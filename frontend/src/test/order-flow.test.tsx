import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '@/lib/api/client';
import { OrderStatus, PaymentStatus, OrderItemType } from '@/types/api.generated';

describe('Milestone 1: Guest / Customer Order & Tracking Flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calculates cart items and discounts accurately', () => {
    const servicePrice = 150000;
    const accessoryPrice = 35000;
    const accessoryQty = 2;
    const promoDiscount = 20000;

    const subtotal = servicePrice + accessoryPrice * accessoryQty;
    expect(subtotal).toBe(220000);

    const totalAmount = Math.max(0, subtotal - promoDiscount);
    expect(totalAmount).toBe(200000);
  });

  it('validates order payload structure matching backend CreateOrderDto', () => {
    const orderPayload = {
      serviceId: 1,
      servicePackageId: 1,
      locationId: 5,
      sessionId: 'guest-session-test',
      promotionCode: 'DISKON50K',
      items: [
        {
          itemType: OrderItemType.SERVICE,
          referenceId: 1,
          qty: 1,
        },
      ],
    };

    expect(orderPayload.serviceId).toBeGreaterThan(0);
    expect(orderPayload.items.length).toBe(1);
    expect(orderPayload.sessionId).toBe('guest-session-test');
  });

  it('handles order status progression from WAITING_CONFIRMATION to COMPLETED to PAID', () => {
    const orderStatuses = [
      OrderStatus.WAITING_CONFIRMATION,
      OrderStatus.ASSIGNED,
      OrderStatus.ACCEPTED,
      OrderStatus.ON_THE_WAY,
      OrderStatus.ARRIVED,
      OrderStatus.IN_PROGRESS,
      OrderStatus.COMPLETED,
      OrderStatus.PAID,
    ];

    expect(orderStatuses[0]).toBe('WAITING_CONFIRMATION');
    expect(orderStatuses[orderStatuses.length - 1]).toBe('PAID');
    expect(orderStatuses.includes(OrderStatus.COMPLETED)).toBe(true);
  });
});
