import { Injectable } from '@nestjs/common';
import { AnalyticsFactory } from './analytics.factory';
import {
  TrackEventDto,
  DateRangeQueryDto,
  FunnelMetrics,
  AnalyticsEventType,
} from './interfaces/analytics.interface';

@Injectable()
export class AnalyticsService {
  constructor(private readonly factory: AnalyticsFactory) {}

  async trackEvent(event: TrackEventDto): Promise<void> {
    const provider = this.factory.getProvider();
    return provider.trackEvent(event);
  }

  async getDashboardData(): Promise<any> {
    const provider = this.factory.getProvider();
    return provider.getDashboardData();
  }

  async getFunnelMetrics(dateRange?: DateRangeQueryDto): Promise<FunnelMetrics> {
    const provider = this.factory.getProvider();
    return provider.getFunnelMetrics(dateRange);
  }

  async getServiceReport(serviceId?: number, dateRange?: DateRangeQueryDto): Promise<any> {
    const provider = this.factory.getProvider();
    return provider.getServiceReport(serviceId, dateRange);
  }

  async getProductReport(productId?: number, dateRange?: DateRangeQueryDto): Promise<any> {
    const provider = this.factory.getProvider();
    return provider.getProductReport(productId, dateRange);
  }
}
