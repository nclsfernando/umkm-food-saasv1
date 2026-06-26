# Deployment Guide — UMKM Food SaaS

## Overview

```
Frontend  → Vercel  (auto-deploy dari GitHub)
Backend   → Railway (Docker container)
Database  → Railway PostgreSQL plugin
Domain    → app.namabisnis.com (custom domain di Vercel)
```

---

## 1. Database (Railway PostgreSQL)

1. Buka [railway.app](https://railway.app) → New Project
2. Klik **Add Plugin** → **PostgreSQL**
3. Setelah selesai, klik plugin PostgreSQL → salin `DATABASE_URL`
   ```
   postgresql://postgres:xxx@containers-us-west-xxx.railway.app:5432/railway
   ```

---

## 2. Backend (Railway)

### Deploy via GitHub

1. Di Railway project yang sama → **New Service** → **GitHub Repo**
2. Pilih repo → pilih folder `backend` (atau atur root directory)
3. Railway otomatis mendeteksi Dockerfile

### Environment Variables di Railway

Buka service backend → **Variables** → tambahkan:

```env
NODE_ENV=production
PORT=4000
DATABASE_URL=<salin dari plugin PostgreSQL>
JWT_SECRET=<generate random string 64 karakter>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://app.namabisnis.com
```

> **Generate JWT_SECRET:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### Run Migration Otomatis

Dockerfile sudah include `prisma migrate deploy` sebelum start server.
Tidak perlu langkah manual.

### Dapatkan Backend URL

Railway akan memberikan URL seperti:
```
https://umkm-food-backend.up.railway.app
```
Salin untuk konfigurasi frontend.

---

## 3. Frontend (Vercel)

### Deploy via Vercel CLI

```bash
cd frontend
npm i -g vercel
vercel login
vercel --prod
```

### Atau via Vercel Dashboard

1. [vercel.com](https://vercel.com) → **New Project** → Import dari GitHub
2. **Root Directory**: `frontend`
3. **Framework Preset**: Next.js (auto-detect)

### Environment Variables di Vercel

Buka project → **Settings** → **Environment Variables**:

```env
NEXT_PUBLIC_API_URL=https://umkm-food-backend.up.railway.app/api/v1
```

### Custom Domain

1. Vercel project → **Settings** → **Domains**
2. Tambahkan `app.namabisnis.com`
3. Di DNS provider, tambahkan CNAME:
   ```
   app → cname.vercel-dns.com
   ```
4. SSL otomatis oleh Vercel (Let's Encrypt)

---

## 4. GitHub Actions (CI/CD)

Tambahkan secrets di **GitHub repo → Settings → Secrets**:

| Secret | Value |
|--------|-------|
| `VERCEL_TOKEN` | Token dari vercel.com/account |
| `VERCEL_ORG_ID` | `.vercel/project.json` setelah `vercel link` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` setelah `vercel link` |
| `RAILWAY_TOKEN` | Railway dashboard → Account → Tokens |
| `NEXT_PUBLIC_API_URL` | URL backend Railway |

Setelah setup, setiap push ke `main`:
- ✅ Lint + Build otomatis
- ✅ Deploy frontend ke Vercel
- ✅ Deploy backend ke Railway

---

## 5. Seed Data Awal (Opsional)

```bash
# Dari mesin lokal, jalankan seed ke production DB
cd backend
DATABASE_URL="postgresql://..." npx ts-node prisma/seed.ts
```

---

## 6. Verifikasi

```bash
# Health check backend
curl https://umkm-food-backend.up.railway.app/api/v1/health

# Test login
curl -X POST https://umkm-food-backend.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@test.com","password":"Password123!"}'
```

---

## Checklist Production

- [ ] `JWT_SECRET` unik dan panjang (min 64 char)
- [ ] `NODE_ENV=production` di Railway
- [ ] Database backup diaktifkan (Railway: Settings → Backups)
- [ ] Custom domain dengan SSL di Vercel
- [ ] Rate limiting aktif (sudah di ThrottlerModule)
- [ ] Helmet security headers aktif (sudah di main.ts)

---

## Estimasi Biaya

| Layanan | Plan | Estimasi/bulan |
|---------|------|----------------|
| Vercel  | Hobby (free) | Rp 0 |
| Railway | Starter ($5 credit) | ~Rp 30.000–80.000 |
| Domain  | Custom domain | ~Rp 100.000/tahun |

**Total: ~Rp 30.000–80.000/bulan** — sangat terjangkau untuk UMKM.
