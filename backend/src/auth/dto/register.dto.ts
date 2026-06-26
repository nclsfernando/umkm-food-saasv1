// src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty({ example: 'owner@warungmakan.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Budi Santoso' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Warung Makan Bu Budi', required: false })
  @IsString()
  @IsOptional()
  businessName?: string;

  @ApiProperty({ example: '08123456789', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: Role, default: 'OWNER', required: false })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
