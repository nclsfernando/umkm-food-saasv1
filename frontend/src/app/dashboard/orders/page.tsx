'use client';
// src/app/dashboard/orders/page.tsx
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useOrders } from '@/hooks/use-data';
import { formatRupiah, formatDate, currentMonthRange, MARKETPLACE_LABELS } from '@/lib/utils';
import { cn } from '@/lib/utils';

const MARKETPLACES = ['', 'GOFOOD', 'GRABFOOD', 'SHOPEEFOOD'];
const STATUSES     = ['', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
const STATUS_LABELS: Record<string, string> = {
  COMPLETED: 'Selesai', CANCELLED: 'Dibatalkan', REFUNDED: 'Refund',
};
const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-600',
  REFUNDED:  'bg-stone-100 text-stone-500',
};

export default function OrdersPage() {
  const { from, to } = currentMonthRange();
  const [dateFrom,    setDateFrom]    = useState(from);
  const [dateTo,      setDateTo]      = useState(to);
  const [marketplace, setMarketplace] = useState('');
  const [status,      setStatus]      = useState('');
  const [page,        setPage]        = useState(1);

  const { data, isLoading } = useOrders({
    from: dateFrom, to: dateTo,
    marketplace: marketplace || undefined,
    status: status || undefined,
    page, limit: 50,
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-ink">Data Order</h1>
        <p className="text-sm text-stone-400 mt-0.5">
          {data?.total ?? 0} pesanan ditemukan
        </p>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          {/* Date range */}
          <div className="flex items-center gap-2">
            <input type="date" value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setPage(1); }}
              className="input w-auto text-sm" />
            <span className="text-stone-300 text-sm">s/d</span>
            <input type="date" value={dateTo}
              onChange={e => { setDateTo(e.target.value); setPage(1); }}
              className="input w-auto text-sm" />
          </div>

          {/* Marketplace */}
          <select value={marketplace}
            onChange={e => { setMarketplace(e.target.value); setPage(1); }}
            className="input w-auto text-sm">
            <option value="">Semua Marketplace</option>
            {MARKETPLACES.filter(Boolean).map(m => (
              <option key={m} value={m}>{MARKETPLACE_LABELS[m]}</option>
            ))}
          </select>

          {/* Status */}
          <select value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="input w-auto text-sm">
            <option value="">Semua Status</option>
            {STATUSES.filter(Boolean).map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                {['No. Order','Marketplace','Tgl Order','Produk','Omzet Kotor','Diskon','Komisi','Diterima','Status'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {isLoading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-3 py-3">
                        <div className="h-4 bg-stone-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data?.data?.length ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-stone-400">
                    <Search className="w-8 h-8 text-stone-200 mx-auto mb-2" />
                    Tidak ada order ditemukan
                  </td>
                </tr>
              ) : (
                data.data.map((o: any) => (
                  <tr key={o.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-3 py-3 font-mono text-xs text-stone-400 whitespace-nowrap">
                      {o.orderNumber}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <MktBadge name={o.marketplace} />
                    </td>
                    <td className="px-3 py-3 text-stone-500 whitespace-nowrap text-xs">
                      {formatDate(o.orderDate)}
                    </td>
                    <td className="px-3 py-3 max-w-[180px]">
                      {o.items?.map((it: any) => (
                        <div key={it.id} className="text-xs text-stone-600 truncate">
                          {it.qty}× {it.productName}
                        </div>
                      ))}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-ink whitespace-nowrap">
                      {formatRupiah(o.grossSales)}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-red-400 whitespace-nowrap">
                      {Number(o.discount) > 0 ? `−${formatRupiah(o.discount)}` : '—'}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-red-400 whitespace-nowrap">
                      {Number(o.commission) > 0 ? `−${formatRupiah(o.commission)}` : '—'}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs font-semibold text-green-600 whitespace-nowrap">
                      {formatRupiah(o.netSales)}
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', STATUS_COLORS[o.status] ?? 'bg-stone-100 text-stone-500')}>
                        {STATUS_LABELS[o.status] ?? o.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data?.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100">
            <p className="text-xs text-stone-400">Halaman {page} dari {data.totalPages} · {data.total} order</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Sebelumnya</button>
              <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Berikutnya</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MktBadge({ name }: { name: string }) {
  const cls: Record<string, string> = {
    GOFOOD: 'badge-gofood', GRABFOOD: 'badge-grabfood', SHOPEEFOOD: 'badge-shopeefood',
  };
  return <span className={cls[name] ?? 'text-xs'}>{MARKETPLACE_LABELS[name] ?? name}</span>;
}
