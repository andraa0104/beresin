/**
 * AUTO-GENERATED FILE. DO NOT MODIFY MANUALLY.
 * Generated from OpenAPI Spec: Beresin Service Commerce API (1.0.0)
 * Command: npm run codegen:api
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
}

// ==========================================
// ENUMS
// ==========================================

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
}

export enum MitraStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum GeneralStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum ProductType {
  MAIN_PRODUCT = 'MAIN_PRODUCT',
  ACCESSORY = 'ACCESSORY',
  MATERIAL = 'MATERIAL',
  SPAREPART = 'SPAREPART',
}

export enum OrderStatus {
  WAITING_CONFIRMATION = 'WAITING_CONFIRMATION',
  ASSIGNED = 'ASSIGNED',
  ACCEPTED = 'ACCEPTED',
  ON_THE_WAY = 'ON_THE_WAY',
  ARRIVED = 'ARRIVED',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_APPROVAL = 'WAITING_APPROVAL',
  COMPLETED = 'COMPLETED',
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
}

export enum OrderItemType {
  PRODUCT = 'PRODUCT',
  ACCESSORY = 'ACCESSORY',
  SERVICE = 'SERVICE',
  ADDON = 'ADDON',
}

export enum AssignmentStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ChangeRequestStatus {
  WAITING = 'WAITING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  WAITING_PAYMENT_VERIFICATION = 'WAITING_PAYMENT_VERIFICATION',
  WAITING_CASH_COLLECTION = 'WAITING_CASH_COLLECTION',
  WAITING_ADMIN_CONFIRMATION = 'WAITING_ADMIN_CONFIRMATION',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum TargetUser {
  NEW_USER = 'NEW_USER',
  EXISTING_USER = 'EXISTING_USER',
  ALL_USER = 'ALL_USER',
}

export enum PromotionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

export enum NotificationChannel {
  WHATSAPP = 'WHATSAPP',
  PUSH_NOTIFICATION = 'PUSH_NOTIFICATION',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
}

export enum NotificationStatus {
  QUEUED = 'QUEUED',
  SENT = 'SENT',
  FAILED = 'FAILED',
}

// ==========================================
// MODELS & ENTITIES
// ==========================================

export interface UserRoleModel {
  id: number;
  role: {
    id: number;
    name: string;
    description?: string;
  };
}

export interface UserModel {
  id: number;
  uuid: string;
  name: string;
  phone: string;
  email?: string | null;
  status: UserStatus;
  roles: string[];
}

export interface CustomerProfileModel {
  id: number;
  customerCode: string;
  totalTransaction: number;
  totalSpending: number;
  user?: UserModel;
  locations?: LocationModel[];
}

export interface MitraProfileModel {
  id: number;
  companyName: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  status: MitraStatus;
  user?: UserModel;
}

export interface LocationModel {
  id: number;
  address: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface ServiceCategoryModel {
  id: number;
  name: string;
  description?: string;
  image?: string;
  status: GeneralStatus;
  services?: ServiceModel[];
}

export interface ServicePackageModel {
  id: number;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  status: GeneralStatus;
}

export interface ServiceModel {
  id: number;
  name: string;
  description?: string;
  image?: string;
  status: GeneralStatus;
  category?: ServiceCategoryModel;
  packages?: ServicePackageModel[];
  serviceProducts?: ServiceProductModel[];
  serviceAccessories?: ServiceAccessoryModel[];
}

export interface ProductCategoryModel {
  id: number;
  name: string;
}

export interface ProductVariantModel {
  id: number;
  sku: string;
  specification?: Record<string, any>;
  price: number;
  stock: number;
  product?: ProductModel;
}

export interface ProductModel {
  id: number;
  name: string;
  brand?: string;
  productType: ProductType;
  description?: string;
  image?: string;
  status: GeneralStatus;
  category?: ProductCategoryModel;
  variants?: ProductVariantModel[];
}

export interface ServiceProductModel {
  id: number;
  isRecommended: boolean;
  product: ProductModel;
}

export interface ServiceAccessoryModel {
  id: number;
  product: ProductModel;
}

export interface ServiceConfigurationDetail {
  service: ServiceModel;
  packages: ServicePackageModel[];
  recommendedProducts: ProductModel[];
  accessories: ProductModel[];
}

export interface OrderItemModel {
  id: number;
  itemType: OrderItemType;
  referenceId: number;
  nameSnapshot: string;
  priceSnapshot: number;
  qty: number;
  subtotal: number;
}

export interface OrderModel {
  id: number;
  orderNumber: string;
  customer?: CustomerProfileModel;
  service: ServiceModel;
  location?: LocationModel;
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items: OrderItemModel[];
  assignments?: TechnicianAssignmentModel[];
  changeRequests?: OrderChangeRequestModel[];
  payments?: PaymentModel[];
}

export interface TechnicianAssignmentModel {
  id: number;
  status: AssignmentStatus;
  assignedAt: string;
  mitra: MitraProfileModel;
  assignedBy?: UserModel;
}

export interface OrderChangeRequestModel {
  id: number;
  reason: string;
  status: ChangeRequestStatus;
  createdAt: string;
  technician?: MitraProfileModel;
}

export interface PaymentModel {
  id: number;
  paymentMethod: string;
  amount: number;
  transactionId?: string;
  status: PaymentStatus;
  proofUrl?: string;
  bankName?: string;
  accountNumber?: string;
  accountHolder?: string;
  technicianSubmittedAt?: string;
  verifiedAt?: string;
  paidAt?: string;
  notes?: string;
}

export interface PromotionModel {
  id: number;
  name: string;
  discountType: DiscountType;
  discountValue: number;
  targetUser: TargetUser;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
}

export interface CartItemModel {
  id: number;
  cartKey: string;
  itemType: OrderItemType;
  referenceId: number;
  qty: number;
  nameSnapshot?: string;
  priceSnapshot?: number;
  subtotal?: number;
}

export interface CartSummary {
  items: CartItemModel[];
  subtotal: number;
  itemCount: number;
}
