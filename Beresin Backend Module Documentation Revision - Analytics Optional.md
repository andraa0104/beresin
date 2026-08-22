# Beresin Backend Module Documentation

## Project Information

**Project Name:** Beresin  
**Backend Framework:** NestJS Latest Version  
**Language:** TypeScript  
**Database:** MySQL 8+  
**ORM:** TypeORM  
**Cache:** Redis  
**Analytics Database:** Optional ClickHouse / MySQL Fallback  
**Architecture Style:** Modular Monolith (Future Microservice Ready)


---

# 1. Backend Objective

Backend Beresin merupakan pusat business logic untuk:

- Service commerce platform
- Product catalog
- Service catalog
- Customer management
- Mitra service management
- Order processing
- Payment
- Promotion
- Notification
- Business analytics


Backend harus dibuat fleksibel agar:

- layanan baru dapat ditambahkan tanpa perubahan besar
- database analytics dapat berubah tanpa mengubah business logic
- sistem tetap berjalan pada VPS sederhana


---

# 2. Technology Architecture


## Primary Database

### MySQL 8+

MySQL merupakan database utama.


Digunakan untuk:

- User
- Customer
- Mitra service
- Service
- Product
- Order
- Payment
- Promotion
- Transaction history


MySQL adalah source of truth seluruh transaksi.


---

## Cache Layer

### Redis (Recommended)


Redis digunakan untuk:


- Session
- JWT blacklist
- OTP
- Temporary cart
- Queue notification
- API cache


Redis bersifat optional.


Jika Redis tidak tersedia:

- aplikasi tetap berjalan menggunakan MySQL
- fitur cache dinonaktifkan


---

## Analytics Layer


### ClickHouse (Optional)


ClickHouse digunakan untuk analytics skala besar.


Contoh:


- Customer behavior
- Product popularity
- Revenue analysis
- Service performance
- Marketing campaign analysis


Namun ClickHouse bukan dependency wajib.


---

# 3. Analytics Architecture Rule


Backend wajib menggunakan abstraction layer.


Jangan melakukan query ClickHouse langsung dari module bisnis.


Gunakan:


```
Business Module

        |

        ↓

Analytics Service Interface

        |

        ↓

---------------------

|                   |

ClickHouse       MySQL Analytics

Available        Fallback

```

---

# 4. ClickHouse Detection Logic


Saat aplikasi startup:


Backend melakukan pengecekan:


```
CHECK CLICKHOUSE CONNECTION

        |

        |

AVAILABLE?

        |

YES ---------------- NO

 |                    |

Use ClickHouse     Use MySQL

Analytics          Analytics

```

---

## Environment Configuration


File:

```
.env
```


Contoh:


Jika ClickHouse tersedia:


```
CLICKHOUSE_ENABLED=true

CLICKHOUSE_HOST=

CLICKHOUSE_PORT=

CLICKHOUSE_DATABASE=
```


Jika tidak tersedia:


```
CLICKHOUSE_ENABLED=false
```


---

# 5. Analytics Service Behavior


Module analytics harus memiliki:


```
AnalyticsService
```


Interface:


```typescript
trackEvent()

getReport()

getDashboardData()

```


Implementasi:


```
ClickHouseAnalyticsService

atau

MysqlAnalyticsService

```


Pemilihan provider:


```
AnalyticsFactory

        |

        ↓

Check Availability

        |

        ↓

Return Analytics Provider

```

---

# 6. Analytics Data Strategy


## Transaction Data


Tetap berada di MySQL.


Contoh:


```
orders

payments

order_items

customers

```

---

## Analytical Data


Dapat berada di:


### Option A

ClickHouse:


```
analytics_events

customer_behavior

sales_summary

service_performance

```


---

### Option B

MySQL:


Gunakan tabel:


```
analytics_events

analytics_daily_summary

analytics_service_report

analytics_product_report

```

---

# 7. Module Structure


```
src

├── auth

├── users

├── roles

├── customers

├── mitra

├── service-catalog

├── product-catalog

├── cart

├── orders

├── payments

├── promotions

├── notifications

├── analytics

│
├── analytics/providers

│   ├── clickhouse.provider.ts

│   └── mysql.provider.ts

│
├── uploads

├── common

└── config

```

---

# 8. Analytics Module


Path:


```
/analytics
```


Responsibilities:


- Tracking business event
- Generate report
- Dashboard data
- Customer behavior analysis


---

Event:


