// src/uploads/uploads.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MarketplaceParserService } from './parsers/marketplace-parser.service';
import { Marketplace } from '@prisma/client';
import Decimal from 'decimal.js';

const COMMISSION_RATE: Record<Marketplace, number> = {
  GOFOOD:     0.20, // 20%
  GRABFOOD:   0.25, // 25%
  SHOPEEFOOD: 0.20, // 20%
};

@Injectable()
export class UploadsService {
  constructor(
    private prisma: PrismaService,
    private parser: MarketplaceParserService,
  ) {}

  async processUpload(
    userId: string,
    marketplace: Marketplace,
    file: Express.Multer.File,
    uploadDate: string,
  ) {
    // Create upload record
    const upload = await this.prisma.upload.create({
      data: {
        userId,
        marketplace,
        filename: file.originalname,
        fileUrl: '',           // set after S3/local storage
        fileSize: file.size,
        status: 'PROCESSING',
        uploadDate: new Date(uploadDate),
      },
    });

    try {
      const parsed = this.parser.parse(file.buffer, file.originalname, marketplace);
      let success = 0, failed = 0;
      const errors: any[] = [];

      // Detect duplicates
      const existingNos = new Set(
        (await this.prisma.order.findMany({
          where: { marketplace },
          select: { orderNumber: true },
        })).map(o => o.orderNumber),
      );

      for (const row of parsed) {
        if (existingNos.has(row.orderNumber)) {
          failed++;
          errors.push({ orderNumber: row.orderNumber, reason: 'Duplikat' });
          continue;
        }

        try {
          // Calculate commission if not in file
          const commRate = new Decimal(COMMISSION_RATE[marketplace]);
          const commission = row.commission.eq(0)
            ? row.grossSales.times(commRate)
            : row.commission;
          const netSales = row.grossSales.minus(row.discount).minus(commission);

          await this.prisma.order.create({
            data: {
              uploadId:   upload.id,
              orderNumber: row.orderNumber,
              marketplace,
              orderDate:  row.orderDate,
              status:     row.status,
              grossSales: row.grossSales.toFixed(2),
              discount:   row.discount.toFixed(2),
              commission: commission.toFixed(2),
              netSales:   netSales.toFixed(2),
              items: {
                create: [{
                  productName: row.productName,
                  qty:       row.qty,
                  unitPrice: row.grossSales.dividedBy(row.qty || 1).toFixed(2),
                  subtotal:  row.grossSales.toFixed(2),
                }],
              },
              settlement: {
                create: {
                  marketplace,
                  expectedAmount: netSales.toFixed(2),
                  status: 'PENDING',
                },
              },
            },
          });

          existingNos.add(row.orderNumber);
          success++;
        } catch (e) {
          failed++;
          errors.push({ orderNumber: row.orderNumber, reason: e.message });
        }
      }

      await this.prisma.upload.update({
        where: { id: upload.id },
        data: {
          status:     failed > 0 && success === 0 ? 'FAILED' : 'SUCCESS',
          rowsTotal:  parsed.length,
          rowsSuccess: success,
          rowsFailed: failed,
          errorLog:   errors.length ? errors : undefined,
        },
      });

      await this.prisma.auditLog.create({
        data: { userId, action: 'UPLOAD_REPORT', entity: 'Upload', entityId: upload.id,
          meta: { marketplace, success, failed } },
      });

      return { uploadId: upload.id, rowsTotal: parsed.length, rowsSuccess: success, rowsFailed: failed, errors };
    } catch (e) {
      await this.prisma.upload.update({
        where: { id: upload.id },
        data: { status: 'FAILED', errorLog: [{ reason: e.message }] },
      });
      throw new BadRequestException(`Gagal memproses file: ${e.message}`);
    }
  }

  async findAll(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.upload.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      this.prisma.upload.count({ where: { userId } }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    return this.prisma.upload.findUniqueOrThrow({ where: { id } });
  }
}
