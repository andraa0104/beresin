export enum AnalyticsEventType {
  SERVICE_VIEW = 'SERVICE_VIEW',
  PRODUCT_VIEW = 'PRODUCT_VIEW',
  ADD_TO_CART = 'ADD_TO_CART',
  ORDER_CREATED = 'ORDER_CREATED',
  PAYMENT_SUCCESS = 'PAYMENT_SUCCESS',
  ORDER_COMPLETED = 'ORDER_COMPLETED',
}

export interface TrackEventDto {
  eventType: AnalyticsEventType | string;
  userId?: number;
  sessionId?: string;
  payload?: Record<string, any>;
}

export interface DateRangeQueryDto {
  startDate?: string;
  endDate?: string;
}

export interface FunnelMetrics {
  serviceViews: number;
  productViews: number;
  addToCart: number;
  ordersCreated: number;
  paymentsSuccessful: number;
  ordersCompleted: number;
  conversionRatePercent: number;
}

export interface IAnalyticsProvider {
  name: string;
  isAvailable(): Promise<boolean>;
  trackEvent(event: TrackEventDto): Promise<void>;
  getDashboardData(): Promise<any>;
  getFunnelMetrics(dateRange?: DateRangeQueryDto): Promise<FunnelMetrics>;
  getServiceReport(serviceId?: number, dateRange?: DateRangeQueryDto): Promise<any>;
  getProductReport(productId?: number, dateRange?: DateRangeQueryDto): Promise<any>;
}
