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
  Payment,
  Order,
  User,
  PaymentStatus,
  OrderStatus,
  Notification,
  NotificationChannel,
  NotificationStatus,
} from '../../database/entities/entities';
import { AnalyticsService } from '../analytics/analytics.service';
import {
  CreatePaymentRecordDto,
  UploadPaymentProofDto,
  TechnicianSubmitCashDto,
  VerifyPaymentDto,
  RejectPaymentDto,
  ManualPaymentMethod,
} from './dto/payments.dto';

export const BERESIN_BANK_ACCOUNTS = [
  {
    bankName: 'BCA',
    accountNumber: '8830192837',
    accountHolder: 'PT BERESIN SOLUSI INDONESIA',
  },
  {
    bankName: 'MANDIRI',
    accountNumber: '1370098234123',
    accountHolder: 'PT BERESIN SOLUSI INDONESIA',
  },
  {
    bankName: 'BRI',
    accountNumber: '020601009823501',
    accountHolder: 'PT BERESIN SOLUSI INDONESIA',
  },
];

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly analyticsService: AnalyticsService,
  ) {}

  // ============================================================================
  // 1. CREATE PAYMENT RECORD & SELECT PAYMENT METHOD
  // ============================================================================

  async createPaymentRecord(userId: number, dto: CreatePaymentRecordDto) {
    const order = await this.orderRepo.findOne({
      where: { id: dto.orderId },
      relations: ['customer', 'customer.user', 'assignments', 'assignments.mitra', 'assignments.mitra.user'],
    });

    if (!order) {
      throw new NotFoundException(`Pesanan dengan ID ${dto.orderId} tidak ditemukan`);
    }

    const amount = Number(order.totalAmount);
    const transactionId = `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let initialStatus = PaymentStatus.WAITING_PAYMENT;
    let bankInfo: any = null;

    if (dto.paymentMethod === ManualPaymentMethod.CASH) {
      initialStatus = PaymentStatus.WAITING_CASH_COLLECTION;
    } else if (dto.paymentMethod === ManualPaymentMethod.TRANSFER) {
      initialStatus = PaymentStatus.WAITING_PAYMENT;
      const matchedBank =
        BERESIN_BANK_ACCOUNTS.find(
          (b) => b.bankName.toUpperCase() === (dto.bankName || 'BCA').toUpperCase(),
        ) || BERESIN_BANK_ACCOUNTS[0];

      bankInfo = matchedBank;
    }

    const payment = this.paymentRepo.create({
      order,
      paymentMethod: dto.paymentMethod,
      amount,
      transactionId,
      status: initialStatus,
      bankName: bankInfo ? bankInfo.bankName : null,
      accountNumber: bankInfo ? bankInfo.accountNumber : null,
      accountHolder: bankInfo ? bankInfo.accountHolder : null,
    });

    const savedPayment = await this.paymentRepo.save(payment);

    // Update Order Status to WAITING_PAYMENT
    if (order.status !== OrderStatus.PAID && order.status !== OrderStatus.COMPLETED) {
      order.status = OrderStatus.WAITING_PAYMENT;
      await this.orderRepo.save(order);
    }

    // Send WhatsApp notification
    if (dto.paymentMethod === ManualPaymentMethod.TRANSFER && order.customer?.user) {
      await this.notificationRepo.save(
        this.notificationRepo.create({
          user: order.customer.user,
          order,
          channel: NotificationChannel.WHATSAPP,
          message: `Silakan lakukan transfer sebesar Rp ${amount.toLocaleString('id-ID')} ke rekening ${bankInfo.bankName} ${bankInfo.accountNumber} a.n. ${bankInfo.accountHolder} untuk pesanan ${order.orderNumber}. Lalu upload bukti transfer di aplikasi.`,
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        }),
      );
    }

    return {
      message: 'Rekening pembayaran berhasil dibuat',
      paymentId: savedPayment.id,
      orderNumber: order.orderNumber,
      paymentMethod: savedPayment.paymentMethod,
      amount: savedPayment.amount,
      status: savedPayment.status,
      bankTransferInstructions:
        dto.paymentMethod === ManualPaymentMethod.TRANSFER ? bankInfo : null,
    };
  }

  // ============================================================================
  // 2. TRANSFER FLOW: UPLOAD PAYMENT PROOF (CUSTOMER)
  // ============================================================================

  async uploadPaymentProof(userId: number, paymentId: number, dto: UploadPaymentProofDto) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['order', 'order.customer', 'order.customer.user'],
    });

    if (!payment) throw new NotFoundException('Data pembayaran tidak ditemukan');

    payment.proofUrl = dto.proofUrl;
    payment.notes = dto.notes || payment.notes;
    payment.status = PaymentStatus.WAITING_PAYMENT_VERIFICATION;

    const saved = await this.paymentRepo.save(payment);

    // Notify Customer
    if (payment.order?.customer?.user) {
      await this.notificationRepo.save(
        this.notificationRepo.create({
          user: payment.order.customer.user,
          order: payment.order,
          channel: NotificationChannel.WHATSAPP,
          message: `Bukti transfer untuk pesanan ${payment.order.orderNumber} telah diterima dan sedang diverifikasi oleh tim Beresin.`,
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        }),
      );
    }

    return {
      message: 'Bukti transfer berhasil diunggah. Menunggu verifikasi Admin / Marketing.',
      paymentId: saved.id,
      status: saved.status,
      proofUrl: saved.proofUrl,
    };
  }

  // ============================================================================
  // 3. CASH FLOW: TECHNICIAN CASH SUBMISSION
  // ============================================================================

  async technicianSubmitCash(
    userId: number,
    paymentId: number,
    dto: TechnicianSubmitCashDto,
  ) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['order', 'order.customer', 'order.customer.user'],
    });

    if (!payment) throw new NotFoundException('Data pembayaran tidak ditemukan');

    payment.proofUrl = dto.proofUrl || payment.proofUrl;
    payment.notes = dto.notes || 'Uang tunai telah diterima di tempat oleh teknisi';
    payment.technicianSubmittedAt = new Date();
    payment.status = PaymentStatus.WAITING_ADMIN_CONFIRMATION;

    const saved = await this.paymentRepo.save(payment);

    return {
      message: 'Serah terima uang tunai berhasil diajukan dan menunggu validasi Admin',
      paymentId: saved.id,
      status: saved.status,
      technicianSubmittedAt: saved.technicianSubmittedAt,
    };
  }

  // ============================================================================
  // 4. ADMIN & MARKETING VERIFICATION (PAID)
  // ============================================================================

  async verifyPayment(adminUserId: number, paymentId: number, dto: VerifyPaymentDto) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['order', 'order.customer', 'order.customer.user'],
    });

    if (!payment) throw new NotFoundException('Data pembayaran tidak ditemukan');

    payment.status = PaymentStatus.PAID;
    payment.paidAt = new Date();
    payment.verifiedBy = { id: adminUserId } as User;
    payment.verifiedAt = new Date();
    if (dto.notes) payment.notes = dto.notes;

    const saved = await this.paymentRepo.save(payment);

    // Update order status to PAID
    const order = payment.order;
    if (order) {
      order.status = OrderStatus.PAID;
      await this.orderRepo.save(order);

      // Send WhatsApp confirmation to Customer
      if (order.customer?.user) {
        await this.notificationRepo.save(
          this.notificationRepo.create({
            user: order.customer.user,
            order,
            channel: NotificationChannel.WHATSAPP,
            message: `Pembayaran sebesar Rp ${Number(payment.amount).toLocaleString('id-ID')} untuk pesanan ${order.orderNumber} telah diverifikasi VALID. Terima kasih!`,
            status: NotificationStatus.SENT,
            sentAt: new Date(),
          }),
        );
      }
    }

    // Analytics Event
    await this.analyticsService.trackEvent({
      eventType: 'PAYMENT_PAID',
      userId: order?.customer?.user?.id,
      payload: {
        paymentId: payment.id,
        orderId: order?.id,
        orderNumber: order?.orderNumber,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        verifiedBy: adminUserId,
      },
    });

    return {
      message: 'Pembayaran berhasil diverifikasi dan ditandai PAID',
      paymentId: saved.id,
      orderNumber: order?.orderNumber,
      status: saved.status,
      paidAt: saved.paidAt,
      verifiedAt: saved.verifiedAt,
    };
  }

  // ============================================================================
  // 5. REJECT PAYMENT
  // ============================================================================

  async rejectPayment(adminUserId: number, paymentId: number, dto: RejectPaymentDto) {
    const payment = await this.paymentRepo.findOne({
      where: { id: paymentId },
      relations: ['order', 'order.customer', 'order.customer.user'],
    });

    if (!payment) throw new NotFoundException('Data pembayaran tidak ditemukan');

    payment.status = PaymentStatus.REJECTED;
    payment.notes = dto.reason;
    payment.verifiedBy = { id: adminUserId } as User;
    payment.verifiedAt = new Date();

    const saved = await this.paymentRepo.save(payment);

    // Notify Customer
    if (payment.order?.customer?.user) {
      await this.notificationRepo.save(
        this.notificationRepo.create({
          user: payment.order.customer.user,
          order: payment.order,
          channel: NotificationChannel.WHATSAPP,
          message: `Bukti pembayaran untuk pesanan ${payment.order.orderNumber} DITOLAK dengan alasan: "${dto.reason}". Silakan periksa kembali dan upload bukti yang valid.`,
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        }),
      );
    }

    return {
      message: 'Pembayaran ditolak',
      paymentId: saved.id,
      status: saved.status,
      reason: dto.reason,
    };
  }

  // ============================================================================
  // 6. PAYMENT HISTORY & LISTING
  // ============================================================================

  async findAll(query?: { status?: PaymentStatus; paymentMethod?: string }) {
    const qb = this.paymentRepo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.order', 'order')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'user')
      .leftJoinAndSelect('payment.verifiedBy', 'verifier');

    if (query?.status) {
      qb.andWhere('payment.status = :status', { status: query.status });
    }
    if (query?.paymentMethod) {
      qb.andWhere('payment.payment_method = :paymentMethod', {
        paymentMethod: query.paymentMethod,
      });
    }

    return qb.orderBy('payment.createdAt', 'DESC').getMany();
  }

  async findById(id: number) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['order', 'order.customer', 'order.customer.user', 'verifiedBy'],
    });
    if (!payment) throw new NotFoundException(`Pembayaran dengan ID ${id} tidak ditemukan`);
    return payment;
  }

  async findByOrderId(orderId: number) {
    return this.paymentRepo.find({
      where: { order: { id: orderId } },
      relations: ['order', 'verifiedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  // Legacy helper
  async createPayment(dto: {
    orderId: number;
    paymentMethod: string;
    amount: number;
    transactionId?: string;
  }) {
    return this.createPaymentRecord(1, {
      orderId: dto.orderId,
      paymentMethod: dto.paymentMethod as any,
    });
  }
}
