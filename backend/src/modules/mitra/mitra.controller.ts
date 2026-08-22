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
import { MitraService } from './mitra.service';
import {
  RejectJobDto,
  UpdateJobStatusDto,
  UploadWorkPhotoDto,
  AddAdditionalItemRequestDto,
  CompleteJobDto,
} from './dto/mitra-jobs.dto';
import { MitraStatus, AssignmentStatus } from '../../database/entities/enums';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Mitra Service & Technician')
@Controller('mitra')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MitraController {
  constructor(private readonly mitraService: MitraService) {}

  // ============================================================================
  // 1. MITRA PROFILE & LOCATION
  // ============================================================================

  @Get('profile/me')
  @Roles('MITRA_SERVICE', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Dapatkan profil mitra/teknisi yang sedang login' })
  @ApiResponse({ status: 200, description: 'Profil mitra berhasil diambil' })
  async getMyProfile(@Req() req: any) {
    const userId = req.user.userId;
    return this.mitraService.getMyProfile(userId);
  }

  @Patch('profile/location')
  @Roles('MITRA_SERVICE', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update posisi GPS live teknisi (Latitude & Longitude)' })
  async updateLocation(
    @Req() req: any,
    @Body() dto: { latitude: number; longitude: number },
  ) {
    const userId = req.user.userId;
    return this.mitraService.updateLocation(userId, dto.latitude, dto.longitude);
  }

  // ============================================================================
  // 2. VIEW ASSIGNED JOBS
  // ============================================================================

  @Get('jobs')
  @Roles('MITRA_SERVICE', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({
    summary:
      'Daftar semua penugasan pekerjaan teknisi (beserta lokasi customer, Google Maps link, dan rincian item)',
  })
  @ApiQuery({ name: 'status', enum: AssignmentStatus, required: false })
  @ApiResponse({ status: 200, description: 'Daftar penugasan berhasil diambil' })
  async getAssignedJobs(
    @Req() req: any,
    @Query('status') status?: AssignmentStatus,
  ) {
    const userId = req.user.userId;
    return this.mitraService.findAssignedJobs(userId, status);
  }

  // ============================================================================
  // 3. ACCEPT JOB
  // ============================================================================

  @Post('jobs/:assignmentId/accept')
  @Roles('MITRA_SERVICE', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({
    summary:
      'Terima penugasan pekerjaan (Otomatis ubah status order ke ACCEPTED & kirim notifikasi ke customer)',
  })
  @ApiParam({ name: 'assignmentId', example: 1 })
  @ApiResponse({ status: 200, description: 'Penugasan berhasil diterima' })
  async acceptJob(
    @Req() req: any,
    @Param('assignmentId') assignmentId: string,
  ) {
    const userId = req.user.userId;
    return this.mitraService.acceptJob(userId, +assignmentId);
  }

  // ============================================================================
  // 4. REJECT JOB
  // ============================================================================

  @Post('jobs/:assignmentId/reject')
  @Roles('MITRA_SERVICE', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({
    summary:
      'Tolak penugasan pekerjaan (Otomatis kembalikan order ke status WAITING_CONFIRMATION)',
  })
  @ApiParam({ name: 'assignmentId', example: 1 })
  @ApiResponse({ status: 200, description: 'Penugasan berhasil ditolak' })
  async rejectJob(
    @Req() req: any,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: RejectJobDto,
  ) {
    const userId = req.user.userId;
    return this.mitraService.rejectJob(userId, +assignmentId, dto);
  }

  // ============================================================================
  // 5. UPDATE JOB STATUS
  // ============================================================================

  @Patch('jobs/:assignmentId/status')
  @Roles('MITRA_SERVICE', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({
    summary:
      'Update progres tahapan pekerjaan teknisi (ON_THE_WAY, ARRIVED, IN_PROGRESS, WAITING_APPROVAL, COMPLETED)',
  })
  @ApiParam({ name: 'assignmentId', example: 1 })
  @ApiResponse({ status: 200, description: 'Status pekerjaan berhasil diperbarui' })
  async updateJobStatus(
    @Req() req: any,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UpdateJobStatusDto,
  ) {
    const userId = req.user.userId;
    return this.mitraService.updateJobStatus(userId, +assignmentId, dto);
  }

  // ============================================================================
  // 6. UPLOAD WORK DOCUMENTATION / PHOTOS
  // ============================================================================

  @Post('jobs/:assignmentId/photos')
  @Roles('MITRA_SERVICE', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({
    summary:
      'Upload dokumentasi foto pekerjaan (BEFORE_WORK, IN_PROGRESS, AFTER_WORK, PROOF_COMPLETION)',
  })
  @ApiParam({ name: 'assignmentId', example: 1 })
  @ApiResponse({ status: 201, description: 'Foto pekerjaan berhasil disimpan' })
  async uploadWorkPhotos(
    @Req() req: any,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: UploadWorkPhotoDto,
  ) {
    const userId = req.user.userId;
    return this.mitraService.uploadWorkPhotos(userId, +assignmentId, dto);
  }

  // ============================================================================
  // 7. ADD ADDITIONAL ITEM & REQUEST CUSTOMER APPROVAL
  // ============================================================================

  @Post('jobs/:assignmentId/additional-items')
  @Roles('MITRA_SERVICE', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({
    summary:
      'Ajukan penambahan item / jasa suku cadang baru & minta persetujuan customer (Request Customer Approval)',
  })
  @ApiParam({ name: 'assignmentId', example: 1 })
  @ApiResponse({ status: 201, description: 'Penambahan item berhasil diajukan dan menunggu persetujuan customer' })
  async addAdditionalItemRequest(
    @Req() req: any,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: AddAdditionalItemRequestDto,
  ) {
    const userId = req.user.userId;
    return this.mitraService.addAdditionalItemRequest(userId, +assignmentId, dto);
  }

  // ============================================================================
  // 8. COMPLETE ORDER
  // ============================================================================

  @Post('jobs/:assignmentId/complete')
  @Roles('MITRA_SERVICE', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({
    summary:
      'Selesaikan pekerjaan / Complete Order (Otomatis update status COMPLETED, hitung metrik customer, dan kirim notifikasi WhatsApp)',
  })
  @ApiParam({ name: 'assignmentId', example: 1 })
  @ApiResponse({ status: 200, description: 'Pesanan berhasil diselesaikan' })
  async completeOrder(
    @Req() req: any,
    @Param('assignmentId') assignmentId: string,
    @Body() dto: CompleteJobDto,
  ) {
    const userId = req.user.userId;
    return this.mitraService.completeOrder(userId, +assignmentId, dto);
  }

  // ============================================================================
  // 9. ADMIN LIST ALL MITRA
  // ============================================================================

  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SERVICE')
  @ApiOperation({ summary: 'Daftar semua mitra teknisi (Admin)' })
  @ApiQuery({ name: 'status', enum: MitraStatus, required: false })
  async getAllMitra(@Query('status') status?: MitraStatus) {
    return this.mitraService.findAll(status);
  }

  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SERVICE')
  @ApiOperation({ summary: 'Detail mitra teknisi (Admin)' })
  @ApiParam({ name: 'id', example: 1 })
  async getMitraById(@Param('id') id: string) {
    return this.mitraService.findById(+id);
  }
}
