'use client';
// src/app/dashboard/reports/page.tsx
import { useState } from 'react';
import { FileBarChart, TrendingUp, Store, Package, Download } from 'lucide-react';
import {
  useProfitLoss, useMarketplaceReport, useProductReport, useMonthlyTrend,
} from '@/hooks/use-data';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import { formatRupiah, formatShort, currentMonthRange, MARKETPLACE_LABELS, EXPENSE_LABELS } from '@/lib/utils';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'pl',       label: 'Laba Rugi',   icon: TrendingUp },
  { id: 'mkt',      label: 'Marketplace', icon: Store },
  { id: 'product',  label: 'Produk',      icon: Package },
  { id: 'trend',    label: 'Tren Tahunan',icon: FileBarChart },
];

const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

export default function ReportsPage() {
  const [tab,  setTab]  = useState('pl');
  const now = new Date();
  const { from, to } = currentMonthRange();
  const [dateFrom, setDateFrom] = useState(from);
  const [dateTo,   setDateTo]   = useState(to);

  const { data: pl,      isLoading: loadPL  } = useProfitLoss(dateFrom, dateTo);
  const { data: mkt,     isLoading: loadMkt } = useMarketplaceReport(dateFrom, dateTo);
  const { data: prod,    isLoading: loadProd} = useProductReport(dateFrom, dateTo);
  const { data: trend,   isLoading: loadTrend} = useMonthlyTrend(now.getFullYear());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Laporan Keuangan</h1>
          <p className="text-sm text-stone-400 mt-0.5">Analisis mendalam performa bisnis Anda</p>
        </div>
        {/* Date range */}
        <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-2">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="text-sm text-stone-600 outline-none" />
          <span className="text-stone-300">—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="text-sm text-stone-600 outline-none" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              tab === t.id ? 'bg-white text-ink shadow-sm' : 'text-stone-400 hover:text-stone-600',
            )}>
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab: Laba Rugi ────────────────────────────────────── */}
      {tab === 'pl' && (
        <div className="space-y-4">
          {loadPL ? <Skeleton /> : pl ? (
            <>
              {/* P&L Statement */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-base font-bold text-ink">Laporan Laba Rugi</h2>
                    <p className="text-xs text-stone-400 mt-0.5">{dateFrom} s/d {dateTo}</p>
                  </div>
                  <span className="text-xs bg-stone-100 text-stone-500 px-2 py-1 rounded-lg font-mono">
                    {pl.orders} pesanan
                  </span>
                </div>

                <div className="space-y-0 divide-y divide-stone-50">
                  <PLRow label="Omzet Kotor (Gross Sales)"     value={pl.revenue.grossSales}    />
                  <PLRow label="— Diskon"                       value={-pl.revenue.discount}     neg />
                  <PLRow label="— Komisi Marketplace"           value={-pl.revenue.commission}   neg />
                  <PLRow label="Pendapatan Bersih"              value={pl.revenue.netSales}      bold border />
                  <PLRow label="— HPP (Harga Pokok Produksi)"   value={-pl.cogs.hpp}             neg />
                  <PLRow label="Laba Kotor"                     value={pl.grossProfit}            bold border />
                  <PLRow label="— Total Biaya Operasional"      value={-pl.expenses.total}       neg />
                  <PLRow label="Laba Bersih"                    value={pl.netProfit}
                    bold border big highlight={pl.netProfit >= 0 ? 'green' : 'red'} />
                </div>

                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-4 text-sm text-stone-400">
                  <span>Net Margin: <strong className="text-ink">{pl.margin}%</strong></span>
                </div>
              </div>

              {/* Expense breakdown */}
              {Object.keys(pl.expenses.breakdown).length > 0 && (
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-ink mb-4">Rincian Biaya Operasional</h3>
                  <div className="space-y-2.5">
                    {Object.entries(pl.expenses.breakdown).map(([cat, amount]: any) => (
                      <div key={cat} className="flex items-center justify-between">
                        <span className="text-sm text-stone-500">{EXPENSE_LABELS[cat] ?? cat}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-400 rounded-full"
                              style={{ width: `${Math.min(100, (amount / pl.expenses.total) * 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-ink font-mono w-28 text-right">
                            {formatRupiah(amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <EmptyState text="Belum ada data. Upload laporan marketplace untuk melihat laba rugi." />
          )}
        </div>
      )}

      {/* ── Tab: Marketplace ──────────────────────────────────── */}
      {tab === 'mkt' && (
        <div className="space-y-4">
          {loadMkt ? <Skeleton /> : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(mkt ?? []).map((m: any) => (
                  <div key={m.marketplace} className="card p-5">
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                      {MARKETPLACE_LABELS[m.marketplace]}
                    </p>
                    <p className="text-lg font-bold text-ink">{formatRupiah(m.grossSales)}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{m.orders} pesanan</p>
                    <div className="mt-3 pt-3 border-t border-stone-100 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Komisi</span>
                        <span className="text-red-500 font-mono">−{formatRupiah(m.commission)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500 font-medium">Diterima</span>
                        <span className="text-green-600 font-bold font-mono">{formatRupiah(m.netSales)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card p-5">
                <h3 className="text-sm font-semibold text-ink mb-4">Perbandingan Marketplace</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={(mkt ?? []).map((m: any) => ({
                    name: MARKETPLACE_LABELS[m.marketplace],
                    'Omzet Kotor': m.grossSales,
                    'Diterima': m.netSales,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={formatShort} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => [formatRupiah(v)]} />
                    <Legend />
                    <Bar dataKey="Omzet Kotor" fill="#fb923c" radius={[4,4,0,0]} />
                    <Bar dataKey="Diterima"    fill="#34d399" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Tab: Produk ───────────────────────────────────────── */}
      {tab === 'product' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {loadProd ? <Skeleton /> : prod ? (
            <>
              {/* Top selling */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-ink mb-4">🏆 Produk Terlaris</h3>
                <div className="space-y-2.5">
                  {prod.topSelling.slice(0, 8).map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs font-bold text-stone-300 w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{p.productName}</p>
                        <div className="w-full h-1 bg-stone-100 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-brand-400 rounded-full"
                            style={{ width: `${Math.min(100, (p.qty / (prod.topSelling[0]?.qty || 1)) * 100)}%` }} />
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-ink flex-shrink-0">{p.qty} pcs</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slow moving */}
              <div className="card p-5">
                <h3 className="text-sm font-semibold text-ink mb-4">🐢 Produk Kurang Laku</h3>
                <div className="space-y-2.5">
                  {prod.slowMoving.slice(0, 8).map((p: any, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-500 truncate">{p.productName}</p>
                      </div>
                      <span className="text-xs text-stone-400 flex-shrink-0">{p.qty} pcs</span>
                      <span className="text-xs font-mono text-stone-400">{formatRupiah(p.revenue)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : <EmptyState text="Belum ada data produk." />}
        </div>
      )}

      {/* ── Tab: Tren Tahunan ─────────────────────────────────── */}
      {tab === 'trend' && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-ink mb-4">Tren Omzet {now.getFullYear()}</h3>
          {loadTrend ? <div className="h-64 bg-stone-50 rounded-lg animate-pulse" /> : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={(trend ?? []).map((t: any) => ({
                bulan:  MONTHS_ID[Number(t.month) - 1],
                omzet:  t.gross_sales,
                bersih: t.net_sales,
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="bulan" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={formatShort} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => [formatRupiah(v)]} />
                <Legend />
                <Line type="monotone" dataKey="omzet"  name="Omzet Kotor" stroke="#fb923c" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="bersih" name="Diterima"    stroke="#34d399" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────
function PLRow({ label, value, neg, bold, border, big, highlight }: {
  label: string; value: number; neg?: boolean; bold?: boolean;
  border?: boolean; big?: boolean; highlight?: 'green' | 'red';
}) {
  return (
    <div className={cn(
      'flex items-center justify-between py-2.5',
      border && 'border-t border-stone-100 mt-1 pt-3',
    )}>
      <span className={cn('text-sm', bold ? 'font-semibold text-ink' : 'text-stone-500')}>{label}</span>
      <span className={cn(
        'font-mono text-sm',
        big   ? 'text-base font-bold' : '',
        highlight === 'green' ? 'text-green-600' :
        highlight === 'red'   ? 'text-red-500' :
        bold  ? 'font-semibold text-ink' :
        neg   ? 'text-stone-400' : 'text-ink',
      )}>
        {value < 0 ? `−${formatRupiah(Math.abs(value))}` : formatRupiah(value)}
      </span>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="card p-6 space-y-3 animate-pulse">
      {[...Array(6)].map((_, i) => <div key={i} className="h-8 bg-stone-100 rounded-lg" />)}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="card p-12 text-center">
      <FileBarChart className="w-12 h-12 text-stone-200 mx-auto mb-3" />
      <p className="text-stone-400 text-sm">{text}</p>
    </div>
  );
}
