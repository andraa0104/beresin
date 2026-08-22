import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AnalyticsEvent,
  AnalyticsDailySummary,
  AnalyticsServiceReport,
  AnalyticsProductReport,
  Order,
} from '../../database/entities/entities';
import { MysqlAnalyticsProvider } from './providers/mysql.provider';
import { ClickHouseAnalyticsProvider } from './providers/clickhouse.provider';
import { AnalyticsFactory } from './analytics.factory';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsEvent,
      AnalyticsDailySummary,
      AnalyticsServiceReport,
      AnalyticsProductReport,
      Order,
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [
    MysqlAnalyticsProvider,
    ClickHouseAnalyticsProvider,
    AnalyticsFactory,
    AnalyticsService,
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
