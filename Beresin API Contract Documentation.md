# Beresin Backend API Contract Documentation
**Version:** 1.0.0  
**Base URL:** `http://localhost:3000/api/v1` (Production: `https://api.beresin.id/api/v1`)  
**Swagger UI:** `http://localhost:3000/api/docs`  
**Architecture:** NestJS Modular Monolith with MySQL 8+ / MariaDB Database

---

## 🌐 General API Standards & Guidelines

### 1. Headers
- **Standard Request:**
  ```http
  Content-Type: application/json
  Accept: application/json
  ```
- **Authenticated Request:**
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```

### 2. Standard Success Response Format
```json
{
  "success": true,
  "statusCode": 200,
  "data": { ... }
}
```

### 3. Standard Error Response Format
```json
{
  "success": false,
  "statusCode": 400,
  "timestamp": "2026-08-22T04:00:00.000Z",
  "path": "/api/v1/example",
  "message": "Pesan deskripsi error yang terjadi"
}
```

---

## 📑 Table of Contents
1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Customer Profile & Locations](#3-customer-profile--locations)
4. [Service Catalog](#4-service-catalog)
5. [Product Catalog](#5-product-catalog)
6. [Service Configuration](#6-service-configuration)
7. [Cart & Temporary Configuration](#7-cart--temporary-configuration)
8. [Order Management](#8-order-management)
9. [Admin Operations](#9-admin-operations)
10. [Mitra Service & Technician](#10-mitra-service--technician)
11. [Payment](#11-payment)
12. [Promotion Engine](#12-promotion-engine)
13. [Notification](#13-notification)
14. [Analytics & Reporting](#14-analytics--reporting)

---

## 1. Authentication
Endpoint prefix: `/api/v1/auth`

### 1.1 Register New Customer
- **Endpoint:** `POST /api/v1/auth/register`
- **Auth:** Public
- **Role:** All
- **Request Body:**
  ```json
  {
    "name": "Budi Santoso",
    "phone": "081234567890",
    "email": "budi@example.com",
    "password": "password123"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "data": {
      "user": {
        "id": 1,
        "uuid": "a849f84b-70c2-4821-b384-8840a1b2c3d4",
        "name": "Budi Santoso",
        "phone": "081234567890",
        "email": "budi@example.com",
        "roles": ["CUSTOMER"]
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error (400 Bad Request):**
  ```json
  {
    "success": false,
    "statusCode": 400,
    "message": "Nomor telepon sudah terdaftar"
  }
  ```

### 1.2 Login User
- **Endpoint:** `POST /api/v1/auth/login`
- **Auth:** Public
- **Role:** All
- **Request Body:**
  ```json
  {
    "phoneOrEmail": "081234567890",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "user": {
        "id": 1,
        "uuid": "a849f84b-70c2-4821-b384-8840a1b2c3d4",
        "name": "Budi Santoso",
        "phone": "081234567890",
        "email": "budi@example.com",
        "status": "ACTIVE",
        "roles": ["CUSTOMER"]
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```
- **Error (401 Unauthorized):**
  ```json
  {
    "success": false,
    "statusCode": 401,
    "message": "Kredensial tidak valid"
  }
  ```

---

## 2. Users
Endpoint prefix: `/api/v1/users`

### 2.1 Get Current User Profile
- **Endpoint:** `GET /api/v1/users/me`
- **Auth:** Bearer JWT
- **Role:** All authenticated users
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "id": 1,
      "uuid": "a849f84b-70c2-4821-b384-8840a1b2c3d4",
      "name": "Budi Santoso",
      "email": "budi@example.com",
      "phone": "081234567890",
      "status": "ACTIVE",
      "userRoles": [
        {
          "id": 1,
          "role": {
            "id": 5,
            "name": "CUSTOMER"
          }
        }
      ]
    }
  }
  ```

### 2.2 List All Users (Admin)
- **Endpoint:** `GET /api/v1/users`
- **Auth:** Bearer JWT
- **Role:** `SUPER_ADMIN`, `ADMIN`
- **Query Parameters:** `?role=CUSTOMER` (Optional), `?search=Budi` (Optional)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": [
      {
        "id": 1,
        "name": "Budi Santoso",
        "phone": "081234567890",
        "email": "budi@example.com",
        "status": "ACTIVE"
      }
    ]
  }
  ```

---

## 3. Customer Profile & Locations
Endpoint prefix: `/api/v1/customers`

### 3.1 Get Customer Profile & Saved Locations
- **Endpoint:** `GET /api/v1/customers/profile`
- **Auth:** Bearer JWT
- **Role:** `CUSTOMER`, `SUPER_ADMIN`, `ADMIN`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "id": 1,
      "customerCode": "CUST-849201",
      "totalTransaction": 3,
      "totalSpending": "3220000.00",
      "locations": [
        {
          "id": 1,
          "address": "Jl. Sudirman No. 45, Komplek Melati Blok B3",
          "latitude": "-6.20876340",
          "longitude": "106.84559900",
          "notes": "Rumah pagar hitam samping masjid"
        }
      ]
    }
  }
  ```

### 3.2 Add Saved Address / Location
- **Endpoint:** `POST /api/v1/customers/locations`
- **Auth:** Bearer JWT
- **Role:** `CUSTOMER`, `SUPER_ADMIN`, `ADMIN`
- **Request Body:**
  ```json
  {
    "address": "Jl. Sudirman No. 45, Komplek Melati Blok B3",
    "latitude": -6.2087634,
    "longitude": 106.845599,
    "notes": "Rumah pagar hitam samping masjid"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "data": {
      "id": 1,
      "address": "Jl. Sudirman No. 45, Komplek Melati Blok B3",
      "latitude": -6.2087634,
      "longitude": 106.845599,
      "notes": "Rumah pagar hitam samping masjid"
    }
  }
  ```

---

## 4. Service Catalog
Endpoint prefix: `/api/v1/services`

### 4.1 Get All Service Categories
- **Endpoint:** `GET /api/v1/services/categories`
- **Auth:** Public
- **Role:** All
- **Query Parameters:** `?status=ACTIVE` (Optional)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": [
      {
        "id": 1,
        "name": "AC",
        "description": "Layanan perbaikan, pemasangan, dan pemeliharaan AC",
        "image": "https://beresin.id/images/cat_ac.png",
        "status": "ACTIVE",
        "services": [
          {
            "id": 1,
            "name": "Pasang AC Baru",
            "image": "https://beresin.id/images/service_ac.png"
          }
        ]
      }
    ]
  }
  ```

