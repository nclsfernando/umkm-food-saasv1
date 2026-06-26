// src/uploads/uploads.module.ts
import { Module } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { MarketplaceParserService } from './parsers/marketplace-parser.service';

@Module({
  controllers: [UploadsController],
  providers: [UploadsService, MarketplaceParserService],
  exports: [UploadsService],
})
export class UploadsModule {}
