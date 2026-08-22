import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  Index,
  Unique,
  type Relation,
} from 'typeorm';

export * from './enums';
import {
  UserStatus,
  MitraStatus,
  GeneralStatus,
  ProductType,
  OrderStatus,
  OrderItemType,
  AssignmentStatus,
  ChangeRequestStatus,
  PaymentStatus,
  DiscountType,
  TargetUser,
  PromotionStatus,
  NotificationChannel,
  NotificationStatus,
} from './enums';

// ------------------------------------------------------------------------------
// MODULE 1: AUTH & USERS
// ------------------------------------------------------------------------------

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('UserRole', (userRole: any) => userRole.role)
  userRoles: Relation<UserRole>[];
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ length: 36, unique: true })
  @Index('idx_users_uuid')
  uuid: string;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 150, unique: true, nullable: true })
  @Index('idx_users_email')
  email: string;

  @Column({ length: 30, unique: true })
  @Index('idx_users_phone')
  phone: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  @Index('idx_users_status')
  status: UserStatus;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany('UserRole', (userRole: any) => userRole.user)
  userRoles: Relation<UserRole>[];

  @OneToOne('CustomerProfile', (customer: any) => customer.user)
  customerProfile: Relation<CustomerProfile>;

  @OneToOne('MitraProfile', (mitra: any) => mitra.user)
  mitraProfile: Relation<MitraProfile>;
}

