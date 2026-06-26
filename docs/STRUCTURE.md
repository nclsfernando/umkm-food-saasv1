# Struktur Folder Lengkap — UMKM Food SaaS

```
umkm-food-saas/
│
├── README.md
├── docker-compose.yml
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD: test → build → deploy
│
├── docs/
│   ├── ERD.md                      # Entity Relationship Diagram
│   ├── API.md                      # API Documentation lengkap
│   └── DEPLOYMENT.md               # Panduan deploy ke Vercel + Railway
│
├── backend/                        # NestJS API
│   ├── Dockerfile
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── package.json
│   ├── .env.example
│   │
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema lengkap
│   │   └── seed.ts                 # Seed data awal (demo user + produk)
│   │
│   └── src/
│       ├── main.ts                 # Entry point (Swagger, CORS, Helmet)
│       ├── app.module.ts           # Root module
│       │
│       ├── prisma/
│       │   ├── prisma.service.ts
│       │   └── prisma.module.ts
│       │
│       ├── auth/
│       │   ├── auth.module.ts
│       │   ├── auth.service.ts     # Login, register, JWT
│       │   ├── auth.controller.ts
│       │   ├── dto/
│       │   │   ├── login.dto.ts
│       │   │   └── register.dto.ts
│       │   ├── guards/
│       │   │   ├── jwt-auth.guard.ts
│       │   │   └── local-auth.guard.ts
│       │   └── strategies/
│       │       ├── jwt.strategy.ts
│       │       └── local.strategy.ts
│       │
│       ├── uploads/
│       │   ├── uploads.module.ts
│       │   ├── uploads.service.ts  # Orchestrate upload → parse → save
│       │   ├── uploads.controller.ts
│       │   └── parsers/
│       │       └── marketplace-parser.service.ts  # ⭐ Core parser
│       │           # GoFood, GrabFood, ShopeeFood column mapping
│       │           # Auto-detect, normalize, calculate commission
│       │
│       ├── dashboard/
│       │   ├── dashboard.module.ts
│       │   ├── dashboard.service.ts  # KPI aggregation
│       │   └── dashboard.controller.ts
│       │
│       ├── orders/
│       │   ├── orders.module.ts
│       │   ├── orders.service.ts   # Filter + paginate orders
│       │   └── orders.controller.ts
│       │
│       ├── products/
│       │   ├── products.module.ts
│       │   ├── products.service.ts  # CRUD + HPP management
│       │   └── products.controller.ts
│       │
│       ├── expenses/
│       │   ├── expenses.module.ts
│       │   ├── expenses.service.ts  # Full CRUD biaya operasional
│       │   ├── expenses.controller.ts
│       │   └── dto/
│       │       └── create-expense.dto.ts
│       │
│       ├── settlements/
│       │   ├── settlements.module.ts
│       │   ├── settlements.service.ts  # Tracker pencairan dana
│       │   └── settlements.controller.ts
│       │
│       ├── reports/
│       │   ├── reports.module.ts
│       │   ├── reports.service.ts   # Laba Rugi, Marketplace, Produk
│       │   └── reports.controller.ts
│       │
│       └── users/
│           └── users.module.ts
│
└── frontend/                       # Next.js 15
    ├── Dockerfile
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── package.json
    ├── .env.example
    │
    └── src/
        ├── app/
        │   ├── layout.tsx              # Root layout + providers
        │   ├── globals.css             # Design tokens + utilities
        │   ├── page.tsx                # Redirect → /dashboard
        │   │
        │   ├── login/
        │   │   └── page.tsx            # Login page
        │   │
        │   ├── register/
        │   │   └── page.tsx            # Register page
        │   │
        │   └── dashboard/
        │       ├── layout.tsx          # Sidebar + mobile nav
        │       ├── page.tsx            # 📊 Dashboard KPI + charts
        │       │
        │       ├── upload/
        │       │   └── page.tsx        # ⬆️ Drag-drop upload laporan
        │       │
        │       ├── orders/
        │       │   └── page.tsx        # 🧾 Tabel order dengan filter
        │       │
        │       ├── products/
        │       │   └── page.tsx        # 📦 CRUD produk + HPP + margin
        │       │
        │       ├── expenses/
        │       │   └── page.tsx        # 💸 CRUD biaya operasional
        │       │
        │       ├── settlements/
        │       │   └── page.tsx        # 💰 Tracker pencairan dana
        │       │
        │       └── reports/
        │           └── page.tsx        # 📈 Laba Rugi, Marketplace, Produk, Tren
        │
        ├── components/
        │   └── providers.tsx           # React Query + Auth provider
        │
        ├── contexts/
        │   └── auth-context.tsx        # Global auth state + JWT
        │
        ├── hooks/
        │   ├── use-dashboard.ts        # React Query hooks dashboard
        │   └── use-data.ts             # Hooks uploads, expenses, etc.
        │
        └── lib/
            ├── api.ts                  # Axios instance + interceptors
            └── utils.ts                # formatRupiah, formatDate, dll
```

## Ringkasan Deliverables

| # | Item | Status |
|---|------|--------|
| 1 | Struktur Folder Lengkap | ✅ |
| 2 | ERD Database | ✅ `docs/ERD.md` |
| 3 | Prisma Schema | ✅ `backend/prisma/schema.prisma` |
| 4 | Backend NestJS Production Ready | ✅ |
| 5 | Frontend Next.js Production Ready | ✅ |
| 6 | Dockerfile (Backend + Frontend) | ✅ |
| 7 | Docker Compose | ✅ `docker-compose.yml` |
| 8 | API Documentation | ✅ `docs/API.md` |
| 9 | Deployment Guide | ✅ `docs/DEPLOYMENT.md` |
| 10| GitHub Actions CI/CD | ✅ `.github/workflows/deploy.yml` |
