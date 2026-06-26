// src/hooks/use-dashboard.ts
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => api.get('/dashboard/summary').then(r => r.data),
    refetchInterval: 60_000, // auto-refresh every minute
  });
}

export function useMarketplaceBreakdown(from: string, to: string) {
  return useQuery({
    queryKey: ['dashboard', 'marketplace', from, to],
    queryFn: () => api.get('/dashboard/marketplace', { params: { from, to } }).then(r => r.data),
    enabled: !!from && !!to,
  });
}

export function useDailyChart(year: number, month: number) {
  return useQuery({
    queryKey: ['dashboard', 'daily-chart', year, month],
    queryFn: () => api.get('/dashboard/daily-chart', { params: { year, month } }).then(r => r.data),
  });
}

export function useTopProducts(from: string, to: string) {
  return useQuery({
    queryKey: ['dashboard', 'top-products', from, to],
    queryFn: () => api.get('/dashboard/top-products', { params: { from, to } }).then(r => r.data),
    enabled: !!from && !!to,
  });
}
