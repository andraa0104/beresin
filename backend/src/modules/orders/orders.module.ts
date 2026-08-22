import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Order,
  OrderItem,
  CustomerProfile,
  Service,
  Location,
} from '../../database/entities/entities';
import { CartModule } from '../cart/cart.module';
import { AnalyticsModule } from '../analytics/analytics.module';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, CustomerProfile, Service, Location]),
    CartModule,
    AnalyticsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
