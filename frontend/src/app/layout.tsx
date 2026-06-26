// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title:       'UMKM Food — Laporan Keuangan Online',
  description: 'Aplikasi laporan keuangan untuk UMKM kuliner GoFood, GrabFood, ShopeeFood',
  manifest:    '/manifest.json',
  viewport:    'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { fontFamily: 'Plus Jakarta Sans', fontSize: '14px' },
              success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
