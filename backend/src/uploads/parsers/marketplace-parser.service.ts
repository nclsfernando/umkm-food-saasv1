// src/uploads/parsers/marketplace-parser.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';
import { parse as csvParse } from 'csv-parse/sync';
import { Marketplace } from '@prisma/client';
import Decimal from 'decimal.js';

export interface ParsedOrder {
  orderNumber: string;
  orderDate: Date;
  productName: string;
  qty: number;
  grossSales: Decimal;
  discount: Decimal;
  commission: Decimal;
  netSales: Decimal;
  status: 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
}

@Injectable()
export class MarketplaceParserService {
  parse(buffer: Buffer, filename: string, marketplace: Marketplace): ParsedOrder[] {
    const ext = filename.split('.').pop()?.toLowerCase();
    let rows: Record<string, any>[];

    if (ext === 'csv') {
      rows = this.parseCsv(buffer);
    } else if (['xlsx', 'xls'].includes(ext ?? '')) {
      rows = this.parseExcel(buffer);
    } else {
      throw new BadRequestException('Format file tidak didukung. Gunakan .xlsx atau .csv');
    }

    switch (marketplace) {
      case 'GOFOOD':    return this.parseGoFood(rows);
      case 'GRABFOOD':  return this.parseGrabFood(rows);
      case 'SHOPEEFOOD':return this.parseShopeeFood(rows);
    }
  }

  private parseCsv(buffer: Buffer): Record<string, any>[] {
    return csvParse(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      bom: true,
    });
  }

  private parseExcel(buffer: Buffer): Record<string, any>[] {
    const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(ws, { defval: '' });
  }

  // ── GoFood Column Mapping ─────────────────────────────────
  // Kolom: No. Pesanan | Waktu Pesanan | Nama Menu | Jumlah |
  //        Total Harga | Diskon | Biaya Layanan | Total Diterima
  private parseGoFood(rows: Record<string, any>[]): ParsedOrder[] {
    return rows
      .filter(r => r['No. Pesanan'] || r['Order ID'])
      .map(r => {
        const gross  = this.toDecimal(r['Total Harga'] ?? r['Gross Amount']);
        const disc   = this.toDecimal(r['Diskon'] ?? r['Discount'] ?? 0);
        const comm   = this.toDecimal(r['Biaya Layanan'] ?? r['Commission'] ?? 0);
        return {
          orderNumber: String(r['No. Pesanan'] ?? r['Order ID']).trim(),
          orderDate:   this.parseDate(r['Waktu Pesanan'] ?? r['Order Time']),
          productName: String(r['Nama Menu'] ?? r['Item Name'] ?? '').trim(),
          qty:         Number(r['Jumlah'] ?? r['Qty'] ?? 1),
          grossSales:  gross,
          discount:    disc,
          commission:  comm,
          netSales:    this.toDecimal(r['Total Diterima'] ?? r['Net Amount']) || gross.minus(disc).minus(comm),
          status:      this.mapStatus(r['Status'] ?? r['Order Status'] ?? 'selesai'),
        };
      });
  }

  // ── GrabFood Column Mapping ───────────────────────────────
  // Kolom: Order ID | Order Date | Item Name | Qty |
  //        Subtotal | Discount | Commission | Nett
  private parseGrabFood(rows: Record<string, any>[]): ParsedOrder[] {
    return rows
      .filter(r => r['Order ID'] || r['order_id'])
      .map(r => {
        const gross = this.toDecimal(r['Subtotal'] ?? r['Gross Sales']);
        const disc  = this.toDecimal(r['Discount'] ?? 0);
        const comm  = this.toDecimal(r['Commission'] ?? r['Commission Fee'] ?? 0);
        return {
          orderNumber: String(r['Order ID'] ?? r['order_id']).trim(),
          orderDate:   this.parseDate(r['Order Date'] ?? r['order_date']),
          productName: String(r['Item Name'] ?? r['item_name'] ?? '').trim(),
          qty:         Number(r['Qty'] ?? r['quantity'] ?? 1),
          grossSales:  gross,
          discount:    disc,
          commission:  comm,
          netSales:    this.toDecimal(r['Nett'] ?? r['Net Amount']) || gross.minus(disc).minus(comm),
          status:      this.mapStatus(r['Status'] ?? r['order_status'] ?? 'completed'),
        };
      });
  }

  // ── ShopeeFood Column Mapping ─────────────────────────────
  // Kolom: ID Pesanan | Waktu Pembuatan | Nama Produk | Jumlah Produk |
  //        Harga Awal | Diskon | Komisi | Pendapatan Bersih
  private parseShopeeFood(rows: Record<string, any>[]): ParsedOrder[] {
    return rows
      .filter(r => r['ID Pesanan'] || r['Order ID'])
      .map(r => {
        const gross = this.toDecimal(r['Harga Awal'] ?? r['Gross Price'] ?? r['Total Harga']);
        const disc  = this.toDecimal(r['Diskon'] ?? r['Discount'] ?? 0);
        const comm  = this.toDecimal(r['Komisi'] ?? r['Commission'] ?? 0);
        return {
          orderNumber: String(r['ID Pesanan'] ?? r['Order ID']).trim(),
          orderDate:   this.parseDate(r['Waktu Pembuatan'] ?? r['Order Time'] ?? r['Created At']),
          productName: String(r['Nama Produk'] ?? r['Product Name'] ?? '').trim(),
          qty:         Number(r['Jumlah Produk'] ?? r['Qty'] ?? 1),
          grossSales:  gross,
          discount:    disc,
          commission:  comm,
          netSales:    this.toDecimal(r['Pendapatan Bersih'] ?? r['Net Income']) || gross.minus(disc).minus(comm),
          status:      this.mapStatus(r['Status Pesanan'] ?? r['Order Status'] ?? 'selesai'),
        };
      });
  }

  // ── Helpers ───────────────────────────────────────────────
  private toDecimal(val: any): Decimal {
    if (!val && val !== 0) return new Decimal(0);
    const clean = String(val).replace(/[^0-9.,\-]/g, '').replace(',', '.');
    try { return new Decimal(clean || 0); }
    catch { return new Decimal(0); }
  }

  private parseDate(val: any): Date {
    if (!val) return new Date();
    if (val instanceof Date) return val;
    const s = String(val).trim();
    // Try ISO
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
    // Try DD/MM/YYYY
    const parts = s.split(/[\/\-]/);
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`);
    }
    return new Date();
  }

  private mapStatus(raw: string): 'COMPLETED' | 'CANCELLED' | 'REFUNDED' {
    const s = String(raw).toLowerCase();
    if (['batal', 'cancel', 'cancelled', 'dibatalkan'].some(x => s.includes(x))) return 'CANCELLED';
    if (['refund', 'dikembalikan'].some(x => s.includes(x))) return 'REFUNDED';
    return 'COMPLETED';
  }
}
