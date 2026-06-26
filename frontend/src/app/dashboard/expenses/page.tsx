'use client';
// src/app/dashboard/expenses/page.tsx
import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, X } from 'lucide-react';
import { useExpenses, useExpenseSummary, useCreateExpense, useUpdateExpense, useDeleteExpense } from '@/hooks/use-data';
import { formatRupiah, formatDate, currentMonthRange, EXPENSE_LABELS } from '@/lib/utils';
import { cn } from '@/lib/utils';

const EXPENSE_CATEGORIES = Object.entries(EXPENSE_LABELS).map(([id, label]) => ({ id, label }));

interface ExpenseForm {
  category: string;
  description: string;
  amount: string;
  expenseDate: string;
}

const emptyForm: ExpenseForm = {
  category: 'BAHAN_BAKU', description: '', amount: '', expenseDate: new Date().toISOString().split('T')[0],
};

export default function ExpensesPage() {
  const { from, to } = currentMonthRange();
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form,    setForm]    = useState<ExpenseForm>(emptyForm);
  const [page,    setPage]    = useState(1);

  const { data, isLoading }          = useExpenses({ from, to, page });
  const { data: summary }            = useExpenseSummary(from, to);
  const { mutateAsync: create, isPending: creating } = useCreateExpense();
  const { mutateAsync: update, isPending: updating } = useUpdateExpense();
  const { mutateAsync: remove }                      = useDeleteExpense();

  const openNew  = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (e: any) => {
    setEditing(e);
    setForm({
      category:    e.category,
      description: e.description ?? '',
      amount:      String(e.amount),
      expenseDate: e.expenseDate.split('T')[0],
    });
    setModal(true);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const payload = { ...form, amount: parseFloat(form.amount) };
    if (editing) await update({ id: editing.id, ...payload });
    else         await create(payload);
    setModal(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Hapus biaya ini?')) await remove(id);
  };

  const totalExpense = (summary ?? []).reduce((acc: number, s: any) => acc + Number(s.total), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">Biaya Operasional</h1>
          <p className="text-sm text-stone-400 mt-0.5">Catat semua pengeluaran usaha bulan ini</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tambah Biaya
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {(summary as any[]).map((s: any) => (
            <div key={s.category} className="card p-4">
              <p className="text-xs text-stone-400 mb-1">{EXPENSE_LABELS[s.category] ?? s.category}</p>
              <p className="text-sm font-bold text-ink">{formatRupiah(s.total)}</p>
            </div>
          ))}
          <div className="card p-4 bg-red-50 border-red-100">
            <p className="text-xs text-red-400 mb-1 font-medium">Total Biaya</p>
            <p className="text-sm font-bold text-red-600">{formatRupiah(totalExpense)}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50">
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-400 uppercase tracking-wider">Keterangan</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-stone-400 uppercase tracking-wider">Jumlah</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-stone-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : !data?.data?.length ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-stone-400 text-sm">
                    Belum ada biaya. Klik "Tambah Biaya" untuk mulai mencatat.
                  </td>
                </tr>
              ) : (
                data.data.map((e: any) => (
                  <tr key={e.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{formatDate(e.expenseDate)}</td>
                    <td className="px-4 py-3">
                      <span className="bg-stone-100 text-stone-600 text-xs font-medium px-2 py-0.5 rounded-full">
                        {EXPENSE_LABELS[e.category] ?? e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-600 max-w-xs truncate">{e.description ?? '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-ink font-mono">
                      {formatRupiah(e.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => openEdit(e)}
                          className="p-1.5 text-stone-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(e.id)}
                          className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100">
            <p className="text-xs text-stone-400">
              Total {data.total} biaya
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Sebelumnya</button>
              <button onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                className="btn-secondary text-xs py-1 px-3 disabled:opacity-40">Berikutnya</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(false)} />
          <div className="relative card w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-ink">
                {editing ? 'Edit Biaya' : 'Tambah Biaya'}
              </h2>
              <button onClick={() => setModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1.5">Kategori</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="input"
                  required
                >
                  {EXPENSE_CATEGORIES.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1.5">Keterangan (opsional)</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Contoh: Gas LPG 3kg × 2"
                  className="input"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1.5">Jumlah (Rp)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0"
                  min="0"
                  className="input font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1.5">Tanggal</label>
                <input
                  type="date"
                  value={form.expenseDate}
                  onChange={e => setForm(f => ({ ...f, expenseDate: e.target.value }))}
                  className="input"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creating || updating}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {(creating || updating) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