### 4.2 Get All Services
- **Endpoint:** `GET /api/v1/services`
- **Auth:** Public
- **Role:** All
- **Query Parameters:** `?categoryId=1` (Optional), `?status=ACTIVE` (Optional)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": [
      {
        "id": 1,
        "name": "Pasang AC Baru",
        "description": "Layanan instalasi unit AC baru",
        "image": "https://beresin.id/images/service_ac.png",
        "category": {
          "id": 1,
          "name": "AC"
        },
        "packages": [
          {
            "id": 1,
            "name": "Basic Installation",
            "price": "150000.00",
            "durationMinutes": 60
          }
        ]
      }
    ]
  }
  ```

### 4.3 Create Service (Admin)
- **Endpoint:** `POST /api/v1/services`
- **Auth:** Bearer JWT
- **Role:** `SUPER_ADMIN`, `ADMIN`
- **Request Body:**
  ```json
  {
    "categoryId": 1,
    "name": "Pasang AC Baru",
    "description": "Layanan instalasi unit indoor & outdoor AC standar komprehensif",
    "image": "https://beresin.id/images/service_ac.png",
    "status": "ACTIVE"
  }
  ```

---

## 5. Product Catalog
Endpoint prefix: `/api/v1/products`

### 5.1 Get All Products
- **Endpoint:** `GET /api/v1/products`
- **Auth:** Public
- **Role:** All
- **Query Parameters:**
  - `?categoryId=1` (Optional)
  - `?productType=MAIN_PRODUCT` (Optional: `MAIN_PRODUCT`, `ACCESSORY`, `MATERIAL`, `SPAREPART`)
  - `?search=sharp` (Optional)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": [
      {
        "id": 1,
        "name": "Sharp AC Split Standar 1/2 PK",
        "brand": "Sharp",
        "productType": "MAIN_PRODUCT",
        "image": "https://beresin.id/images/sharp_ac.png",
        "variants": [
          {
            "id": 1,
            "sku": "SHARP-AH-A5SAY-05PK",
            "price": "2850000.00",
            "stock": 25,
            "specification": {
              "capacity": "0.5 PK",
              "power_watt": 350
            }
          }
        ]
      }
    ]
  }
  ```