@Entity('user_roles')
@Unique(['user', 'role'])
export class UserRole {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ManyToOne('User', (user: any) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToOne('Role', (role: any) => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Relation<Role>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

// ------------------------------------------------------------------------------
// MODULE 2: CUSTOMERS
// ------------------------------------------------------------------------------

@Entity('customer_profiles')
export class CustomerProfile {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @OneToOne('User', (user: any) => user.customerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ name: 'customer_code', length: 50, unique: true })
  customerCode: string;

  @Column({ name: 'total_transaction', type: 'int', unsigned: true, default: 0 })
  totalTransaction: number;

  @Column({ name: 'total_spending', type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  totalSpending: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('Location', (loc: any) => loc.customer)
  locations: Relation<Location>[];

  @OneToMany('Order', (order: any) => order.customer)
  orders: Relation<Order>[];
}

// ------------------------------------------------------------------------------
// MODULE 3: MITRA
// ------------------------------------------------------------------------------

@Entity('mitra_profiles')
export class MitraProfile {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @OneToOne('User', (user: any) => user.mitraProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @Column({ name: 'company_name', length: 150 })
  companyName: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 5.0 })
  rating: number;

  @Column({ type: 'enum', enum: MitraStatus, default: MitraStatus.PENDING })
  status: MitraStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('TechnicianAssignment', (assignment: any) => assignment.mitra)
  assignments: Relation<TechnicianAssignment>[];
}

// ------------------------------------------------------------------------------
// MODULE 12: LOCATIONS
// ------------------------------------------------------------------------------

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ManyToOne('CustomerProfile', (cust: any) => cust.locations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Relation<CustomerProfile>;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

// ------------------------------------------------------------------------------
// MODULE 4: SERVICE CATALOG
// ------------------------------------------------------------------------------

@Entity('service_categories')
export class ServiceCategory {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  image: string;

  @Column({ type: 'enum', enum: GeneralStatus, default: GeneralStatus.ACTIVE })
  status: GeneralStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany('Service', (srv: any) => srv.category)
  services: Relation<Service>[];
}

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ManyToOne('ServiceCategory', (cat: any) => cat.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Relation<ServiceCategory>;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  image: string;

  @Column({ type: 'enum', enum: GeneralStatus, default: GeneralStatus.ACTIVE })
  status: GeneralStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany('ServicePackage', (pkg: any) => pkg.service)
  packages: Relation<ServicePackage>[];

  @OneToMany('ServiceProduct', (sp: any) => sp.service)
  serviceProducts: Relation<ServiceProduct>[];

  @OneToMany('ServiceAccessory', (sa: any) => sa.service)
  serviceAccessories: Relation<ServiceAccessory>[];
}

@Entity('service_packages')
export class ServicePackage {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ManyToOne('Service', (srv: any) => srv.packages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Relation<Service>;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  price: number;

  @Column({ name: 'duration_minutes', type: 'int', unsigned: true, default: 60 })
  durationMinutes: number;

  @Column({ type: 'enum', enum: GeneralStatus, default: GeneralStatus.ACTIVE })
  status: GeneralStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

// ------------------------------------------------------------------------------
// MODULE 5: PRODUCT CATALOG
// ------------------------------------------------------------------------------

@Entity('product_categories')
export class ProductCategory {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ length: 100 })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany('Product', (p: any) => p.category)
  products: Relation<Product>[];
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ManyToOne('ProductCategory', (cat: any) => cat.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: Relation<ProductCategory>;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 100, nullable: true })
  brand: string;

  @Column({ name: 'product_type', type: 'enum', enum: ProductType, default: ProductType.MAIN_PRODUCT })
  productType: ProductType;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true })
  image: string;

  @Column({ type: 'enum', enum: GeneralStatus, default: GeneralStatus.ACTIVE })
  status: GeneralStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToMany('ProductVariant', (pv: any) => pv.product)
  variants: Relation<ProductVariant>[];
}

@Entity('product_variants')
export class ProductVariant {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ManyToOne('Product', (p: any) => p.variants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product>;

  @Column({ length: 100, unique: true })
  sku: string;

  @Column({ type: 'json', nullable: true })
  specification: Record<string, any>;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  price: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

// ------------------------------------------------------------------------------
// MODULE 6: SERVICE CONFIGURATION MAPPINGS
// ------------------------------------------------------------------------------

@Entity('service_products')
@Unique(['service', 'product'])
export class ServiceProduct {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ManyToOne('Service', (s: any) => s.serviceProducts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Relation<Service>;

  @ManyToOne('Product', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product>;

  @Column({ name: 'is_recommended', default: false })
  isRecommended: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('service_accessories')
@Unique(['service', 'product'])
export class ServiceAccessory {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ManyToOne('Service', (s: any) => s.serviceAccessories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Relation<Service>;

  @ManyToOne('Product', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// ------------------------------------------------------------------------------
// MODULE 7: ORDERS
// ------------------------------------------------------------------------------

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'order_number', length: 64, unique: true })
  orderNumber: string;

  @ManyToOne('CustomerProfile', (cust: any) => cust.orders)
  @JoinColumn({ name: 'customer_id' })
  customer: Relation<CustomerProfile>;

  @ManyToOne('Service')
  @JoinColumn({ name: 'service_id' })
  service: Relation<Service>;

  @ManyToOne('Location', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'location_id' })
  location: Relation<Location>;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  subtotal: number;

  @Column({ name: 'discount_amount', type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  discountAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  totalAmount: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.WAITING_CONFIRMATION })
  status: OrderStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany('OrderItem', (item: any) => item.order, { cascade: true })
  items: Relation<OrderItem>[];

  @OneToMany('TechnicianAssignment', (ta: any) => ta.order)
  assignments: Relation<TechnicianAssignment>[];

  @OneToMany('OrderChangeRequest', (ocr: any) => ocr.order)
  changeRequests: Relation<OrderChangeRequest>[];

  @OneToMany('Payment', (p: any) => p.order)
  payments: Relation<Payment>[];
}

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ManyToOne('Order', (o: any) => o.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Relation<Order>;

  @Column({ name: 'item_type', type: 'enum', enum: OrderItemType })
  itemType: OrderItemType;

  @Column({ name: 'reference_id', type: 'bigint', unsigned: true })
  referenceId: number;

  @Column({ name: 'name_snapshot', length: 255 })
  nameSnapshot: string;

  @Column({ name: 'price_snapshot', type: 'decimal', precision: 15, scale: 2 })
  priceSnapshot: number;

  @Column({ type: 'int', unsigned: true, default: 1 })
  qty: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// ------------------------------------------------------------------------------
// MODULE 8: TECHNICIAN ASSIGNMENTS
// ------------------------------------------------------------------------------

@Entity('technician_assignments')
export class TechnicianAssignment {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ManyToOne('Order', (o: any) => o.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Relation<Order>;

  @ManyToOne('MitraProfile', (m: any) => m.assignments)
  @JoinColumn({ name: 'mitra_id' })
  mitra: Relation<MitraProfile>;

  @ManyToOne('User')
  @JoinColumn({ name: 'assigned_by' })
  assignedBy: Relation<User>;

  @Column({ type: 'enum', enum: AssignmentStatus, default: AssignmentStatus.PENDING })
  status: AssignmentStatus;

  @Column({ name: 'assigned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// ------------------------------------------------------------------------------
// MODULE 9: ORDER CHANGES
// ------------------------------------------------------------------------------

@Entity('order_change_requests')
export class OrderChangeRequest {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ManyToOne('Order', (o: any) => o.changeRequests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Relation<Order>;

  @ManyToOne('MitraProfile')
  @JoinColumn({ name: 'technician_id' })
  technician: Relation<MitraProfile>;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'enum', enum: ChangeRequestStatus, default: ChangeRequestStatus.WAITING })
  status: ChangeRequestStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// ------------------------------------------------------------------------------
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ManyToOne('Order', (o: any) => o.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Relation<Order>;

  @Column({ name: 'payment_method', length: 50 })
  paymentMethod: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'transaction_id', length: 100, nullable: true })
  transactionId: string;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.WAITING_PAYMENT,
  })
  status: PaymentStatus;

  @Column({ name: 'proof_url', length: 255, nullable: true })
  proofUrl: string;

  @Column({ name: 'bank_name', length: 50, nullable: true })
  bankName: string;

  @Column({ name: 'account_number', length: 50, nullable: true })
  accountNumber: string;

  @Column({ name: 'account_holder', length: 100, nullable: true })
  accountHolder: string;

  @Column({ name: 'technician_submitted_at', type: 'timestamp', nullable: true })
  technicianSubmittedAt: Date;

  @ManyToOne('User', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'verified_by' })
  verifiedBy: Relation<User>;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// ------------------------------------------------------------------------------
// MODULE 11: PROMOTIONS
// ------------------------------------------------------------------------------

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ length: 150 })
  name: string;

  @Column({ name: 'discount_type', type: 'enum', enum: DiscountType })
  discountType: DiscountType;

  @Column({ name: 'discount_value', type: 'decimal', precision: 15, scale: 2 })
  discountValue: number;

  @Column({ name: 'target_user', type: 'enum', enum: TargetUser, default: TargetUser.ALL_USER })
  targetUser: TargetUser;

  @Column({ name: 'start_date', type: 'datetime' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'datetime' })
  endDate: Date;

  @Column({ type: 'enum', enum: PromotionStatus, default: PromotionStatus.ACTIVE })
  status: PromotionStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}

// ------------------------------------------------------------------------------
// MODULE 13: NOTIFICATIONS
// ------------------------------------------------------------------------------

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ManyToOne('User', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @ManyToOne('Order', { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'order_id' })
  order: Relation<Order>;

  @Column({ type: 'enum', enum: NotificationChannel, default: NotificationChannel.WHATSAPP })
  channel: NotificationChannel;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.QUEUED })
  status: NotificationStatus;

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

// ------------------------------------------------------------------------------
// MODULE 14: ANALYTICS FALLBACK (MYSQL)
// ------------------------------------------------------------------------------

@Entity('analytics_events')
export class AnalyticsEvent {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'event_type', length: 100 })
  eventType: string;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true })
  userId: number;

  @Column({ name: 'session_id', length: 100, nullable: true })
  sessionId: string;

  @Column({ type: 'json', nullable: true })
  payload: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

