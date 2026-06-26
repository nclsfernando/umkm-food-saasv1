// src/reports/reports.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Marketplace } from '@prisma/client';
import Decimal from 'decimal.js';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  // ── Laporan Laba Rugi ─────────────────────────────────────
  async profitLoss(from: string, to: string) {
    const dateFilter = { gte: new Date(from), lte: new Date(to) };

    const [orderAgg, expenses, items] = await Promise.all([
      this.prisma.order.aggregate({
        where: { status: 'COMPLETED', orderDate: dateFilter },
        _sum: { grossSales: true, discount: true, commission: true, netSales: true },
        _count: { id: true },
      }),
      this.prisma.expense.findMany({
        where: { expenseDate: dateFilter },
        select: { category: true, amount: true },
      }),
      this.prisma.orderItem.findMany({
        where: { order: { status: 'COMPLETED', orderDate: dateFilter } },
        include: { product: { select: { hpp: true } } },
      }),
    ]);

    const grossSales  = new Decimal(orderAgg._sum.grossSales  ?? 0);
    const discount    = new Decimal(orderAgg._sum.discount    ?? 0);
    const commission  = new Decimal(orderAgg._sum.commission  ?? 0);
    const netSales    = new Decimal(orderAgg._sum.netSales    ?? 0);

    const hpp = items.reduce((acc, i) => {
      return acc.plus(i.product ? new Decimal(i.product.hpp).times(i.qty) : 0);
    }, new Decimal(0));

    const totalExpenses = expenses.reduce((acc, e) => acc.plus(e.amount), new Decimal(0));
    const grossProfit   = netSales.minus(hpp);
    const netProfit     = grossProfit.minus(totalExpenses);

    // Group expenses by category
    const expenseByCategory: Record<string, number> = {};
    for (const e of expenses) {
      expenseByCategory[e.category] = (expenseByCategory[e.category] ?? 0) + Number(e.amount);
    }

    return {
      period:      { from, to },
      orders:      orderAgg._count.id,
      revenue: {
        grossSales:  grossSales.toNumber(),
        discount:    discount.toNumber(),
        commission:  commission.toNumber(),
        netSales:    netSales.toNumber(),
      },
      cogs: {
        hpp: hpp.toNumber(),
      },
      grossProfit: grossProfit.toNumber(),
      expenses: {
        total:      totalExpenses.toNumber(),
        breakdown:  expenseByCategory,
      },
      netProfit:   netProfit.toNumber(),
      margin:      netSales.gt(0) ? netProfit.dividedBy(netSales).times(100).toFixed(2) : '0',
    };
  }

  // ── Laporan Penjualan per Marketplace ─────────────────────
  async salesByMarketplace(from: string, to: string) {
    const dateFilter = { gte: new Date(from), lte: new Date(to) };
    const marketplaces: Marketplace[] = ['GOFOOD','GRABFOOD','SHOPEEFOOD'];
    const results: {
      marketplace: Marketplace;
      orders: number;
      grossSales: number;
      commission: number;
      netSales: number;
    }[] = [];

    for (const mp of marketplaces) {
      const agg = await this.prisma.order.aggregate({
        where: { marketplace: mp, status: 'COMPLETED', orderDate: dateFilter },
        _count: { id: true },
        _sum: { grossSales: true, commission: true, netSales: true },
      });
      results.push({
        marketplace: mp,
        orders:     agg._count.id,
        grossSales: Number(agg._sum.grossSales  ?? 0),
        commission: Number(agg._sum.commission  ?? 0),
        netSales:   Number(agg._sum.netSales    ?? 0),
      });
    }
    return results;
  }

  // ── Laporan Produk ─────────────────────────────────────────
  async productReport(from: string, to: string) {
    const dateFilter = { gte: new Date(from), lte: new Date(to) };
    const items = await this.prisma.orderItem.groupBy({
      by: ['productName'],
      where: { order: { status: 'COMPLETED', orderDate: dateFilter } },
      _sum: { qty: true, subtotal: true },
      orderBy: { _sum: { qty: 'desc' } },
    });

    const ranked = items.map((i, idx) => ({
      rank:        idx + 1,
      productName: i.productName,
      qty:         i._sum.qty    ?? 0,
      revenue:     i._sum.subtotal ?? 0,
    }));

    return {
      topSelling:   ranked.slice(0, 10),
      slowMoving:   [...ranked].reverse().slice(0, 10),
      all:          ranked,
    };
  }

  // ── Monthly Trend ─────────────────────────────────────────
  async monthlyTrend(year: number) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        EXTRACT(MONTH FROM order_date) as month,
        SUM(gross_sales)::float as gross_sales,
        SUM(net_sales)::float   as net_sales,
        COUNT(id)::int          as orders
      FROM orders
      WHERE status = 'COMPLETED'
        AND EXTRACT(YEAR FROM order_date) = ${year}
      GROUP BY EXTRACT(MONTH FROM order_date)
      ORDER BY month ASC
    `;
    return rows;
  }
}
