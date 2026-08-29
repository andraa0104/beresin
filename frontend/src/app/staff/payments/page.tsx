'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Search,
  Building,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { apiClient } from '@/lib/api/client';
import { PaymentStatus, PaymentModel } from '@/types/api.generated';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function StaffPaymentsPage() {
  const router = useRouter();
  const { isAuthenticated, isStaff, isLoading: authLoading } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isStaff)) {
      router.push('/auth/login?redirect=/staff/payments');
    }
  }, [authLoading, isAuthenticated, isStaff, router]);

  const { data: payments, isLoading, refetch } = useQuery<PaymentModel[]>({
    queryKey: ['staff-payments', filterStatus],
    queryFn: () => {
      const query = filterStatus ? `?status=${filterStatus}` : '';
      return apiClient<PaymentModel[]>(`payments${query}`);
    },
    enabled: isAuthenticated && isStaff,
    refetchInterval: 10000,
  });

  const handleVerify = async (paymentId: number) => {
    if (!confirm('Apakah pembayaran ini sudah valid masuk ke rekening Beresin?')) return;

    try {
      setActionLoadingId(paymentId);
      await apiClient(`payments/${paymentId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ notes: 'Diverifikasi valid oleh staf operasional' }),
      });
      alert('Pembayaran berhasil diverifikasi (Status: PAID)!');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Gagal memverifikasi pembayaran');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (paymentId: number) => {
    const reason = prompt('Masukkan alasan penolakan bukti pembayaran:');
    if (!reason) return;

    try {
      setActionLoadingId(paymentId);
      await apiClient(`payments/${paymentId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      alert('Pembayaran ditolak!');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Gagal menolak pembayaran');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl">
        <Skeleton className="h-8 w-64 rounded-xl" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl pb-16">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight">
          Verifikasi Pembayaran
        </h1>
        <p className="text-xs text-[var(--fg-muted)]">
          Pemeriksaan bukti transfer bank dan konfirmasi serah terima uang tunai mitra
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: '', label: 'Semua Pembayaran' },
          { key: PaymentStatus.WAITING_PAYMENT_VERIFICATION, label: 'Perlu Verifikasi Bukti' },
          { key: PaymentStatus.WAITING_ADMIN_CONFIRMATION, label: 'Serah Terima Kasir/Tunai' },
          { key: PaymentStatus.PAID, label: 'Sudah Lunas' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilterStatus(key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filterStatus === key
                ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--fg-secondary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {payments && payments.length > 0 ? (
        <div className="flex flex-col gap-3">
          {payments.map((p) => {
            const isNeedAction =
              p.status === PaymentStatus.WAITING_PAYMENT_VERIFICATION ||
              p.status === PaymentStatus.WAITING_ADMIN_CONFIRMATION;

            return (
              <GlassCard key={p.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[var(--fg-primary)]">
                        Tagihan #{p.id} (Metode: {p.paymentMethod})
                      </span>
                      <StatusBadge status={p.status} size="sm" />
                    </div>

                    <p className="text-xs text-[var(--fg-muted)] mt-1">
                      {p.bankName ? `Bank Pengirim: ${p.bankName} • Rek: ${p.accountNumber} a.n. ${p.accountHolder}` : 'Pembayaran Tunai Lapangan'}
                    </p>

                    {p.proofUrl && (
                      <a
                        href={p.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[var(--brand-primary)] font-bold hover:underline mt-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Lihat Bukti Transfer</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
                  <span className="text-base font-black text-[var(--brand-primary)]">
                    Rp {Number(p.amount).toLocaleString('id-ID')}
                  </span>

                  {isNeedAction && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        isLoading={actionLoadingId === p.id}
                        onClick={() => handleVerify(p.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 font-bold"
                        leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      >
                        Valid (Lunas)
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={actionLoadingId === p.id}
                        onClick={() => handleReject(p.id)}
                        className="text-[var(--status-destructive)]"
                        leftIcon={<XCircle className="w-3.5 h-3.5" />}
                      >
                        Tolak
                      </Button>
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={CreditCard}
          title="Tidak Ada Data Pembayaran"
          description="Belum ada transaksi pembayaran pada status ini."
        />
      )}
    </div>
  );
}
