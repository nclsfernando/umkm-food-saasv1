// src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateProductDto {
  name: string;
  categoryId: string;
  sellingPrice: number;
  hpp: number;
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: { ...dto, sellingPrice: dto.sellingPrice.toString(), hpp: dto.hpp.toString() },
      include: { category: true },
    });
  }

  findAll(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return this.prisma.product.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
      skip, take: limit,
    });
  }

  async findOne(id: string) {
    const p = await this.prisma.product.findUnique({ where: { id }, include: { category: true } });
    if (!p) throw new NotFoundException('Produk tidak ditemukan');
    return p;
  }

  async update(id: string, dto: Partial<CreateProductDto>) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.sellingPrice) data.sellingPrice = dto.sellingPrice.toString();
    if (dto.hpp)          data.hpp          = dto.hpp.toString();
    return this.prisma.product.update({ where: { id }, data, include: { category: true } });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  // Categories
  findAllCategories() { return this.prisma.category.findMany(); }
}
