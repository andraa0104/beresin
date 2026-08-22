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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ServiceCatalogService } from './service-catalog.service';
import { GeneralStatus } from '../../database/entities/enums';
import {
  CreateServiceCategoryDto,
  UpdateServiceCategoryDto,
} from './dto/service-category.dto';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import {
  CreateServicePackageDto,
  UpdateServicePackageDto,
} from './dto/service-package.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Service Catalog')
@Controller('services')
export class ServiceCatalogController {
  constructor(private readonly catalogService: ServiceCatalogService) {}

  // ============================================================================
  // 1. SERVICE CATEGORIES (CRUD)
  // ============================================================================

  @Get('categories')
  @ApiOperation({
    summary: 'Dapatkan semua kategori layanan (AC, Motor, Mobil, Furniture, Elektronik)',
  })
  @ApiQuery({ name: 'status', enum: GeneralStatus, required: false })
  @ApiResponse({ status: 200, description: 'Daftar kategori layanan berhasil diambil' })
  async getCategories(@Query('status') status?: GeneralStatus) {
    return this.catalogService.findAllCategories(status);
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Dapatkan detail kategori layanan berdasarkan ID' })
  @ApiParam({ name: 'id', example: 1 })
  async getCategoryById(@Param('id') id: string) {
    return this.catalogService.findCategoryById(+id);
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buat kategori layanan baru (Admin / Super Admin)' })
  @ApiResponse({ status: 201, description: 'Kategori berhasil dibuat' })
  async createCategory(@Body() dto: CreateServiceCategoryDto) {
    return this.catalogService.createCategory(dto);
  }

  @Put('categories/:id')
  @Patch('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update data kategori layanan (Admin / Super Admin)' })
  @ApiParam({ name: 'id', example: 1 })
  async updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateServiceCategoryDto,
  ) {
    return this.catalogService.updateCategory(+id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus kategori layanan / Soft-delete (Admin / Super Admin)' })
  @ApiParam({ name: 'id', example: 1 })
  async deleteCategory(@Param('id') id: string) {
    return this.catalogService.deleteCategory(+id);
  }

  // ============================================================================
  // 2. SERVICES (CRUD)
  // ============================================================================

  @Get()
  @ApiOperation({
    summary: 'Daftar semua layanan beserta paket, produk rekomendasi & aksesoris',
  })
  @ApiQuery({ name: 'categoryId', required: false, description: 'Filter by category ID' })
  @ApiQuery({ name: 'status', enum: GeneralStatus, required: false })
  @ApiResponse({ status: 200, description: 'Daftar layanan berhasil diambil' })
  async getServices(
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: GeneralStatus,
  ) {
    return this.catalogService.findAllServices(
      categoryId ? +categoryId : undefined,
      status,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Detail lengkap layanan (AC Baru, Cuci AC, dll) + paket & produk/aksesoris',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Detail layanan berhasil diambil' })
  async getServiceById(@Param('id') id: string) {
    return this.catalogService.findServiceById(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buat layanan baru (Admin / Super Admin)' })
  @ApiResponse({ status: 201, description: 'Layanan berhasil dibuat' })
  async createService(@Body() dto: CreateServiceDto) {
    return this.catalogService.createService(dto);
  }

  @Put(':id')
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update data layanan (Admin / Super Admin)' })
  @ApiParam({ name: 'id', example: 1 })
  async updateService(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.catalogService.updateService(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus layanan / Soft-delete (Admin / Super Admin)' })
  @ApiParam({ name: 'id', example: 1 })
  async deleteService(@Param('id') id: string) {
    return this.catalogService.deleteService(+id);
  }

  // ============================================================================
  // 3. SERVICE PACKAGES (CRUD)
  // ============================================================================

  @Get('packages/all')
  @ApiOperation({ summary: 'Daftar semua paket jasa / Filter by serviceId' })
  @ApiQuery({ name: 'serviceId', required: false, description: 'Filter by service ID' })
  @ApiQuery({ name: 'status', enum: GeneralStatus, required: false })
  async getPackages(
    @Query('serviceId') serviceId?: string,
    @Query('status') status?: GeneralStatus,
  ) {
    return this.catalogService.findAllPackages(
      serviceId ? +serviceId : undefined,
      status,
    );
  }

  @Get('packages/:packageId')
  @ApiOperation({ summary: 'Detail paket jasa berdasarkan ID' })
  @ApiParam({ name: 'packageId', example: 1 })
  async getPackageById(@Param('packageId') packageId: string) {
    return this.catalogService.findPackageById(+packageId);
  }

  @Post('packages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buat paket jasa baru untuk layanan (Admin / Super Admin)' })
  @ApiResponse({ status: 201, description: 'Paket jasa berhasil dibuat' })
  async createPackage(@Body() dto: CreateServicePackageDto) {
    return this.catalogService.createPackage(dto);
  }

  @Put('packages/:packageId')
  @Patch('packages/:packageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update paket jasa (Admin / Super Admin)' })
  @ApiParam({ name: 'packageId', example: 1 })
  async updatePackage(
    @Param('packageId') packageId: string,
    @Body() dto: UpdateServicePackageDto,
  ) {
    return this.catalogService.updatePackage(+packageId, dto);
  }

  @Delete('packages/:packageId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus paket jasa / Soft-delete (Admin / Super Admin)' })
  @ApiParam({ name: 'packageId', example: 1 })
  async deletePackage(@Param('packageId') packageId: string) {
    return this.catalogService.deletePackage(+packageId);
  }
}
