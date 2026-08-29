'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  History,
  CheckCircle2,
  Calendar,
  DollarSign,
  MapPin,
  ArrowLeft,
  Wrench,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { apiClient } from '@/lib/api/client';
import { OrderStatus, AssignmentStatus } from '@/types/api.generated';
import { StatusBadge } from '@/components/ui/status-badge';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function MitraHistoryPage() {
  const router = useRouter();
  const { isAuthenticated, isMitra, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isMitra)) {
      router.push('/auth/login?redirect=/mitra/history');
    }
  }, [authLoading, isAuthenticated, isMitra, router]);

  // Fetch all jobs for Mitra
  const { data: jobs, isLoading } = useQuery<any[]>({
    queryKey: ['mitra-jobs-history'],
    queryFn: () => apiClient<any[]>('mitra/jobs'),
    enabled: isAuthenticated && isMitra,
  });

  if (authLoading || isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-36 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  // Filter completed or history jobs
  const historyJobs = (jobs || []).filter(
    (job) =>
      job.status === AssignmentStatus.COMPLETED ||
      job.order?.status === OrderStatus.COMPLETED ||
      job.order?.status === OrderStatus.PAID
  );

  const totalEarnings = historyJobs.reduce(
    (acc, job) => acc + (Number(job.order?.totalAmount) || 0),
    0
  );

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-16">
      <div className="flex items-center gap-3">
        <Link
          href="/mitra"
          className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] p-1 rounded-full"
          aria-label="Kembali ke Tugas Aktif"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-wider block">
            Portal Teknisi
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight">
            Riwayat Pekerjaan Selesai
          </h1>
        </div>
      </div>

      {/* Earnings Summary Card */}
      <div className="grid grid-cols-2 gap-4">
        <div className="liquid-card p-5">
          <span className="text-xs text-[var(--fg-muted)] font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Pekerjaan Tuntas</span>
          </span>
          <p className="text-2xl sm:text-3xl font-black text-[var(--fg-primary)] mt-2">
            {historyJobs.length} Order
          </p>
        </div>

        <div className="liquid-card p-5">
          <span className="text-xs text-[var(--fg-muted)] font-semibold flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-sky-500" />
            <span>Total Nilai Pengerjaan</span>
          </span>
          <p className="text-lg sm:text-2xl font-black text-[var(--brand-primary)] mt-2 truncate">
            Rp {totalEarnings.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* History Jobs List */}
      {historyJobs.length > 0 ? (
        <div className="flex flex-col gap-3.5">
          {historyJobs.map((job) => {
            const order = job.order;
            return (
              <GlassCard key={job.id} className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[var(--fg-primary)]">
                        {order?.orderNumber || `Job #${job.id}`}
                      </span>
                      <StatusBadge status={order?.status || job.status} size="sm" />
                    </div>
                    <h3 className="text-sm font-bold text-[var(--fg-primary)] mt-1">
                      {order?.service?.name || 'Layanan'}
                    </h3>
                  </div>

                  <span className="text-sm font-black text-[var(--brand-primary)]">
                    Rp {Number(order?.totalAmount || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="text-xs text-[var(--fg-muted)] flex flex-col gap-1 pt-2 border-t border-[var(--border-subtle)]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="line-clamp-1">{order?.location?.address || 'Alamat lokasi customer'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>
                      Selesai: {job.completedAt ? new Date(job.completedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Selesai diverifikasi'}
                    </span>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={History}
          title="Belum Ada Riwayat Pekerjaan"
          description="Pekerjaan yang telah Anda selesaikan dan diverifikasi akan muncul di riwayat ini."
          actionLabel="Lihat Tugas Aktif"
          onAction={() => router.push('/mitra')}
        />
      )}
    </div>
  );
}
