import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Order,
  TechnicianAssignment,
  MitraProfile,
  CustomerProfile,
  Location,
  User,
  OrderStatus,
  AssignmentStatus,
  NotificationChannel,
  NotificationStatus,
  Notification,
} from '../../database/entities/entities';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  AssignTechnicianDto,
  UpdateOrderStatusOperationDto,
} from './dto/admin-operations.dto';

@Injectable()
export class AdminOperationsService {
  private readonly logger = new Logger(AdminOperationsService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(TechnicianAssignment)
    private readonly assignmentRepo: Repository<TechnicianAssignment>,
    @InjectRepository(MitraProfile)
    private readonly mitraRepo: Repository<MitraProfile>,
    @InjectRepository(CustomerProfile)
    private readonly customerRepo: Repository<CustomerProfile>,
    @InjectRepository(Location)
    private readonly locationRepo: Repository<Location>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly analyticsService: AnalyticsService,
  ) {}

  // ============================================================================
  // 1. ORDER DASHBOARD & REAL-TIME OPERATIONAL METRICS
  // ============================================================================

  async getOrderDashboard() {
    const statusCounts = await this.orderRepo
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(order.id)', 'count')
      .addSelect('SUM(order.total_amount)', 'revenue')
      .groupBy('order.status')
      .getRawMany();

    const counts: Record<string, number> = {
      WAITING_CONFIRMATION: 0,
      ASSIGNED: 0,
      ACCEPTED: 0,
      ON_THE_WAY: 0,
      ARRIVED: 0,
      IN_PROGRESS: 0,
      WAITING_APPROVAL: 0,
      COMPLETED: 0,
      WAITING_PAYMENT: 0,
      PAID: 0,
      CANCELLED: 0,
    };

    let totalRevenue = 0;

    statusCounts.forEach((sc) => {
      counts[sc.status] = parseInt(sc.count, 10);
      if (sc.status === OrderStatus.COMPLETED || sc.status === OrderStatus.PAID) {
        totalRevenue += parseFloat(sc.revenue || 0);
      }
    });

    const activeOrdersCount =
      counts.WAITING_CONFIRMATION +
      counts.ASSIGNED +
      counts.ACCEPTED +
      counts.ON_THE_WAY +
      counts.ARRIVED +
      counts.IN_PROGRESS +
      counts.WAITING_APPROVAL;

    // Recent 10 waiting orders needing admin dispatch
    const urgentOrders = await this.orderRepo.find({
      where: { status: OrderStatus.WAITING_CONFIRMATION },
      relations: ['customer', 'customer.user', 'service', 'location'],
      order: { createdAt: 'ASC' },
      take: 10,
    });

    return {
      metrics: {
        totalActiveOrders: activeOrdersCount,
        waitingConfirmation: counts.WAITING_CONFIRMATION,
        assigned: counts.ASSIGNED,
        inProgress: counts.IN_PROGRESS + counts.ON_THE_WAY + counts.ARRIVED,
        completed: counts.COMPLETED + counts.PAID,
        cancelled: counts.CANCELLED,
        totalCompletedRevenue: totalRevenue,
        statusBreakdown: counts,
      },
      urgentDispatches: urgentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        service: o.service?.name,
        customerName: o.customer?.user?.name,
        customerPhone: o.customer?.user?.phone,
        address: o.location?.address,
        totalAmount: Number(o.totalAmount),
        createdAt: o.createdAt,
      })),
    };
  }

  // ============================================================================
  // 2. FILTER & SEARCH ORDERS
  // ============================================================================

  async filterOrders(query?: {
    status?: OrderStatus;
    serviceId?: number;
    mitraId?: number;
    search?: string;
  }) {
    const qb = this.orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('order.service', 'service')
      .leftJoinAndSelect('order.location', 'location')
      .leftJoinAndSelect('order.assignments', 'assignment')
      .leftJoinAndSelect('assignment.mitra', 'mitra')
      .leftJoinAndSelect('mitra.user', 'mitraUser');

    if (query?.status) {
      qb.andWhere('order.status = :status', { status: query.status });
    }
    if (query?.serviceId) {
      qb.andWhere('order.service_id = :serviceId', { serviceId: query.serviceId });
    }
    if (query?.mitraId) {
      qb.andWhere('assignment.mitra_id = :mitraId', { mitraId: query.mitraId });
    }
    if (query?.search) {
      qb.andWhere(
        '(order.order_number LIKE :search OR customerUser.name LIKE :search OR customerUser.phone LIKE :search OR mitra.company_name LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const orders = await qb.orderBy('order.createdAt', 'DESC').getMany();

    return orders.map((order) => {
      const latestAssignment =
        order.assignments && order.assignments.length > 0
          ? order.assignments[order.assignments.length - 1]
          : null;

      const loc = order.location;
      const lat = loc?.latitude ? Number(loc.latitude) : null;
      const lng = loc?.longitude ? Number(loc.longitude) : null;

      return {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
        service: {
          id: order.service?.id,
          name: order.service?.name,
        },
        customer: {
          id: order.customer?.id,
          name: order.customer?.user?.name,
          phone: order.customer?.user?.phone,
        },
        gpsLocation: loc
          ? {
              address: loc.address,
              latitude: lat,
              longitude: lng,
              googleMapsUrl: lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null,
            }
          : null,
        assignedMitra: latestAssignment
          ? {
              assignmentId: latestAssignment.id,
              mitraId: latestAssignment.mitra?.id,
              companyName: latestAssignment.mitra?.companyName,
              status: latestAssignment.status,
              phone: latestAssignment.mitra?.user?.phone,
            }
          : null,
      };
    });
  }

  // ============================================================================
  // 3. ASSIGN MITRA SERVICE
  // ============================================================================

  async assignMitra(dto: AssignTechnicianDto, adminUserId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId },
      relations: ['customer', 'customer.user', 'service'],
    });
    if (!order) throw new NotFoundException(`Order dengan ID ${dto.orderId} tidak ditemukan`);

    const mitra = await this.mitraRepo.findOne({
      where: { id: dto.mitraId },
      relations: ['user'],
    });
    if (!mitra) throw new NotFoundException(`Mitra service dengan ID ${dto.mitraId} tidak ditemukan`);

    const assignment = this.assignmentRepo.create({
      order,
      mitra,
      assignedBy: { id: adminUserId } as User,
      status: AssignmentStatus.PENDING,
    });

    const savedAssignment = await this.assignmentRepo.save(assignment);

    // Update order status to ASSIGNED if currently WAITING_CONFIRMATION
    if (order.status === OrderStatus.WAITING_CONFIRMATION) {
      order.status = OrderStatus.ASSIGNED;
      await this.orderRepo.save(order);
    }

    // WhatsApp Notification to Mitra
    if (mitra.user) {
      await this.notificationRepo.save(
        this.notificationRepo.create({
          user: mitra.user,
          order,
          channel: NotificationChannel.WHATSAPP,
          message: `Halo ${mitra.companyName}, pesanan ${order.orderNumber} (${order.service?.name}) telah ditugaskan kepada Anda.`,
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        }),
      );
    }

    // WhatsApp Notification to Customer
    if (order.customer?.user) {
      await this.notificationRepo.save(
        this.notificationRepo.create({
          user: order.customer.user,
          order,
          channel: NotificationChannel.WHATSAPP,
          message: `Teknisi dari mitra ${mitra.companyName} telah ditugaskan untuk pesanan ${order.orderNumber}.`,
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        }),
      );
    }

    return {
      message: 'Mitra service berhasil ditugaskan ke pesanan',
      assignmentId: savedAssignment.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      assignedMitra: {
        id: mitra.id,
        companyName: mitra.companyName,
        phone: mitra.user?.phone,
      },
    };
  }

  // ============================================================================
  // 4. CHANGE ORDER STATUS
  // ============================================================================

  async changeOrderStatus(
    orderId: number,
    dto: UpdateOrderStatusOperationDto,
    adminUserId: number,
  ) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['customer', 'customer.user', 'service'],
    });
    if (!order) throw new NotFoundException(`Order dengan ID ${orderId} tidak ditemukan`);

    const oldStatus = order.status;
    order.status = dto.status;
    const savedOrder = await this.orderRepo.save(order);

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
          adminUserId,
        },
      });
    }

    return {
      message: `Status pesanan ${order.orderNumber} berhasil diubah menjadi ${dto.status}`,
      orderId: savedOrder.id,
      orderNumber: savedOrder.orderNumber,
      previousStatus: oldStatus,
      currentStatus: savedOrder.status,
      notes: dto.notes || null,
    };
  }

  // ============================================================================
  // 5. VIEW CUSTOMER GPS LOCATION & COORDINATES
  // ============================================================================

  async getCustomerGpsLocation(orderId: number) {
    const order = await this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['customer', 'customer.user', 'location', 'service'],
    });
    if (!order) throw new NotFoundException(`Order dengan ID ${orderId} tidak ditemukan`);

    const location = order.location;
    if (!location) {
      throw new NotFoundException('Lokasi GPS belum ditentukan untuk order ini');
    }

    const latitude = location.latitude ? Number(location.latitude) : null;
    const longitude = location.longitude ? Number(location.longitude) : null;

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      serviceName: order.service?.name,
      customer: {
        id: order.customer?.id,
        name: order.customer?.user?.name,
        phone: order.customer?.user?.phone,
      },
      gpsLocation: {
        address: location.address,
        latitude,
        longitude,
        accessNotes: location.notes,
        googleMapsUrl:
          latitude && longitude
            ? `https://www.google.com/maps?q=${latitude},${longitude}`
            : null,
        directionsUrl:
          latitude && longitude
            ? `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`
            : null,
      },
    };
  }
}
