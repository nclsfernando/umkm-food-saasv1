// src/hooks/use-uploads.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export function useUploads(page = 1) {
  return useQuery({
    queryKey: ['uploads', page],
    queryFn: () => api.get('/uploads', { params: { page, limit: 20 } }).then(r => r.data),
  });
}

export function useUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, marketplace, uploadDate }: {
      file: File; marketplace: string; uploadDate: string;
    }) => {
      const form = new FormData();
      form.append('file', file);
      form.append('marketplace', marketplace);
      form.append('uploadDate', uploadDate);
      return api.post('/uploads', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(r => r.data);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['uploads'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(`Berhasil memproses ${data.rowsSuccess} dari ${data.rowsTotal} baris`);
    },
  });
}

// src/hooks/use-expenses.ts
export function useExpenses(params?: { from?: string; to?: string; page?: number }) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => api.get('/expenses', { params }).then(r => r.data),
  });
}

export function useExpenseSummary(from: string, to: string) {
  return useQuery({
    queryKey: ['expenses', 'summary', from, to],
    queryFn: () => api.get('/expenses/summary', { params: { from, to } }).then(r => r.data),
    enabled: !!from && !!to,
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/expenses', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Biaya berhasil ditambahkan');
    },
  });
}

export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => api.put(`/expenses/${id}`, data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Biaya berhasil diperbarui');
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/expenses/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Biaya dihapus');
    },
  });
}

// src/hooks/use-settlements.ts
export function useSettlements(params?: { marketplace?: string; status?: string; page?: number }) {
  return useQuery({
    queryKey: ['settlements', params],
    queryFn: () => api.get('/settlements', { params }).then(r => r.data),
  });
}

export function useMarkSettled() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, settledAmount }: { id: string; settledAmount: number }) =>
      api.put(`/settlements/${id}/settle`, { settledAmount }).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settlements'] });
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Settlement ditandai sudah cair');
    },
  });
}

// src/hooks/use-products.ts
export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => api.get('/products').then(r => r.data),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/products/categories').then(r => r.data),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/products', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produk berhasil ditambahkan');
    },
  });
}

// src/hooks/use-reports.ts
export function useProfitLoss(from: string, to: string) {
  return useQuery({
    queryKey: ['reports', 'profit-loss', from, to],
    queryFn: () => api.get('/reports/profit-loss', { params: { from, to } }).then(r => r.data),
    enabled: !!from && !!to,
  });
}

export function useMarketplaceReport(from: string, to: string) {
  return useQuery({
    queryKey: ['reports', 'marketplace', from, to],
    queryFn: () => api.get('/reports/marketplace', { params: { from, to } }).then(r => r.data),
    enabled: !!from && !!to,
  });
}

export function useProductReport(from: string, to: string) {
  return useQuery({
    queryKey: ['reports', 'products', from, to],
    queryFn: () => api.get('/reports/products', { params: { from, to } }).then(r => r.data),
    enabled: !!from && !!to,
  });
}

export function useMonthlyTrend(year: number) {
  return useQuery({
    queryKey: ['reports', 'monthly-trend', year],
    queryFn: () => api.get('/reports/monthly-trend', { params: { year } }).then(r => r.data),
  });
}

export function useOrders(params?: any) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => api.get('/orders', { params }).then(r => r.data),
  });
}
