import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { AnalyticsEventType } from './interfaces/analytics.interface';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Analytics & Reporting')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // ============================================================================
  // 1. TRACK EVENT (PUBLIC / CLIENT-SIDE STREAM)
  // ============================================================================

  @Post('events')
  @ApiOperation({
    summary:
      'Track User & Business Event: SERVICE_VIEW, PRODUCT_VIEW, ADD_TO_CART, ORDER_CREATED, PAYMENT_SUCCESS, ORDER_COMPLETED',
  })
  @ApiResponse({ status: 200, description: 'Event berhasil direkam' })
  async trackEvent(
    @Body()
    body: {
      eventType: AnalyticsEventType | string;
      userId?: number;
      sessionId?: string;
      payload?: Record<string, any>;
    },
  ) {
    await this.analyticsService.trackEvent(body);
    return { message: `Event '${body.eventType}' successfully tracked` };
  }

  // ============================================================================
  // 2. DASHBOARD DATA
  // ============================================================================

  @Get('dashboard')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MARKETING')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Executive Analytics Dashboard (Admin & Marketing)',
  })
  async getDashboard() {
    return this.analyticsService.getDashboardData();
  }

  // ============================================================================
  // 3. FUNNEL CONVERSION METRICS
  // ============================================================================

  @Get('funnel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MARKETING')
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      'Metrik Konversi Corong Penjualan (View -> Cart -> Order -> Payment -> Complete)',
  })
  @ApiQuery({ name: 'startDate', required: false, example: '2026-01-01' })
  @ApiQuery({ name: 'endDate', required: false, example: '2026-12-31' })
  async getFunnel(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getFunnelMetrics({ startDate, endDate });
  }

  // ============================================================================
  // 4. SERVICE REPORT
  // ============================================================================

  @Get('services')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MARKETING')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Laporan Performa Jasa Layanan' })
  @ApiQuery({ name: 'serviceId', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getServiceReport(
    @Query('serviceId') serviceId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getServiceReport(serviceId ? +serviceId : undefined, {
      startDate,
      endDate,
    });
  }

  // ============================================================================
  // 5. PRODUCT REPORT
  // ============================================================================

  @Get('products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MARKETING')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Laporan Penjualan & View Produk Katalog' })
  @ApiQuery({ name: 'productId', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getProductReport(
    @Query('productId') productId?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getProductReport(productId ? +productId : undefined, {
      startDate,
      endDate,
    });
  }
}
