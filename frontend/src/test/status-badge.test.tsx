import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { StatusBadge } from '@/components/ui/status-badge';
import { OrderStatus, PaymentStatus } from '@/types/api.generated';

describe('StatusBadge', () => {
  it('renders correct label for WAITING_CONFIRMATION', () => {
    render(<StatusBadge status={OrderStatus.WAITING_CONFIRMATION} />);
    expect(screen.getByText('Menunggu Konfirmasi')).toBeInTheDocument();
  });

  it('renders correct label for PAID', () => {
    render(<StatusBadge status={OrderStatus.PAID} />);
    expect(screen.getByText('Lunas')).toBeInTheDocument();
  });

  it('renders correct label for WAITING_PAYMENT_VERIFICATION', () => {
    render(<StatusBadge status={PaymentStatus.WAITING_PAYMENT_VERIFICATION} />);
    expect(screen.getByText('Verifikasi Pembayaran')).toBeInTheDocument();
  });
});
