'use client';
// src/app/dashboard/layout.tsx
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, LayoutDashboard, Upload, Package, Receipt,
  Landmark, FileBarChart, LogOut, Menu, X, ChevronRight,
  User, Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/dashboard',             label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/dashboard/upload',      label: 'Upload Laporan', icon: Upload },
  { href: '/dashboard/orders',      label: 'Data Order',   icon: Receipt },
  { href: '/dashboard/products',    label: 'Produk & HPP', icon: Package },
  { href: '/dashboard/expenses',    label: 'Biaya',        icon: Receipt },
  { href: '/dashboard/settlements', label: 'Settlement',   icon: Landmark },
  { href: '/dashboard/reports',     label: 'Laporan',      icon: FileBarChart },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router   = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div className="w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }
  if (!user) return null;

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside className={cn(
      'flex flex-col h-full bg-white border-r border-stone-100',
      mobile ? 'w-72' : 'w-64 hidden md:flex',
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-stone-100">
        <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <ShoppingBag className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-ink leading-tight">UMKM Food</p>
          <p className="text-xs text-stone-400 leading-tight truncate max-w-[130px]">
            {user.businessName ?? user.name}
          </p>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="ml-auto text-stone-400">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700',
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-brand-500')} />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-brand-400" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-stone-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 transition-colors">
          <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-brand-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ink truncate">{user.name}</p>
            <p className="text-xs text-stone-400 truncate">{user.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-500
                     hover:bg-red-50 hover:text-red-600 transition-colors w-full mt-1"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-stone-100">
          <button onClick={() => setSidebarOpen(true)} className="text-stone-500">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-ink">UMKM Food</span>
          </div>
          <button className="ml-auto text-stone-400">
            <Bell className="w-5 h-5" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
