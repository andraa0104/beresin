import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MitraProfile,
  MitraStatus,
  TechnicianAssignment,
  AssignmentStatus,
  Order,
  OrderItem,
  OrderItemType,
  OrderStatus,
  CustomerProfile,
  Notification,
  NotificationChannel,
  NotificationStatus,
  OrderChangeRequest,
  ChangeRequestStatus,
  ProductVariant,
  ServicePackage,
} from '../../database/entities/entities';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  RejectJobDto,
  UpdateJobStatusDto,
  UploadWorkPhotoDto,
  AddAdditionalItemRequestDto,
  CompleteJobDto,
} from './dto/mitra-jobs.dto';

@Injectable()
export class MitraService {
  private readonly logger = new Logger(MitraService.name);

  constructor(
    @InjectRepository(MitraProfile)
    private readonly mitraRepo: Repository<MitraProfile>,
    @InjectRepository(TechnicianAssignment)
    private readonly assignmentRepo: Repository<TechnicianAssignment>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
    @InjectRepository(CustomerProfile)
    private readonly customerRepo: Repository<CustomerProfile>,
    @InjectRepository(OrderChangeRequest)
    private readonly ocrRepo: Repository<OrderChangeRequest>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(ServicePackage)
    private readonly packageRepo: Repository<ServicePackage>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly analyticsService: AnalyticsService,
  ) {}

  // ============================================================================
  // 1. MITRA PROFILE & LOCATION
  // ============================================================================

  async findAll(status?: MitraStatus) {
    const qb = this.mitraRepo
      .createQueryBuilder('mitra')
      .leftJoinAndSelect('mitra.user', 'user')
      .leftJoinAndSelect('mitra.assignments', 'assignment');

    if (status) {
      qb.andWhere('mitra.status = :status', { status });
    }
    return qb.getMany();
  }

  async findById(id: number) {
    const mitra = await this.mitraRepo.findOne({
      where: { id },
      relations: ['user', 'assignments', 'assignments.order'],
    });
    if (!mitra) throw new NotFoundException('Mitra tidak ditemukan');
    return mitra;
  }