### 5.2 Create Product & Variant (Admin)
- **Endpoint:** `POST /api/v1/products`
- **Auth:** Bearer JWT
- **Role:** `SUPER_ADMIN`, `ADMIN`
- **Request Body:**
  ```json
  {
    "categoryId": 1,
    "name": "Sharp AC Split Standar 1/2 PK",
    "brand": "Sharp",
    "productType": "MAIN_PRODUCT",
    "description": "AC hemat daya teknologi Turbo Cooling",
    "image": "https://beresin.id/images/sharp_ac.png",
    "status": "ACTIVE"
  }
  ```

---

## 6. Service Configuration
Endpoint prefix: `/api/v1/service-configuration`

### 6.1 Get Complete Service Configuration (Crucial for Checkout Flow)
- **Endpoint:** `GET /api/v1/service-configuration/:serviceId`
- **Auth:** Public
- **Role:** All
- **Description:** Mengembalikan seluruh paket jasa, produk unit yang kompatibel, dan aksesoris/material untuk konfigurasi pemesanan customer.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "service": {
        "id": 1,
        "name": "Pasang AC Baru",
        "description": "Layanan instalasi unit AC",
        "image": "https://beresin.id/images/service_ac.png",
        "category": { "id": 1, "name": "AC" }
      },
      "packages": [
        {
          "id": 1,
          "name": "Basic Installation",
          "price": 150000,
          "durationMinutes": 60
        },
        {
          "id": 2,
          "name": "Premium Installation (Include Vakum)",
          "price": 250000,
          "durationMinutes": 90
        }
      ],
      "products": [
        {
          "id": 1,
          "name": "Sharp AC Split Standar 1/2 PK",
          "brand": "Sharp",
          "productType": "MAIN_PRODUCT",
          "isRecommended": true,
          "variants": [
            {
              "id": 1,
              "sku": "SHARP-05PK-STD",
              "price": 2850000,
              "stock": 25,
              "specification": { "capacity": "0.5 PK", "power_watt": 350 }
            }
          ]
        }
      ],
      "accessories": [
        {
          "id": 2,
          "name": "Selang AC Tembaga 3 Meter",
          "brand": "Tateyama",
          "productType": "ACCESSORY",
          "variants": [
            {
              "id": 2,
              "sku": "SELANG-3M-AC",
              "price": 120000,
              "stock": 50
            }
          ]
        }
      ]
    }
  }
  ```

---

## 7. Cart & Temporary Configuration
Endpoint prefix: `/api/v1/cart`

### 7.1 Get Temporary Cart & Calculated Subtotal
- **Endpoint:** `GET /api/v1/cart`
- **Auth:** Bearer JWT (User) OR `?sessionId=...` (Guest)
- **Query Parameters:** `?sessionId=guest-session-123` (Opsional untuk guest)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "cartKey": "guest_guest-session-123",
      "itemCount": 3,
      "subtotal": 3220000,
      "discountAmount": 0,
      "total": 3220000,
      "totalAmount": 3220000,
      "storageType": "MYSQL_FALLBACK",
      "items": [
        {
          "itemType": "SERVICE",
          "referenceId": 2,
          "name": "Pasang AC Baru - Premium Installation (Include Vakum)",
          "price": 250000,
          "qty": 1,
          "subtotal": 250000
        },
        {
          "itemType": "PRODUCT",
          "referenceId": 1,
          "name": "Sharp AC Split Standar 1/2 PK (SKU: SHARP-05PK-STD)",
          "price": 2850000,
          "qty": 1,
          "subtotal": 2850000
        },
        {
          "itemType": "ACCESSORY",
          "referenceId": 2,
          "name": "Selang AC Tembaga 3 Meter (SKU: SELANG-3M-AC)",
          "price": 120000,
          "qty": 1,
          "subtotal": 120000
        }
      ]
    }
  }
  ```

