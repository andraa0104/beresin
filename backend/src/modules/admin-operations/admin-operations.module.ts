import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Order,
  TechnicianAssignment,
  MitraProfile,
  CustomerProfile,
  Location,
  Notification,
} from '../../database/entities/entities';
import { AnalyticsModule } from '../analytics/analytics.module';
import { AdminOperationsService } from './admin-operations.service';
import { AdminOperationsController } from './admin-operations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      TechnicianAssignment,
      MitraProfile,
      CustomerProfile,
      Location,
      Notification,
    ]),
    AnalyticsModule,
  ],
  controllers: [AdminOperationsController],
  providers: [AdminOperationsService],
  exports: [AdminOperationsService],
})
export class AdminOperationsModule {}
