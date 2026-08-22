import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { NotificationChannel } from '../../database/entities/entities';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}

  @Get('my')
  @ApiOperation({ summary: 'Daftar riwayat notifikasi akun yang sedang login' })
  async getMyNotifications(@Req() req: any) {
    return this.notifService.getUserNotifications(req.user.userId);
  }

  @Post('send')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Kirim notifikasi manual / broadcast (Admin)' })
  async send(
    @Body()
    dto: {
      userId: number;
      orderId?: number;
      channel?: NotificationChannel;
      message: string;
    },
  ) {
    return this.notifService.sendNotification(dto);
  }
}
