// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format Rupiah
export function formatRupiah(value: number | string | null | undefined): string {
  const num = Number(value ?? 0);
  if (isNaN(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style:    'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// Short number (1.2jt, 850rb)
export function formatShort(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} M`;
  if (value >= 1_000_000)     return `${(value / 1_000_000).toFixed(1)} jt`;
  if (value >= 1_000)         return `${(value / 1_000).toFixed(0)} rb`;
  return String(value);
}

// Format tanggal Indonesia
export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(date).toLocaleDateString('id-ID', opts ?? {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// Month range helpers
export function currentMonthRange() {
  const now   = new Date();
  const from  = new Date(now.getFullYear(), now.getMonth(), 1);
  const to    = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    from: from.toISOString().split('T')[0],
    to:   to.toISOString().split('T')[0],
  };
}

export const MARKETPLACE_LABELS: Record<string, string> = {
  GOFOOD:     'GoFood',
  GRABFOOD:   'GrabFood',
  SHOPEEFOOD: 'ShopeeFood',
};

export const MARKETPLACE_COLORS: Record<string, string> = {
  GOFOOD:     '#16a34a',
  GRABFOOD:   '#059669',
  SHOPEEFOOD: '#ea580c',
};

export const EXPENSE_LABELS: Record<string, string> = {
  BAHAN_BAKU:  'Bahan Baku',
  GAS:         'Gas',
  LISTRIK:     'Listrik',
  AIR:         'Air',
  INTERNET:    'Internet',
  GAJI:        'Gaji',
  MARKETING:   'Marketing',
  TRANSPORTASI:'Transportasi',
  LAIN_LAIN:   'Lain-lain',
};
