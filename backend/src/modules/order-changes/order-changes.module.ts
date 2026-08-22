import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderChangeRequest, Order, MitraProfile } from '../../database/entities/entities';
import { OrderChangesService } from './order-changes.service';
import { OrderChangesController } from './order-changes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([OrderChangeRequest, Order, MitraProfile])],
  controllers: [OrderChangesController],
  providers: [OrderChangesService],
  exports: [OrderChangesService],
})
export class OrderChangesModule {}
