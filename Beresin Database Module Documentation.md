# Beresin Database Module Documentation

## Project Overview

**Project Name:** Beresin  
**Type:** Service Commerce Platform  
**Database Engine:** MySQL 8+  
**Purpose:** Database foundation untuk aplikasi Beresin yang menggabungkan layanan jasa, produk, aksesoris, teknisi, transaksi, promo, dan analitik bisnis.

Dokumen ini menjadi acuan implementasi database sebelum masuk tahap backend NestJS.

---

# 1. Database Architecture

## Primary Database

Database utama menggunakan:

```
MySQL 8+
```

Fungsi:

- Menyimpan data transaksi utama
- Menyimpan katalog layanan
- Menyimpan produk
- Menyimpan customer
- Menyimpan mitra service
- Menyimpan pembayaran
- Menyimpan promo

---

## Supporting Database

### Redis

Digunakan untuk:

- Session
- OTP
- Cache katalog populer
- Cart sementara
- Queue WhatsApp notification


### ClickHouse

Digunakan untuk:

- Customer behavior analytics
- Sales analytics
- Product performance
- Service performance
- Marketing analytics

---

# 2. Database Design Principle

## Dynamic Service System

Beresin tidak menggunakan struktur layanan hardcode.

Contoh:

Service AC:

```
Category
    |
    |
Service
    |
    |
Product
    |
    |
Accessory
    |
    |
Service Package
```

Customer dapat memilih:

```
Produk saja

atau

Jasa saja

atau

Produk + Accessories + Jasa
```

---

# 3. Database Module Structure


```
database
|
├── authentication
|
├── user_management
|
├── customer
|
├── mitra_service
|
├── service_catalog
|
├── product_catalog
|
├── order_management
|
├── payment
|
├── promotion
|
├── notification
|
└── analytics
```

---

# MODULE 1: Authentication & User Management

## Purpose

Mengelola seluruh akun pengguna.

Actor:

- Super Admin
- Admin
- Customer Service
- Marketing
- Customer
- User Umum
- Mitra Service


## Tables


### users

Fungsi:

Menyimpan data akun.


Fields:

```
id
uuid
name
email
phone
password_hash
status
last_login_at
created_at
updated_at
deleted_at
```


---

### roles

Fungsi:

Menyimpan hak akses.


Data awal:


```
SUPER_ADMIN

ADMIN

CUSTOMER_SERVICE

MARKETING

CUSTOMER

MITRA_SERVICE
```


Fields:

```
id
name
description
created_at
```


---

### user_roles

Relasi user dengan role.


Fields:

```
id

user_id

role_id
```

---

# MODULE 2: Customer Management


## Purpose

Mengelola pelanggan Beresin.


## Table: customer_profiles


Fields:


```
id

user_id

customer_code

total_transaction

total_spending

created_at
```


Digunakan untuk:

- Menentukan customer baru
- Menentukan customer lama
- Program loyalty
- Promo


Rule:


Customer baru:

```
total_transaction = 0
```


Customer lama:

```
total_transaction > 0
```

---

# MODULE 3: Mitra Service Management


## Purpose

Mengelola teknisi dan partner jasa.


## Table: mitra_profiles


Fields:


```
id

user_id

company_name

address

latitude

longitude

rating

status
```


Status:


```
PENDING

ACTIVE

SUSPENDED
```


---

# MODULE 4: Service Catalog


## Purpose

Mengatur kategori layanan dan jenis pekerjaan.


## Table: service_categories


Contoh:


```
AC

Motor

Mobil

Furniture

Elektronik
```


Fields:


```
id

name

description

image

status
```


---

## Table: services


Contoh:


```
Service AC

Pasang AC Baru

Cuci AC

Perbaikan AC
```


Fields:


```
id

category_id

name

description

image

status
```


---

## Table: service_packages


Menyimpan pilihan jasa.


Contoh:


```
Pasang AC

Basic Installation

Premium Installation
```


Fields:


```
id

service_id

name

description

price

duration_minutes

status
```


---

# MODULE 5: Product Catalog


## Purpose

Mengelola produk yang dapat ditawarkan ke customer.


Contoh:


```
AC Sharp

Daikin AC

Oli Motor

Sparepart
```


---

## Table: product_categories


Fields:


```
id

name
```


---

## Table: products


Fields:


```
id

category_id

name

brand

product_type

description

image

status
```


Product Type:


```
MAIN_PRODUCT

ACCESSORY

MATERIAL

SPAREPART
```


---

## Table: product_variants


Digunakan jika produk mempunyai variasi.


Contoh:


```
Sharp AC

1/2 PK

1 PK

1.5 PK
```


Fields:


```
id

product_id

sku

specification JSON

price

stock
```

---

# MODULE 6: Service Product Mapping


## Purpose

Menghubungkan layanan dengan produk yang tersedia.


