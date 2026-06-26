// src/uploads/uploads.controller.ts
import {
  Controller, Post, Get, Param, Query, UseGuards,
  Request, UseInterceptors, UploadedFile, Body, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';
import { Marketplace } from '@prisma/client';

@ApiTags('Uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private uploads: UploadsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload laporan marketplace (Excel/CSV)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file:        { type: 'string', format: 'binary' },
        marketplace: { type: 'string', enum: ['GOFOOD','GRABFOOD','SHOPEEFOOD'] },
        uploadDate:  { type: 'string', example: '2024-01-15' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (_, file, cb) => {
      const allowed = ['xlsx', 'xls', 'csv'];
      const ext = file.originalname.split('.').pop()?.toLowerCase() ?? '';
      cb(null, allowed.includes(ext));
    },
  }))
  upload(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('marketplace') marketplace: Marketplace,
    @Body('uploadDate') uploadDate: string,
  ) {
    return this.uploads.processUpload(req.user.id, marketplace, file, uploadDate ?? new Date().toISOString());
  }

  @Get()
  @ApiOperation({ summary: 'Daftar riwayat upload' })
  findAll(
    @Request() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.uploads.findAll(req.user.id, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail upload' })
  findOne(@Param('id') id: string) {
    return this.uploads.findOne(id);
  }
}
