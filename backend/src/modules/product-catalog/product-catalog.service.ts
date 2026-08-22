import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProductCategory,
  Product,
  ProductVariant,
  ProductType,
  GeneralStatus,
} from '../../database/entities/entities';
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from './dto/product-category.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import {
  CreateProductVariantDto,
  UpdateProductVariantDto,
} from './dto/product-variant.dto';

@Injectable()
export class ProductCatalogService {
  constructor(
    @InjectRepository(ProductCategory)
    private readonly categoryRepo: Repository<ProductCategory>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  // ============================================================================
  // 1. PRODUCT CATEGORIES CRUD
  // ============================================================================

  async findAllCategories() {
    return this.categoryRepo.find({
      relations: ['products', 'products.variants'],
      order: { id: 'ASC' },
    });
  }

  async findCategoryById(id: number) {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['products', 'products.variants'],
    });
    if (!category) throw new NotFoundException(`Kategori produk dengan ID ${id} tidak ditemukan`);
    return category;
  }

  async createCategory(dto: CreateProductCategoryDto) {
    const cat = this.categoryRepo.create(dto);
    return this.categoryRepo.save(cat);
  }

  async updateCategory(id: number, dto: UpdateProductCategoryDto) {
    const category = await this.findCategoryById(id);
    Object.assign(category, dto);
    return this.categoryRepo.save(category);
  }

  async deleteCategory(id: number) {
    const category = await this.findCategoryById(id);
    await this.categoryRepo.softDelete(category.id);
    return { message: `Kategori produk '${category.name}' berhasil dihapus (soft-delete)` };
  }

  // ============================================================================
  // 2. PRODUCTS CRUD
  // ============================================================================

  async findAllProducts(query?: {
    categoryId?: number;
    productType?: ProductType;
    status?: GeneralStatus;
    search?: string;
  }) {
    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.variants', 'variant');

    if (query?.categoryId) {
      qb.andWhere('product.category_id = :categoryId', { categoryId: query.categoryId });
    }
    if (query?.productType) {
      qb.andWhere('product.product_type = :productType', { productType: query.productType });
    }
    if (query?.status) {
      qb.andWhere('product.status = :status', { status: query.status });
    } else {
      qb.andWhere('product.status = :status', { status: GeneralStatus.ACTIVE });
    }
    if (query?.search) {
      qb.andWhere(
        '(LOWER(product.name) LIKE :search OR LOWER(product.brand) LIKE :search OR LOWER(variant.sku) LIKE :search)',
        { search: `%${query.search.toLowerCase()}%` },
      );
    }

    return qb.orderBy('product.id', 'ASC').getMany();
  }

  async findProductById(id: number) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['category', 'variants'],
    });
    if (!product) throw new NotFoundException(`Produk dengan ID ${id} tidak ditemukan`);
    return product;
  }

  async createProduct(dto: CreateProductDto) {
    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (!category) {
      throw new NotFoundException(`Kategori produk dengan ID ${dto.categoryId} tidak ditemukan`);
    }

    const product = this.productRepo.create({
      category,
      name: dto.name,
      brand: dto.brand,
      productType: dto.productType || ProductType.MAIN_PRODUCT,
      description: dto.description,
      image: dto.image,
      status: dto.status || GeneralStatus.ACTIVE,
    });
    return this.productRepo.save(product);
  }

  async updateProduct(id: number, dto: UpdateProductDto) {
    const product = await this.findProductById(id);

    if (dto.categoryId && dto.categoryId !== product.category?.id) {
      const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
      if (!category) {
        throw new NotFoundException(`Kategori produk dengan ID ${dto.categoryId} tidak ditemukan`);
      }
      product.category = category;
    }

    if (dto.name !== undefined) product.name = dto.name;
    if (dto.brand !== undefined) product.brand = dto.brand;
    if (dto.productType !== undefined) product.productType = dto.productType;
    if (dto.description !== undefined) product.description = dto.description;
    if (dto.image !== undefined) product.image = dto.image;
    if (dto.status !== undefined) product.status = dto.status;

    return this.productRepo.save(product);
  }

  async deleteProduct(id: number) {
    const product = await this.findProductById(id);
    await this.productRepo.softDelete(product.id);
    return { message: `Produk '${product.name}' berhasil dihapus (soft-delete)` };
  }

  // ============================================================================
  // 3. PRODUCT VARIANTS & PRICE MANAGEMENT CRUD
  // ============================================================================

  async findAllVariants(productId?: number) {
    const qb = this.variantRepo
      .createQueryBuilder('variant')
      .leftJoinAndSelect('variant.product', 'product');

    if (productId) {
      qb.andWhere('variant.product_id = :productId', { productId });
    }
    return qb.orderBy('variant.id', 'ASC').getMany();
  }

  async findVariantById(id: number) {
    const variant = await this.variantRepo.findOne({
      where: { id },
      relations: ['product'],
    });
    if (!variant) throw new NotFoundException(`Varian produk dengan ID ${id} tidak ditemukan`);
    return variant;
  }

  async createVariant(dto: CreateProductVariantDto) {
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) {
      throw new NotFoundException(`Produk dengan ID ${dto.productId} tidak ditemukan`);
    }

    const existingSku = await this.variantRepo.findOne({ where: { sku: dto.sku } });
    if (existingSku) {
      throw new BadRequestException(`SKU '${dto.sku}' sudah terdaftar pada varian lain`);
    }

    const variant = this.variantRepo.create({
      product,
      sku: dto.sku,
      price: dto.price,
      stock: dto.stock || 0,
      specification: dto.specification || null,
    });
    return this.variantRepo.save(variant);
  }

  async updateVariant(id: number, dto: UpdateProductVariantDto) {
    const variant = await this.findVariantById(id);

    if (dto.sku && dto.sku !== variant.sku) {
      const existingSku = await this.variantRepo.findOne({ where: { sku: dto.sku } });
      if (existingSku) {
        throw new BadRequestException(`SKU '${dto.sku}' sudah terdaftar pada varian lain`);
      }
      variant.sku = dto.sku;
    }

    if (dto.productId && dto.productId !== variant.product?.id) {
      const product = await this.productRepo.findOne({ where: { id: dto.productId } });
      if (!product) {
        throw new NotFoundException(`Produk dengan ID ${dto.productId} tidak ditemukan`);
      }
      variant.product = product;
    }

    if (dto.price !== undefined) variant.price = dto.price;
    if (dto.stock !== undefined) variant.stock = dto.stock;
    if (dto.specification !== undefined) variant.specification = dto.specification;

    return this.variantRepo.save(variant);
  }

  async deleteVariant(id: number) {
    const variant = await this.findVariantById(id);
    await this.variantRepo.softDelete(variant.id);
    return { message: `Varian SKU '${variant.sku}' berhasil dihapus (soft-delete)` };
  }
}
