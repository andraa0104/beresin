import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Order,
  OrderItem,
  CustomerProfile,
  Service,
  ServicePackage,
  ProductVariant,
  Location,
  OrderStatus,
  OrderItemType,
  CartItem,
} from '../../database/entities/entities';
import { CartService } from '../cart/cart.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/orders.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(CustomerProfile)
    private readonly customerRepo: Repository<CustomerProfile>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    private readonly cartService: CartService,
    private readonly analyticsService: AnalyticsService,
    private readonly dataSource: DataSource,
  ) {}

  // ============================================================================
  // 1. CREATE ORDER FROM CART (WITH DATABASE TRANSACTION)
  // ============================================================================

  async createOrder(userId: number, dto: CreateOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      // 1. Resolve Customer Profile
      const customer = await manager.findOne(CustomerProfile, {
        where: { user: { id: userId } },
        relations: ['user'],
      });
      if (!customer) {
        throw new BadRequestException('Customer profile tidak ditemukan. Pastikan akun terdaftar sebagai customer.');
      }

      // 2. Resolve Service
      const service = await manager.findOne(Service, {
        where: { id: dto.serviceId },
      });
      if (!service) {
        throw new BadRequestException(`Layanan dengan ID ${dto.serviceId} tidak ditemukan`);
      }

      // 3. Resolve Location (Optional)
      let location: Location = null;
      if (dto.locationId) {
        location = await manager.findOne(Location, {
          where: { id: dto.locationId },
        });
      }

      // 4. Resolve Items (From DTO items OR Customer Cart)
      let itemsToOrder = dto.items || [];
      const cartKey = this.cartService.getCartKey(userId, dto.sessionId);

      if (itemsToOrder.length === 0) {
        const cartResult = await this.cartService.getCart(cartKey);
        itemsToOrder = cartResult.items.map((i: any) => ({
          itemType: i.itemType,
          referenceId: i.referenceId,
          qty: i.qty,
        }));
      }

      // 5. Calculate Pricing and Snapshots
      let subtotal = 0;
      const orderItemsToSave: Partial<OrderItem>[] = [];

      // Add Service Package if specified
      if (dto.servicePackageId) {
        const pkg = await manager.findOne(ServicePackage, {
          where: { id: dto.servicePackageId },
        });
        if (pkg) {
          const pkgPrice = Number(pkg.price);
          subtotal += pkgPrice;
          orderItemsToSave.push({
            itemType: OrderItemType.SERVICE,
            referenceId: pkg.id,
            nameSnapshot: `${service.name} - ${pkg.name}`,
            priceSnapshot: pkgPrice,
            qty: 1,
            subtotal: pkgPrice,
          });
        }
      }

      // Add Products & Accessories
      for (const item of itemsToOrder) {
        if (
          item.itemType === OrderItemType.PRODUCT ||
          item.itemType === OrderItemType.ACCESSORY
        ) {
          const variant = await manager.findOne(ProductVariant, {
            where: { id: item.referenceId },
            relations: ['product'],
          });
          if (variant) {
            const itemPrice = Number(variant.price);
            const lineSubtotal = itemPrice * item.qty;
            subtotal += lineSubtotal;
            orderItemsToSave.push({
              itemType: item.itemType,
              referenceId: variant.id,
              nameSnapshot: `${variant.product.name} (SKU: ${variant.sku})`,
              priceSnapshot: itemPrice,
              qty: item.qty,
              subtotal: lineSubtotal,
            });
          }
        } else if (
          item.itemType === OrderItemType.SERVICE &&
          !dto.servicePackageId
        ) {
          const pkg = await manager.findOne(ServicePackage, {
            where: { id: item.referenceId },
          });
          if (pkg) {
            const itemPrice = Number(pkg.price);
            subtotal += itemPrice * item.qty;
            orderItemsToSave.push({
              itemType: OrderItemType.SERVICE,
              referenceId: pkg.id,
              nameSnapshot: `${service.name} - ${pkg.name}`,
              priceSnapshot: itemPrice,
              qty: item.qty,
              subtotal: itemPrice * item.qty,
            });
          }
        }
      }

      if (orderItemsToSave.length === 0) {
        throw new BadRequestException(
          'Keranjang pesanan kosong. Harap pilih minimal 1 paket jasa atau produk.',
        );
      }

      // 6. Apply Promotion Discount (If promotionCode is supplied)
      let discountAmount = 0;
      if (dto.promotionCode) {
        const promo = await manager.findOne(Promotion, {
          where: {
            name: dto.promotionCode,
            status: PromotionStatus.ACTIVE,
          },
        });

        if (promo) {
          const isNewCustomer = Number(customer.totalTransaction || 0) === 0;
          let eligible = true;

          if (promo.targetUser === TargetUser.NEW_USER && !isNewCustomer) {
            eligible = false;
          } else if (promo.targetUser === TargetUser.EXISTING_USER && isNewCustomer) {
            eligible = false;
          }

          if (eligible) {
            if (promo.discountType === DiscountType.PERCENTAGE) {
              discountAmount = (subtotal * Number(promo.discountValue)) / 100;
            } else {
              discountAmount = Number(promo.discountValue);
            }
            discountAmount = Math.min(discountAmount, subtotal);
          }
        }
      }

      const totalAmount = Math.max(0, subtotal - discountAmount);

      // 7. Generate Human-Readable Unique Order Number (BRS-YYYYMMDD-XXXX)
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `BRS-${dateStr}-${randomSuffix}`;

      // 8. Save Order Entity
      const order = manager.create(Order, {
        orderNumber,
        customer,
        service,
        location,
        subtotal,
        discountAmount,
        totalAmount,
        status: OrderStatus.WAITING_CONFIRMATION,
      });
      const savedOrder = await manager.save(Order, order);

      // 8. Save Order Items with Mandatory Pricing Snapshot
      for (const item of orderItemsToSave) {
        item.order = savedOrder;
        await manager.save(OrderItem, manager.create(OrderItem, item));
      }

      // 9. Clear the customer's cart in MySQL within transaction
      await manager.delete(CartItem, { cartKey });

      // 10. Track Analytics Event
      await this.analyticsService.trackEvent({
        eventType: 'CREATE_ORDER',
        userId,
        payload: {
          orderId: savedOrder.id,
          orderNumber: savedOrder.orderNumber,
          serviceId: service.id,
          totalAmount: savedOrder.totalAmount,
          itemCount: orderItemsToSave.length,
        },
      });

      this.logger.log(`>> [Order Transaction] Order ${savedOrder.orderNumber} successfully created.`);
      return this.findOne(savedOrder.id, manager);
    });
  }

  // ============================================================================
  // 2. ADMIN ORDER VIEW (WITH FILTERS & SEARCH)
  // ============================================================================

  async findAll(query?: { status?: OrderStatus; search?: string; customerId?: number }) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'user')
      .leftJoinAndSelect('order.service', 'service')
      .leftJoinAndSelect('order.location', 'location')
      .leftJoinAndSelect('order.items', 'item')
      .leftJoinAndSelect('order.assignments', 'assignment')
      .leftJoinAndSelect('assignment.mitra', 'mitra')
      .leftJoinAndSelect('mitra.user', 'mitraUser')
      .leftJoinAndSelect('order.payments', 'payment');

    if (query?.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }
    if (query?.customerId) {
      qb.andWhere('order.customer_id = :customerId', { customerId: query.customerId });
    }
    if (query?.search) {
      qb.andWhere('(order.order_number LIKE :search OR user.name LIKE :search OR user.phone LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    return qb.orderBy('order.createdAt', 'DESC').getMany();
  }

  // ============================================================================
  // 3. CUSTOMER ORDER HISTORY
  // ============================================================================

  async findMyOrders(userId: number) {
    const customer = await this.customerRepo.findOne({
      where: { user: { id: userId } },
    });
    if (!customer) return [];

    return this.orderRepo.find({
      where: { customer: { id: customer.id } },
      relations: [
        'service',
        'location',
        'items',
        'assignments',
        'assignments.mitra',
        'payments',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  // ============================================================================
  // 4. ORDER DETAIL (COMPLETE RELATIONS)
  // ============================================================================

  async findOne(id: number, manager?: any) {
    const repo = manager ? manager.getRepository(Order) : this.orderRepo;
    const order = await repo.findOne({
      where: { id },
      relations: [
        'customer',
        'customer.user',
        'service',
        'location',
        'items',
        'assignments',
        'assignments.mitra',
        'assignments.mitra.user',
        'changeRequests',
        'payments',
      ],
    });

    if (!order) throw new NotFoundException(`Pesanan dengan ID ${id} tidak ditemukan`);
    return order;
  }

  // ============================================================================
  // 5. ORDER STATUS MANAGEMENT
  // ============================================================================

  async updateStatus(id: number, dto: UpdateOrderStatusDto) {
    const order = await this.findOne(id);
    const oldStatus = order.status;
    order.status = dto.status;
    const saved = await this.orderRepo.save(order);

    // If order is completed, update customer lifetime statistics
    if (dto.status === OrderStatus.COMPLETED && oldStatus !== OrderStatus.COMPLETED) {
      const customer = order.customer;
      if (customer) {
        customer.totalTransaction = Number(customer.totalTransaction || 0) + 1;
        customer.totalSpending = Number(customer.totalSpending || 0) + Number(order.totalAmount);
        await this.customerRepo.save(customer);
      }

      await this.analyticsService.trackEvent({
        eventType: 'ORDER_COMPLETED',
        userId: customer?.user?.id,
        payload: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
        },
      });
    }

    return saved;
  }
}
