// src/expenses/expenses.controller.ts
import {
  Controller, Get, Post, Put, Delete, Param, Body,
  Query, UseGuards, Request, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private expenses: ExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Tambah biaya operasional' })
  create(@Request() req: any, @Body() dto: CreateExpenseDto) {
    return this.expenses.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Daftar biaya' })
  findAll(
    @Request() req: any,
    @Query('from') from?: string,
    @Query('to')   to?:   string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.expenses.findAll(req.user.id, from, to, page, limit);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Ringkasan biaya per kategori' })
  summary(
    @Request() req: any,
    @Query('from') from: string,
    @Query('to')   to:   string,
  ) {
    return this.expenses.summary(req.user.id, from, to);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.expenses.findOne(id); }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: any) { return this.expenses.update(id, dto); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.expenses.remove(id); }
}
