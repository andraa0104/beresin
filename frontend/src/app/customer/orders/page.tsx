'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Clock, ArrowRight, Wrench } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { apiClient } from '@/lib/api/client';
import { OrderModel } from '@/types/api.generated';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function CustomerOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/customer/orders');
    }
  }, [authLoading, isAuthenticated, router]);

  const { data: orders, isLoading, error, refetch } = useQuery<OrderModel[]>({
    queryKey: ['my-orders'],
    queryFn: () => apiClient<OrderModel[]>('orders/my-orders'),
    enabled: isAuthenticated,
  });

  if (authLoading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-4">
        <Skeleton className="h-8 w-48 rounded-xl" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight">
          Riwayat Pesanan Saya
        </h1>
        <p className="text-xs text-[var(--fg-muted)]">
          Pantau status pengerjaan, detail invoice, dan teknisi yang ditugaskan
        </p>
      </div>

      {orders && orders.length > 0 ? (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="liquid-card liquid-card-interactive p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[var(--brand-light)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[var(--fg-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                      {order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--fg-primary)] mt-1">
                    {order.service?.name || 'Layanan'}
                  </h3>
                  <p className="text-xs text-[var(--fg-muted)] mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-[var(--fg-muted)] block">Total Tagihan</span>
                  <span className="text-sm font-extrabold text-[var(--brand-primary)]">
                    Rp {Number(order.totalAmount).toLocaleString('id-ID')}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-[var(--fg-muted)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="Belum Ada Riwayat Pesanan"
          description="Anda belum memiliki pesanan aktif. Mulai pesan teknisi untuk perbaikan perangkat Anda."
          actionLabel="Pesan Layanan Sekarang"
          onAction={() => router.push('/services')}
        />
      )}
    </div>
  );
}
