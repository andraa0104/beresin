import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const logger = new Logger('BeresinBootstrap');
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);

  // Serve static files (uploads)
  app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Interceptors & Filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  // Swagger Documentation Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Beresin Service Commerce API')
    .setDescription(
      'Dokumentasi REST API Backend Platform Beresin (Jasa, Produk, Aksesoris, Order, Teknisi, Promo, dan Analytics)',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Authentication', 'Registrasi & Login dengan JWT')
    .addTag('Users', 'Manajemen Pengguna & Profil')
    .addTag('Roles & Permissions', 'RBAC & Akses Role')
    .addTag('Customers', 'Profil & Klasifikasi Pelanggan')
    .addTag('Mitra Service', 'Profil & Penugasan Teknisi / Partner')
    .addTag('Service Catalog', 'Katalog Layanan & Paket Jasa Dinamis')
    .addTag('Product Catalog', 'Katalog Produk, Varian, SKU, & Spesifikasi JSON')
    .addTag('Service Configuration', 'Mapping Layanan ke Produk & Aksesoris')
    .addTag('Cart & Configuration', 'Kalkulasi Multi-Item Jasa + Produk + Aksesoris')
    .addTag('Orders', 'Core Order Engine & Snapshot Pricing')
    .addTag('Technician Assignments', 'Penugasan Mitra & Monitoring')
    .addTag('Order Modifications & Changes', 'Pengajuan Perubahan di Lapangan & Approval')
    .addTag('Payments', 'Pencatatan & Simulasi Transaksi Pembayaran')
    .addTag('Promotions & Discounts', 'Validasi Kupon Diskon & Target User')
    .addTag('Notifications', 'Integrasi WhatsApp & Multi-Channel Dispatcher')
    .addTag('Analytics', 'Analytics Abstraction Layer (ClickHouse / MySQL Fallback)')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  logger.log(`=======================================================`);
  logger.log(`🚀 Beresin Backend Application running on port : ${port}`);
  logger.log(`📚 Swagger API Documentation available at      : http://localhost:${port}/api/docs`);
  logger.log(`📡 Base API Endpoint URL                       : http://localhost:${port}/api/v1`);
  logger.log(`=======================================================`);
}
bootstrap();
