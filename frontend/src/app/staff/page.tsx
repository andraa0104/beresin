'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Wrench,
  Users,
  CreditCard,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { apiClient } from '@/lib/api/client';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';

export default function StaffOverviewPage() {
  const router = useRouter();
  const { isAuthenticated, isStaff, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isStaff)) {
      router.push('/auth/login?redirect=/staff');
    }
  }, [authLoading, isAuthenticated, isStaff, router]);

  // Fetch Dashboard Metrics
  const { data: dashboard, isLoading } = useQuery<any>({
    queryKey: ['admin-operations-dashboard'],
    queryFn: () => apiClient<any>('admin/operations/dashboard'),
    enabled: isAuthenticated && isStaff,
    refetchInterval: 15000,
  });

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = dashboard?.metrics || {};
  const urgentOrders = dashboard?.urgentOrders || [];

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div>
        <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider block">
          Pusat Kendali Operasional
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--fg-primary)] tracking-tight mt-0.5">
          Dashboard Operasional Staf
        </h1>
        <p className="text-xs text-[var(--fg-muted)]">
          Agregasi pesanan real-time, status mitra teknisi, dan antrean mendesak
        </p>
      </div>

      {/* 4 Core Operational Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mb-2">
            <span>Perlu Ditugaskan</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {metrics.waitingConfirmation || 0}
          </span>
          <span className="text-[11px] text-[var(--fg-muted)] mt-2">Menunggu penugasan mitra</span>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mb-2">
            <span>Sedang Berjalan</span>
            <Wrench className="w-4 h-4 text-sky-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
            {(metrics.assigned || 0) + (metrics.inProgress || 0)}
          </span>
          <span className="text-[11px] text-[var(--fg-muted)] mt-2">Pengerjaan di lapangan</span>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mb-2">
            <span>Selesai Hari Ini</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.completed || 0}
          </span>
          <span className="text-[11px] text-[var(--fg-muted)] mt-2">Layanan tuntas</span>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mb-2">
            <span>Total Pendapatan</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 truncate">
            Rp {Number(metrics.totalRevenue || 0).toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] text-[var(--fg-muted)] mt-2">Akumulasi penjualan</span>
        </GlassCard>
      </div>

      {/* Quick Operational Actions Section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-[var(--fg-primary)] flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-indigo-500" />
          <span>Aksi Cepat & Navigasi Modul</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/staff/orders"
            className="liquid-card liquid-card-interactive p-4 flex flex-col items-center justify-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--fg-primary)]">Tugaskan Order</span>
          </Link>

          <Link
            href="/staff/payments"
            className="liquid-card liquid-card-interactive p-4 flex flex-col items-center justify-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--fg-primary)]">Verifikasi Bayar</span>
          </Link>

          <Link
            href="/staff/promotions"
            className="liquid-card liquid-card-interactive p-4 flex flex-col items-center justify-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--fg-primary)]">Kupon & Banner</span>
          </Link>

          <Link
            href="/staff/mitra"
            className="liquid-card liquid-card-interactive p-4 flex flex-col items-center justify-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--fg-primary)]">Data Mitra</span>
          </Link>

          <Link
            href="/staff/analytics"
            className="liquid-card liquid-card-interactive p-4 flex flex-col items-center justify-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--fg-primary)]">Analytics Funnel</span>
          </Link>

          <Link
            href="/staff/users"
            className="liquid-card liquid-card-interactive p-4 flex flex-col items-center justify-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--fg-primary)]">User & Roles</span>
          </Link>
        </div>
      </div>

      {/* Urgent Orders Queue */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-bold text-[var(--fg-primary)]">
              Antrean Pesanan Masuk (Perlu Tindakan)
            </h2>
          </div>
          <Link href="/staff/orders" className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1">
            Lihat Semua Pesanan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {urgentOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {urgentOrders.map((order: any) => (
              <GlassCard key={order.id} className="p-5 flex flex-col justify-between gap-3 border-amber-500/20">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-[var(--fg-primary)]">
                      {order.orderNumber}
                    </span>
                    <h3 className="text-sm font-bold text-[var(--fg-primary)] mt-1">
                      {order.service?.name}
                    </h3>
                  </div>
                  <StatusBadge status={order.status} size="sm" />
                </div>

                <div className="text-xs text-[var(--fg-muted)] flex flex-col gap-0.5">
                  <p>Pemesan: <b className="text-[var(--fg-primary)]">{order.customer?.user?.name || 'Customer'}</b> ({order.customer?.user?.phone})</p>
                  <p className="line-clamp-1">Alamat: {order.location?.address || '-'}</p>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between mt-auto">
                  <span className="text-sm font-black text-[var(--brand-primary)]">
                    Rp {Number(order.totalAmount).toLocaleString('id-ID')}
                  </span>
                  <Link href={`/orders/${order.id}`} className="text-xs font-bold text-[var(--brand-primary)] hover:underline">
                    Kelola Order →
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] text-xs text-[var(--fg-muted)]">
            Tidak ada antrean pesanan mendesak saat ini. Semua pesanan telah ditangani.
          </div>
        )}
      </div>
    </div>
  );
}
