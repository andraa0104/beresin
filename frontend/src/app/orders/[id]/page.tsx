'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Wrench,
  CreditCard,
  Building,
  Upload,
  ArrowLeft,
  Phone,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import {
  OrderModel,
  OrderStatus,
  PaymentStatus,
  PaymentModel,
} from '@/types/api.generated';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { GlassCard } from '@/components/ui/glass-card';
import { Modal } from '@/components/ui/modal';
import { TextField } from '@/components/ui/text-field';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/empty-state';

export default function OrderDetailPage() {
  const routeParams = useParams();
  const orderId = Number(routeParams?.id);

  const [paymentMethod, setPaymentMethod] = useState<'TRANSFER' | 'CASH'>('TRANSFER');
  const [selectedBank, setSelectedBank] = useState<'BCA' | 'MANDIRI' | 'BRI'>('BCA');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Transfer Proof Form State
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);
  const [copiedBank, setCopiedBank] = useState(false);

  // 1. Fetch Order Details
  const { data: order, isLoading, error, refetch } = useQuery<OrderModel>({
    queryKey: ['order-detail', orderId],
    queryFn: () => apiClient<OrderModel>(`orders/${orderId}`),
    refetchInterval: 10000, // Poll every 10s for status changes
  });

  // 2. Fetch Bank Accounts
  const { data: bankAccounts } = useQuery<any[]>({
    queryKey: ['bank-accounts'],
    queryFn: () => apiClient<any[]>('payments/bank-accounts'),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto py-12">
        <ErrorState
          title="Pesanan Tidak Ditemukan"
          message="Data pesanan tidak ditemukan atau Anda tidak memiliki akses ke pesanan ini."
          onRetry={refetch}
        />
      </div>
    );
  }

  const latestAssignment = order.assignments?.[0];
  const latestPayment = order.payments?.[order.payments.length - 1];

  const handleCopyAccount = (acc: string) => {
    navigator.clipboard.writeText(acc);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleCreatePaymentRecord = async () => {
    try {
      await apiClient<PaymentModel>('payments/records', {
        method: 'POST',
        body: JSON.stringify({
          orderId: order.id,
          paymentMethod,
          bankName: paymentMethod === 'TRANSFER' ? selectedBank : undefined,
        }),
      });
      setIsPaymentModalOpen(false);
      refetch();
      if (paymentMethod === 'TRANSFER') {
        setIsUploadModalOpen(true);
      }
    } catch (err: any) {
      alert(err.message || 'Gagal memilih metode pembayaran');
    }
  };

  const handleUploadProofSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!latestPayment) return;

    try {
      setIsSubmittingProof(true);
      setProofError(null);

      // Upload file to /upload/single if file present
      let proofUrl = 'https://beresin.id/uploads/proof_demo.jpg';
      if (proofFile) {
        const formData = new FormData();
        formData.append('file', proofFile);
        try {
          const uploadRes = await apiClient<{ url: string }>('upload/single?category=payments', {
            method: 'POST',
            body: formData,
          });
          if (uploadRes && uploadRes.url) {
            proofUrl = uploadRes.url;
          }
        } catch {
          // Fallback to sample URL
        }
      }

      // Call verify endpoint
      await apiClient(`payments/${latestPayment.id}/upload-proof`, {
        method: 'POST',
        body: JSON.stringify({
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountHolder: accountHolder.trim(),
          proofUrl,
        }),
      });

      setIsUploadModalOpen(false);
      refetch();
    } catch (err: any) {
      setProofError(err.message || 'Gagal mengunggah bukti pembayaran');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  // Timeline stage calculation
  const timelineStages = [
    { key: OrderStatus.WAITING_CONFIRMATION, label: 'Menunggu Konfirmasi' },
    { key: OrderStatus.ASSIGNED, label: 'Mitra Ditugaskan' },
    { key: OrderStatus.ACCEPTED, label: 'Diterima Teknisi' },
    { key: OrderStatus.ON_THE_WAY, label: 'Menuju Lokasi' },
    { key: OrderStatus.IN_PROGRESS, label: 'Pengerjaan' },
    { key: OrderStatus.COMPLETED, label: 'Selesai' },
    { key: OrderStatus.PAID, label: 'Lunas' },
  ];

  const currentStatusIndex = timelineStages.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/customer/orders"
            className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] p-1 rounded-full"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-[11px] font-bold text-[var(--fg-muted)] uppercase tracking-wider block">
              Nomor Pesanan
            </span>
            <h1 className="text-lg sm:text-xl font-black text-[var(--fg-primary)] tracking-tight">
              {order.orderNumber}
            </h1>
          </div>
        </div>

        <StatusBadge status={order.status} size="md" />
      </div>

      {/* ========================================================================= */}
      {/* 1. STATUS PROGRESSION TIMELINE */}
      {/* ========================================================================= */}
      <div className="liquid-card p-5 sm:p-6">
        <h2 className="text-xs font-bold text-[var(--fg-primary)] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-500" />
          <span>Status Pengerjaan Layanan</span>
        </h2>

        <div className="relative flex items-center justify-between overflow-x-auto pb-2 scrollbar-none">
          {timelineStages.map((stage, idx) => {
            const isPassed = currentStatusIndex >= idx;
            const isCurrent = currentStatusIndex === idx;

            return (
              <div key={stage.key} className="flex flex-col items-center text-center min-w-[80px] px-1 relative z-10">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCurrent
                      ? 'bg-[var(--brand-primary)] text-white ring-4 ring-[var(--focus-ring)] scale-110'
                      : isPassed
                      ? 'bg-emerald-500 text-white'
                      : 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--fg-muted)]'
                  }`}
                >
                  {isPassed && !isCurrent ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] mt-2 font-medium line-clamp-2 leading-tight ${
                    isCurrent
                      ? 'font-bold text-[var(--brand-primary)]'
                      : isPassed
                      ? 'text-[var(--fg-primary)]'
                      : 'text-[var(--fg-muted)]'
                  }`}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ASSIGNED TECHNICIAN (IF ASSIGNED) */}
      {/* ========================================================================= */}
      {latestAssignment && latestAssignment.mitra && (
        <div className="liquid-card p-5 border-l-4 border-l-cyan-500 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                Mitra Teknisi Terverifikasi
              </span>
              <h3 className="text-sm font-bold text-[var(--fg-primary)] mt-0.5">
                {latestAssignment.mitra.companyName}
              </h3>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                ⭐ Rating: {Number(latestAssignment.mitra.rating || 5.0).toFixed(1)} / 5.0
              </p>
            </div>
          </div>

          <StatusBadge status={latestAssignment.status} size="sm" />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LOCATION & SERVICE INFO */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="liquid-card p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--fg-primary)] mb-2">
            <Wrench className="w-4 h-4 text-sky-500" />
            <span>Layanan Dipesan</span>
          </div>
          <p className="text-sm font-bold text-[var(--fg-primary)]">{order.service?.name}</p>
          <p className="text-xs text-[var(--fg-muted)] mt-1">
            Dibuat pada {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        <div className="liquid-card p-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--fg-primary)] mb-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Lokasi Pengerjaan</span>
          </div>
          <p className="text-xs font-semibold text-[var(--fg-primary)] line-clamp-2">
            {order.location?.address || 'Alamat pengerjaan customer'}
          </p>
          {order.location?.notes && (
            <p className="text-[11px] text-[var(--fg-muted)] mt-1">
              Catatan: {order.location.notes}
            </p>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ITEM INVOICE BREAKDOWN */}
      {/* ========================================================================= */}
      <div className="liquid-card p-5 sm:p-6 flex flex-col gap-3">
        <h2 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center justify-between">
          <span>Rincian Tagihan & Biaya</span>
          <span className="text-xs font-semibold text-[var(--fg-muted)]">
            Total {order.items?.length || 0} Item
          </span>
        </h2>

        {order.items?.map((item) => (
          <div key={item.id} className="flex justify-between text-xs py-1">
            <div>
              <span className="font-semibold text-[var(--fg-primary)] block">
                {item.nameSnapshot}
              </span>
              <span className="text-[11px] text-[var(--fg-muted)]">
                Rp {Number(item.priceSnapshot).toLocaleString('id-ID')} x {item.qty}
              </span>
            </div>
            <span className="font-bold text-[var(--fg-primary)]">
              Rp {Number(item.subtotal).toLocaleString('id-ID')}
            </span>
          </div>
        ))}

        <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-1.5 text-xs text-[var(--fg-muted)]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-semibold text-[var(--fg-primary)]">
              Rp {Number(order.subtotal).toLocaleString('id-ID')}
            </span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Diskon Voucher</span>
              <span>- Rp {Number(order.discountAmount).toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-black text-[var(--fg-primary)] pt-2 border-t border-[var(--border-subtle)]">
            <span>Total Pembayaran</span>
            <span className="text-[var(--brand-primary)]">
              Rp {Number(order.totalAmount).toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. PAYMENT STATUS & ACTIONS */}
      {/* ========================================================================= */}
      <div className="liquid-card p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--fg-primary)]">Status Pembayaran</h3>
            <p className="text-xs text-[var(--fg-muted)] mt-0.5">
              Metode: {latestPayment ? latestPayment.paymentMethod : 'Belum dipilih'}
            </p>
          </div>
          {latestPayment && <StatusBadge status={latestPayment.status} />}
        </div>

        {order.status === OrderStatus.PAID ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Pembayaran telah LUNAS dan diverifikasi oleh Beresin. Terima kasih!</span>
          </div>
        ) : latestPayment?.status === PaymentStatus.WAITING_PAYMENT_VERIFICATION ? (
          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-800 dark:text-blue-300 font-semibold flex items-center gap-2">
            <Clock className="w-5 h-5 shrink-0 animate-spin" />
            <span>Bukti transfer telah diterima dan sedang dalam antrean verifikasi tim Beresin.</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            {!latestPayment ? (
              <Button
                variant="primary"
                className="w-full font-bold"
                onClick={() => setIsPaymentModalOpen(true)}
                leftIcon={<CreditCard className="w-4 h-4" />}
              >
                Pilih Metode Pembayaran
              </Button>
            ) : latestPayment.paymentMethod === 'TRANSFER' ? (
              <Button
                variant="primary"
                className="w-full font-bold"
                onClick={() => setIsUploadModalOpen(true)}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Upload Bukti Transfer Bank
              </Button>
            ) : (
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 font-medium">
                Pembayaran Tunai (CASH): Silakan serahkan uang pas sebesar Rp {Number(order.totalAmount).toLocaleString('id-ID')} kepada teknisi di lokasi.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: SELECT PAYMENT METHOD */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Pilih Metode Pembayaran"
      >
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('TRANSFER')}
              className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                paymentMethod === 'TRANSFER'
                  ? 'bg-[var(--brand-light)] border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold ring-2 ring-[var(--focus-ring)]'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--fg-secondary)]'
              }`}
            >
              <Building className="w-6 h-6 mx-auto mb-2" />
              <span className="text-xs">Transfer Bank</span>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('CASH')}
              className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${
                paymentMethod === 'CASH'
                  ? 'bg-[var(--brand-light)] border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold ring-2 ring-[var(--focus-ring)]'
                  : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--fg-secondary)]'
              }`}
            >
              <CreditCard className="w-6 h-6 mx-auto mb-2" />
              <span className="text-xs">Bayar Tunai di Tempat</span>
            </button>
          </div>

          {paymentMethod === 'TRANSFER' && (
            <div className="flex flex-col gap-2.5 p-3.5 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)]">
              <span className="text-xs font-semibold text-[var(--fg-secondary)]">Pilih Rekening Tujuan:</span>
              <div className="grid grid-cols-3 gap-2">
                {['BCA', 'MANDIRI', 'BRI'].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBank(b as any)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      selectedBank === b
                        ? 'bg-[var(--brand-primary)] text-white border-[var(--brand-primary)]'
                        : 'bg-[var(--bg-surface)] text-[var(--fg-secondary)] border-[var(--border-subtle)]'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button variant="primary" className="w-full font-bold mt-2" onClick={handleCreatePaymentRecord}>
            Lanjutkan
          </Button>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: UPLOAD TRANSFER PROOF */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Bukti Transfer Bank"
        description="Transfer sesuai nominal tagihan lalu upload bukti transfer Anda."
      >
        <form onSubmit={handleUploadProofSubmit} className="flex flex-col gap-4">
          {/* Target Bank Info Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-sky-500/10 to-blue-600/10 border border-sky-500/30">
            <span className="text-[10px] font-bold uppercase text-sky-600 dark:text-sky-400">Rekening Resmi Beresin</span>
            <div className="flex items-center justify-between mt-1">
              <div>
                <p className="text-base font-black text-[var(--fg-primary)] tracking-wider">
                  8831-2948-1029
                </p>
                <p className="text-xs text-[var(--fg-muted)]">Bank BCA a.n. PT Beresin Solusi Indonesia</p>
              </div>
              <button
                type="button"
                onClick={() => handleCopyAccount('883129481029')}
                className="p-2 text-sky-600 hover:bg-sky-500/20 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
              >
                {copiedBank ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedBank ? 'Disalin' : 'Salin'}</span>
              </button>
            </div>
            <div className="mt-2 pt-2 border-t border-sky-500/20 text-xs font-bold text-[var(--fg-primary)] flex justify-between">
              <span>Nominal Transfer:</span>
              <span className="text-[var(--brand-primary)]">
                Rp {Number(order.totalAmount).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <TextField
            label="Bank Pengirim"
            placeholder="Contoh: BCA / Mandiri / BRI"
            required
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
          />

          <TextField
            label="Nomor Rekening Pengirim"
            placeholder="Contoh: 1234567890"
            required
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
          />

          <TextField
            label="Nama Pemilik Rekening"
            placeholder="Contoh: Budi Santoso"
            required
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--fg-secondary)]">Foto / Screenshot Bukti Transfer</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              className="text-xs text-[var(--fg-muted)] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[var(--brand-light)] file:text-[var(--brand-primary)] hover:file:bg-sky-500/25"
            />
          </div>

          {proofError && (
            <p className="text-xs text-[var(--status-destructive)] font-semibold flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              <span>{proofError}</span>
            </p>
          )}

          <Button type="submit" variant="primary" isLoading={isSubmittingProof} className="w-full font-bold mt-2">
            Kirim Bukti Pembayaran
          </Button>
        </form>
      </Modal>
    </div>
  );
}
