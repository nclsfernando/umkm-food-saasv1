# ERD — UMKM Food SaaS Database

## Entity Relationship Diagram

```mermaid
erDiagram
    users {
        uuid id PK
        string email UK
        string password_hash
        string name
        enum role "OWNER|STAFF"
        string business_name
        string phone
        string avatar_url
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    categories {
        uuid id PK
        enum name "FOOD|BEVERAGE|DESSERT|SNACK"
        timestamp created_at
    }

    products {
        uuid id PK
        string name
        uuid category_id FK
        decimal selling_price
        decimal hpp
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    uploads {
        uuid id PK
        uuid user_id FK
        enum marketplace "GOFOOD|GRABFOOD|SHOPEEFOOD"
        string filename
        string file_url
        int file_size
        enum status "PROCESSING|SUCCESS|FAILED"
        int rows_total
        int rows_success
        int rows_failed
        json error_log
        date upload_date
        timestamp created_at
    }

    orders {
        uuid id PK
        uuid upload_id FK
        string order_number
        enum marketplace "GOFOOD|GRABFOOD|SHOPEEFOOD"
        timestamp order_date
        enum status "COMPLETED|CANCELLED|REFUNDED"
        decimal gross_sales
        decimal discount
        decimal commission
        decimal net_sales
        timestamp created_at
    }

    order_items {
        uuid id PK
        uuid order_id FK
        uuid product_id FK "nullable"
        string product_name
        int qty
        decimal unit_price
        decimal subtotal
    }

    expenses {
        uuid id PK
        uuid user_id FK
        enum category "BAHAN_BAKU|GAS|LISTRIK|AIR|INTERNET|GAJI|MARKETING|TRANSPORTASI|LAIN_LAIN"
        string description
        decimal amount
        date expense_date
        timestamp created_at
        timestamp updated_at
    }

    settlements {
        uuid id PK
        uuid order_id FK UK
        enum marketplace "GOFOOD|GRABFOOD|SHOPEEFOOD"
        decimal expected_amount
        decimal settled_amount "nullable"
        enum status "PENDING|SETTLED"
        timestamp settled_at "nullable"
        timestamp created_at
    }

    audit_logs {
        uuid id PK
        uuid user_id FK
        string action
        string entity
        string entity_id "nullable"
        json meta "nullable"
        timestamp created_at
    }

    %% Relationships
    users        ||--o{ uploads      : "membuat"
    users        ||--o{ expenses     : "mencatat"
    users        ||--o{ audit_logs   : "melakukan"
    categories   ||--o{ products     : "mengkategorikan"
    uploads      ||--o{ orders       : "menghasilkan"
    orders       ||--o{ order_items  : "berisi"
    orders       ||--o| settlements  : "memiliki"
    products     ||--o{ order_items  : "dirujuk oleh"
```

## Penjelasan Tabel

### `users`
Menyimpan akun pemilik usaha dan staff. Role OWNER punya akses penuh, STAFF akses terbatas.

### `categories` & `products`
Master data produk dengan HPP. Digunakan untuk menghitung laba kotor per produk.

### `uploads`
Rekam jejak setiap file yang diupload. Menyimpan status pemrosesan dan error log untuk debugging.

### `orders` & `order_items`
Data transaksi yang sudah distandarisasi dari laporan marketplace. Setiap order bisa punya banyak item.

### `expenses`
Biaya operasional yang diinput manual oleh pemilik. Dikurangi dari laba kotor untuk mendapat laba bersih.

### `settlements`
Tracker pencairan dana dari marketplace. Status PENDING → SETTLED setelah dikonfirmasi pemilik.

### `audit_logs`
Log aktivitas user untuk keamanan dan debugging.

## Index yang Dibuat

```sql
-- orders
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_orders_marketplace ON orders(marketplace);
CREATE UNIQUE INDEX idx_orders_unique ON orders(order_number, marketplace);

-- expenses
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);

-- settlements
CREATE INDEX idx_settlements_status ON settlements(status);
CREATE INDEX idx_settlements_marketplace ON settlements(marketplace);

-- audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```
