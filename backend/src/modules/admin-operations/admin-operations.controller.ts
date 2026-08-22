import {
  Controller,
  Get,
  Post,
  Patch,
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
import { AdminOperationsService } from './admin-operations.service';
import {
  AssignTechnicianDto,
  UpdateOrderStatusOperationDto,
} from './dto/admin-operations.dto';
import { OrderStatus } from '../../database/entities/enums';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Admin Operations')
@Controller('admin/operations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
export class AdminOperationsController {
  constructor(private readonly operationsService: AdminOperationsService) {}

  // ============================================================================
  // 1. ORDER DASHBOARD
  // ============================================================================

  @Get('dashboard')
  @ApiOperation({
    summary:
      'Order Dashboard: Agregasi metrik pesanan real-time & daftar pesanan mendesak (Admin Only)',
  })
  @ApiResponse({ status: 200, description: 'Metrik dashboard operasional berhasil diambil' })
  async getOrderDashboard() {
    return this.operationsService.getOrderDashboard();
  }

  // ============================================================================
  // 2. FILTER & SEARCH ORDERS
  // ============================================================================

  @Get('orders')
  @ApiOperation({
    summary:
      'Filter & Search Orders: Filter berdasarkan status, serviceId, mitraId, dan kata kunci (Admin Only)',
  })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiQuery({ name: 'serviceId', required: false, type: Number })
  @ApiQuery({ name: 'mitraId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, description: 'Cari no order / customer / telepon / mitra' })
  @ApiResponse({ status: 200, description: 'Daftar order terfilter berhasil diambil' })
  async filterOrders(
    @Query('status') status?: OrderStatus,
    @Query('serviceId') serviceId?: string,
    @Query('mitraId') mitraId?: string,
    @Query('search') search?: string,
  ) {
    return this.operationsService.filterOrders({
      status,
      serviceId: serviceId ? +serviceId : undefined,
      mitraId: mitraId ? +mitraId : undefined,
      search,
    });
  }

  // ============================================================================
  // 3. ASSIGN MITRA SERVICE
  // ============================================================================

  @Post('assign')
  @ApiOperation({
    summary:
      'Assign Mitra Service: Tugaskan mitra service / teknisi ke pesanan (Admin Only)',
  })
  @ApiResponse({ status: 201, description: 'Mitra service berhasil ditugaskan' })
  async assignMitra(@Req() req: any, @Body() dto: AssignTechnicianDto) {
    const adminUserId = req.user.userId;
    return this.operationsService.assignMitra(dto, adminUserId);
  }

  // ============================================================================
  // 4. CHANGE ORDER STATUS
  // ============================================================================

  @Patch('orders/:orderId/status')
  @ApiOperation({
    summary:
      'Change Order Status: Perbarui status pesanan operasional (Admin Only)',
  })
  @ApiParam({ name: 'orderId', example: 1 })
  @ApiResponse({ status: 200, description: 'Status pesanan berhasil diubah' })
  async changeOrderStatus(
    @Req() req: any,
    @Param('orderId') orderId: string,
    @Body() dto: UpdateOrderStatusOperationDto,
  ) {
    const adminUserId = req.user.userId;
    return this.operationsService.changeOrderStatus(+orderId, dto, adminUserId);
  }

  // ============================================================================
  // 5. VIEW CUSTOMER GPS LOCATION
  // ============================================================================

  @Get('orders/:orderId/location')
  @ApiOperation({
    summary:
      'View Customer GPS Location: Dapatkan koordinat GPS latitude/longitude, alamat, dan link Google Maps navigasi (Admin Only)',
  })
  @ApiParam({ name: 'orderId', example: 1 })
  @ApiResponse({ status: 200, description: 'Lokasi GPS customer berhasil diambil' })
  async getCustomerGpsLocation(@Param('orderId') orderId: string) {
    return this.operationsService.getCustomerGpsLocation(+orderId);
  }
}
