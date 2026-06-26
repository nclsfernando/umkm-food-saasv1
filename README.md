# 🍜 UMKM Food — Aplikasi Laporan Keuangan Online Food

Aplikasi SaaS untuk UMKM kuliner yang berjualan di GoFood, GrabFood, dan ShopeeFood.

## Stack

| Layer      | Tech                          |
|------------|-------------------------------|
| Frontend   | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| Backend    | NestJS, Prisma ORM            |
| Database   | PostgreSQL                    |
| Deploy FE  | Vercel                        |
| Deploy BE  | Railway                       |

## Quickstart (Local)

```bash
# 1. Clone & setup
git clone https://github.com/yourorg/umkm-food.git
cd umkm-food

# 2. Backend
cd backend
cp .env.example .env        # isi DATABASE_URL & JWT_SECRET
npm install
npx prisma migrate dev
npm run start:dev

# 3. Frontend
cd ../frontend
cp .env.example .env.local  # isi NEXT_PUBLIC_API_URL
npm install
npm run dev
```

## Docker (semua sekaligus)

```bash
docker compose up --build
```

Frontend: http://localhost:3000  
Backend API: http://localhost:4000  
API Docs: http://localhost:4000/api/docs

## Folder Structure

```
umkm-food-saas/
├── frontend/           # Next.js 15 app
├── backend/            # NestJS API
├── docs/               # ERD, API Docs, Deploy Guide
├── docker-compose.yml
└── .github/workflows/  # CI/CD
```
