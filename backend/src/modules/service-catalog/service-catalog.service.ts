import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ServiceCategory,
  Service,
  ServicePackage,
  GeneralStatus,
} from '../../database/entities/entities';
import {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
} from './dto/service-category.dto';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import {
  CreateServicePackageDto,
  UpdateServicePackageDto,
} from './dto/service-package.dto';

@Injectable()
export class ServiceCatalogService {
  constructor(
    @InjectRepository(ServiceCategory)
    private readonly categoryRepo: Repository<ServiceCategory>,
    @InjectRepository(Service)
    private readonly serviceRepo: Repository<Service>,
    @InjectRepository(ServicePackage)
    private readonly packageRepo: Repository<ServicePackage>,
  ) {}

  // ============================================================================
  // 1. SERVICE CATEGORIES CRUD
  // ============================================================================

  async findAllCategories(status?: GeneralStatus) {
    const qb = this.categoryRepo
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.services', 'service')
      .leftJoinAndSelect('service.packages', 'package');

    if (status) {
      qb.andWhere('category.status = :status', { status });
    }
    return qb.orderBy('category.id', 'ASC').getMany();
  }

  async findCategoryById(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['services', 'services.packages'],
    });
    if (!category) throw new NotFoundException(`Kategori layanan dengan ID ${id} tidak ditemukan`);
    return category;
  }

  async createCategory(dto: CreateServiceCategoryDto) {
    const category = this.categoryRepo.create({
      name: dto.name,
      description: dto.description,
      image: dto.image,
      status: dto.status || GeneralStatus.ACTIVE,
    });
    return this.categoryRepo.save(category);
  }

  async updateCategory(id: number, dto: UpdateServiceCategoryDto) {
    const category = await this.findCategoryById(id);
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async deleteCategory(id: number) {
    const category = await this.findCategoryById(id);
    await this.categoryRepo.softDelete(category.id);
    return { message: `Kategori layanan '${category.name}' berhasil dihapus (soft-delete)` };
  }

  // ============================================================================
  // 2. SERVICES CRUD
  // ============================================================================

  async findAllServices(categoryId?: number, status?: GeneralStatus) {
    const qb = this.serviceRepo
      .createQueryBuilder('service')
      .leftJoinAndSelect('service.category', 'category')
      .leftJoinAndSelect('service.packages', 'package')
      .leftJoinAndSelect('service.serviceProducts', 'sp')
      .leftJoinAndSelect('sp.product', 'product')
      .leftJoinAndSelect('product.variants', 'productVariant')
      .leftJoinAndSelect('service.serviceAccessories', 'sa')
      .leftJoinAndSelect('sa.product', 'accessory')
      .leftJoinAndSelect('accessory.variants', 'accessoryVariant');

    if (categoryId) {
      qb.andWhere('service.category_id = :categoryId', { categoryId });
    }
    if (status) {
      qb.andWhere('service.status = :status', { status });
    }
    return qb.orderBy('service.id', 'ASC').getMany();
  }

  async findServiceById(id: number) {
    const service = await this.serviceRepo.findOne({
      where: { id },
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
    if (!service) throw new NotFoundException(`Layanan dengan ID ${id} tidak ditemukan`);
    return service;
  }

  async createService(dto: CreateServiceDto) {
    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (!category) {
      throw new NotFoundException(`Kategori layanan dengan ID ${dto.categoryId} tidak ditemukan`);
    }

    const service = this.serviceRepo.create({
      category,
      name: dto.name,
      description: dto.description,
      image: dto.image,
      status: dto.status || GeneralStatus.ACTIVE,
    });
    return this.serviceRepo.save(service);
  }

  async updateService(id: number, dto: UpdateServiceDto) {
    const service = await this.findServiceById(id);

    if (dto.categoryId && dto.categoryId !== service.category?.id) {
      const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
      if (!category) {
        throw new NotFoundException(`Kategori layanan dengan ID ${dto.categoryId} tidak ditemukan`);
      }
      service.category = category;
    }

    if (dto.name !== undefined) service.name = dto.name;
    if (dto.description !== undefined) service.description = dto.description;
    if (dto.image !== undefined) service.image = dto.image;
    if (dto.status !== undefined) service.status = dto.status;

    return this.serviceRepo.save(service);
  }

  async deleteService(id: number) {
    const service = await this.findServiceById(id);
    await this.serviceRepo.softDelete(service.id);
    return { message: `Layanan '${service.name}' berhasil dihapus (soft-delete)` };
  }

  // ============================================================================
  // 3. SERVICE PACKAGES CRUD
  // ============================================================================

  async findAllPackages(serviceId?: number, status?: GeneralStatus) {
    const qb = this.packageRepo
      .createQueryBuilder('pkg')
      .leftJoinAndSelect('pkg.service', 'service');

    if (serviceId) {
      qb.andWhere('pkg.service_id = :serviceId', { serviceId });
    }
    if (status) {
      qb.andWhere('pkg.status = :status', { status });
    }
    return qb.orderBy('pkg.id', 'ASC').getMany();
  }

  async findPackageById(id: number) {
    const pkg = await this.packageRepo.findOne({
      where: { id },
      relations: ['service'],
    });
    if (!pkg) throw new NotFoundException(`Paket jasa dengan ID ${id} tidak ditemukan`);
    return pkg;
  }

  async createPackage(dto: CreateServicePackageDto) {
    const service = await this.serviceRepo.findOne({ where: { id: dto.serviceId } });
    if (!service) {
      throw new NotFoundException(`Layanan dengan ID ${dto.serviceId} tidak ditemukan`);
    }

    const pkg = this.packageRepo.create({
      service,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      durationMinutes: dto.durationMinutes || 60,
      status: dto.status || GeneralStatus.ACTIVE,
    });
    return this.packageRepo.save(pkg);
  }

  async updatePackage(id: number, dto: UpdateServicePackageDto) {
    const pkg = await this.findPackageById(id);

    if (dto.serviceId && dto.serviceId !== pkg.service?.id) {
      const service = await this.serviceRepo.findOne({ where: { id: dto.serviceId } });
      if (!service) {
        throw new NotFoundException(`Layanan dengan ID ${dto.serviceId} tidak ditemukan`);
      }
      pkg.service = service;
    }

    if (dto.name !== undefined) pkg.name = dto.name;
    if (dto.description !== undefined) pkg.description = dto.description;
    if (dto.price !== undefined) pkg.price = dto.price;
    if (dto.durationMinutes !== undefined) pkg.durationMinutes = dto.durationMinutes;
    if (dto.status !== undefined) pkg.status = dto.status;

    return this.packageRepo.save(pkg);
  }

  async deletePackage(id: number) {
    const pkg = await this.findPackageById(id);
    await this.packageRepo.softDelete(pkg.id);
    return { message: `Paket jasa '${pkg.name}' berhasil dihapus (soft-delete)` };
  }
}
