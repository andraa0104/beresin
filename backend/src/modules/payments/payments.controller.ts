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
import { PaymentsService, BERESIN_BANK_ACCOUNTS } from './payments.service';
import {
  CreatePaymentRecordDto,
  UploadPaymentProofDto,
  TechnicianSubmitCashDto,
  VerifyPaymentDto,
  RejectPaymentDto,
} from './dto/payments.dto';
import { PaymentStatus } from '../../database/entities/enums';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Payments Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  // ============================================================================
  // 1. GET BERESIN BANK ACCOUNTS (FOR TRANSFER WORKFLOW)
  // ============================================================================

  @Get('bank-accounts')
  @ApiOperation({
    summary: 'Daftar rekening bank resmi Beresin (BCA, Mandiri, BRI)',
  })
  @ApiResponse({ status: 200, description: 'Rekening bank Beresin berhasil diambil' })
  async getBankAccounts() {
    return BERESIN_BANK_ACCOUNTS;
  }

  // ============================================================================
  // 2. CREATE PAYMENT RECORD / SELECT METHOD (CASH OR TRANSFER)
  // ============================================================================

  @Post('records')
  @Roles('CUSTOMER', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({
    summary:
      'Pilih metode pembayaran (CASH atau TRANSFER). Untuk TRANSFER, sistem mengembalikan data rekening Beresin.',
  })
  @ApiResponse({ status: 201, description: 'Rekord pembayaran berhasil dibuat' })
  async createPaymentRecord(
    @Req() req: any,
    @Body() dto: CreatePaymentRecordDto,
  ) {
    const userId = req.user.userId;
    return this.paymentsService.createPaymentRecord(userId, dto);
  }

  // ============================================================================
  // 3. TRANSFER WORKFLOW: UPLOAD PROOF (CUSTOMER)
  // ============================================================================

  @Post(':paymentId/upload-proof')
  @Roles('CUSTOMER', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({
    summary:
      'Upload bukti transfer bank customer (Otomatis ubah status ke WAITING_PAYMENT_VERIFICATION)',
  })
  @ApiParam({ name: 'paymentId', example: 1 })
  @ApiResponse({ status: 200, description: 'Bukti transfer berhasil diunggah' })
  async uploadPaymentProof(
    @Req() req: any,
    @Param('paymentId') paymentId: string,
    @Body() dto: UploadPaymentProofDto,
  ) {
    const userId = req.user.userId;
    return this.paymentsService.uploadPaymentProof(userId, +paymentId, dto);
  }

  // ============================================================================
  // 4. CASH WORKFLOW: TECHNICIAN CASH SUBMISSION (MITRA SERVICE)
  // ============================================================================

  @Post(':paymentId/technician-submit-cash')
  @Roles('MITRA_SERVICE', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({
    summary:
      'Teknisi mengajukan serah terima uang tunai yang diterima dari customer di tempat (Ubah status ke WAITING_ADMIN_CONFIRMATION)',
  })
  @ApiParam({ name: 'paymentId', example: 1 })
  @ApiResponse({ status: 200, description: 'Serah terima uang tunai berhasil diajukan' })
  async technicianSubmitCash(
    @Req() req: any,
    @Param('paymentId') paymentId: string,
    @Body() dto: TechnicianSubmitCashDto,
  ) {
    const userId = req.user.userId;
    return this.paymentsService.technicianSubmitCash(userId, +paymentId, dto);
  }

  // ============================================================================
  // 5. ADMIN & MARKETING VERIFICATION (MARK AS PAID)
  // ============================================================================

  @Post(':paymentId/verify')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MARKETING')
  @ApiOperation({
    summary:
      'Admin / Marketing verifikasi pembayaran manual (Tandai PAID, update order status ke PAID & kirim notifikasi ke customer)',
  })
  @ApiParam({ name: 'paymentId', example: 1 })
  @ApiResponse({ status: 200, description: 'Pembayaran berhasil diverifikasi dan ditandai PAID' })
  async verifyPayment(
    @Req() req: any,
    @Param('paymentId') paymentId: string,
    @Body() dto: VerifyPaymentDto,
  ) {
    const adminUserId = req.user.userId;
    return this.paymentsService.verifyPayment(adminUserId, +paymentId, dto);
  }

  // ============================================================================
  // 6. ADMIN & MARKETING REJECTION
  // ============================================================================

  @Post(':paymentId/reject')
  @Roles('SUPER_ADMIN', 'ADMIN', 'MARKETING')
  @ApiOperation({
    summary:
      'Admin / Marketing tolak bukti pembayaran (Tandai REJECTED & kirim alasan ke customer)',
  })
  @ApiParam({ name: 'paymentId', example: 1 })
  @ApiResponse({ status: 200, description: 'Pembayaran ditolak' })
  async rejectPayment(
    @Req() req: any,
    @Param('paymentId') paymentId: string,
    @Body() dto: RejectPaymentDto,
  ) {
    const adminUserId = req.user.userId;
    return this.paymentsService.rejectPayment(adminUserId, +paymentId, dto);
  }

  // ============================================================================
  // 7. PAYMENT HISTORY & LISTING
  // ============================================================================

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'MARKETING', 'CUSTOMER_SERVICE')
  @ApiOperation({ summary: 'Daftar riwayat semua pembayaran (Admin / Marketing View)' })
  @ApiQuery({ name: 'status', enum: PaymentStatus, required: false })
  @ApiQuery({ name: 'paymentMethod', required: false, description: 'CASH atau TRANSFER' })
  async getAllPayments(
    @Query('status') status?: PaymentStatus,
    @Query('paymentMethod') paymentMethod?: string,
  ) {
    return this.paymentsService.findAll({ status, paymentMethod });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detail data pembayaran berdasarkan ID' })
  @ApiParam({ name: 'id', example: 1 })
  async getPaymentById(@Param('id') id: string) {
    return this.paymentsService.findById(+id);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: 'Riwayat pembayaran untuk pesanan tertentu' })
  @ApiParam({ name: 'orderId', example: 1 })
  async getByOrderId(@Param('orderId') orderId: string) {
    return this.paymentsService.findByOrderId(+orderId);
  }
}
