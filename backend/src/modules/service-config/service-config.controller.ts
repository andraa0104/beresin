import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ServiceConfigService } from './service-config.service';
import {
  MapServiceProductDto,
  MapServiceAccessoryDto,
} from './dto/service-config.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Service Configuration')
@Controller('service-configuration')
export class ServiceConfigController {
  constructor(private readonly configService: ServiceConfigService) {}

  // ============================================================================
  // 1. GET COMPLETE SERVICE CONFIGURATION DETAIL (Packages + Products + Accessories)
  // ============================================================================

  @Get(':serviceId')
  @ApiOperation({
    summary:
      'Dapatkan detail konfigurasi layanan lengkap (Kembalikan: products, accessories, packages)',
  })
  @ApiParam({ name: 'serviceId', example: 1, description: 'ID layanan (e.g. Pasang AC Baru)' })
  @ApiResponse({
    status: 200,
    description: 'Konfigurasi layanan berhasil diambil',
  })
  async getServiceConfiguration(@Param('serviceId') serviceId: string) {
    return this.configService.getServiceConfiguration(+serviceId);
  }

  // ============================================================================
  // 2. MANAGE SERVICE PRODUCTS (Relation: service_products)
  // ============================================================================

  @Get('products/:serviceId')
  @ApiOperation({
    summary: 'Daftar produk yang terhubung dengan layanan tertentu [service_products]',
  })
  @ApiParam({ name: 'serviceId', example: 1 })
  async getServiceProducts(@Param('serviceId') serviceId: string) {
    return this.configService.getServiceProducts(+serviceId);
  }

  @Post('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Hubungkan produk dengan layanan (e.g. Pasang AC Baru -> Sharp AC, Daikin AC) [service_products]',
  })
  @ApiResponse({ status: 201, description: 'Relasi produk berhasil dibuat' })
  async mapProduct(@Body() dto: MapServiceProductDto) {
    return this.configService.mapProductToService(dto);
  }

  @Delete('products/:serviceId/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Hapus relasi produk dari layanan [service_products]',
  })
  @ApiParam({ name: 'serviceId', example: 1 })
  @ApiParam({ name: 'productId', example: 1 })
  async unmapProduct(
    @Param('serviceId') serviceId: string,
    @Param('productId') productId: string,
  ) {
    return this.configService.unmapProductFromService(+serviceId, +productId);
  }

  // ============================================================================
  // 3. MANAGE SERVICE ACCESSORIES (Relation: service_accessories)
  // ============================================================================

  @Get('accessories/:serviceId')
  @ApiOperation({
    summary: 'Daftar aksesoris yang terhubung dengan layanan tertentu [service_accessories]',
  })
  @ApiParam({ name: 'serviceId', example: 1 })
  async getServiceAccessories(@Param('serviceId') serviceId: string) {
    return this.configService.getServiceAccessories(+serviceId);
  }

  @Post('accessories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Hubungkan aksesoris dengan layanan (e.g. Pasang AC -> Selang AC, Bracket) [service_accessories]',
  })
  @ApiResponse({ status: 201, description: 'Relasi aksesoris berhasil dibuat' })
  async mapAccessory(@Body() dto: MapServiceAccessoryDto) {
    return this.configService.mapAccessoryToService(dto);
  }

  @Delete('accessories/:serviceId/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Hapus relasi aksesoris dari layanan [service_accessories]',
  })
  @ApiParam({ name: 'serviceId', example: 1 })
  @ApiParam({ name: 'productId', example: 2 })
  async unmapAccessory(
    @Param('serviceId') serviceId: string,
    @Param('productId') productId: string,
  ) {
    return this.configService.unmapAccessoryFromService(+serviceId, +productId);
  }
}
