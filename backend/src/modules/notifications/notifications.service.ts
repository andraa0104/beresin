import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  User,
  Order,
  NotificationChannel,
  NotificationStatus,
} from '../../database/entities/entities';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  async sendNotification(dto: {
    userId: number;
    orderId?: number;
    channel?: NotificationChannel;
    message: string;
  }) {
    const notif = this.notifRepo.create({
      user: { id: dto.userId } as User,
      order: dto.orderId ? ({ id: dto.orderId } as Order) : null,
      channel: dto.channel || NotificationChannel.WHATSAPP,
      message: dto.message,
      status: NotificationStatus.SENT,
      sentAt: new Date(),
    });

    this.logger.log(
      `[Notification Dispatched via ${notif.channel}] User: ${dto.userId} - Msg: ${dto.message}`,
    );
    return this.notifRepo.save(notif);
  }

  async getUserNotifications(userId: number) {
    return this.notifRepo.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }
}
