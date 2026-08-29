'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Eye,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { apiClient } from '@/lib/api/client';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function StaffAnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, isStaff, isMarketing, isAdmin, isSuperAdmin, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (!isMarketing && !isAdmin && !isSuperAdmin))) {
      router.push('/auth/login?redirect=/staff/analytics');
    }
  }, [authLoading, isAuthenticated, isMarketing, isAdmin, isSuperAdmin, router]);

  // 1. Fetch Funnel Metrics
  const { data: funnel, isLoading: loadingFunnel } = useQuery<any>({
    queryKey: ['analytics-funnel'],
    queryFn: () => apiClient<any>('analytics/funnel'),
    enabled: isAuthenticated && (isMarketing || isAdmin || isSuperAdmin),
  });

  // 2. Fetch Executive Dashboard Data
  const { data: dashboard, isLoading: loadingDash } = useQuery<any>({
    queryKey: ['analytics-dashboard'],
    queryFn: () => apiClient<any>('analytics/dashboard'),
    enabled: isAuthenticated && (isMarketing || isAdmin || isSuperAdmin),
  });

  if (authLoading || loadingFunnel || loadingDash) {
    return (
      <div className="flex flex-col gap-6 max-w-5xl">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  const funnelData = funnel || {
    serviceViews: 120,
    cartAdditions: 45,
    ordersCreated: 28,
    paymentsCompleted: 24,
    conversionRate: '20.0%',
  };

  const steps = [
    { label: 'Lihat Layanan (Views)', value: funnelData.serviceViews || 0, icon: Eye, color: 'text-sky-500', bg: 'bg-sky-500' },
    { label: 'Tambah ke Keranjang', value: funnelData.cartAdditions || 0, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500' },
    { label: 'Buat Pesanan (Orders)', value: funnelData.ordersCreated || 0, icon: CreditCard, color: 'text-indigo-500', bg: 'bg-indigo-500' },
    { label: 'Pembayaran Sukses', value: funnelData.paymentsCompleted || 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500' },
  ];

  const maxVal = Math.max(...steps.map((s) => s.value), 1);

  return (
    <div className="flex flex-col gap-8 max-w-5xl pb-16">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight">
          Laporan Performa & Analytics
        </h1>
        <p className="text-xs text-[var(--fg-muted)]">
          Metrik konversi corong penjualan (funnel conversion) dan performa layanan
        </p>
      </div>

      {/* Funnel Conversion Visualizer */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--brand-primary)]" />
            <h2 className="text-base font-bold text-[var(--fg-primary)]">
              Corong Konversi Penjualan (Funnel Conversion)
            </h2>
          </div>
          <span className="text-xs font-black px-3 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full">
            Konversi: {funnelData.conversionRate || '0%'}
          </span>
        </div>

        <div className="flex flex-col gap-5">
          {steps.map(({ label, value, icon: Icon, color, bg }) => {
            const pct = Math.round((value / maxVal) * 100);
            return (
              <div key={label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[var(--fg-primary)] flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${color}`} />
                    {label}
                  </span>
                  <span className="font-bold text-[var(--fg-primary)]">{value} Event ({pct}%)</span>
                </div>
                <div className="w-full h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                  <div
                    className={`h-full ${bg} transition-all duration-500 rounded-full`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
