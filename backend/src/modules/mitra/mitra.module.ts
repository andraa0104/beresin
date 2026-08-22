import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  MitraProfile,
  TechnicianAssignment,
  Order,
  OrderItem,
  CustomerProfile,
  OrderChangeRequest,
  ProductVariant,
  ServicePackage,
  Notification,
} from '../../database/entities/entities';
import { AnalyticsModule } from '../analytics/analytics.module';
import { MitraService } from './mitra.service';
import { MitraController } from './mitra.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MitraProfile,
      TechnicianAssignment,
      Order,
      OrderItem,
      CustomerProfile,
      OrderChangeRequest,
      ProductVariant,
      ServicePackage,
      Notification,
    ]),
    AnalyticsModule,
  ],
  controllers: [MitraController],
  providers: [MitraService],
  exports: [MitraService],
})
export class MitraModule {}
