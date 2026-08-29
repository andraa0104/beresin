'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Wrench,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Camera,
  DollarSign,
  AlertCircle,
  Navigation,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { apiClient } from '@/lib/api/client';
import { AssignmentStatus, OrderStatus } from '@/types/api.generated';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { GlassCard } from '@/components/ui/glass-card';
import { Modal } from '@/components/ui/modal';
import { TextField } from '@/components/ui/text-field';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function MitraDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isMitra, isLoading: authLoading } = useAuth();

  const [activeJobModal, setActiveJobModal] = useState<any | null>(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [cashModalOpen, setCashModalOpen] = useState(false);
  const [photoStage, setPhotoStage] = useState<'BEFORE_WORK' | 'IN_PROGRESS' | 'AFTER_WORK'>('BEFORE_WORK');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoNotes, setPhotoNotes] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isMitra)) {
      router.push('/auth/login?redirect=/mitra');
    }
  }, [authLoading, isAuthenticated, isMitra, router]);

  // Fetch Assigned Jobs for Mitra
  const { data: jobs, isLoading, refetch } = useQuery<any[]>({
    queryKey: ['mitra-assigned-jobs'],
    queryFn: () => apiClient<any[]>('mitra/jobs'),
    enabled: isAuthenticated && isMitra,
    refetchInterval: 10000,
  });

  const handleAcceptJob = async (assignmentId: number) => {
    try {
      setActionLoading(true);
      await apiClient(`mitra/jobs/${assignmentId}/accept`, { method: 'POST' });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Gagal menerima tugas');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectJob = async (assignmentId: number) => {
    const reason = prompt('Alasan penolakan tugas:');
    if (!reason) return;

    try {
      setActionLoading(true);
      await apiClient(`mitra/jobs/${assignmentId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Gagal menolak tugas');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (assignmentId: number, status: OrderStatus) => {
    try {
      setActionLoading(true);
      await apiClient(`mitra/jobs/${assignmentId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJobModal || !photoUrl.trim()) return;

    try {
      setActionLoading(true);
      await apiClient(`mitra/jobs/${activeJobModal.id}/photos`, {
        method: 'POST',
        body: JSON.stringify({
          stage: photoStage,
          photoUrl: photoUrl.trim(),
          description: photoNotes.trim() || undefined,
        }),
      });
      setPhotoModalOpen(false);
      setPhotoUrl('');
      setPhotoNotes('');
      alert('Foto pengerjaan berhasil diunggah!');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah foto');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitCash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJobModal) return;

    try {
      setActionLoading(true);
      const paymentId = activeJobModal.order?.payments?.[0]?.id;
      if (!paymentId) {
        alert('Tidak ada tagihan pembayaran terdaftar');
        return;
      }

      await apiClient(`payments/${paymentId}/technician-submit-cash`, {
        method: 'POST',
        body: JSON.stringify({
          amountCollected: Number(cashAmount) || Number(activeJobModal.order?.totalAmount),
          notes: 'Diterima tunai oleh teknisi di lokasi',
        }),
      });
      setCashModalOpen(false);
      alert('Serah terima uang tunai berhasil diajukan ke admin!');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Gagal mengajukan serah terima tunai');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteOrder = async (assignmentId: number) => {
    if (!confirm('Apakah pekerjaan sudah selesai secara tuntas dan telah diverifikasi oleh customer?')) return;

    try {
      setActionLoading(true);
      await apiClient(`mitra/jobs/${assignmentId}/complete`, {
        method: 'POST',
        body: JSON.stringify({ notes: 'Pekerjaan selesai dilakukan dengan baik' }),
      });
      alert('Pesanan berhasil diselesaikan!');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Gagal menyelesaikan pesanan');
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <Skeleton className="h-8 w-48 rounded-xl" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-44 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-16">
      <div>
        <span className="text-[11px] font-bold text-[var(--brand-primary)] uppercase tracking-wider block">
          Area Lapangan
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight">
          Penugasan Pekerjaan Teknisi
        </h1>
        <p className="text-xs text-[var(--fg-muted)]">
          Kelola tugas aktif, navigasi ke lokasi customer, dan update progres pekerjaan
        </p>
      </div>

      {jobs && jobs.length > 0 ? (
        <div className="flex flex-col gap-4">
          {jobs.map((job) => {
            const order = job.order;
            const isPendingAssignment = job.status === AssignmentStatus.PENDING;

            return (
              <GlassCard key={job.id} className="p-5 flex flex-col gap-4">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-[var(--fg-primary)]">
                        {order?.orderNumber}
                      </span>
                      <StatusBadge status={order?.status} size="sm" />
                    </div>
                    <h3 className="text-base font-bold text-[var(--fg-primary)] mt-1">
                      {order?.service?.name}
                    </h3>
                  </div>

                  <span className="text-sm font-black text-[var(--brand-primary)]">
                    Rp {Number(order?.totalAmount || 0).toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Customer Location & Google Maps Navigation */}
                <div className="p-3.5 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2 text-xs text-[var(--fg-secondary)]">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[var(--fg-primary)] line-clamp-2">
                        {order?.location?.address || 'Lokasi customer'}
                      </p>
                      {order?.location?.notes && (
                        <p className="text-[11px] text-[var(--fg-muted)] mt-0.5">
                          Patokan: {order.location.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {job.googleMapsUrl && (
                    <a
                      href={job.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/15 text-[var(--brand-primary)] text-xs font-bold hover:bg-sky-500/25 shrink-0"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Buka Maps</span>
                    </a>
                  )}
                </div>

                {/* Action Buttons for Field Status */}
                <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-2">
                  {isPendingAssignment ? (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        isLoading={actionLoading}
                        onClick={() => handleAcceptJob(job.id)}
                        className="flex-1 font-bold"
                      >
                        Terima Tugas
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        isLoading={actionLoading}
                        onClick={() => handleRejectJob(job.id)}
                        className="text-[var(--status-destructive)]"
                      >
                        Tolak
                      </Button>
                    </>
                  ) : (
                    <>
                      {order?.status === OrderStatus.ACCEPTED && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleUpdateStatus(job.id, OrderStatus.ON_THE_WAY)}
                        >
                          Menuju Lokasi
                        </Button>
                      )}
                      {order?.status === OrderStatus.ON_THE_WAY && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleUpdateStatus(job.id, OrderStatus.ARRIVED)}
                        >
                          Tiba di Lokasi
                        </Button>
                      )}
                      {order?.status === OrderStatus.ARRIVED && (
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleUpdateStatus(job.id, OrderStatus.IN_PROGRESS)}
                        >
                          Mulai Pengerjaan
                        </Button>
                      )}
                      {order?.status === OrderStatus.IN_PROGRESS && (
                        <>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setActiveJobModal(job);
                              setPhotoModalOpen(true);
                            }}
                            leftIcon={<Camera className="w-3.5 h-3.5" />}
                          >
                            Foto Bukti
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setActiveJobModal(job);
                              setCashAmount(String(order.totalAmount));
                              setCashModalOpen(true);
                            }}
                            leftIcon={<DollarSign className="w-3.5 h-3.5" />}
                          >
                            Terima Tunai
                          </Button>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleCompleteOrder(job.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 font-bold text-white"
                          >
                            Selesaikan Tugas
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Wrench}
          title="Tidak Ada Tugas Aktif"
          description="Saat ini belum ada penugasan pekerjaan baru dari admin."
        />
      )}

      {/* Modal: Upload Documentation Photo */}
      <Modal
        isOpen={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        title="Upload Foto Dokumentasi Lapangan"
      >
        <form onSubmit={handleUploadPhoto} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--fg-secondary)]">Tahap Dokumentasi</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'BEFORE_WORK', label: 'Sebelum' },
                { key: 'IN_PROGRESS', label: 'Progres' },
                { key: 'AFTER_WORK', label: 'Selesai' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPhotoStage(key as any)}
                  className={`py-2 text-xs font-bold rounded-xl border ${
                    photoStage === key
                      ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]'
                      : 'bg-[var(--bg-elevated)] text-[var(--fg-secondary)] border-[var(--border-subtle)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <TextField
            label="URL Foto Dokumentasi"
            placeholder="https://example.com/photo.jpg"
            required
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />

          <TextField
            label="Keterangan Tambahan (Opsional)"
            placeholder="Kondisi filter AC kotor sebelum dicuci..."
            value={photoNotes}
            onChange={(e) => setPhotoNotes(e.target.value)}
          />

          <Button type="submit" variant="primary" isLoading={actionLoading} className="w-full font-bold mt-2">
            Simpan Dokumentasi
          </Button>
        </form>
      </Modal>

      {/* Modal: Submit Cash */}
      <Modal
        isOpen={cashModalOpen}
        onClose={() => setCashModalOpen(false)}
        title="Serah Terima Pembayaran Tunai (CASH)"
        description="Catat penerimaan uang tunai dari customer untuk diteruskan ke kasir/admin."
      >
        <form onSubmit={handleSubmitCash} className="flex flex-col gap-4">
          <TextField
            label="Nominal Uang Tunai Diterima (Rp)"
            required
            type="number"
            value={cashAmount}
            onChange={(e) => setCashAmount(e.target.value)}
          />

          <Button type="submit" variant="primary" isLoading={actionLoading} className="w-full font-bold mt-2">
            Konfirmasi Serah Terima Tunai
          </Button>
        </form>
      </Modal>
    </div>
  );
}
