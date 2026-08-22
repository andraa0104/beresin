# Beresin Database Deployment & Connection Guide

Dokumentasi implementasi database MySQL 8+ untuk platform **Beresin** (Service Commerce Platform) berdasarkan [Beresin Database Module Documentation.md](file:///d:/beresin/Beresin%20Database%20Module%20Documentation.md).

---

## 1. Konfigurasi Database VPS

| Parameter | Nilai |
| :--- | :--- |
| **Server Host / IP** | `116.212.73.22` |
| **Port** | `3306` |
| **Database Name** | `beresin_db` |
| **App Username** | `beresin_user` |
| **App Password** | `Beresin#Secure2026!` |
| **Root Username** | `root` |
| **Root Password** | `Beresin#Root2026!` |
| **Charset / Collation** | `utf8mb4` / `utf8mb4_unicode_ci` |

---

## 2. Struktur Tabel yang Telah Dibuat (`beresin_schema.sql`)

### Module 1: Auth & User Management
- `roles` (Super Admin, Admin, Customer Service, Marketing, Customer, Mitra Service)
- `users` (UUID, email, phone, password_hash, status, soft-delete `deleted_at`)
- `user_roles` (Relasi user dengan role)

### Module 2 & 3: Profiles
- `customer_profiles` (customer_code, total_transaction, total_spending)
- `mitra_profiles` (company_name, address, latitude, longitude, rating, status)

### Module 4: Service Catalog (Dynamic Service System)
- `service_categories` (AC, Motor, Mobil, Furniture, Elektronik)
- `services` (Layanan spesifik)
- `service_packages` (Paket jasa, harga dasar, durasi pengerjaan)

### Module 5 & 6: Product Catalog & Mapping
- `product_categories`
- `products` (Tipe: `MAIN_PRODUCT`, `ACCESSORY`, `MATERIAL`, `SPAREPART`)
- `product_variants` (SKU, JSON specification, harga, stok)
- `service_products` (Mapping layanan dengan produk rekomendasi)
- `service_accessories` (Mapping aksesoris terkait layanan)

### Module 7: Order Management (Snapshot Pricing Rule)
- `orders` (Order number, status flow dari WAITING_CONFIRMATION sampai PAID/COMPLETED/CANCELLED)
- `order_items` (Menyimpan snapshot harga & nama item: `PRODUCT`, `ACCESSORY`, `SERVICE`, `ADDON`)

### Module 8 & 9: Technician & Modifications
- `technician_assignments` (Penugasan mitra/teknisi)
- `order_change_requests` (Pengajuan perubahan kebutuhan pekerjaan di lapangan)

### Module 10, 11, 12, 13: Operations
- `payments` (Tracking pembayaran & gateway transaction_id)
- `promotions` (Diskon persen/nominal untuk `NEW_USER`, `EXISTING_USER`, `ALL_USER`)
- `locations` (GPS latitude & longitude customer)
- `notifications` (Log integrasi WhatsApp, Push Notification, SMS)

---

## 3. Cara Menjalankan Deployment ke VPS

### Opsi A: Menggunakan PowerShell dari Komputer Lokal (Windows)
Jalankan file [deploy_to_vps.ps1](file:///d:/beresin/deploy_to_vps.ps1):
```powershell
powershell -ExecutionPolicy Bypass -File .\deploy_to_vps.ps1
```
*(Masukkan password root VPS saat diminta oleh SSH/SCP)*

### Opsi B: Jalankan Langsung di VPS
1. Upload file [beresin_schema.sql](file:///d:/beresin/beresin_schema.sql) dan [deploy_db.sh](file:///d:/beresin/deploy_db.sh) ke VPS:
   ```bash
   scp beresin_schema.sql deploy_db.sh root@116.212.73.22:/root/
   ```
2. SSH ke VPS dan jalankan script:
   ```bash
   ssh root@116.212.73.22
   chmod +x deploy_db.sh
   ./deploy_db.sh
   ```

---

## 4. Format Environment / Connection String (NestJS / Prisma / TypeORM)

```env
DATABASE_HOST=116.212.73.22
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=terserah
DATABASE_NAME=beresin_db

# TypeORM / Prisma Connection URL
DATABASE_URL="mysql://root:terserah@116.212.73.22:3306/beresin_db"
```
