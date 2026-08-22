import { Controller, Get, Post, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AssignmentsService } from './assignments.service';
import { AssignmentStatus } from '../../database/entities/entities';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Technician Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Post()
  @Roles('SUPER_ADMIN', 'ADMIN', 'CUSTOMER_SERVICE')
  @ApiOperation({ summary: 'Tugaskan teknisi/mitra ke suatu order (Admin/CS)' })
  async assign(@Req() req: any, @Body() body: { orderId: number; mitraId: number }) {
    return this.assignmentsService.assignTechnician(body.orderId, body.mitraId, req.user.userId);
  }

  @Get('my-jobs')
  @Roles('MITRA_SERVICE')
  @ApiOperation({ summary: 'Daftar penugasan pekerjaan untuk mitra/teknisi yang sedang login' })
  async getMyJobs(@Req() req: any) {
    return this.assignmentsService.findMitraJobs(req.user.userId);
  }

  @Patch(':id/status')
  @Roles('MITRA_SERVICE', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({
    summary: 'Update respon teknisi (ACCEPTED / REJECTED / COMPLETED / CANCELLED)',
  })
  async updateStatus(@Param('id') id: string, @Body('status') status: AssignmentStatus) {
    return this.assignmentsService.updateAssignmentStatus(+id, status);
  }
}
