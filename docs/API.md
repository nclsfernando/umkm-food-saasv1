# API Documentation — UMKM Food SaaS

Base URL: `https://api.namabisnis.com/api/v1`  
Auth: Bearer Token (JWT) — kecuali endpoint Auth

---

## Auth

### POST /auth/register
Daftar akun baru.

**Body:**
```json
{
  "email": "owner@warungmakan.com",
  "name": "Budi Santoso",
  "password": "Password123!",
  "businessName": "Warung Makan Bu Budi",
  "phone": "08123456789"
}
```
**Response:** `{ accessToken, user }`

---

### POST /auth/login
Login dan dapatkan JWT.

**Body:** `{ "email": "...", "password": "..." }`  
**Response:** `{ accessToken, user }`

---

### GET /auth/me
Data user yang sedang login.  
**Header:** `Authorization: Bearer <token>`

---

## Dashboard

### GET /dashboard/summary
KPI ringkasan bisnis.

**Response:**
```json
{
  "today":  { "orders": 12, "grossSales": 450000, "netSales": 360000 },
  "week":   { "orders": 87, "grossSales": 3200000, ... },
  "month":  {
    "orders": 342, "grossSales": 12500000, "netSales": 10000000,
    "hpp": 5000000, "expenses": 2000000,
    "grossProfit": 5000000, "netProfit": 3000000
  },
  "pendingSettlement": 1250000
}
```

### GET /dashboard/marketplace?from=2024-01-01&to=2024-01-31
Breakdown per marketplace.

### GET /dashboard/daily-chart?year=2024&month=1
Data grafik omzet harian.

### GET /dashboard/top-products?from=...&to=...&limit=10
Produk terlaris berdasarkan qty.

---

## Uploads

### POST /uploads
Upload laporan marketplace.

**Content-Type:** `multipart/form-data`

| Field | Type | Keterangan |
|-------|------|------------|
| `file` | File | .xlsx / .xls / .csv, maks 10MB |
| `marketplace` | string | `GOFOOD` / `GRABFOOD` / `SHOPEEFOOD` |
| `uploadDate` | string | Format: `YYYY-MM-DD` |

**Response:**
```json
{
  "uploadId": "uuid",
  "rowsTotal": 150,
  "rowsSuccess": 148,
  "rowsFailed": 2,
  "errors": [
    { "orderNumber": "GF-123", "reason": "Duplikat" }
  ]
}
```

### GET /uploads?page=1&limit=20
Riwayat upload.

### GET /uploads/:id
Detail upload tertentu.

---

## Orders

### GET /orders
Daftar order dengan filter.

**Query params:**
| Param | Contoh | Keterangan |
|-------|--------|------------|
| `from` | `2024-01-01` | Tanggal mulai |
| `to` | `2024-01-31` | Tanggal akhir |
| `marketplace` | `GOFOOD` | Filter marketplace |
| `status` | `COMPLETED` | Filter status |
| `page` | `1` | Halaman |
| `limit` | `50` | Per halaman |

**Response:** `{ data[], total, page, limit, totalPages }`

### GET /orders/:id
Detail order dengan items dan settlement.

---

## Products

### GET /products/categories
Daftar kategori produk.

### POST /products
Tambah produk baru.
```json
{
  "name": "Ayam Geprek Original",
  "categoryId": "uuid",
  "sellingPrice": 25000,
  "hpp": 12000
}
```

### GET /products
Daftar semua produk aktif.

### PUT /products/:id
Update produk.

### DELETE /products/:id
Nonaktifkan produk (soft delete).

---

## Expenses

### POST /expenses
Tambah biaya.
```json
{
  "category": "GAS",
  "description": "Gas LPG 3kg x 2",
  "amount": 45000,
  "expenseDate": "2024-01-15"
}
```

**Kategori yang tersedia:**
`BAHAN_BAKU` | `GAS` | `LISTRIK` | `AIR` | `INTERNET` | `GAJI` | `MARKETING` | `TRANSPORTASI` | `LAIN_LAIN`

### GET /expenses?from=...&to=...&page=1&limit=20
Daftar biaya dengan filter.

### GET /expenses/summary?from=...&to=...
Total biaya per kategori.
```json
[
  { "category": "BAHAN_BAKU", "total": 3500000 },
  { "category": "GAS", "total": 90000 }
]
```

### PUT /expenses/:id
Update biaya.

### DELETE /expenses/:id
Hapus biaya.

---

## Settlements

### GET /settlements?marketplace=GOFOOD&status=PENDING&page=1
Daftar settlement dengan filter.

**Response includes summary:**
```json
{
  "data": [...],
  "summary": { "pending": 2500000, "settled": 8000000 },
  "total": 45,
  "totalPages": 3
}
```

### PUT /settlements/:id/settle
Tandai satu settlement sudah cair.
```json
{ "settledAmount": 245000 }
```

### PUT /settlements/bulk-settle
Tandai semua pending dari marketplace sudah cair.
```json
{
  "marketplace": "GOFOOD",
  "settledDate": "2024-01-20"
}
```

---

## Reports

### GET /reports/profit-loss?from=2024-01-01&to=2024-01-31
Laporan Laba Rugi lengkap.

**Response:**
```json
{
  "period": { "from": "2024-01-01", "to": "2024-01-31" },
  "orders": 342,
  "revenue": {
    "grossSales": 12500000,
    "discount":    500000,
    "commission": 2000000,
    "netSales":  10000000
  },
  "cogs": { "hpp": 5000000 },
  "grossProfit": 5000000,
  "expenses": {
    "total": 2000000,
    "breakdown": {
      "BAHAN_BAKU": 1500000,
      "GAS": 90000,
      "LISTRIK": 200000
    }
  },
  "netProfit": 3000000,
  "margin": "30.00"
}
```

### GET /reports/marketplace?from=...&to=...
Laporan per marketplace (GoFood, GrabFood, ShopeeFood).

### GET /reports/products?from=...&to=...
Laporan produk terlaris & kurang laku.

### GET /reports/monthly-trend?year=2024
Tren omzet bulanan selama setahun.

---

## Users

### GET /users
Daftar semua user (Owner only).

### PUT /users/profile
Update profil user yang login.
```json
{
  "name": "Budi Santoso",
  "businessName": "Warung Makan Bu Budi",
  "phone": "08123456789"
}
```

---

## Error Codes

| Code | Keterangan |
|------|------------|
| 400 | Request tidak valid (format salah, field kosong) |
| 401 | Token tidak ada / expired |
| 403 | Tidak punya akses |
| 404 | Data tidak ditemukan |
| 409 | Konflik (misal: email sudah terdaftar, duplikat order) |
| 429 | Rate limit: maks 100 request/menit per IP |
| 500 | Server error |

**Format error response:**
```json
{
  "statusCode": 400,
  "message": ["email must be an email"],
  "error": "Bad Request"
}
```
