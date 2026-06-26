// src/expenses/dto/create-expense.dto.ts
import { IsEnum, IsNumber, IsString, IsOptional, IsDateString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCategory } from '@prisma/client';

export class CreateExpenseDto {
  @ApiProperty({ enum: ExpenseCategory })
  @IsEnum(ExpenseCategory)
  category: ExpenseCategory;

  @ApiProperty({ example: 'Gas LPG 3kg x 2' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 50000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  expenseDate: string;
}
