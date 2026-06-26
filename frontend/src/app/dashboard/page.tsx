'use client';
// src/app/dashboard/page.tsx
import { useState } from 'react';
import {
  TrendingUp, ShoppingCart, Store, Banknote,
  ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie, Legend,
} from 'recharts';
import { useDashboardSummary, useDailyChart, useTopProducts, useMarketplaceBreakdown } from '@/hooks/use-dashboard';
import { formatRupiah, formatShort, currentMonthRange, MARKETPLACE_COLORS, MARKETPLACE_LABELS } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const now     = new Date();
  const { from, to } = currentMonthRange();

  const { data: summary,    isLoading: loadSummary,  refetch } = useDashboardSummary();
  const { data: dailyChart, isLoading: loadChart  } = useDailyChart(now.getFullYear(), now.getMonth() + 1);
  const { data: topProds,   isLoading: loadProds  } = useTopProducts(from, to);
  const { data: mktBreak,   isLoading: loadMkt    } = useMarketplaceBreakdown(from, to);

  if (loadSummary) return <DashboardSkeleton />;

  const month = summary?.month ?? {};
  const week  = summary?.week  ?? {};
  const today = summary?.today ?? {};

  const kpis = [
    {
      label:    'Omzet Bulan Ini',
      value:    formatRupiah(month.grossSales),
      sub:      `${month.orders ?? 0} pesanan`,
      icon:     TrendingUp,
      color:    'text-brand-500',
      bg:       'bg-brand-50',
      trend:    null,
    },
    {
      label:    'Omzet Minggu Ini',
      value:    formatRupiah(week.grossSales),
      sub:      `${week.orders ?? 0} pesanan`,
      icon:     ShoppingCart,
      color:    'text-blue-500',
      bg:       'bg-blue-50',
    },
    {
      label:    'Pendapatan Bersih',
      value:    formatRupiah(month.netSales),
      sub:      `Komisi: ${formatRupiah(month.commission)}`,
      icon:     Banknote,
      color:    'text-emerald-500',
      bg:       'bg-emerald-50',
    },
    {
      label:    'Laba Bersih',
      value:    formatRupiah(month.netProfit),
      sub:      `Margin: ${month.netSales > 0 ? ((month.netProfit / month.netSales) * 100).toFixed(1) : 0}%`,
      icon:     Store,
      color:    month.netProfit >= 0 ? 'text-green-500' : 'text-red-500',
      bg:       month.netProfit >= 0 ? 'bg-green-50'   : 'bg-red-50',
    },
  ];

  const chartData = (dailyChart ?? []).map((d: any) => ({
    day:   new Date(d.day).getDate(),
    omzet: d.gross_sales,
    bersih: d.net_sales,
  }));

  const pieData = (mktBreak ?? []).map((m: any) => ({
    name:  MARKETPLACE_LABELS[m.marketplace] ?? m.marketplace,
    value: Number(m.grossSales),
    color: MARKETPLACE_COLORS[m.marketplace] ?? '#999',
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">Dashboard</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {new Date().toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700 btn-secondary"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Settlement alert */}
      {summary?.pendingSettlement > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            <strong>{formatRupiah(summary.pendingSettlement)}</strong> dari marketplace belum dicairkan.
            {' '}<a href="/dashboard/settlements" className="underline font-medium">Lihat Settlement →</a>
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="stat-card">
            <div className="flex items-start justify-between">
              <p className="text-xs text-stone-400 font-medium leading-tight">{kpi.label}</p>
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', kpi.bg)}>
                <kpi.icon className={cn('w-4 h-4', kpi.color)} />
              </div>
            </div>
            <p className="text-xl font-bold text-ink mt-2 leading-tight">{kpi.value}</p>
            <p className="text-xs text-stone-400 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-ink">Omzet Harian</h2>
              <p className="text-xs text-stone-400">
                {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-400 inline-block" />Kotor
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />Bersih
              </span>
            </div>
          </div>
          {loadChart ? (
            <div className="h-52 bg-stone-50 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="omzet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"   stopColor="#fb923c" stopOpacity={0.15} />
                    <stop offset="95%"  stopColor="#fb923c" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="bersih" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"   stopColor="#34d399" stopOpacity={0.15} />
                    <stop offset="95%"  stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#a8a29e' }} />
                <YAxis tickFormatter={(v) => formatShort(v)} tick={{ fontSize: 11, fill: '#a8a29e' }} />
                <Tooltip
                  formatter={(v: number) => [formatRupiah(v)]}
                  labelFormatter={(l) => `Tanggal ${l}`}
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e7e5e4' }}
                />
                <Area type="monotone" dataKey="omzet"  stroke="#fb923c" strokeWidth={2} fill="url(#omzet)"  />
                <Area type="monotone" dataKey="bersih" stroke="#34d399" strokeWidth={2} fill="url(#bersih)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie chart marketplace */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ink mb-1">Per Marketplace</h2>
          <p className="text-xs text-stone-400 mb-4">Bulan ini</p>
          {loadMkt ? (
            <div className="h-52 bg-stone-50 rounded-lg animate-pulse" />
          ) : pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                     dataKey="value" paddingAngle={3}>
                  {pieData.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [formatRupiah(v)]} />
                <Legend
                  formatter={(v) => <span className="text-xs text-stone-600">{v}</span>}
                  iconType="circle" iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-stone-300 text-sm">
              Belum ada data
            </div>
          )}
        </div>
      </div>

      {/* Top Products + P&L snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top products bar chart */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ink mb-1">Produk Terlaris</h2>
          <p className="text-xs text-stone-400 mb-4">Berdasarkan jumlah terjual bulan ini</p>
          {loadProds ? (
            <div className="h-48 bg-stone-50 rounded-lg animate-pulse" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={(topProds ?? []).slice(0, 7).map((p: any) => ({
                  name:  p.productName.length > 16 ? p.productName.slice(0, 16) + '…' : p.productName,
                  qty:   p._sum?.qty ?? p.qty ?? 0,
                }))}
                layout="vertical"
                margin={{ left: 4, right: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#a8a29e' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#78716c' }} width={110} />
                <Tooltip formatter={(v: number) => [`${v} pcs`]} contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="qty" fill="#fb923c" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Laba Rugi snapshot */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-ink mb-1">Ringkasan Laba Rugi</h2>
          <p className="text-xs text-stone-400 mb-4">Bulan berjalan</p>
          <div className="space-y-3">
            {[
              { label: 'Omzet Kotor',        value: month.grossSales,  positive: true  },
              { label: '— Diskon',            value: month.discount,    positive: false },
              { label: '— Komisi Marketplace',value: month.commission,  positive: false },
              { label: '= Pendapatan Bersih', value: month.netSales,    positive: true, bold: true },
              { label: '— HPP',               value: month.hpp,         positive: false },
              { label: '— Biaya Operasional', value: month.expenses,    positive: false },
              { label: '= Laba Bersih',       value: month.netProfit,   positive: month.netProfit >= 0, bold: true, big: true },
            ].map((row) => (
              <div
                key={row.label}
                className={cn(
                  'flex items-center justify-between py-1',
                  row.bold && 'border-t border-stone-100 pt-2',
                )}
              >
                <span className={cn('text-sm text-stone-500', row.bold && 'font-semibold text-ink')}>
                  {row.label}
                </span>
                <span className={cn(
                  'text-sm font-mono',
                  row.big  ? (row.positive ? 'text-green-600 font-bold text-base' : 'text-red-500 font-bold text-base') :
                  row.bold ? 'font-semibold text-ink' :
                  row.positive ? 'text-ink' : 'text-stone-500',
                )}>
                  {row.positive ? '' : '−'}{formatRupiah(Math.abs(row.value ?? 0))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-stone-100 rounded-lg" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-stone-100 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-64 bg-stone-100 rounded-xl" />
        <div className="h-64 bg-stone-100 rounded-xl" />
      </div>
    </div>
  );
}
