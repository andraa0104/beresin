import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ServiceProduct,
  ServiceAccessory,
  Service,
  Product,
  GeneralStatus,
} from '../../database/entities/entities';
import {
  MapServiceProductDto,
  MapServiceAccessoryDto,
} from './dto/service-config.dto';

@Injectable()
export class ServiceConfigService {
  constructor(
    @InjectRepository(ServiceProduct)
    private readonly spRepo: Repository<ServiceProduct>,
    @InjectRepository(ServiceAccessory)
    private readonly saRepo: Repository<ServiceAccessory>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  // ============================================================================
  // 1. SERVICE PRODUCTS MAPPING (Relation: service_products)
  // ============================================================================

  async getServiceProducts(serviceId: number) {
    const service = await this.serviceRepo.findOne({ where: { id: serviceId } });
    if (!service) throw new NotFoundException(`Layanan dengan ID ${serviceId} tidak ditemukan`);

    const mappings = await this.spRepo.find({
      where: { service: { id: serviceId } },
      relations: ['product', 'product.variants'],
    });

    return mappings.map((m) => ({
      mappingId: m.id,
      isRecommended: m.isRecommended,
      createdAt: m.createdAt,
      product: {
        id: m.product.id,
        name: m.product.name,
        brand: m.product.brand,
        productType: m.product.productType,
        description: m.product.description,
        image: m.product.image,
        variants: (m.product.variants || []).map((v) => ({
          id: v.id,
          sku: v.sku,
          price: Number(v.price),
          stock: v.stock,
          specification: v.specification,
        })),
      },
    }));
  }

  async mapProductToService(dto: MapServiceProductDto) {
    const service = await this.serviceRepo.findOne({ where: { id: dto.serviceId } });
    if (!service) throw new NotFoundException(`Layanan dengan ID ${dto.serviceId} tidak ditemukan`);

    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException(`Produk dengan ID ${dto.productId} tidak ditemukan`);

    let mapping = await this.spRepo.findOne({
      where: {
        service: { id: dto.serviceId },
        product: { id: dto.productId },
      },
    });

    if (mapping) {
      mapping.isRecommended = dto.isRecommended !== undefined ? dto.isRecommended : mapping.isRecommended;
    } else {
      mapping = this.spRepo.create({
        service,
        product,
        isRecommended: dto.isRecommended || false,
      });
    }

    return this.spRepo.save(mapping);
  }

  async unmapProductFromService(serviceId: number, productId: number) {
    const mapping = await this.spRepo.findOne({
      where: {
        service: { id: serviceId },
        product: { id: productId },
      },
    });

    if (!mapping) {
      throw new NotFoundException('Relasi service-product tidak ditemukan');
    }

    await this.spRepo.remove(mapping);
    return { message: 'Relasi produk berhasil dihapus dari layanan' };
  }

  // ============================================================================
  // 2. SERVICE ACCESSORIES MAPPING (Relation: service_accessories)
  // ============================================================================

  async getServiceAccessories(serviceId: number) {
    const service = await this.serviceRepo.findOne({ where: { id: serviceId } });
    if (!service) throw new NotFoundException(`Layanan dengan ID ${serviceId} tidak ditemukan`);

    const mappings = await this.saRepo.find({
      where: { service: { id: serviceId } },
      relations: ['product', 'product.variants'],
    });

    return mappings.map((m) => ({
      mappingId: m.id,
      createdAt: m.createdAt,
      accessory: {
        id: m.product.id,
        name: m.product.name,
        brand: m.product.brand,
        productType: m.product.productType,
        description: m.product.description,
        image: m.product.image,
        variants: (m.product.variants || []).map((v) => ({
          id: v.id,
          sku: v.sku,
          price: Number(v.price),
          stock: v.stock,
          specification: v.specification,
        })),
      },
    }));
  }

  async mapAccessoryToService(dto: MapServiceAccessoryDto) {
    const service = await this.serviceRepo.findOne({ where: { id: dto.serviceId } });
    if (!service) throw new NotFoundException(`Layanan dengan ID ${dto.serviceId} tidak ditemukan`);

    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException(`Aksesoris/Produk dengan ID ${dto.productId} tidak ditemukan`);

    let mapping = await this.saRepo.findOne({
      where: {
        service: { id: dto.serviceId },
        product: { id: dto.productId },
      },
    });

    if (!mapping) {
      mapping = this.saRepo.create({
        service,
        product,
      });
    }

    return this.saRepo.save(mapping);
  }

  async unmapAccessoryFromService(serviceId: number, productId: number) {
    const mapping = await this.saRepo.findOne({
      where: {
        service: { id: serviceId },
        product: { id: productId },
      },
    });

    if (!mapping) {
      throw new NotFoundException('Relasi service-accessory tidak ditemukan');
    }

    await this.saRepo.remove(mapping);
    return { message: 'Relasi aksesoris berhasil dihapus dari layanan' };
  }

  // ============================================================================
  // 3. COMPLETE SERVICE CONFIGURATION DETAIL (Packages + Products + Accessories)
  // ============================================================================

  async getServiceConfiguration(serviceId: number) {
    const service = await this.serviceRepo.findOne({
      where: { id: serviceId },
      relations: [
        'category',
        'packages',
        'serviceProducts',
        'serviceProducts.product',
        'serviceProducts.product.variants',
        'serviceAccessories',
        'serviceAccessories.product',
        'serviceAccessories.product.variants',
      ],
    });

    if (!service) {
      throw new NotFoundException(`Layanan dengan ID ${serviceId} tidak ditemukan`);
    }

    // Packages list
    const packages = (service.packages || [])
      .filter((pkg) => pkg.status === GeneralStatus.ACTIVE)
      .map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        description: pkg.description,
        price: Number(pkg.price),
        durationMinutes: pkg.durationMinutes,
        status: pkg.status,
      }));

    // Products list (e.g. Sharp AC, Daikin AC)
    const products = (service.serviceProducts || [])
      .filter((sp) => sp.product && sp.product.status === GeneralStatus.ACTIVE)
      .map((sp) => ({
        id: sp.product.id,
        name: sp.product.name,
        brand: sp.product.brand,
        productType: sp.product.productType,
        description: sp.product.description,
        image: sp.product.image,
        isRecommended: sp.isRecommended,
        variants: (sp.product.variants || []).map((v) => ({
          id: v.id,
          sku: v.sku,
          price: Number(v.price),
          stock: v.stock,
          specification: v.specification,
        })),
      }));

    // Accessories list (e.g. Selang AC, Bracket)
    const accessories = (service.serviceAccessories || [])
      .filter((sa) => sa.product && sa.product.status === GeneralStatus.ACTIVE)
      .map((sa) => ({
        id: sa.product.id,
        name: sa.product.name,
        brand: sa.product.brand,
        productType: sa.product.productType,
        description: sa.product.description,
        image: sa.product.image,
        variants: (sa.product.variants || []).map((v) => ({
          id: v.id,
          sku: v.sku,
          price: Number(v.price),
          stock: v.stock,
          specification: v.specification,
        })),
      }));

    return {
      service: {
        id: service.id,
        name: service.name,
        description: service.description,
        image: service.image,
        status: service.status,
        category: service.category
          ? {
              id: service.category.id,
              name: service.category.name,
              description: service.category.description,
              image: service.category.image,
            }
          : null,
      },
      packages,
      products,
      accessories,
      // Aliases for convenience
      availablePackages: packages,
      availableProducts: products,
      availableAccessories: accessories,
    };
  }
}