## Table: service_products


Contoh:


```
Pasang AC Baru

|

Sharp AC

Daikin AC

Panasonic AC
```


Fields:


```
id

service_id

product_id

is_recommended
```


---

## Table: service_accessories


Menghubungkan aksesoris dengan layanan.


Contoh:


```
Pasang AC

|

Selang AC

Bracket

Kabel
```


Fields:


```
id

service_id

product_id
```

---

# MODULE 7: Order Management


## Purpose

Mengelola transaksi customer.


Flow:


```
Customer

↓

Select Service

↓

Select Product

↓

Select Accessories

↓

Select Service Package

↓

Create Order
```


---

## Table: orders


Fields:


```
id

order_number

customer_id

service_id

location_id

subtotal

discount_amount

total_amount

status

created_at
```


Order Status:


```
WAITING_CONFIRMATION

ASSIGNED

ACCEPTED

ON_THE_WAY

ARRIVED

IN_PROGRESS

WAITING_APPROVAL

COMPLETED

WAITING_PAYMENT

PAID

CANCELLED
```

---

## Table: order_items


Fungsi:

Menyimpan semua komponen pembelian.


Contoh:


```
PRODUCT:
Sharp AC


ACCESSORY:
Selang 3 meter


SERVICE:
Premium Installation
```


Fields:


```
id

order_id

item_type

reference_id

name_snapshot

price_snapshot

qty

subtotal
```


Item Type:


```
PRODUCT

ACCESSORY

SERVICE

ADDON
```

---

# MODULE 8: Technician Assignment


## Purpose

Admin menentukan teknisi.


## Table:


```
technician_assignments
```


Fields:


```
id

order_id

mitra_id

assigned_by

status

assigned_at
```

---

# MODULE 9: Order Modification


## Purpose

Mengakomodasi perubahan pekerjaan.


Contoh:


Customer order:

```
Selang 3 meter
```

Teknisi menemukan:

```
Selang 5 meter
```


---

## Table:


```
order_change_requests
```


Fields:


```
id

order_id

technician_id

reason

status

created_at
```


Status:


```
WAITING

APPROVED

REJECTED
```

---

# MODULE 10: Payment


## Table:


```
payments
```


Fields:


```
id

order_id

payment_method

amount

transaction_id

status

paid_at
```


---

# MODULE 11: Promotion System


## Purpose

Mengatur diskon.


Target:


```
NEW_USER

EXISTING_USER

ALL_USER
```


## Table:


```
promotions
```


Fields:


```
id

name

discount_type

discount_value

target_user

start_date

end_date

status
```

---

# MODULE 12: Location


## Purpose

Menyimpan lokasi customer berbasis GPS.


## Table:


```
locations
```


Fields:


```
id

customer_id

address

latitude

longitude

notes
```

---

# MODULE 13: Notification


## Purpose

Integrasi WhatsApp.


Events:


```
ORDER_CREATED

TECHNICIAN_ASSIGNED

TECHNICIAN_ON_THE_WAY

PRICE_CHANGED

ORDER_COMPLETED

PAYMENT_SUCCESS
```


## Table:


```
notifications
```


Fields:


```
id

user_id

order_id

channel

message

status

sent_at
```

---

# MODULE 14: Analytics Preparation


Data yang dikirim ke ClickHouse:


## Customer Analytics

```
customer_id

transaction_count

spending

favorite_service
```


## Product Analytics


```
product_id

view_count

purchase_count

revenue
```


## Service Analytics


```
service_id

order_count

completion_rate

rating
```


---

# Database Development Priority


## Phase 1: Core Database


Implement:


```
users

roles

user_roles

customer_profiles

mitra_profiles

service_categories

services

service_packages

products

product_variants

orders

order_items
```


---

## Phase 2: Business Operation


Implement:


```
technician_assignments

payments

promotions

notifications

order_change_requests
```


---

## Phase 3: Scale


Implement:


```
vendor_management

inventory

warehouse

commission

loyalty

analytics pipeline
```


---

# Development Rules


1. Semua transaksi wajib memiliki snapshot harga.

2. Jangan mengambil harga langsung dari tabel produk ketika order sudah dibuat.

3. Semua tabel wajib memiliki:

```
created_at

updated_at
```

4. Gunakan soft delete untuk data master.

5. Gunakan enum status yang jelas.

6. Hindari tabel khusus per kategori layanan.

Contoh salah:

```
ac_services

motor_services
```

Gunakan:

```
services

service_categories
```

agar platform dapat berkembang.


---

# Output Target

Database yang dibuat dari dokumentasi ini harus mampu mendukung:

- Website PWA Beresin
- Mobile Android Customer
- Mobile Android Mitra Service
- Dashboard Admin
- Dashboard Marketing
- WhatsApp Automation
- Business Analytics