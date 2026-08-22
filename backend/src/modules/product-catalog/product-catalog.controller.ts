import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ProductCatalogService } from './product-catalog.service';
import { ProductType, GeneralStatus } from '../../database/entities/enums';
import {
  CreateProductCategoryDto,
  UpdateProductCategoryDto,
} from './dto/product-category.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';
import {
  CreateProductVariantDto,
  UpdateProductVariantDto,
} from './dto/product-variant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Product Catalog')
@Controller('products')
export class ProductCatalogController {
  constructor(private readonly catalogService: ProductCatalogService) {}

  // ============================================================================
  // 1. PRODUCT CATEGORIES (CRUD)
  // ============================================================================

  @Get('categories')
  @ApiOperation({ summary: 'Daftar semua kategori produk' })
  @ApiResponse({ status: 200, description: 'Kategori produk berhasil diambil' })
  async getCategories() {
    return this.catalogService.findAllCategories();
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Dapatkan detail kategori produk berdasarkan ID' })
  @ApiParam({ name: 'id', example: 1 })
  async getCategoryById(@Param('id') id: string) {
    return this.catalogService.findCategoryById(+id);
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buat kategori produk baru (Admin / Super Admin)' })
  @ApiResponse({ status: 201, description: 'Kategori produk berhasil dibuat' })
  async createCategory(@Body() dto: CreateProductCategoryDto) {
    return this.catalogService.createCategory(dto);
  }

  @Put('categories/:id')
  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update nama kategori produk (Admin / Super Admin)' })
  @ApiParam({ name: 'id', example: 1 })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateProductCategoryDto,
  ) {
    return this.catalogService.updateCategory(+id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus kategori produk / Soft-delete (Admin / Super Admin)' })
  @ApiParam({ name: 'id', example: 1 })
  async deleteCategory(@Param('id') id: string) {
    return this.catalogService.deleteCategory(+id);
  }

  // ============================================================================
  // 2. PRODUCTS (CRUD)
  // ============================================================================

  @Get()
  @ApiOperation({
    summary: 'Daftar produk dengan filter categoryId, productType, status & search',
  })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({
    name: 'productType',
    enum: ProductType,
    required: false,
    description: 'Filter tipe produk (MAIN_PRODUCT, ACCESSORY, MATERIAL, SPAREPART)',
  })
  @ApiQuery({ name: 'status', enum: GeneralStatus, required: false })
  @ApiQuery({ name: 'search', required: false, description: 'Cari berdasarkan nama/brand/SKU' })
  @ApiResponse({ status: 200, description: 'Daftar produk berhasil diambil' })
  async getProducts(
    @Query('categoryId') categoryId?: string,
    @Query('productType') productType?: ProductType,
    @Query('status') status?: GeneralStatus,
    @Query('search') search?: string,
  ) {
    return this.catalogService.findAllProducts({
      categoryId: categoryId ? +categoryId : undefined,
      productType,
      status,
      search,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail produk beserta varian harga & spesifikasi teknis JSON' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Detail produk berhasil diambil' })
  async getProductById(@Param('id') id: string) {
    return this.catalogService.findProductById(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Tambah produk baru (Tipe: MAIN_PRODUCT, ACCESSORY, MATERIAL, SPAREPART) + Image URL',
  })
  @ApiResponse({ status: 201, description: 'Produk berhasil dibuat' })
  async createProduct(@Body() dto: CreateProductDto) {
    return this.catalogService.createProduct(dto);
  }

  @Put(':id')
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update data produk (Admin / Super Admin)' })
  @ApiParam({ name: 'id', example: 1 })
  async updateProduct(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.catalogService.updateProduct(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus produk / Soft-delete (Admin / Super Admin)' })
  @ApiParam({ name: 'id', example: 1 })
  async deleteProduct(@Param('id') id: string) {
    return this.catalogService.deleteProduct(+id);
  }

  // ============================================================================
  // 3. PRODUCT VARIANTS & PRICE MANAGEMENT (CRUD)
  // ============================================================================

  @Get('variants/all')
  @ApiOperation({ summary: 'Daftar semua varian produk / Filter by productId' })
  @ApiQuery({ name: 'productId', required: false, description: 'Filter by product ID' })
  async getVariants(@Query('productId') productId?: string) {
    return this.catalogService.findAllVariants(productId ? +productId : undefined);
  }

  @Get('variants/:variantId')
  @ApiOperation({ summary: 'Detail varian produk berdasarkan ID' })
  @ApiParam({ name: 'variantId', example: 1 })
  async getVariantById(@Param('variantId') variantId: string) {
    return this.catalogService.findVariantById(+variantId);
  }

  @Post('variants')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Tambah varian baru (SKU unik, Harga, Stok, dan Spesifikasi Teknis JSON)',
  })
  @ApiResponse({ status: 201, description: 'Varian produk berhasil dibuat' })
  async createVariant(@Body() dto: CreateProductVariantDto) {
    return this.catalogService.createVariant(dto);
  }

  @Put('variants/:variantId')
  @Patch('variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update varian (Harga / Stok / Spesifikasi JSON) - Price Management',
  })
  @ApiParam({ name: 'variantId', example: 1 })
  async updateVariant(
    @Param('variantId') variantId: string,
    @Body() dto: UpdateProductVariantDto,
  ) {
    return this.catalogService.updateVariant(+variantId, dto);
  }

  @Delete('variants/:variantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus varian produk / Soft-delete (Admin / Super Admin)' })
  @ApiParam({ name: 'variantId', example: 1 })
  async deleteVariant(@Param('variantId') variantId: string) {
    return this.catalogService.deleteVariant(+variantId);
  }
}
