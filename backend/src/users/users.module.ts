// src/users/users.module.ts
import { Module } from '@nestjs/common';

// Users profile is managed via AuthService (GET /auth/me, PUT /users/profile)
// For brevity the controller is minimal

import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
class UsersService {
  constructor(private prisma: PrismaService) {}
  update(id: string, dto: any) {
    return this.prisma.user.update({ where: { id }, data: dto,
      select: { id: true, email: true, name: true, role: true, businessName: true, phone: true } });
  }
  findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true, createdAt: true },
    });
  }
}

@Controller('users')
@UseGuards(JwtAuthGuard)
class UsersController {
  constructor(private users: UsersService) {}
  @Get()        findAll()                       { return this.users.findAll(); }
  @Put('profile') update(@Request() req: any, @Body() dto: any) { return this.users.update(req.user.id, dto); }
}

@Module({
  controllers: [UsersController],
  providers:   [UsersService],
})
export class UsersModule {}
