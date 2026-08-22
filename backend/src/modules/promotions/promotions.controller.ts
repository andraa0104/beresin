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
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import {
  CreatePromotionDto,
  UpdatePromotionDto,
  ValidatePromotionDto,
} from './dto/promotions.dto';
import { PromotionStatus } from '../../database/entities/enums';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Promotions Engine')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promoService: PromotionsService) {}

  // ============================================================================
  // 1. VALIDATE PROMOTION ELIGIBILITY (PUBLIC / CUSTOMER)
  // ============================================================================

  @Post('validate')
  @ApiOperation({
    summary:
      'Validasi kelayakan promo & hitung diskon (Cek Target User: NEW_USER, EXISTING_USER, ALL_USER & masa aktif)',
  })
  @ApiResponse({ status: 200, description: 'Hasil validasi & kalkulasi diskon' })
  async validateEligibility(
    @Req() req: any,
    @Body() dto: ValidatePromotionDto,
  ) {
    const userId = req.user?.userId || null;
    return this.promoService.validateEligibility(userId, dto);
  }

  // ============================================================================
  // 2. LIST ALL ACTIVE PROMOTIONS (PUBLIC)
  // ============================================================================

  @Get()
  @ApiOperation({ summary: 'Daftar semua voucher promosi aktif' })
  @ApiQuery({ name: 'status', enum: PromotionStatus, required: false })
  @ApiResponse({ status: 200, description: 'Daftar promosi berhasil diambil' })
  async getPromotions(@Query('status') status?: PromotionStatus) {
    return this.promoService.findAll(status || PromotionStatus.ACTIVE);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail promosi berdasarkan ID' })
  @ApiParam({ name: 'id', example: 1 })
  async getPromotionById(@Param('id') id: string) {
    return this.promoService.findById(+id);
  }

  // ============================================================================
  // 3. CREATE & MANAGE PROMOTIONS (ADMIN / MARKETING)
  // ============================================================================

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MARKETING')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Buat promosi baru (Target: NEW_USER / EXISTING_USER / ALL_USER, Diskon: PERCENTAGE / FIXED)',
  })
  @ApiResponse({ status: 201, description: 'Promosi berhasil dibuat' })
  async createPromotion(@Body() dto: CreatePromotionDto) {
    return this.promoService.create(dto);
  }

  @Put(':id')
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MARKETING')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update promosi (Admin / Marketing)' })
  @ApiParam({ name: 'id', example: 1 })
  async updatePromotion(
    @Param('id') id: string,
    @Body() dto: UpdatePromotionDto,
  ) {
    return this.promoService.update(+id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MARKETING')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Hapus promosi / Soft-delete (Admin / Marketing)' })
  @ApiParam({ name: 'id', example: 1 })
  async deletePromotion(@Param('id') id: string) {
    return this.promoService.delete(+id);
  }
}
