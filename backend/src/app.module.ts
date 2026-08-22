import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { ALL_ENTITIES } from './database/entities/entities';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { CustomersModule } from './modules/customers/customers.module';
import { MitraModule } from './modules/mitra/mitra.module';
import { ServiceCatalogModule } from './modules/service-catalog/service-catalog.module';
import { ProductCatalogModule } from './modules/product-catalog/product-catalog.module';
import { ServiceConfigModule } from './modules/service-config/service-config.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { AssignmentsModule } from './modules/assignments/assignments.module';
import { OrderChangesModule } from './modules/order-changes/order-changes.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminOperationsModule } from './modules/admin-operations/admin-operations.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.user'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        entities: ALL_ENTITIES,
        synchronize: false, // Schema managed via beresin_schema.sql
        logging: configService.get<string>('nodeEnv') === 'development' ? ['error', 'warn'] : false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    RolesModule,
    CustomersModule,
    MitraModule,
    ServiceCatalogModule,
    ProductCatalogModule,
    ServiceConfigModule,
    CartModule,
    OrdersModule,
    AssignmentsModule,
    OrderChangesModule,
    PaymentsModule,
    PromotionsModule,
    NotificationsModule,
    AnalyticsModule,
    AdminOperationsModule,
    UploadModule,
  ],
})
export class AppModule {}
