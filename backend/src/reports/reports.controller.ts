// src/reports/reports.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get('profit-loss')
  @ApiOperation({ summary: 'Laporan Laba Rugi' })
  profitLoss(@Query('from') from: string, @Query('to') to: string) {
    return this.reports.profitLoss(from, to);
  }

  @Get('marketplace')
  @ApiOperation({ summary: 'Laporan penjualan per marketplace' })
  marketplace(@Query('from') from: string, @Query('to') to: string) {
    return this.reports.salesByMarketplace(from, to);
  }

  @Get('products')
  @ApiOperation({ summary: 'Laporan produk terlaris & kurang laku' })
  products(@Query('from') from: string, @Query('to') to: string) {
    return this.reports.productReport(from, to);
  }

  @Get('monthly-trend')
  @ApiOperation({ summary: 'Tren penjualan bulanan dalam setahun' })
  monthlyTrend(@Query('year') year: number) {
    return this.reports.monthlyTrend(+year || new Date().getFullYear());
  }
}
