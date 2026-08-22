import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Service,
  ServicePackage,
  ProductVariant,
  CartItem,
  OrderItemType,
} from '../../database/entities/entities';
import {
  AddCartItemDto,
  UpdateCartItemDto,
  RemoveCartItemDto,
  CalculateCartDirectDto,
} from './dto/cart.dto';

export interface CartStoredItem {
  itemType: OrderItemType;
  referenceId: number;
  qty: number;
}

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  private readonly redisEnabled: boolean;

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(ServicePackage)
    private readonly packageRepo: Repository<ServicePackage>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
    @InjectRepository(CartItem)
    private readonly cartItemRepo: Repository<CartItem>,
    private readonly configService: ConfigService,
  ) {
    this.redisEnabled = this.configService.get<boolean>('redis.enabled', false);
    if (this.redisEnabled) {
      this.logger.log('>> [Cart Storage] Using Provider: Redis Fast In-Memory Cache');
    } else {
      this.logger.log('>> [Cart Storage] Using Provider: MySQL Persistent Database Fallback (Active)');
    }
  }

  // ============================================================================
  // 1. CART IDENTIFIER RESOLVER
  // ============================================================================

  getCartKey(userId?: number, sessionId?: string): string {
    if (userId) {
      return `user_${userId}`;
    }
    if (sessionId) {
      return `guest_${sessionId}`;
    }
    throw new BadRequestException('User ID atau Session ID harus disertakan untuk cart');
  }

  // ============================================================================
  // 2. STORAGE OPERATIONS (REDIS / MYSQL FALLBACK)
  // ============================================================================

  private async getRawItems(cartKey: string): Promise<CartStoredItem[]> {
    if (this.redisEnabled) {
      // In Redis mode: retrieve JSON from redis
      // return JSON.parse(await redis.get(`cart:${cartKey}`)) || [];
    }

    // MySQL Fallback Storage
    const rows = await this.cartItemRepo.find({
      where: { cartKey },
      order: { createdAt: 'ASC' },
    });

    return rows.map((r) => ({
      itemType: r.itemType,
      referenceId: Number(r.referenceId),
      qty: r.qty,
    }));
  }

  // ============================================================================
  // 3. CART ACTIONS (GET, ADD, UPDATE, REMOVE, CLEAR)
  // ============================================================================

  async getCart(cartKey: string) {
    const rawItems = await this.getRawItems(cartKey);
    return this.resolveAndCalculateItems(rawItems, cartKey);
  }

  async addItem(cartKey: string, dto: AddCartItemDto) {
    if (this.redisEnabled) {
      // Redis logic
    } else {
      // MySQL Fallback Persistence
      let existing = await this.cartItemRepo.findOne({
        where: {
          cartKey,
          itemType: dto.itemType,
          referenceId: dto.referenceId,
        },
      });

      if (existing) {
        existing.qty += dto.qty;
        await this.cartItemRepo.save(existing);
      } else {
        const item = this.cartItemRepo.create({
          cartKey,
          itemType: dto.itemType,
          referenceId: dto.referenceId,
          qty: dto.qty,
        });
        await this.cartItemRepo.save(item);
      }
    }

    return this.getCart(cartKey);
  }

  async updateItem(cartKey: string, dto: UpdateCartItemDto) {
    if (this.redisEnabled) {
      // Redis logic
    } else {
      // MySQL Fallback Persistence
      const existing = await this.cartItemRepo.findOne({
        where: {
          cartKey,
          itemType: dto.itemType,
          referenceId: dto.referenceId,
        },
      });

      if (!existing) {
        throw new BadRequestException('Item tidak ditemukan di dalam keranjang');
      }

      if (dto.qty <= 0) {
        await this.cartItemRepo.remove(existing);
      } else {
        existing.qty = dto.qty;
        await this.cartItemRepo.save(existing);
      }
    }

    return this.getCart(cartKey);
  }

  async removeItem(cartKey: string, dto: RemoveCartItemDto) {
    if (this.redisEnabled) {
      // Redis logic
    } else {
      // MySQL Fallback Persistence
      const existing = await this.cartItemRepo.findOne({
        where: {
          cartKey,
          itemType: dto.itemType,
          referenceId: dto.referenceId,
        },
      });

      if (existing) {
        await this.cartItemRepo.remove(existing);
      }
    }

    return this.getCart(cartKey);
  }

  async clearCart(cartKey: string) {
    if (this.redisEnabled) {
      // Redis logic
    } else {
      // MySQL Fallback Persistence
      await this.cartItemRepo.delete({ cartKey });
    }

    return {
      message: 'Keranjang berhasil dikosongkan',
      cartKey,
      items: [],
      subtotal: 0,
      totalAmount: 0,
    };
  }

  // ============================================================================
  // 4. PRICING RESOLUTION & SNAPSHOT CALCULATION
  // ============================================================================

  private async resolveAndCalculateItems(items: CartStoredItem[], cartKey?: string) {
    let subtotal = 0;
    const resolvedItems: any[] = [];

    for (const item of items) {
      if (item.itemType === OrderItemType.SERVICE) {
        const pkg = await this.packageRepo.findOne({
          where: { id: item.referenceId },
          relations: ['service'],
        });
        if (pkg) {
          const itemPrice = Number(pkg.price);
          const lineSubtotal = itemPrice * item.qty;
          subtotal += lineSubtotal;
          resolvedItems.push({
            itemType: OrderItemType.SERVICE,
            referenceId: pkg.id,
            name: `${pkg.service ? pkg.service.name + ' - ' : ''}${pkg.name}`,
            price: itemPrice,
            qty: item.qty,
            subtotal: lineSubtotal,
            durationMinutes: pkg.durationMinutes,
          });
        }
      } else if (
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
          subtotal += lineSubtotal;
          resolvedItems.push({
            itemType: item.itemType,
            referenceId: variant.id,
            name: `${variant.product.name} (SKU: ${variant.sku})`,
            brand: variant.product.brand,
            image: variant.product.image,
            price: itemPrice,
            qty: item.qty,
            subtotal: lineSubtotal,
            stock: variant.stock,
          });
        }
      }
    }

    return {
      cartKey,
      itemCount: resolvedItems.length,
      subtotal,
      discountAmount: 0,
      total: subtotal,
      totalAmount: subtotal,
      storageType: this.redisEnabled ? 'REDIS' : 'MYSQL_FALLBACK',
      items: resolvedItems,
    };
  }

  // Direct calculation for checkout
  async calculateCart(dto: {
    serviceId: number;
    servicePackageId?: number;
    items: Array<{ itemType: OrderItemType; referenceId: number; qty: number }>;
  }) {
    const service = await this.serviceRepo.findOne({ where: { id: dto.serviceId } });
    if (!service) throw new BadRequestException('Service tidak ditemukan');

    let subtotal = 0;
    const resolvedItems: any[] = [];

    if (dto.servicePackageId) {
      const pkg = await this.packageRepo.findOne({ where: { id: dto.servicePackageId } });
      if (pkg) {
        const itemPrice = Number(pkg.price);
        subtotal += itemPrice;
        resolvedItems.push({
          itemType: OrderItemType.SERVICE,
          referenceId: pkg.id,
          nameSnapshot: `${service.name} - ${pkg.name}`,
          priceSnapshot: itemPrice,
          qty: 1,
          subtotal: itemPrice,
        });
      }
    }

    if (dto.items && dto.items.length > 0) {
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
            subtotal += lineSubtotal;
            resolvedItems.push({
              itemType: item.itemType,
              referenceId: variant.id,
              nameSnapshot: `${variant.product.name} (SKU: ${variant.sku})`,
              priceSnapshot: itemPrice,
              qty: item.qty,
              subtotal: lineSubtotal,
            });
          }
        }
      }
    }

    return {
      serviceId: service.id,
      serviceName: service.name,
      subtotal,
      discountAmount: 0,
      totalAmount: subtotal,
      items: resolvedItems,
    };
  }
}