```
SERVICE_VIEW

PRODUCT_VIEW

ADD_TO_CART

CREATE_ORDER

PAYMENT_SUCCESS

ORDER_COMPLETED

PROMOTION_USED

```

---

Example:


Customer membuka produk:


```
Product View Event

↓

Analytics Service

↓

ClickHouse

atau

MySQL

```

---

# 9. Backend Module List


## Authentication Module


Path:

```
/auth
```


Responsibilities:

- Register
- Login
- JWT
- Refresh token


---

## User Module


Path:

```
/users
```


Responsibilities:

- User management
- Profile
- Role


---

## Role Permission Module


Path:

```
/roles
```


Responsibilities:

- RBAC
- Permission control


---

## Customer Module


Path:

```
/customers
```


Responsibilities:

- Customer profile
- Transaction history
- Customer classification


---

## Mitra Service Module


Path:


```
/mitra
```


Responsibilities:


- Technician profile
- Skill
- Availability
- Job history


---

## Service Catalog Module


Path:


```
/services
```


Responsibilities:


- Service category
- Service
- Service package


---

## Product Catalog Module


Path:


```
/products
```


Responsibilities:


- Product
- Variant
- Price
- Description
- Image


---

## Service Configuration Module


Path:


```
/service-configuration
```


Responsibilities:


Menghubungkan:


```
Service

+

Product

+

Accessory

+

Service Package

```


---

## Cart Module


Path:


```
/cart
```


Responsibilities:


Membuat konfigurasi pembelian:


```
Product

+

Accessory

+

Service

```


---

## Order Module


Path:


```
/orders
```


Core transaction system.


Flow:


```
Cart

↓

Checkout

↓

Order

↓

Assignment

↓

Execution

↓

Payment

```


---

## Technician Assignment Module


Path:


```
/assignments
```


Responsibilities:


- Admin assign teknisi
- Monitoring pekerjaan


---

## Order Change Module


Path:


```
/order-changes
```


Responsibilities:


Teknisi dapat:


- tambah item
- mengganti item
- menghapus item


Dengan approval customer.


---

## Payment Module


Path:


```
/payments
```


Responsibilities:


- Payment status
- Transaction record


---

## Promotion Module


Path:


```
/promotions
```


Target:


```
NEW_USER

EXISTING_USER

ALL_USER

```


---

## Notification Module


Path:


```
/notifications
```


Channel:


```
WhatsApp

Email

Push Notification
```


Menggunakan Redis queue jika tersedia.


---

# 10. Development Rules


## Rule 1

MySQL adalah sumber data utama.


Jangan menyimpan transaksi hanya di ClickHouse.


---

## Rule 2

ClickHouse hanya untuk analytical workload.


Tidak digunakan untuk:


- order creation
- payment
- customer profile
- product transaction


---

## Rule 3

Backend harus tetap berjalan tanpa:

- ClickHouse
- Redis


---

## Rule 4

Semua external service harus memiliki fallback.


Contoh:


```
WhatsApp gagal

↓

Simpan notification queue

↓

Retry

```

---

# 11. Development Sequence


```
1. Setup NestJS

↓

2. Connect MySQL

↓

3. Generate Entity

↓

4. Authentication

↓

5. RBAC

↓

6. Service Catalog

↓

7. Product Catalog

↓

8. Cart

↓

9. Order Engine

↓

10. Technician Assignment

↓

11. Payment

↓

12. Promotion

↓

13. Notification

↓

14. Analytics Layer

↓

15. Optional ClickHouse Integration

```

---

# 12. Completion Criteria


Backend selesai apabila:


## Core System

✓ Authentication berjalan

✓ Role permission berjalan

✓ Service catalog berjalan

✓ Product catalog berjalan

✓ Customer dapat membuat order

✓ Admin dapat assign teknisi

✓ Teknisi dapat update pekerjaan

✓ Add-on approval berjalan


---

## Infrastructure


✓ Redis dapat digunakan jika tersedia

✓ ClickHouse dapat digunakan jika tersedia

✓ MySQL tetap menjadi database utama

✓ Analytics fallback berjalan


---

# Final Architecture Principle


Beresin harus dibangun dengan prinsip:


```
Transaction First

Analytics Second

Optional Infrastructure

Flexible Business Model
```


MySQL menangani operasional bisnis.

ClickHouse mempercepat analitik apabila tersedia.

Jika ClickHouse tidak tersedia, sistem tetap berjalan normal menggunakan MySQL.