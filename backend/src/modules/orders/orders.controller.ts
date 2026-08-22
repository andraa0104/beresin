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
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/orders.dto';
import { OrderStatus } from '../../database/entities/enums';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ============================================================================
  // 1. CREATE ORDER FROM CART (CUSTOMER)
  // ============================================================================

  @Post()
  @Roles('CUSTOMER', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({
    summary:
      'Buat pesanan baru dari cart / direct checkout (Atomic Database Transaction)',
  })
  @ApiResponse({ status: 201, description: 'Pesanan berhasil dibuat' })
  async createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
    const userId = req.user.userId;
    return this.ordersService.createOrder(userId, dto);
  }

  // ============================================================================
  // 2. CUSTOMER ORDER HISTORY
  // ============================================================================

  @Get('my-orders')
  @Roles('CUSTOMER', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Daftar riwayat pesanan customer yang sedang login' })
  @ApiResponse({ status: 200, description: 'Riwayat pesanan berhasil diambil' })
  async getMyOrders(@Req() req: any) {
    const userId = req.user.userId;
    return this.ordersService.findMyOrders(userId);
  }

  // ============================================================================
  // 3. ADMIN ORDER VIEW (WITH FILTERS & SEARCH)
  // ============================================================================

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SERVICE', 'MARKETING')
  @ApiOperation({
    summary:
      'Daftar semua pesanan (Admin View - filter status, customerId, search orderNumber/nama/telepon)',
  })
  @ApiQuery({ name: 'status', enum: OrderStatus, required: false })
  @ApiQuery({ name: 'customerId', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, description: 'Cari nomor order/nama/telepon' })
  @ApiResponse({ status: 200, description: 'Daftar order berhasil diambil' })
  async getAllOrders(
    @Query('status') status?: OrderStatus,
    @Query('customerId') customerId?: string,
    @Query('search') search?: string,
  ) {
    return this.ordersService.findAll({
      status,
      customerId: customerId ? +customerId : undefined,
      search,
    });
  }

  // ============================================================================
  // 4. ORDER DETAIL (COMPLETE RELATIONS)
  // ============================================================================

  @Get(':id')
  @ApiOperation({
    summary:
      'Detail lengkap pesanan beserta items snapshot, teknisi assignment, perubahan order, dan pembayaran',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Detail pesanan berhasil diambil' })
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  // ============================================================================
  // 5. UPDATE ORDER STATUS (ADMIN / CS / OPERASIONAL)
  // ============================================================================

  @Patch(':id/status')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SERVICE', 'MITRA_SERVICE')
  @ApiOperation({
    summary:
      'Perbarui status pesanan (ASSIGNED, ON_THE_WAY, IN_PROGRESS, COMPLETED, dll)',
  })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Status pesanan berhasil diperbarui' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(+id, dto);
  }
}
