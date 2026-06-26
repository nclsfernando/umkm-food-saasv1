'use client';
// src/app/register/page.tsx
import { useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/auth-context';
import { ShoppingBag, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', businessName: '', phone: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { ...form, role: 'OWNER' });
      await login(form.email, form.password);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Pendaftaran gagal.');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'name',         label: 'Nama Lengkap',   type: 'text',     placeholder: 'Budi Santoso'          },
    { name: 'email',        label: 'Email',           type: 'email',    placeholder: 'email@bisnis.com'       },
    { name: 'password',     label: 'Password',        type: 'password', placeholder: 'Minimal 8 karakter'     },
    { name: 'businessName', label: 'Nama Usaha',      type: 'text',     placeholder: 'Warung Makan Bu Budi'   },
    { name: 'phone',        label: 'No. HP (opsional)',type: 'tel',     placeholder: '08123456789'             },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500 rounded-2xl mb-4 shadow-lg shadow-brand-200">
            <ShoppingBag className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ink">Daftar Akun Baru</h1>
          <p className="text-stone-500 text-sm mt-1">Gratis untuk UMKM kuliner Indonesia</p>
        </div>

        <div className="card p-6 shadow-xl shadow-stone-100">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.name}>
                <label className="text-sm font-medium text-stone-700 block mb-1.5">{f.label}</label>
                <input
                  name={f.name}
                  type={f.type}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  className="input"
                  required={f.name !== 'phone'}
                  minLength={f.name === 'password' ? 8 : undefined}
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Membuat akun...' : 'Buat Akun'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-brand-500 font-semibold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