### 7.2 Add Item to Cart
- **Endpoint:** `POST /api/v1/cart/items`
- **Request Body:**
  ```json
  {
    "itemType": "PRODUCT",
    "referenceId": 1,
    "qty": 1,
    "sessionId": "guest-session-123"
  }
  ```

### 7.3 Update Quantity
- **Endpoint:** `PUT /api/v1/cart/items`
- **Request Body:**
  ```json
  {
    "itemType": "PRODUCT",
    "referenceId": 1,
    "qty": 2,
    "sessionId": "guest-session-123"
  }
  ```

### 7.4 Delete Specific Item
- **Endpoint:** `DELETE /api/v1/cart/items`
- **Request Body:**
  ```json
  {
    "itemType": "PRODUCT",
    "referenceId": 1,
    "sessionId": "guest-session-123"
  }
  ```

---

## 8. Order Management
Endpoint prefix: `/api/v1/orders`

### 8.1 Create Order (Atomic Database Transaction)
- **Endpoint:** `POST /api/v1/orders`
- **Auth:** Bearer JWT
- **Role:** `CUSTOMER`, `SUPER_ADMIN`, `ADMIN`
- **Request Body:**
  ```json
  {
    "serviceId": 1,
    "servicePackageId": 2,
    "locationId": 1,
    "promotionCode": "DISKONBARU50K",
    "sessionId": "guest-session-123",
    "items": [
      {
        "itemType": "PRODUCT",
        "referenceId": 1,
        "qty": 1
      },
      {
        "itemType": "ACCESSORY",
        "referenceId": 2,
        "qty": 1
      }
    ]
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "data": {
      "id": 1,
      "orderNumber": "BRS-20260822-8391",
      "subtotal": 3220000,
      "discountAmount": 50000,
      "totalAmount": 3170000,
      "status": "WAITING_CONFIRMATION",
      "service": {
        "id": 1,
        "name": "Pasang AC Baru"
      },
      "items": [
        {
          "id": 1,
          "itemType": "SERVICE",
          "nameSnapshot": "Pasang AC Baru - Premium Installation (Include Vakum)",
          "priceSnapshot": "250000.00",
          "qty": 1,
          "subtotal": "250000.00"
        },
        {
          "id": 2,
          "itemType": "PRODUCT",
          "nameSnapshot": "Sharp AC Split Standar 1/2 PK (SKU: SHARP-05PK-STD)",
          "priceSnapshot": "2850000.00",
          "qty": 1,
          "subtotal": "2850000.00"
        }
      ]
    }
  }
  ```

