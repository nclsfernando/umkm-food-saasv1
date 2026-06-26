// src/products/products.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProductsService, CreateProductDto } from './products.service';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private products: ProductsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Daftar kategori produk' })
  categories() { return this.products.findAllCategories(); }

  @Post()
  @ApiOperation({ summary: 'Tambah produk baru' })
  create(@Body() dto: CreateProductDto) { return this.products.create(dto); }

  @Get()
  @ApiOperation({ summary: 'Daftar produk' })
  findAll() { return this.products.findAll(); }

  @Get(':id') findOne(@Param('id') id: string) { return this.products.findOne(id); }
  @Put(':id') update(@Param('id') id: string, @Body() dto: any) { return this.products.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.products.remove(id); }
}
