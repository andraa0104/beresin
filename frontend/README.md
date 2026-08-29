# 🚀 Beresin Frontend - Production-Grade Progressive Web App (PWA)

Platform frontend untuk layanan service commerce **Beresin** (Service AC, Otomotif, Furniture, dan Elektronik). Dibangun dengan arsitektur **Next.js (App Router)**, **TypeScript Strict Mode**, **Tailwind CSS**, dan mengusung sistem desain internal **"Beresin Liquid"** yang memberikan pengalaman pengguna sekelas aplikasi mobile native pada smartphone.

---

## 📑 Daftar Isi
1. [Tech Stack & Library](#1-tech-stack--library)
2. [Arsitektur & Struktur Folder](#2-arsitektur--struktur-folder)
3. [Design System: Beresin Liquid & 3-Mode Theme](#3-design-system-beresin-liquid--3-mode-theme)
4. [PWA & Strategi Caching](#4-pwa--strategi-caching)
5. [Autentikasi & Otorisasi (7 Aktor RBAC)](#5-autentikasi--otorisasi-7-aktor-rbac)
6. [Instalasi & Menjalankan Aplikasi](#6-instalasi--menjalankan-aplikasi)
7. [Scripts & Command Reference](#7-scripts--command-reference)
8. [Matriks Halaman & Endpoint Backend](#8-matriks-halaman--endpoint-backend)

---

## 1. Tech Stack & Library

- **Framework:** Next.js (App Router, Turbopack, React 19)
- **Language:** TypeScript (Strict Mode)
- **Styling:** Tailwind CSS + Custom CSS Variables Tokens
- **Icons:** Lucide React
- **Server State & Cache:** TanStack Query v5
- **Form & Validation:** React Hook Form + Zod
- **Testing:** Vitest + React Testing Library + JSDOM
- **API Spec & Codegen:** Script pembuat TypeScript types otomatis dari OpenAPI 3.0 (`http://localhost:3000/api/docs-json`)

---

## 2. Arsitektur & Struktur Folder

```text
frontend/
├── public/
│   ├── icons/                    # PWA icons (192, 512, maskable, apple-touch-icon)
│   ├── manifest.json             # Web App Manifest PWA
│   ├── sw.js                     # PWA Service Worker (App Shell cache, network-first API)
│   └── offline.html              # Fallback offline screen
├── src/
│   ├── app/                      # Next.js App Router (22 Routes)
│   │   ├── page.tsx              # Public Landing Page & Catalog Showcase
│   │   ├── layout.tsx            # Root Layout (PWA meta, Providers, Anti-flash script)
│   │   ├── globals.css           # Beresin Liquid tokens & Tailwind styles
│   │   ├── services/             # Katalog Layanan & Detail Konfigurasi Paket
│   │   ├── cart/                 # Keranjang Sementara & Validasi Voucher
│   │   ├── checkout/             # Checkout 1-Step Auth & Lokasi Pengerjaan
│   │   ├── orders/[id]/          # Detail Pesanan, Timeline, & Pembayaran
│   │   ├── track/                # Lacak Status Pesanan Publik
│   │   ├── promotions/           # Daftar Kupon & Voucher Diskon
│   │   ├── customer/             # Portal Pelanggan (Orders & Profile)
│   │   ├── mitra/                # Portal Mobile Teknisi Lapangan (Tugas & Foto)
│   │   ├── staff/                # Unified Portal Staf (Admin, CS, Marketing)
│   │   └── auth/                 # Login & Registrasi
│   ├── components/
│   │   ├── ui/                   # Reusable UI Tokens (Button, TextField, StatusBadge, GlassCard, Modal, BottomSheet, Skeleton, EmptyState, ThemeSelector)
│   │   └── shared/               # AppShell, PublicHeader, MobileBottomNav, DesktopSidebar, OfflineBanner, InstallPrompt
│   ├── lib/
│   │   ├── api/                  # Centralized apiClient with Envelope unwrapping & error handling
│   │   ├── auth/                 # AuthContext, tokenStore, RBAC helpers
│   │   ├── cart/                 # CartContext, guest session sync, live subtotal math
│   │   ├── pwa/                  # PwaContext, install prompt, update notifier
│   │   ├── theme/                # ThemeContext (System, Light, Dark)
│   │   └── validation/           # Zod schemas matching backend DTOs
│   ├── types/                    # Generated OpenAPI interfaces (api.generated.ts)
│   └── test/                     # Vitest test suites
├── scripts/
│   ├── generate-api-types.js     # Script sinkronisasi kontrak OpenAPI
│   └── generate-icons.js         # Script PWA icon generator
├── .env.example
├── .env.local
├── vitest.config.ts
└── package.json
```

---

## 3. Design System: Beresin Liquid & 3-Mode Theme

Sistem desain **Beresin Liquid** memberikan tampilan modern translucent dengan kedalaman visual tinggi:
- **Translucent Glass Surface:** Backdrop blur bertingkat (`liquid-glass`, `liquid-glass-strong`).
- **3 Pilihan Tema:**
  - `System` (Default mengikuti `prefers-color-scheme`)
  - `Light` (Background bersih, kontras teks optimal)
  - `Dark` (Sleek deep navy dark mode)
- **Anti-Flash Theme:** Script inline di `<head>` mencegah layout flicker saat hydration.
- **Mobile Touch Standards:** Touch target minimum 44x44 px dan safe-area insets untuk perangkat berlayar notch.

---

## 4. PWA & Strategi Caching

- **Display Standalone:** Terasa seperti aplikasi Android/iOS native saat diinstal.
- **Service Worker (`public/sw.js`):**
  - Hanya meng-cache App Shell dan aset statis aman (`/_next/static/`, icons, fonts, `offline.html`).
  - **Network-First / Network-Only untuk API:** Data transaksi sensitif, token, dan mutasi pesanan TIDAK disimpan di offline cache untuk menjaga keabsahan data.
  - **Offline Fallback:** Menampilkan halaman `offline.html` ramah pengguna ketika koneksi internet terputus.

---

## 5. Autentikasi & Otorisasi (7 Aktor RBAC)

1. **Guest / Publik:** Akses landing page, katalog layanan, keranjang via `sessionId`, validasi promo, pelacakan order.
2. **Customer:** Checkout, riwayat order (`/customer/orders`), alamat pengerjaan, upload bukti transfer (`/orders/[id]`).
3. **Mitra / Teknisi (`MITRA_SERVICE`):** Workspace mobile (`/mitra`), terima/tolak tugas, update progres pengerjaan, foto bukti sebelum/sesudah, serah terima tunai, penyelesaian order.
4. **Customer Service (`CUSTOMER_SERVICE`):** Antrean pesanan, update status, penugasan teknisi (`/staff/orders`).
5. **Marketing (`MARKETING`):** Executive analytics dashboard, funnel conversion metrics, manajemen kupon diskon (`/staff/promotions`), verifikasi transfer (`/staff/payments`).
6. **Admin (`ADMIN`):** Operations dashboard, filter/search order, penugasan mitra, direktori mitra/customer, user management.
7. **Super Admin (`SUPER_ADMIN`):** Seluruh hak akses Admin + manajemen roles baru dan assignment role user.

---

## 6. Instalasi & Menjalankan Aplikasi

### Persyaratan
- Node.js versi 18+ atau 20+
- Backend Beresin aktif di `http://localhost:3000`

### Langkah Instalasi
1. Masuk ke direktori frontend:
   ```bash
   cd d:\beresin\frontend
   ```
2. Install dependency:
   ```bash
   npm install
   ```
3. Konfigurasi Environment File:
   File `.env.local` sudah disiapkan default:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
   NEXT_PUBLIC_API_DOCS_URL=http://localhost:3000/api/docs-json
   ```
4. Jalankan Development Server:
   ```bash
   npm run dev
   ```
   Buka browser di `http://localhost:3000` (atau port yang diberikan Next.js).

---

## 7. Scripts & Command Reference

| Command | Keterangan |
| :--- | :--- |
| `npm run dev` | Menjalankan Next.js development server dengan Turbopack |
| `npm run build` | Melakukan compile dan build production bundle |
| `npm run typecheck` | Menjalankan type-checker TypeScript strict (`tsc --noEmit`) |
| `npm run lint` | Menjalankan pemeriksaan ESLint |
| `npm test` | Menjalankan unit & integration test suite Vitest |
| `npm run codegen:api` | Men-generate TypeScript types dari OpenAPI endpoint backend |

---

## 8. Matriks Halaman & Endpoint Backend

| Halaman Frontend | Endpoint Backend Utama | Role / Aktor |
| :--- | :--- | :--- |
| `/` (Landing Page) | `GET /services/categories`, `GET /services`, `GET /promotions` | Publik |
| `/services` | `GET /services`, `GET /services/categories` | Publik |
| `/services/[id]` | `GET /service-configuration/:id` | Publik |
| `/cart` | `GET /cart`, `POST/PUT/DELETE /cart/items`, `POST /promotions/validate` | Publik / Customer |
| `/checkout` | `POST /auth/register`, `POST /customers/locations`, `POST /orders` | Publik / Customer |
| `/orders/[id]` | `GET /orders/:id`, `POST /payments/records`, `POST /payments/:id/upload-proof` | Customer / Admin |
| `/customer/orders` | `GET /orders/my-orders` | Customer |
| `/customer/profile` | `GET /customers/profile/me`, `POST /customers/locations` | Customer |
| `/mitra` | `GET /mitra/jobs`, `POST /mitra/jobs/:id/accept`, `PATCH /mitra/jobs/:id/status`, `POST /mitra/jobs/:id/photos`, `POST /payments/:id/technician-submit-cash`, `POST /mitra/jobs/:id/complete` | Mitra Service |
| `/staff` | `GET /admin/operations/dashboard` | Staf (Admin, CS, Mkt) |
| `/staff/orders` | `GET /admin/operations/orders`, `POST /admin/operations/assign` | Staf (Admin, CS) |
| `/staff/payments` | `GET /payments`, `POST /payments/:id/verify`, `POST /payments/:id/reject` | Staf (Admin, Mkt) |
| `/staff/analytics` | `GET /analytics/funnel`, `GET /analytics/dashboard` | Staf (Admin, Mkt) |
| `/staff/users` | `GET /users`, `GET /roles`, `POST /users/:id/roles` | Super Admin / Admin |