### 8.2 Customer Order History
- **Endpoint:** `GET /api/v1/orders/my-orders`
- **Auth:** Bearer JWT
- **Role:** `CUSTOMER`, `SUPER_ADMIN`, `ADMIN`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": [
      {
        "id": 1,
        "orderNumber": "BRS-20260822-8391",
        "status": "WAITING_CONFIRMATION",
        "totalAmount": "3170000.00",
        "createdAt": "2026-08-22T05:00:00.000Z",
        "service": { "id": 1, "name": "Pasang AC Baru" }
      }
    ]
  }
  ```

### 8.3 Get Order Detail
- **Endpoint:** `GET /api/v1/orders/:id`
- **Auth:** Bearer JWT
- **Role:** All Authenticated

---

## 9. Admin Operations
Endpoint prefix: `/api/v1/admin/operations`  
*(Protected exclusively by `ADMIN` and `SUPER_ADMIN` roles)*

### 9.1 Order Dashboard
- **Endpoint:** `GET /api/v1/admin/operations/dashboard`
- **Auth:** Bearer JWT (`ADMIN`, `SUPER_ADMIN`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "metrics": {
        "totalActiveOrders": 12,
        "waitingConfirmation": 3,
        "assigned": 4,
        "inProgress": 5,
        "completed": 45,
        "cancelled": 2,
        "totalCompletedRevenue": 48500000
      },
      "urgentDispatches": [
        {
          "id": 1,
          "orderNumber": "BRS-20260822-8391",
          "service": "Pasang AC Baru",
          "customerName": "Budi Santoso",
          "customerPhone": "081234567890",
          "address": "Jl. Sudirman No. 45",
          "totalAmount": 3170000,
          "createdAt": "2026-08-22T05:00:00.000Z"
        }
      ]
    }
  }
  ```

### 9.2 Filter Orders
- **Endpoint:** `GET /api/v1/admin/operations/orders`
- **Query Parameters:** `?status=WAITING_CONFIRMATION`, `?serviceId=1`, `?mitraId=1`, `?search=Budi`

### 9.3 Assign Mitra Service to Order
- **Endpoint:** `POST /api/v1/admin/operations/assign`
- **Request Body:**
  ```json
  {
    "orderId": 1,
    "mitraId": 1,
    "notes": "Harap bawa tangga 3 meter dan alat vakum pipa"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "data": {
      "message": "Mitra service berhasil ditugaskan ke pesanan",
      "assignmentId": 1,
      "orderId": 1,
      "orderNumber": "BRS-20260822-8391",
      "orderStatus": "ASSIGNED",
      "assignedMitra": {
        "id": 1,
        "companyName": "Mitra Sejuk Abadi",
        "phone": "081987654321"
      }
    }
  }
  ```

### 9.4 View Customer GPS Location
- **Endpoint:** `GET /api/v1/admin/operations/orders/:orderId/location`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "orderId": 1,
      "orderNumber": "BRS-20260822-8391",
      "serviceName": "Pasang AC Baru",
      "customer": {
        "id": 1,
        "name": "Budi Santoso",
        "phone": "081234567890"
      },
      "gpsLocation": {
        "address": "Jl. Sudirman No. 45, Komplek Melati Blok B3",
        "latitude": -6.2087634,
        "longitude": 106.845599,
        "accessNotes": "Rumah pagar hitam samping masjid",
        "googleMapsUrl": "https://www.google.com/maps?q=-6.2087634,106.845599",
        "directionsUrl": "https://www.google.com/maps/dir/?api=1&destination=-6.2087634,106.845599"
      }
    }
  }
  ```

---

## 10. Mitra Service & Technician
Endpoint prefix: `/api/v1/mitra`  
*(Protected by `MITRA_SERVICE`, `SUPER_ADMIN`, `ADMIN`)*

### 10.1 View Assigned Jobs
- **Endpoint:** `GET /api/v1/mitra/jobs`
- **Query Parameters:** `?status=PENDING` (Optional: `PENDING`, `ACCEPTED`, `REJECTED`, `COMPLETED`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": [
      {
        "assignmentId": 1,
        "assignmentStatus": "PENDING",
        "order": {
          "id": 1,
          "orderNumber": "BRS-20260822-8391",
          "orderStatus": "ASSIGNED",
          "totalAmount": 3170000,
          "service": "Pasang AC Baru",
          "customer": {
            "name": "Budi Santoso",
            "phone": "081234567890"
          },
          "location": {
            "address": "Jl. Sudirman No. 45",
            "googleMapsUrl": "https://www.google.com/maps?q=-6.2087634,106.845599"
          }
        }
      }
    ]
  }
  ```

