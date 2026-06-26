// src/orders/orders.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Marketplace, OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(opts: {
    from?: string; to?: string;
    marketplace?: Marketplace; status?: OrderStatus;
    page?: number; limit?: number;
  }) {
    const { from, to, marketplace, status, page = 1, limit = 50 } = opts;
    const where: any = {};
    if (from && to)  where.orderDate   = { gte: new Date(from), lte: new Date(to) };
    if (marketplace) where.marketplace = marketplace;
    if (status)      where.status      = status;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { orderDate: 'desc' },
        skip, take: limit,
      }),
      this.prisma.order.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  findOne(id: string) {
    return this.prisma.order.findUniqueOrThrow({ where: { id }, include: { items: true, settlement: true } });
  }
}
