// src/dashboard/dashboard.controller.ts
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private dashboard: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'KPI ringkasan hari ini / minggu ini / bulan ini' })
  summary() {
    return this.dashboard.getSummary();
  }

  @Get('marketplace')
  @ApiOperation({ summary: 'Breakdown per marketplace' })
  @ApiQuery({ name: 'from', example: '2024-01-01' })
  @ApiQuery({ name: 'to',   example: '2024-01-31' })
  marketplace(@Query('from') from: string, @Query('to') to: string) {
    return this.dashboard.getMarketplaceBreakdown(from, to);
  }

  @Get('daily-chart')
  @ApiOperation({ summary: 'Data grafik omzet harian per bulan' })
  @ApiQuery({ name: 'year',  example: 2024 })
  @ApiQuery({ name: 'month', example: 1 })
  dailyChart(@Query('year') year: number, @Query('month') month: number) {
    return this.dashboard.getDailyChart(+year, +month);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Produk terlaris' })
  @ApiQuery({ name: 'from',  example: '2024-01-01' })
  @ApiQuery({ name: 'to',    example: '2024-01-31' })
  @ApiQuery({ name: 'limit', example: 10, required: false })
  topProducts(
    @Query('from') from: string,
    @Query('to')   to:   string,
    @Query('limit') limit = 10,
  ) {
    return this.dashboard.getTopProducts(from, to, +limit);
  }
}

// ─────────────────────────────────────────────
// src/dashboard/dashboard.module.ts