  async getMyProfile(userId: number) {
    const mitra = await this.mitraRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!mitra) throw new NotFoundException('Mitra profile tidak ditemukan');
    return mitra;
  }

  async updateStatus(id: number, status: MitraStatus) {
    const mitra = await this.findById(id);
    mitra.status = status;
    return this.mitraRepo.save(mitra);
  }

  async updateLocation(userId: number, lat: number, lng: number) {
    const mitra = await this.mitraRepo.findOne({ where: { user: { id: userId } } });
    if (!mitra) throw new NotFoundException('Mitra profile tidak ditemukan');
    mitra.latitude = lat;
    mitra.longitude = lng;
    return this.mitraRepo.save(mitra);
  }

  // ============================================================================
  // 2. VIEW ASSIGNED JOBS
  // ============================================================================

  async findAssignedJobs(userId: number, status?: AssignmentStatus) {
    const mitra = await this.mitraRepo.findOne({ where: { user: { id: userId } } });
    if (!mitra) throw new NotFoundException('Profil mitra tidak ditemukan untuk akun ini');

    const qb = this.assignmentRepo
      .createQueryBuilder('assignment')
      .leftJoinAndSelect('assignment.order', 'order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('order.service', 'service')
      .leftJoinAndSelect('order.location', 'location')
      .leftJoinAndSelect('order.items', 'item')
      .where('assignment.mitra_id = :mitraId', { mitraId: mitra.id });

    if (status) {
      qb.andWhere('assignment.status = :status', { status });
    }

    const assignments = await qb.orderBy('assignment.assignedAt', 'DESC').getMany();

    return assignments.map((a) => {
      const order = a.order;
      const location = order?.location;
      const lat = location?.latitude ? Number(location.latitude) : null;
      const lng = location?.longitude ? Number(location.longitude) : null;

      return {
        assignmentId: a.id,
        assignmentStatus: a.status,
        assignedAt: a.assignedAt,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          orderStatus: order.status,
          totalAmount: Number(order.totalAmount),
          service: order.service?.name,
          customer: {
            name: order.customer?.user?.name,
            phone: order.customer?.user?.phone,
          },
          location: location
            ? {
                id: location.id,
                address: location.address,
                notes: location.notes,
                latitude: lat,
                longitude: lng,
                googleMapsUrl:
                  lat && lng ? `https://www.google.com/maps?q=${lat},${lng}` : null,
                directionsUrl:
                  lat && lng
                    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
                    : null,
              }
            : null,
          items: (order.items || []).map((i) => ({
            id: i.id,
            itemType: i.itemType,
            name: i.nameSnapshot,
            price: Number(i.priceSnapshot),
            qty: i.qty,
            subtotal: Number(i.subtotal),
          })),
        },
      };
    });
  }

  // ============================================================================
  // 3. ACCEPT JOB
  // ============================================================================

  async acceptJob(userId: number, assignmentId: number) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['mitra', 'mitra.user', 'order', 'order.customer', 'order.customer.user'],
    });

    if (!assignment) throw new NotFoundException('Penugasan tidak ditemukan');
    if (assignment.mitra?.user?.id !== userId) {
      throw new ForbiddenException('Anda tidak berhak mengakses penugasan ini');
    }

    assignment.status = AssignmentStatus.ACCEPTED;
    await this.assignmentRepo.save(assignment);

    const order = assignment.order;
    if (order) {
      order.status = OrderStatus.ACCEPTED;
      await this.orderRepo.save(order);

      if (order.customer?.user) {
        await this.notificationRepo.save(
          this.notificationRepo.create({
            user: order.customer.user,
            order,
            channel: NotificationChannel.WHATSAPP,
            message: `Teknisi dari ${assignment.mitra?.companyName} telah menerima pesanan ${order.orderNumber} dan sedang bersiap menuju lokasi.`,
            status: NotificationStatus.SENT,
            sentAt: new Date(),
          }),
        );
      }
    }

    return {
      message: 'Penugasan pekerjaan berhasil diterima',
      assignmentId: assignment.id,
      assignmentStatus: assignment.status,
      orderNumber: order?.orderNumber,
      orderStatus: order?.status,
    };
  }

  // ============================================================================
  // 4. REJECT JOB
  // ============================================================================

  async rejectJob(userId: number, assignmentId: number, dto: RejectJobDto) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['mitra', 'mitra.user', 'order'],
    });

    if (!assignment) throw new NotFoundException('Penugasan tidak ditemukan');
    if (assignment.mitra?.user?.id !== userId) {
      throw new ForbiddenException('Anda tidak berhak menolak penugasan ini');
    }

    assignment.status = AssignmentStatus.REJECTED;
    await this.assignmentRepo.save(assignment);

    // Revert order status back to WAITING_CONFIRMATION so Admin can reassign
    const order = assignment.order;
    if (order) {
      order.status = OrderStatus.WAITING_CONFIRMATION;
      await this.orderRepo.save(order);
    }

    return {
      message: 'Penugasan pekerjaan berhasil ditolak. Pesanan dikembalikan ke antrean Admin.',
      assignmentId: assignment.id,
      orderNumber: order?.orderNumber,
      orderStatus: order?.status,
      reason: dto.reason,
    };
  }

  // ============================================================================
  // 5. UPDATE JOB STATUS
  // ============================================================================

  async updateJobStatus(userId: number, assignmentId: number, dto: UpdateJobStatusDto) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['mitra', 'mitra.user', 'order', 'order.customer', 'order.customer.user'],
    });

    if (!assignment) throw new NotFoundException('Penugasan tidak ditemukan');
    if (assignment.mitra?.user?.id !== userId) {
      throw new ForbiddenException('Anda tidak berhak mengakses penugasan ini');
    }

    const order = assignment.order;
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    const oldStatus = order.status;
    order.status = dto.status;
    await this.orderRepo.save(order);

    if (dto.status === OrderStatus.COMPLETED) {
      assignment.status = AssignmentStatus.COMPLETED;
      await this.assignmentRepo.save(assignment);

      const customer = order.customer;
      if (customer) {
        customer.totalTransaction = Number(customer.totalTransaction || 0) + 1;
        customer.totalSpending = Number(customer.totalSpending || 0) + Number(order.totalAmount);
        await this.customerRepo.save(customer);
      }
    }

    return {
      message: `Status pekerjaan berhasil diubah menjadi ${dto.status}`,
      assignmentId: assignment.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      previousStatus: oldStatus,
      currentStatus: order.status,
      notes: dto.notes || null,
    };
  }

  // ============================================================================
  // 6. UPLOAD WORK DOCUMENTATION / PHOTOS
  // ============================================================================

  async uploadWorkPhotos(userId: number, assignmentId: number, dto: UploadWorkPhotoDto) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['mitra', 'mitra.user', 'order'],
    });

    if (!assignment) throw new NotFoundException('Penugasan tidak ditemukan');
    if (assignment.mitra?.user?.id !== userId) {
      throw new ForbiddenException('Anda tidak berhak mengunggah foto untuk penugasan ini');
    }

    const order = assignment.order;
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    await this.analyticsService.trackEvent({
      eventType: 'WORK_PHOTO_UPLOADED',
      userId,
      payload: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        mitraId: assignment.mitra?.id,
        photoType: dto.photoType,
        photoUrls: dto.photoUrls,
        notes: dto.notes,
      },
    });

    return {
      message: 'Dokumentasi foto pengerjaan berhasil diunggah',
      assignmentId: assignment.id,
      orderNumber: order.orderNumber,
      photoType: dto.photoType,
      uploadedCount: dto.photoUrls.length,
      photoUrls: dto.photoUrls,
      notes: dto.notes || null,
    };
  }

  // ============================================================================
  // 7. ADD ADDITIONAL ITEM & REQUEST CUSTOMER APPROVAL
  // ============================================================================

  async addAdditionalItemRequest(
    userId: number,
    assignmentId: number,
    dto: AddAdditionalItemRequestDto,
  ) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['mitra', 'mitra.user', 'order', 'order.customer', 'order.customer.user'],
    });

    if (!assignment) throw new NotFoundException('Penugasan tidak ditemukan');
    if (assignment.mitra?.user?.id !== userId) {
      throw new ForbiddenException('Anda tidak berhak mengajukan penambahan item untuk penugasan ini');
    }

    const order = assignment.order;
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    let addedSubtotal = 0;
    const addedItems: any[] = [];

    for (const item of dto.items) {
      if (
        item.itemType === OrderItemType.PRODUCT ||
        item.itemType === OrderItemType.ACCESSORY
      ) {
        const variant = await this.variantRepo.findOne({
          where: { id: item.referenceId },
          relations: ['product'],
        });
        if (variant) {
          const itemPrice = Number(variant.price);
          const lineSubtotal = itemPrice * item.qty;
          addedSubtotal += lineSubtotal;

          const savedItem = await this.orderItemRepo.save(
            this.orderItemRepo.create({
              order,
              itemType: item.itemType,
              referenceId: variant.id,
              nameSnapshot: `[Tambahan] ${variant.product.name} (SKU: ${variant.sku})`,
              priceSnapshot: itemPrice,
              qty: item.qty,
              subtotal: lineSubtotal,
            }),
          );

          addedItems.push({
            id: savedItem.id,
            name: savedItem.nameSnapshot,
            price: itemPrice,
            qty: item.qty,
            subtotal: lineSubtotal,
          });
        }
      } else if (item.itemType === OrderItemType.SERVICE) {
        const pkg = await this.packageRepo.findOne({ where: { id: item.referenceId } });
        if (pkg) {
          const itemPrice = Number(pkg.price);
          const lineSubtotal = itemPrice * item.qty;
          addedSubtotal += lineSubtotal;

          const savedItem = await this.orderItemRepo.save(
            this.orderItemRepo.create({
              order,
              itemType: item.itemType,
              referenceId: pkg.id,
              nameSnapshot: `[Tambahan] Jasa: ${pkg.name}`,
              priceSnapshot: itemPrice,
              qty: item.qty,
              subtotal: lineSubtotal,
            }),
          );

          addedItems.push({
            id: savedItem.id,
            name: savedItem.nameSnapshot,
            price: itemPrice,
            qty: item.qty,
            subtotal: lineSubtotal,
          });
        }
      }
    }

    if (addedItems.length === 0) {
      throw new BadRequestException('Item tambahan tidak valid atau tidak ditemukan');
    }

    // 1. Update order subtotal & total amount
    order.subtotal = Number(order.subtotal) + addedSubtotal;
    order.totalAmount = Number(order.totalAmount) + addedSubtotal;
    order.status = OrderStatus.WAITING_APPROVAL;
    await this.orderRepo.save(order);

    // 2. Create Order Change Request
    const changeRequest = await this.ocrRepo.save(
      this.ocrRepo.create({
        order,
        technician: assignment.mitra,
        reason: dto.reason,
        status: ChangeRequestStatus.WAITING,
      }),
    );

    // 3. Send Notification to Customer for Approval
    if (order.customer?.user) {
      await this.notificationRepo.save(
        this.notificationRepo.create({
          user: order.customer.user,
          order,
          channel: NotificationChannel.WHATSAPP,
          message: `Teknisi ${assignment.mitra?.companyName} mengajukan item tambahan (+Rp ${addedSubtotal.toLocaleString('id-ID')}) untuk pesanan ${order.orderNumber} dengan alasan: "${dto.reason}". Silakan buka aplikasi untuk menyetujui.`,
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        }),
      );
    }

    return {
      message: 'Penambahan item berhasil diajukan ke customer dan menunggu persetujuan',
      changeRequestId: changeRequest.id,
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      additionalSubtotal: addedSubtotal,
      newTotalAmount: order.totalAmount,
      addedItems,
      reason: dto.reason,
    };
  }

  // ============================================================================
  // 8. COMPLETE ORDER
  // ============================================================================

  async completeOrder(userId: number, assignmentId: number, dto: CompleteJobDto) {
    const assignment = await this.assignmentRepo.findOne({
      where: { id: assignmentId },
      relations: ['mitra', 'mitra.user', 'order', 'order.customer', 'order.customer.user'],
    });

    if (!assignment) throw new NotFoundException('Penugasan tidak ditemukan');
    if (assignment.mitra?.user?.id !== userId) {
      throw new ForbiddenException('Anda tidak berhak menyelesaikan penugasan ini');
    }

    const order = assignment.order;
    if (!order) throw new NotFoundException('Order tidak ditemukan');

    assignment.status = AssignmentStatus.COMPLETED;
    await this.assignmentRepo.save(assignment);

    order.status = OrderStatus.COMPLETED;
    await this.orderRepo.save(order);

    const customer = order.customer;
    if (customer) {
      customer.totalTransaction = Number(customer.totalTransaction || 0) + 1;
      customer.totalSpending = Number(customer.totalSpending || 0) + Number(order.totalAmount);
      await this.customerRepo.save(customer);
    }

    if (customer?.user) {
      await this.notificationRepo.save(
        this.notificationRepo.create({
          user: customer.user,
          order,
          channel: NotificationChannel.WHATSAPP,
          message: `Pesanan ${order.orderNumber} telah selesai dikerjakan oleh teknisi ${assignment.mitra?.companyName}. Terima kasih telah menggunakan layanan Beresin!`,
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        }),
      );
    }

    await this.analyticsService.trackEvent({
      eventType: 'ORDER_COMPLETED_BY_MITRA',
      userId,
      payload: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        mitraId: assignment.mitra?.id,
        totalAmount: order.totalAmount,
        completionNotes: dto.completionNotes,
        evidencePhotos: dto.evidencePhotos,
      },
    });

    return {
      message: 'Pekerjaan berhasil diselesaikan dan pesanan ditandai COMPLETED',
      assignmentId: assignment.id,
      orderNumber: order.orderNumber,
      orderStatus: order.status,
      customerName: customer?.user?.name,
      completionNotes: dto.completionNotes || null,
      evidencePhotos: dto.evidencePhotos || [],
    };
  }
}
