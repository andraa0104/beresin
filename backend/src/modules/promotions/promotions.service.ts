import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import {
  Promotion,
  DiscountType,
  TargetUser,
  PromotionStatus,
  CustomerProfile,
} from '../../database/entities/entities';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  ValidatePromotionDto,
} from './dto/promotions.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private readonly promoRepo: Repository<Promotion>,
    @InjectRepository(CustomerProfile)
    private readonly customerRepo: Repository<CustomerProfile>,
  ) {}

  // ============================================================================
  // 1. PROMOTIONS CRUD (ADMIN / MARKETING)
  // ============================================================================

  async findAll(status?: PromotionStatus) {
    const qb = this.promoRepo.createQueryBuilder('promo');
    if (status) {
      qb.andWhere('promo.status = :status', { status });
    }
    return qb.orderBy('promo.createdAt', 'DESC').getMany();
  }

  async findById(id: number) {
    const promo = await this.promoRepo.findOne({ where: { id } });
    if (!promo) throw new NotFoundException(`Promosi dengan ID ${id} tidak ditemukan`);
    return promo;
  }

  async create(dto: CreatePromotionDto) {
    const existing = await this.promoRepo.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new BadRequestException(`Promosi dengan kode/nama '${dto.name}' sudah ada`);
    }

    const promo = this.promoRepo.create({
      name: dto.name,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      targetUser: dto.targetUser || TargetUser.ALL_USER,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      status: dto.status || PromotionStatus.ACTIVE,
    });
    return this.promoRepo.save(promo);
  }

  async update(id: number, dto: UpdatePromotionDto) {
    const promo = await this.findById(id);

    if (dto.name && dto.name !== promo.name) {
      const existing = await this.promoRepo.findOne({ where: { name: dto.name } });
      if (existing) {
        throw new BadRequestException(`Promosi dengan kode/nama '${dto.name}' sudah ada`);
      }
      promo.name = dto.name;
    }

    if (dto.discountType !== undefined) promo.discountType = dto.discountType;
    if (dto.discountValue !== undefined) promo.discountValue = dto.discountValue;
    if (dto.targetUser !== undefined) promo.targetUser = dto.targetUser;
    if (dto.startDate !== undefined) promo.startDate = new Date(dto.startDate);
    if (dto.endDate !== undefined) promo.endDate = new Date(dto.endDate);
    if (dto.status !== undefined) promo.status = dto.status;

    return this.promoRepo.save(promo);
  }

  async delete(id: number) {
    const promo = await this.findById(id);
    await this.promoRepo.softDelete(promo.id);
    return { message: `Promosi '${promo.name}' berhasil dihapus (soft-delete)` };
  }

  // ============================================================================
  // 2. VALIDATE PROMOTION ELIGIBILITY & CALCULATE DISCOUNT
  // ============================================================================

  async validateEligibility(userId: number | null, dto: ValidatePromotionDto) {
    const now = new Date();

    // 1. Find active promo within valid date window
    const promo = await this.promoRepo.findOne({
      where: {
        name: dto.promoCode,
        status: PromotionStatus.ACTIVE,
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
    });

    if (!promo) {
      throw new BadRequestException(
        `Kode promo '${dto.promoCode}' tidak valid, tidak aktif, atau sudah kedaluwarsa`,
      );
    }

    // 2. Resolve customer profile for target user verification
    let customer: CustomerProfile = null;
    let isNewCustomer = true;

    if (userId) {
      customer = await this.customerRepo.findOne({ where: { user: { id: userId } } });
      if (customer) {
        isNewCustomer = Number(customer.totalTransaction || 0) === 0;
      }
    }

    // 3. Verify Target User Rules (NEW_USER, EXISTING_USER, ALL_USER)
    if (promo.targetUser === TargetUser.NEW_USER) {
      if (!isNewCustomer) {
        throw new BadRequestException(
          `Promo '${promo.name}' khusus untuk pelanggan baru (belum pernah bertransaksi sebelumnya)`,
        );
      }
    } else if (promo.targetUser === TargetUser.EXISTING_USER) {
      if (isNewCustomer) {
        throw new BadRequestException(
          `Promo '${promo.name}' khusus untuk pelanggan setia (telah memiliki riwayat transaksi)`,
        );
      }
    }

    // 4. Calculate Discount
    let discountAmount = 0;
    if (promo.discountType === DiscountType.PERCENTAGE) {
      discountAmount = (dto.subtotal * Number(promo.discountValue)) / 100;
    } else {
      discountAmount = Number(promo.discountValue);
    }

    // Cap discount to subtotal
    discountAmount = Math.min(discountAmount, dto.subtotal);
    const finalTotal = dto.subtotal - discountAmount;

    return {
      valid: true,
      promoId: promo.id,
      promoCode: promo.name,
      discountType: promo.discountType,
      discountValue: Number(promo.discountValue),
      targetUser: promo.targetUser,
      originalSubtotal: dto.subtotal,
      discountAmount,
      finalTotal,
      message: `Kode promo '${promo.name}' berhasil digunakan. Hemat Rp ${discountAmount.toLocaleString('id-ID')}`,
    };
  }
}
