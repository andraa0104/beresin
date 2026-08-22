-- ==============================================================================
-- BERESIN DATABASE MODULE SCHEMA (MySQL 8+)
-- Service Commerce Platform Database Foundation
-- Generated based on: Beresin Database Module Documentation.md
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS `beresin_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `beresin_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- MODULE 1: Authentication & User Management
-- ------------------------------------------------------------------------------

-- 1. roles
DROP TABLE IF EXISTS `user_roles`;
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. users
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` VARCHAR(36) NOT NULL UNIQUE,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) DEFAULT NULL UNIQUE,
  `phone` VARCHAR(30) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING') NOT NULL DEFAULT 'ACTIVE',
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_users_uuid` (`uuid`),
  INDEX `idx_users_phone` (`phone`),
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. user_roles
CREATE TABLE `user_roles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `role_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_role` (`user_id`, `role_id`),
  INDEX `idx_user_roles_user` (`user_id`),
  INDEX `idx_user_roles_role` (`role_id`),
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- MODULE 2: Customer Management
-- ------------------------------------------------------------------------------

-- 4. customer_profiles
DROP TABLE IF EXISTS `customer_profiles`;
CREATE TABLE `customer_profiles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL UNIQUE,
  `customer_code` VARCHAR(50) NOT NULL UNIQUE,
  `total_transaction` INT UNSIGNED NOT NULL DEFAULT 0,
  `total_spending` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_customer_user` (`user_id`),
  INDEX `idx_customer_code` (`customer_code`),
  CONSTRAINT `fk_customer_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- MODULE 3: Mitra Service Management
-- ------------------------------------------------------------------------------