### 10.2 Accept Job
- **Endpoint:** `POST /api/v1/mitra/jobs/:assignmentId/accept`

### 10.3 Reject Job
- **Endpoint:** `POST /api/v1/mitra/jobs/:assignmentId/reject`
- **Request Body:**
  ```json
  {
    "reason": "Jarak lokasi di luar jangkauan operasional teknisi hari ini"
  }
  ```

### 10.4 Update Job Progress Status
- **Endpoint:** `PATCH /api/v1/mitra/jobs/:assignmentId/status`
- **Request Body:**
  ```json
  {
    "status": "ON_THE_WAY",
    "notes": "Sedang menuju lokasi customer, perkiraan tiba 15 menit"
  }
  ```

### 10.5 Upload Work Photo Documentation
- **Endpoint:** `POST /api/v1/mitra/jobs/:assignmentId/photos`
- **Request Body:**
  ```json
  {
    "photoType": "AFTER_WORK",
    "photoUrls": [
      "https://beresin.id/uploads/evidence/ac_after_clean.jpg"
    ],
    "notes": "Evaporator bersih dan unit dingin normal"
  }
  ```

### 10.6 Add Additional Item & Request Customer Approval
- **Endpoint:** `POST /api/v1/mitra/jobs/:assignmentId/additional-items`
- **Request Body:**
  ```json
  {
    "reason": "Pipa tembaga lama bocor dan butuh penggantian selang 2 meter serta freon R32",
    "items": [
      {
        "itemType": "ACCESSORY",
        "referenceId": 2,
        "qty": 2
      }
    ]
  }
  ```

### 10.7 Complete Order
- **Endpoint:** `POST /api/v1/mitra/jobs/:assignmentId/complete`
- **Request Body:**
  ```json
  {
    "completionNotes": "Pekerjaan instalasi selesai 100% dan unit berfungsi normal",
    "evidencePhotos": [
      "https://beresin.id/uploads/evidence/final_ac.jpg"
    ]
  }
  ```

---

## 11. Payment Management (Manual Cash & Transfer Workflows)
Endpoint prefix: `/api/v1/payments`

