import { Controller, Post, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderChangesService } from './order-changes.service';
import { ChangeRequestStatus } from '../../database/entities/entities';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Order Modifications & Changes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('order-changes')
export class OrderChangesController {
  constructor(private readonly changesService: OrderChangesService) {}

  @Post()
  @Roles('MITRA_SERVICE')
  @ApiOperation({
    summary: 'Teknisi mengajukan perubahan/penambahan pekerjaan & material di lapangan',
  })
  async createRequest(@Req() req: any, @Body() dto: { orderId: number; reason: string }) {
    return this.changesService.createRequest(req.user.userId, dto);
  }

  @Patch(':id/respond')
  @Roles('CUSTOMER', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Customer atau Admin menyetujui/menolak pengajuan perubahan teknisi' })
  async respond(@Param('id') id: string, @Body('status') status: ChangeRequestStatus) {
    return this.changesService.respondRequest(+id, status);
  }
}