-- 5. mitra_profiles
DROP TABLE IF EXISTS `mitra_profiles`;
CREATE TABLE `mitra_profiles` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL UNIQUE,
  `company_name` VARCHAR(150) NOT NULL,
  `address` TEXT DEFAULT NULL,
  `latitude` DECIMAL(10, 8) DEFAULT NULL,
  `longitude` DECIMAL(11, 8) DEFAULT NULL,
  `rating` DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  `status` ENUM('PENDING', 'ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'PENDING',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_mitra_user` (`user_id`),
  INDEX `idx_mitra_status` (`status`),
  INDEX `idx_mitra_lat_long` (`latitude`, `longitude`),
  CONSTRAINT `fk_mitra_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- MODULE 12: Location (GPS Based for Customer)
-- ------------------------------------------------------------------------------

-- 6. locations
DROP TABLE IF EXISTS `locations`;
CREATE TABLE `locations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `customer_id` BIGINT UNSIGNED NOT NULL,
  `address` TEXT NOT NULL,
  `latitude` DECIMAL(10, 8) DEFAULT NULL,
  `longitude` DECIMAL(11, 8) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_locations_customer` (`customer_id`),
  CONSTRAINT `fk_locations_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer_profiles` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- MODULE 4: Service Catalog
-- ------------------------------------------------------------------------------

-- 7. service_categories
DROP TABLE IF EXISTS `service_categories`;
CREATE TABLE `service_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_service_cat_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. services
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_services_category` (`category_id`),
  INDEX `idx_services_status` (`status`),
  CONSTRAINT `fk_services_category` FOREIGN KEY (`category_id`) REFERENCES `service_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. service_packages
DROP TABLE IF EXISTS `service_packages`;
CREATE TABLE `service_packages` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `duration_minutes` INT UNSIGNED NOT NULL DEFAULT 60,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_service_packages_service` (`service_id`),
  INDEX `idx_service_packages_status` (`status`),
  CONSTRAINT `fk_service_packages_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- MODULE 5: Product Catalog
-- ------------------------------------------------------------------------------

-- 10. product_categories
DROP TABLE IF EXISTS `product_categories`;
CREATE TABLE `product_categories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. products
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `category_id` BIGINT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `brand` VARCHAR(100) DEFAULT NULL,
  `product_type` ENUM('MAIN_PRODUCT', 'ACCESSORY', 'MATERIAL', 'SPAREPART') NOT NULL DEFAULT 'MAIN_PRODUCT',
  `description` TEXT DEFAULT NULL,
  `image` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_products_category` (`category_id`),
  INDEX `idx_products_type` (`product_type`),
  INDEX `idx_products_status` (`status`),
  CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `product_categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. product_variants
DROP TABLE IF EXISTS `product_variants`;
CREATE TABLE `product_variants` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `sku` VARCHAR(100) NOT NULL UNIQUE,
  `specification` JSON DEFAULT NULL,
  `price` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `stock` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_variants_product` (`product_id`),
  INDEX `idx_variants_sku` (`sku`),
  CONSTRAINT `fk_variants_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- MODULE 6: Service Product Mapping
-- ------------------------------------------------------------------------------

-- 13. service_products
DROP TABLE IF EXISTS `service_products`;
CREATE TABLE `service_products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `is_recommended` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_service_product` (`service_id`, `product_id`),
  INDEX `idx_sp_service` (`service_id`),
  INDEX `idx_sp_product` (`product_id`),
  CONSTRAINT `fk_sp_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sp_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. service_accessories
DROP TABLE IF EXISTS `service_accessories`;
CREATE TABLE `service_accessories` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_id` BIGINT UNSIGNED NOT NULL,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_service_accessory` (`service_id`, `product_id`),
  INDEX `idx_sa_service` (`service_id`),
  INDEX `idx_sa_product` (`product_id`),
  CONSTRAINT `fk_sa_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sa_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- MODULE 7: Order Management
-- ------------------------------------------------------------------------------

-- 15. orders
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_number` VARCHAR(64) NOT NULL UNIQUE,
  `customer_id` BIGINT UNSIGNED NOT NULL,
  `service_id` BIGINT UNSIGNED NOT NULL,
  `location_id` BIGINT UNSIGNED DEFAULT NULL,
  `subtotal` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `discount_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `total_amount` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `status` ENUM(
    'WAITING_CONFIRMATION',
    'ASSIGNED',
    'ACCEPTED',
    'ON_THE_WAY',
    'ARRIVED',
    'IN_PROGRESS',
    'WAITING_APPROVAL',
    'COMPLETED',
    'WAITING_PAYMENT',
    'PAID',
    'CANCELLED'
  ) NOT NULL DEFAULT 'WAITING_CONFIRMATION',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_orders_number` (`order_number`),
  INDEX `idx_orders_customer` (`customer_id`),
  INDEX `idx_orders_service` (`service_id`),
  INDEX `idx_orders_status` (`status`),
  CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customer_profiles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_orders_location` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. order_items (Snapshots: wajib ada snapshot harga dan snapshot nama)
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `item_type` ENUM('PRODUCT', 'ACCESSORY', 'SERVICE', 'ADDON') NOT NULL,
  `reference_id` BIGINT UNSIGNED NOT NULL,
  `name_snapshot` VARCHAR(255) NOT NULL,
  `price_snapshot` DECIMAL(15, 2) NOT NULL,
  `qty` INT UNSIGNED NOT NULL DEFAULT 1,
  `subtotal` DECIMAL(15, 2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_order_items_order` (`order_id`),
  INDEX `idx_order_items_type_ref` (`item_type`, `reference_id`),
  CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- MODULE 8: Technician Assignment
-- ------------------------------------------------------------------------------

-- 17. technician_assignments
DROP TABLE IF EXISTS `technician_assignments`;
CREATE TABLE `technician_assignments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `mitra_id` BIGINT UNSIGNED NOT NULL,
  `assigned_by` BIGINT UNSIGNED NOT NULL,
  `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `assigned_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tech_assign_order` (`order_id`),
  INDEX `idx_tech_assign_mitra` (`mitra_id`),
  INDEX `idx_tech_assign_by` (`assigned_by`),
  CONSTRAINT `fk_tech_assign_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_tech_assign_mitra` FOREIGN KEY (`mitra_id`) REFERENCES `mitra_profiles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_tech_assign_by` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- MODULE 9: Order Modification
-- ------------------------------------------------------------------------------

-- 18. order_change_requests
DROP TABLE IF EXISTS `order_change_requests`;
CREATE TABLE `order_change_requests` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `technician_id` BIGINT UNSIGNED NOT NULL,
  `reason` TEXT NOT NULL,
  `status` ENUM('WAITING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'WAITING',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ocr_order` (`order_id`),
  INDEX `idx_ocr_technician` (`technician_id`),
  CONSTRAINT `fk_ocr_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_ocr_technician` FOREIGN KEY (`technician_id`) REFERENCES `mitra_profiles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- MODULE 10: Payment
-- ------------------------------------------------------------------------------

-- 19. payments
DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` BIGINT UNSIGNED NOT NULL,
  `payment_method` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(15, 2) NOT NULL,
  `transaction_id` VARCHAR(100) DEFAULT NULL,
  `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
  `paid_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_payments_order` (`order_id`),
  INDEX `idx_payments_trans_id` (`transaction_id`),
  CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- MODULE 11: Promotion System
-- ------------------------------------------------------------------------------

-- 20. promotions
DROP TABLE IF EXISTS `promotions`;
CREATE TABLE `promotions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `discount_type` ENUM('PERCENTAGE', 'FIXED') NOT NULL,
  `discount_value` DECIMAL(15, 2) NOT NULL,
  `target_user` ENUM('NEW_USER', 'EXISTING_USER', 'ALL_USER') NOT NULL DEFAULT 'ALL_USER',
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `status` ENUM('ACTIVE', 'INACTIVE', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_promotions_target` (`target_user`),
  INDEX `idx_promotions_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- MODULE 13: Notification (WhatsApp / Push / SMS)
-- ------------------------------------------------------------------------------

-- 21. notifications
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `order_id` BIGINT UNSIGNED DEFAULT NULL,
  `channel` ENUM('WHATSAPP', 'PUSH_NOTIFICATION', 'SMS', 'EMAIL') NOT NULL DEFAULT 'WHATSAPP',
  `message` TEXT NOT NULL,
  `status` ENUM('QUEUED', 'SENT', 'FAILED') NOT NULL DEFAULT 'QUEUED',
  `sent_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_notif_user` (`user_id`),
  INDEX `idx_notif_order` (`order_id`),
  INDEX `idx_notif_status` (`status`),
  CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_notif_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- MODULE 14: Analytics Fallback (MySQL Analytics Layer)
-- ------------------------------------------------------------------------------

-- 22. analytics_events
DROP TABLE IF EXISTS `analytics_events`;
CREATE TABLE `analytics_events` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `event_type` VARCHAR(100) NOT NULL,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `session_id` VARCHAR(100) DEFAULT NULL,
  `payload` JSON DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_events_type` (`event_type`),
  INDEX `idx_events_user` (`user_id`),
  INDEX `idx_events_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. analytics_daily_summary
DROP TABLE IF EXISTS `analytics_daily_summary`;
CREATE TABLE `analytics_daily_summary` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `summary_date` DATE NOT NULL UNIQUE,
  `total_orders` INT UNSIGNED NOT NULL DEFAULT 0,
  `total_revenue` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `active_customers` INT UNSIGNED NOT NULL DEFAULT 0,
  `active_mitra` INT UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_summary_date` (`summary_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. analytics_service_report
DROP TABLE IF EXISTS `analytics_service_report`;
CREATE TABLE `analytics_service_report` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `service_id` BIGINT UNSIGNED NOT NULL,
  `report_date` DATE NOT NULL,
  `order_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `completion_rate` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
  `avg_rating` DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
  `revenue` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_service_date` (`service_id`, `report_date`),
  INDEX `idx_asr_service` (`service_id`),
  INDEX `idx_asr_date` (`report_date`),
  CONSTRAINT `fk_asr_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. analytics_product_report
DROP TABLE IF EXISTS `analytics_product_report`;
CREATE TABLE `analytics_product_report` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` BIGINT UNSIGNED NOT NULL,
  `report_date` DATE NOT NULL,
  `view_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `purchase_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `revenue` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_product_date` (`product_id`, `report_date`),
  INDEX `idx_apr_product` (`product_id`),
  INDEX `idx_apr_date` (`report_date`),
  CONSTRAINT `fk_apr_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- MODULE 15: Temporary Cart (MySQL Fallback Storage)
-- ------------------------------------------------------------------------------

-- 26. cart_items
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `cart_key` VARCHAR(100) NOT NULL,
  `item_type` ENUM('PRODUCT', 'ACCESSORY', 'SERVICE', 'ADDON') NOT NULL,
  `reference_id` BIGINT UNSIGNED NOT NULL,
  `qty` INT UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_cart_key` (`cart_key`),
  INDEX `idx_cart_item_ref` (`item_type`, `reference_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- 1. Roles Seed
INSERT INTO `roles` (`name`, `description`) VALUES
('SUPER_ADMIN', 'Super administrator with full system access'),
('ADMIN', 'Standard administrator for operations'),
('CUSTOMER_SERVICE', 'Customer service representative handling queries & modifications'),
('MARKETING', 'Marketing staff managing promo and analytics'),
('CUSTOMER', 'End-customer hiring services and ordering products'),
('MITRA_SERVICE', 'Partner technician or service provider company')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- 2. Service Categories Seed
INSERT INTO `service_categories` (`id`, `name`, `description`, `image`, `status`) VALUES
(1, 'AC', 'Layanan perbaikan, pemasangan, dan pemeliharaan AC', 'https://beresin.id/images/cat_ac.png', 'ACTIVE'),
(2, 'Motor', 'Layanan servis motor berkala dan perbaikan di lokasi', 'https://beresin.id/images/cat_motor.png', 'ACTIVE'),
(3, 'Mobil', 'Layanan salon, detailing, dan montir panggilan', 'https://beresin.id/images/cat_mobil.png', 'ACTIVE'),
(4, 'Furniture', 'Layanan reparasi, perakitan, dan cuci furniture', 'https://beresin.id/images/cat_furniture.png', 'ACTIVE'),
(5, 'Elektronik', 'Layanan perbaikan TV, mesin cuci, kulkas & microwave', 'https://beresin.id/images/cat_elektronik.png', 'ACTIVE')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. Product Categories Seed
INSERT INTO `product_categories` (`id`, `name`) VALUES
(1, 'Air Conditioner Unit'),
(2, 'AC Accessories & Parts'),
(3, 'Oli & Pelumas'),
(4, 'Sparepart Motor & Mobil'),
(5, 'Tools & Material')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