@Entity('analytics_daily_summary')
export class AnalyticsDailySummary {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'summary_date', type: 'date', unique: true })
  summaryDate: string;

  @Column({ name: 'total_orders', type: 'int', unsigned: true, default: 0 })
  totalOrders: number;

  @Column({ name: 'total_revenue', type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  totalRevenue: number;

  @Column({ name: 'active_customers', type: 'int', unsigned: true, default: 0 })
  activeCustomers: number;

  @Column({ name: 'active_mitra', type: 'int', unsigned: true, default: 0 })
  activeMitra: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('analytics_service_report')
@Unique(['service', 'reportDate'])
export class AnalyticsServiceReport {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ManyToOne('Service', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'service_id' })
  service: Relation<Service>;

  @Column({ name: 'report_date', type: 'date' })
  reportDate: string;

  @Column({ name: 'order_count', type: 'int', unsigned: true, default: 0 })
  orderCount: number;

  @Column({ name: 'completion_rate', type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  completionRate: number;

  @Column({ name: 'avg_rating', type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  avgRating: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  revenue: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('analytics_product_report')
@Unique(['product', 'reportDate'])
export class AnalyticsProductReport {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @ManyToOne('Product', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product>;

  @Column({ name: 'report_date', type: 'date' })
  reportDate: string;

  @Column({ name: 'view_count', type: 'int', unsigned: true, default: 0 })
  viewCount: number;

  @Column({ name: 'purchase_count', type: 'int', unsigned: true, default: 0 })
  purchaseCount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  revenue: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('cart_items')
export class CartItem {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'cart_key', length: 100 })
  @Index('idx_cart_key')
  cartKey: string;

  @Column({ name: 'item_type', type: 'enum', enum: OrderItemType })
  itemType: OrderItemType;

  @Column({ name: 'reference_id', type: 'bigint', unsigned: true })
  referenceId: number;

  @Column({ type: 'int', unsigned: true, default: 1 })
  qty: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

export const ALL_ENTITIES = [
  Role,
  User,
  UserRole,
  CustomerProfile,
  MitraProfile,
  Location,
  ServiceCategory,
  Service,
  ServicePackage,
  ProductCategory,
  Product,
  ProductVariant,
  ServiceProduct,
  ServiceAccessory,
  Order,
  OrderItem,
  TechnicianAssignment,
  OrderChangeRequest,
  Payment,
  Promotion,
  Notification,
  AnalyticsEvent,
  AnalyticsDailySummary,
  AnalyticsServiceReport,
  AnalyticsProductReport,
  CartItem,
];
