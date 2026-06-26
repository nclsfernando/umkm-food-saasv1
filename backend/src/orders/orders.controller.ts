// src/orders/orders.controller.ts
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Daftar order dengan filter' })
  findAll(
    @Query('from')        from?:        string,
    @Query('to')          to?:          string,
    @Query('marketplace') marketplace?: any,
    @Query('status')      status?:      any,
    @Query('page')        page  = 1,
    @Query('limit')       limit = 50,
  ) {
    return this.orders.findAll({ from, to, marketplace, status, page: +page, limit: +limit });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail order' })
  findOne(@Param('id') id: string) { return this.orders.findOne(id); }
}
