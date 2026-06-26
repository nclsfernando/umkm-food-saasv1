'use client';
// src/app/dashboard/products/page.tsx
import { useState } from 'react';
import { Plus, Pencil, Package, X, Loader2 } from 'lucide-react';
import { useProducts, useCategories, useCreateProduct } from '@/hooks/use-data';
import { formatRupiah } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const CATEGORY_LABELS: Record<string, string> = {
  FOOD: 'Makanan', BEVERAGE: 'Minuman', DESSERT: 'Dessert', SNACK: 'Snack',
};
const CATEGORY_COLORS: Record<string, string> = {
  FOOD: 'bg-orange-100 text-orange-700',
  BEVERAGE: 'bg-blue-100 text-blue-700',
  DESSERT: 'bg-pink-100 text-pink-700',
  SNACK: 'bg-yellow-100 text-yellow-700',
};

interface ProductForm { name: string; categoryId: string; sellingPrice: string; hpp: string; }
const emptyForm: ProductForm = { name: '', categoryId: '', sellingPrice: '', hpp: '' };

export default function ProductsPage() {
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form,    setForm]    = useState<ProductForm>(emptyForm);

  const { data: products, isLoading } = useProducts();
  const { data: categories }          = useCategories();
  const { mutateAsync: create, isPending: creating } = useCreateProduct();
  const qc = useQueryClient();

  const openNew  = () => { setEditing(null); setForm(emptyForm); setModal(true); };
  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, categoryId: p.categoryId, sellingPrice: String(p.sellingPrice), hpp: String(p.hpp) });
    setModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, sellingPrice: parseFloat(form.sellingPrice), hpp: parseFloat(form.hpp) };
    if (editing) {
      await api.put(`/products/${editing.id}`, payload);
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produk diperbarui');
    } else {
      await create(payload);
    }
    setModal(false);
  };

  const margin = (sell: number, hpp: number) =>
    sell > 0 ? (((sell - hpp) / sell) * 100).toFixed(0) : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-ink">Produk & HPP</h1>
          <p className="text-sm text-stone-400 mt-0.5">Kelola produk dan Harga Pokok Produksi untuk hitung laba</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />Tambah Produk
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-36 animate-pulse bg-stone-50" />)}
        </div>
      ) : !products?.length ? (
        <div className="card p-12 text-center">
          <Package className="w-12 h-12 text-stone-200 mx-auto mb-3" />
          <p className="text-stone-400 text-sm">Belum ada produk. Tambahkan produk untuk menghitung laba bersih.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p: any) => {
            const m = margin(Number(p.sellingPrice), Number(p.hpp));
            return (
              <div key={p.id} className="card p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink leading-tight truncate">{p.name}</p>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block',
                      CATEGORY_COLORS[p.category?.name ?? ''] ?? 'bg-stone-100 text-stone-600')}>
                      {CATEGORY_LABELS[p.category?.name ?? ''] ?? p.category?.name}
                    </span>
                  </div>
                  <button onClick={() => openEdit(p)}
                    className="p-1.5 text-stone-300 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors ml-2 flex-shrink-0">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-stone-400">Harga Jual</p>
                    <p className="text-sm font-bold text-ink mt-0.5">{formatRupiah(p.sellingPrice)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">HPP</p>
                    <p className="text-sm font-bold text-red-500 mt-0.5">{formatRupiah(p.hpp)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-400">Margin</p>
                    <p className={cn('text-sm font-bold mt-0.5', Number(m) >= 30 ? 'text-green-600' : 'text-amber-500')}>
                      {m}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(false)} />
          <div className="relative card w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-ink">{editing ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button onClick={() => setModal(false)} className="text-stone-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1.5">Nama Produk</label>
                <input type="text" value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ayam Geprek Original" className="input" required />
              </div>
              <div>
                <label className="text-sm font-medium text-stone-700 block mb-1.5">Kategori</label>
                <select value={form.categoryId}
                  onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  className="input" required>
                  <option value="">Pilih kategori...</option>
                  {(categories ?? []).map((c: any) => (
                    <option key={c.id} value={c.id}>{CATEGORY_LABELS[c.name] ?? c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-1.5">Harga Jual (Rp)</label>
                  <input type="number" value={form.sellingPrice}
                    onChange={e => setForm(f => ({ ...f, sellingPrice: e.target.value }))}
                    placeholder="25000" min="0" className="input font-mono" required />
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-700 block mb-1.5">HPP (Rp)</label>
                  <input type="number" value={form.hpp}
                    onChange={e => setForm(f => ({ ...f, hpp: e.target.value }))}
                    placeholder="12000" min="0" className="input font-mono" required />
                </div>
              </div>
              {form.sellingPrice && form.hpp && (
                <div className="bg-stone-50 rounded-lg px-4 py-3 text-sm">
                  <span className="text-stone-500">Margin: </span>
                  <span className={cn('font-bold',
                    Number(margin(parseFloat(form.sellingPrice), parseFloat(form.hpp))) >= 30
                      ? 'text-green-600' : 'text-amber-500')}>
                    {margin(parseFloat(form.sellingPrice), parseFloat(form.hpp))}%
                  </span>
                  <span className="text-stone-400 ml-2">
                    ({formatRupiah(parseFloat(form.sellingPrice) - parseFloat(form.hpp))} per porsi)
                  </span>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Batal</button>
                <button type="submit" disabled={creating}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
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