### 11.1 List Beresin Bank Accounts (For Transfer)
- **Endpoint:** `GET /api/v1/payments/bank-accounts`
- **Auth:** Public / Bearer JWT
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": [
      {
        "bankName": "BCA",
        "accountNumber": "8830192837",
        "accountHolder": "PT BERESIN SOLUSI INDONESIA"
      },
      {
        "bankName": "MANDIRI",
        "accountNumber": "1370098234123",
        "accountHolder": "PT BERESIN SOLUSI INDONESIA"
      }
    ]
  }
  ```

### 11.2 Select Payment Method (CASH or TRANSFER)
- **Endpoint:** `POST /api/v1/payments/records`
- **Auth:** Bearer JWT
- **Role:** `CUSTOMER`, `SUPER_ADMIN`, `ADMIN`
- **Request Body (Transfer):**
  ```json
  {
    "orderId": 1,
    "paymentMethod": "TRANSFER",
    "bankName": "BCA"
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "data": {
      "message": "Rekening pembayaran berhasil dibuat",
      "paymentId": 1,
      "orderNumber": "BRS-20260822-8391",
      "paymentMethod": "TRANSFER",
      "amount": "3170000.00",
      "status": "WAITING_PAYMENT",
      "bankTransferInstructions": {
        "bankName": "BCA",
        "accountNumber": "8830192837",
        "accountHolder": "PT BERESIN SOLUSI INDONESIA"
      }
    }
  }
  ```

### 11.3 Transfer Workflow: Customer Uploads Payment Proof
- **Endpoint:** `POST /api/v1/payments/:paymentId/upload-proof`
- **Auth:** Bearer JWT
- **Role:** `CUSTOMER`, `SUPER_ADMIN`, `ADMIN`
- **Request Body:**
  ```json
  {
    "proofUrl": "https://beresin.id/uploads/payments/proof_bca_3170000.jpg",
    "notes": "Transfer dari rekening BCA a.n. Budi Santoso"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "message": "Bukti transfer berhasil diunggah. Menunggu verifikasi Admin / Marketing.",
      "paymentId": 1,
      "status": "WAITING_PAYMENT_VERIFICATION",
      "proofUrl": "https://beresin.id/uploads/payments/proof_bca_3170000.jpg"
    }
  }
  ```

### 11.4 Cash Workflow: Technician Submits Cash Collection
- **Endpoint:** `POST /api/v1/payments/:paymentId/technician-submit-cash`
- **Auth:** Bearer JWT
- **Role:** `MITRA_SERVICE`, `SUPER_ADMIN`, `ADMIN`
- **Request Body:**
  ```json
  {
    "proofUrl": "https://beresin.id/uploads/payments/cash_receipt_123.jpg",
    "notes": "Uang tunai pas Rp 3.170.000 telah diterima di tempat oleh teknisi"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "message": "Serah terima uang tunai berhasil diajukan dan menunggu validasi Admin",
      "paymentId": 1,
      "status": "WAITING_ADMIN_CONFIRMATION",
      "technicianSubmittedAt": "2026-08-22T05:25:00.000Z"
    }
  }
  ```

### 11.5 Admin / Marketing Verifies Payment (Mark as PAID)
- **Endpoint:** `POST /api/v1/payments/:paymentId/verify`
- **Auth:** Bearer JWT
- **Role:** `SUPER_ADMIN`, `ADMIN`, `MARKETING`
- **Request Body:**
  ```json
  {
    "notes": "Mutasi rekening bank telah masuk dan divalidasi valid"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "message": "Pembayaran berhasil diverifikasi dan ditandai PAID",
      "paymentId": 1,
      "orderNumber": "BRS-20260822-8391",
      "status": "PAID",
      "paidAt": "2026-08-22T05:30:00.000Z",
      "verifiedAt": "2026-08-22T05:30:00.000Z"
    }
  }
  ```

### 11.6 Admin / Marketing Rejects Payment
- **Endpoint:** `POST /api/v1/payments/:paymentId/reject`
- **Auth:** Bearer JWT
- **Role:** `SUPER_ADMIN`, `ADMIN`, `MARKETING`
- **Request Body:**
  ```json
  {
    "reason": "Nominal transfer tidak sesuai atau mutasi bank tidak ditemukan"
  }
  ```

### 11.7 Payment History & Order Payments
- **Endpoint:** `GET /api/v1/payments` (Admin view: `?status=...`, `?paymentMethod=...`)
- **Endpoint:** `GET /api/v1/payments/order/:orderId` (Riwayat pembayaran per order)

---

## 12. Promotion Engine
Endpoint prefix: `/api/v1/promotions`

### 12.1 Validate Promotion Eligibility & Calculate Discount
- **Endpoint:** `POST /api/v1/promotions/validate`
- **Auth:** Public / Bearer JWT
- **Request Body:**
  ```json
  {
    "promoCode": "DISKONBARU50K",
    "subtotal": 250000
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "valid": true,
      "promoId": 1,
      "promoCode": "DISKONBARU50K",
      "discountType": "FIXED",
      "discountValue": 50000,
      "targetUser": "NEW_USER",
      "originalSubtotal": 250000,
      "discountAmount": 50000,
      "finalTotal": 200000,
      "message": "Kode promo 'DISKONBARU50K' berhasil digunakan. Hemat Rp 50.000"
    }
  }
  ```

---

## 13. Notification
Endpoint prefix: `/api/v1/notifications`

### 13.1 Get User Notification Stream
- **Endpoint:** `GET /api/v1/notifications/my`
- **Auth:** Bearer JWT
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": [
      {
        "id": 1,
        "channel": "WHATSAPP",
        "message": "Teknisi dari Mitra Sejuk Abadi telah ditugaskan untuk pesanan BRS-20260822-8391.",
        "status": "SENT",
        "sentAt": "2026-08-22T05:10:00.000Z"
      }
    ]
  }
  ```

