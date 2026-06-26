'use client';
// src/app/dashboard/settlements/page.tsx
import { useState } from 'react';
import { CheckCircle2, Clock, Wallet, Loader2 } from 'lucide-react';
import { useSettlements, useMarkSettled } from '@/hooks/use-data';
import { formatRupiah, formatDate, MARKETPLACE_LABELS } from '@/lib/utils';
import { cn } from '@/lib/utils';

const MARKETPLACE_OPTS = [
  { id: '', label: 'Semua' },
  { id: 'GOFOOD', label: 'GoFood' },
  { id: 'GRABFOOD', label: 'GrabFood' },
  { id: 'SHOPEEFOOD', label: 'ShopeeFood' },
];

export default function SettlementsPage() {
  const [marketplace, setMarketplace] = useState('');
  const [status,      setStatus]      = useState('');
  const [page,        setPage]        = useState(1);
  const [settling,    setSettling]    = useState<string | null>(null);

  const { data, isLoading } = useSettlements({ marketplace: marketplace || undefined, status: status as any || undefined, page });
  const { mutateAsync: markSettled } = useMarkSettled();

  const handleSettle = async (id: string, expectedAmount: number) => {
    setSettling(id);
    await markSettled({ id, settledAmount: expectedAmount });
    setSettling(null);
  };

  const summary = data?.summary ?? { pending: 0, settled: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-ink">Settlement Tracker</h1>
        <p className="text-sm text-stone-400 mt-0.5">Pantau pencairan dana dari GoFood, GrabFood, ShopeeFood</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5 border-l-4 border-l-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">Belum Cair</p>
              <p className="text-lg font-bold text-ink">{formatRupiah(summary.pending)}</p>
            </div>
          </div>
        </div>
        <div className="card p-5 border-l-4 border-l-green-400">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-stone-400 font-medium">Sudah Cair</p>
              <p className="text-lg font-bold text-ink">{formatRupiah(summary.settled)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex rounded-xl overflow-hidden border border-stone-200">
          {MARKETPLACE_OPTS.map(opt => (
            <button
              key={opt.id}
              onClick={() => { setMarketplace(opt.id); setPage(1); }}
              className={cn(
                'px-3 py-1.5 text-sm font-medium transition-colors',
                marketplace === opt.id ? 'bg-brand-500 text-white' : 'text-stone-500 hover:bg-stone-50',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex rounded-xl overflow-hidden border border-stone-200">
          {[{ id: '', label: 'Semua' }, { id: 'PENDING', label: 'Belum Cair' }, { id: 'SETTLED', label: 'Sudah Cair' }].map(opt => (
            <button
              key={opt.id}
              onClick={() => { setStatus(opt.id); setPage(1); }}
              className={cn(
                'px-3 py-1.5 text-sm font-medium transition-colors',
                status === opt.id ? 'bg-brand-500 text-white' : 'text-stone-500 hover:bg-stone-50',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">No. Order</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Marketplace</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Tgl Order</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-stone-400 uppercase tracking-wider">Nominal</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-stone-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Tgl Cair</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {isLoading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-stone-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data?.data?.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-stone-400">
                    Belum ada data settlement
                  </td>
                </tr>
              ) : (
                data.data.map((s: any) => (
                  <tr key={s.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-stone-500">
                      {s.order?.orderNumber ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <MarketplaceBadge name={s.marketplace} />
                    </td>
                    <td className="px-4 py-3 text-stone-500 text-xs whitespace-nowrap">
                      {s.order?.orderDate ? formatDate(s.order.orderDate) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-ink font-mono">
                      {formatRupiah(s.expectedAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.status === 'SETTLED' ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" /> Sudah Cair
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-stone-400 text-xs whitespace-nowrap">
                      {s.settledAt ? formatDate(s.settledAt) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {s.status === 'PENDING' && (
                        <button
                          onClick={() => handleSettle(s.id, s.expectedAmount)}
                          disabled={settling === s.id}
                          className="text-xs btn-primary py-1 px-2.5 flex items-center gap-1 disabled:opacity-60"
                        >
                          {settling === s.id
                            ? <Loader2 className="w-3 h-3 animate-spin" />
                            : <CheckCircle2 className="w-3 h-3" />}
                          Sudah Cair
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data?.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100">
            <p className="text-xs text-stone-400">Total {data.total} settlement</p>
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

function MarketplaceBadge({ name }: { name: string }) {
  const classes: Record<string, string> = {
    GOFOOD:     'badge-gofood',
    GRABFOOD:   'badge-grabfood',
    SHOPEEFOOD: 'badge-shopeefood',
  };
  return <span className={classes[name] ?? 'text-xs font-semibold'}>{MARKETPLACE_LABELS[name] ?? name}</span>;
}
