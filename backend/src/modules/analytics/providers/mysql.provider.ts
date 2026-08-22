import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  IAnalyticsProvider,
  TrackEventDto,
  DateRangeQueryDto,
  FunnelMetrics,
  AnalyticsEventType,
} from '../interfaces/analytics.interface';
import {
  AnalyticsEvent,
  AnalyticsDailySummary,
  AnalyticsServiceReport,
  AnalyticsProductReport,
  Order,
  OrderStatus,
} from '../../../database/entities/entities';

@Injectable()
export class MysqlAnalyticsProvider implements IAnalyticsProvider {
  name = 'MySQL Analytics Fallback';
  private readonly logger = new Logger(MysqlAnalyticsProvider.name);

  constructor(
    @InjectRepository(AnalyticsEvent)
    private readonly eventRepo: Repository<AnalyticsEvent>,
    @InjectRepository(AnalyticsDailySummary)
    private readonly dailySummaryRepo: Repository<AnalyticsDailySummary>,
    @InjectRepository(AnalyticsServiceReport)
    private readonly serviceReportRepo: Repository<AnalyticsServiceReport>,
    @InjectRepository(AnalyticsProductReport)
    private readonly productReportRepo: Repository<AnalyticsProductReport>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async isAvailable(): Promise<boolean> {
    try {
      await this.eventRepo.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async trackEvent(event: TrackEventDto): Promise<void> {
    try {
      const entity = this.eventRepo.create({
        eventType: event.eventType,
        userId: event.userId,
        sessionId: event.sessionId,
        payload: event.payload,
      });
      await this.eventRepo.save(entity);
      this.logger.debug(`[MySQL Analytics] Event tracked: ${event.eventType}`);
    } catch (err: any) {
      this.logger.error(`[MySQL Analytics] Failed to track event: ${err.message}`);
    }
  }

  async getFunnelMetrics(dateRange?: DateRangeQueryDto): Promise<FunnelMetrics> {
    const qb = this.eventRepo
      .createQueryBuilder('event')
      .select('event.event_type', 'eventType')
      .addSelect('COUNT(event.id)', 'count');

    if (dateRange?.startDate && dateRange?.endDate) {
      qb.andWhere('event.created_at BETWEEN :start AND :end', {
        start: dateRange.startDate,
        end: dateRange.endDate,
      });
    }

    const rows = await qb.groupBy('event.event_type').getRawMany();

    const map: Record<string, number> = {
      [AnalyticsEventType.SERVICE_VIEW]: 0,
      [AnalyticsEventType.PRODUCT_VIEW]: 0,
      [AnalyticsEventType.ADD_TO_CART]: 0,
      [AnalyticsEventType.ORDER_CREATED]: 0,
      [AnalyticsEventType.PAYMENT_SUCCESS]: 0,
      [AnalyticsEventType.ORDER_COMPLETED]: 0,
    };

    rows.forEach((r) => {
      map[r.eventType] = parseInt(r.count, 10);
    });

    const totalViews = map[AnalyticsEventType.SERVICE_VIEW] + map[AnalyticsEventType.PRODUCT_VIEW];
    const completed = map[AnalyticsEventType.ORDER_COMPLETED];
    const conversionRate = totalViews > 0 ? (completed / totalViews) * 100 : 0;

    return {
      serviceViews: map[AnalyticsEventType.SERVICE_VIEW],
      productViews: map[AnalyticsEventType.PRODUCT_VIEW],
      addToCart: map[AnalyticsEventType.ADD_TO_CART],
      ordersCreated: map[AnalyticsEventType.ORDER_CREATED],
      paymentsSuccessful: map[AnalyticsEventType.PAYMENT_SUCCESS],
      ordersCompleted: map[AnalyticsEventType.ORDER_COMPLETED],
      conversionRatePercent: parseFloat(conversionRate.toFixed(2)),
    };
  }

  async getDashboardData(): Promise<any> {
    const totalEvents = await this.eventRepo.count();
    const funnel = await this.getFunnelMetrics();

    const orderStats = await this.orderRepo
      .createQueryBuilder('order')
      .select('COUNT(order.id)', 'totalOrders')
      .addSelect('SUM(order.total_amount)', 'totalRevenue')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.COMPLETED, OrderStatus.PAID],
      })
      .getRawOne();

    const summaries = await this.dailySummaryRepo.find({
      order: { summaryDate: 'DESC' },
      take: 7,
    });

    return {
      provider: this.name,
      storageMode: 'MySQL Fallback Database',
      totalTrackedEvents: totalEvents,
      funnelSummary: funnel,
      commercialSummary: {
        completedOrders: parseInt(orderStats?.totalOrders || '0', 10),
        totalCompletedRevenue: parseFloat(orderStats?.totalRevenue || '0'),
      },
      recentDailySummaries: summaries,
    };
  }

  async getServiceReport(serviceId?: number, dateRange?: DateRangeQueryDto): Promise<any> {
    const qb = this.serviceReportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.service', 'service');

    if (serviceId) {
      qb.andWhere('report.service_id = :serviceId', { serviceId });
    }
    if (dateRange?.startDate && dateRange?.endDate) {
      qb.andWhere('report.report_date BETWEEN :start AND :end', {
        start: dateRange.startDate,
        end: dateRange.endDate,
      });
    }
    return qb.orderBy('report.report_date', 'DESC').getMany();
  }

  async getProductReport(productId?: number, dateRange?: DateRangeQueryDto): Promise<any> {
    const qb = this.productReportRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.product', 'product');

    if (productId) {
      qb.andWhere('report.product_id = :productId', { productId });
    }
    if (dateRange?.startDate && dateRange?.endDate) {
      qb.andWhere('report.report_date BETWEEN :start AND :end', {
        start: dateRange.startDate,
        end: dateRange.endDate,
      });
    }
    return qb.orderBy('report.report_date', 'DESC').getMany();
  }
}
