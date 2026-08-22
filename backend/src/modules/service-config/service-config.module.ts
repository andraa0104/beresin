import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ServiceProduct,
  ServiceAccessory,
  Service,
  Product,
} from '../../database/entities/entities';
import { ServiceConfigService } from './service-config.service';
import { ServiceConfigController } from './service-config.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceProduct, ServiceAccessory, Service, Product])],
  controllers: [ServiceConfigController],
  providers: [ServiceConfigService],
  exports: [ServiceConfigService],
})
export class ServiceConfigModule {}
