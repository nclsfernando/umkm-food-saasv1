// src/settlements/settlements.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Marketplace } from '@prisma/client';

@Injectable()
export class SettlementsService {
  constructor(private prisma: PrismaService) {}

  async findAll(marketplace?: Marketplace, status?: 'PENDING' | 'SETTLED', page = 1, limit = 20) {
    const where: any = {};
    if (marketplace) where.marketplace = marketplace;
    if (status)      where.status      = status;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.settlement.findMany({
        where,
        include: { order: { select: { orderNumber: true, orderDate: true, netSales: true } } },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      this.prisma.settlement.count({ where }),
    ]);

    const agg = await this.prisma.settlement.groupBy({
      by: ['status'],
      _sum: { expectedAmount: true, settledAmount: true },
    });

    const summary = { pending: 0, settled: 0 };
    for (const a of agg) {
      if (a.status === 'PENDING') summary.pending = Number(a._sum.expectedAmount ?? 0);
      else summary.settled = Number(a._sum.settledAmount ?? a._sum.expectedAmount ?? 0);
    }

    return { data, total, page, limit, totalPages: Math.ceil(total / limit), summary };
  }

  async markSettled(id: string, settledAmount: number) {
    return this.prisma.settlement.update({
      where: { id },
      data: { status: 'SETTLED', settledAmount: settledAmount.toString(), settledAt: new Date() },
    });
  }

  async markAllSettled(marketplace: Marketplace, settledDate: string) {
    return this.prisma.settlement.updateMany({
      where: { marketplace, status: 'PENDING' },
      data: { status: 'SETTLED', settledAt: new Date(settledDate) },
    });
  }
}
