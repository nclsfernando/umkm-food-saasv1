// src/settlements/settlements.controller.ts
import { Controller, Get, Put, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettlementsService } from './settlements.service';
import { Marketplace } from '@prisma/client';

@ApiTags('Settlements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('settlements')
export class SettlementsController {
  constructor(private settlements: SettlementsService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar settlement dengan filter marketplace & status' })
  findAll(
    @Query('marketplace') marketplace?: Marketplace,
    @Query('status')      status?:      'PENDING' | 'SETTLED',
    @Query('page')        page  = 1,
    @Query('limit')       limit = 20,
  ) {
    return this.settlements.findAll(marketplace, status, +page, +limit);
  }

  @Put(':id/settle')
  @ApiOperation({ summary: 'Tandai settlement sudah cair' })
  markSettled(@Param('id') id: string, @Body('settledAmount') amount: number) {
    return this.settlements.markSettled(id, amount);
  }

  @Put('bulk-settle')
  @ApiOperation({ summary: 'Tandai semua pending dari marketplace sebagai sudah cair' })
  bulkSettle(
    @Body('marketplace') marketplace: Marketplace,
    @Body('settledDate') settledDate: string,
  ) {
    return this.settlements.markAllSettled(marketplace, settledDate);
  }
}

// ─────────────────────────────────────────────