---

## 14. Analytics & Reporting
Endpoint prefix: `/api/v1/analytics`

### 14.1 Track Event
- **Endpoint:** `POST /api/v1/analytics/events`
- **Auth:** Public
- **Request Body:**
  ```json
  {
    "eventType": "VIEW_PRODUCT",
    "userId": 1,
    "sessionId": "guest-session-123",
    "payload": { "productId": 1, "productName": "Sharp AC 1/2 PK" }
  }
  ```

### 14.2 Business Analytics Dashboard (Admin / Marketing)
- **Endpoint:** `GET /api/v1/analytics/dashboard`
- **Auth:** Bearer JWT (`SUPER_ADMIN`, `ADMIN`, `MARKETING`)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "summary": {
        "totalOrders": 128,
        "totalRevenue": 142500000,
        "activeCustomers": 85,
        "activeMitra": 24
      }
    }
  }
  ```

---

## 15. Upload & File Management
Endpoint prefix: `/api/v1/upload`

### 15.1 Upload Single File
- **Endpoint:** `POST /api/v1/upload/single`
- **Auth:** Bearer JWT
- **Query Parameters:** `?category=products` (Options: `products`, `services`, `evidence`, `attachments`, `payments`, `general`)
- **Content-Type:** `multipart/form-data`
- **Form Data Field:** `file` (Binary File max 10MB; JPG, PNG, WEBP, GIF, SVG, PDF)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "data": {
      "filename": "sharp_ac_05pk_a849f84b.png",
      "originalName": "sharp_ac_05pk.png",
      "category": "products",
      "mimeType": "image/png",
      "sizeBytes": 248102,
      "url": "http://localhost:3000/uploads/products/sharp_ac_05pk_a849f84b.png",
      "storageProvider": "LOCAL"
    }
  }
  ```

### 15.2 Upload Multiple Files
- **Endpoint:** `POST /api/v1/upload/multiple`
- **Auth:** Bearer JWT
- **Query Parameters:** `?category=evidence`
- **Content-Type:** `multipart/form-data`
- **Form Data Field:** `files` (Array of Binary Files, max 10 files)
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "data": [
      {
        "filename": "ac_before_clean_1a2b3c4d.jpg",
        "originalName": "ac_before_clean.jpg",
        "category": "evidence",
        "mimeType": "image/jpeg",
        "sizeBytes": 512000,
        "url": "http://localhost:3000/uploads/evidence/ac_before_clean_1a2b3c4d.jpg",
        "storageProvider": "LOCAL"
      },
      {
        "filename": "ac_after_clean_5e6f7g8h.jpg",
        "originalName": "ac_after_clean.jpg",
        "category": "evidence",
        "mimeType": "image/jpeg",
        "sizeBytes": 480000,
        "url": "http://localhost:3000/uploads/evidence/ac_after_clean_5e6f7g8h.jpg",
        "storageProvider": "LOCAL"
      }
    ]
  }
  ```

### 15.3 Delete Uploaded File
- **Endpoint:** `DELETE /api/v1/upload/:category/:filename`
- **Auth:** Bearer JWT