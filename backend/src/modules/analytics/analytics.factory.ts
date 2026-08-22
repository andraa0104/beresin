import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IAnalyticsProvider } from './interfaces/analytics.interface';
import { MysqlAnalyticsProvider } from './providers/mysql.provider';
import { ClickHouseAnalyticsProvider } from './providers/clickhouse.provider';

@Injectable()
export class AnalyticsFactory implements OnModuleInit {
  private readonly logger = new Logger(AnalyticsFactory.name);
  private activeProvider: IAnalyticsProvider;

  constructor(
    private readonly mysqlProvider: MysqlAnalyticsProvider,
    private readonly clickhouseProvider: ClickHouseAnalyticsProvider,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Analytics Engine & Checking Providers...');
    const clickhouseReady = await this.clickhouseProvider.isAvailable();

    if (clickhouseReady) {
      this.activeProvider = this.clickhouseProvider;
      this.logger.log('>> [Analytics Engine] Using Provider: ClickHouse High-Throughput Analytics');
    } else {
      this.activeProvider = this.mysqlProvider;
      this.logger.log('>> [Analytics Engine] Using Provider: MySQL Analytics Fallback (Active)');
    }
  }

  getProvider(): IAnalyticsProvider {
    return this.activeProvider || this.mysqlProvider;
  }
}
