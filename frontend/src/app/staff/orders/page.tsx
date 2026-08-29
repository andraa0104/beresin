'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Filter,
  UserPlus,
  Wrench,
  Clock,
  Eye,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { apiClient } from '@/lib/api/client';
import { OrderStatus, MitraProfileModel } from '@/types/api.generated';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { GlassCard } from '@/components/ui/glass-card';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

export default function StaffOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isStaff, isLoading: authLoading } = useAuth();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [assignModalOrder, setAssignModalOrder] = useState<any | null>(null);
  const [selectedMitraId, setSelectedMitraId] = useState<number | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isStaff)) {
      router.push('/auth/login?redirect=/staff/orders');
    }
  }, [authLoading, isAuthenticated, isStaff, router]);

  // 1. Fetch Orders List
  const { data: orders, isLoading, refetch } = useQuery<any[]>({
    queryKey: ['staff-orders', selectedStatus, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedStatus) params.append('status', selectedStatus);
      if (search) params.append('search', search);
      return apiClient<any[]>(`admin/operations/orders?${params.toString()}`);
    },
    enabled: isAuthenticated && isStaff,
    refetchInterval: 10000,
  });

  // 2. Fetch Available Mitra for Assignment
  const { data: mitras } = useQuery<MitraProfileModel[]>({
    queryKey: ['all-mitra-list'],
    queryFn: () => apiClient<MitraProfileModel[]>('mitra'),
    enabled: !!assignModalOrder,
  });

  const handleAssignMitraSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalOrder || !selectedMitraId) return;

    try {
      setIsAssigning(true);
      await apiClient('admin/operations/assign', {
        method: 'POST',
        body: JSON.stringify({
          orderId: assignModalOrder.id,
          mitraId: selectedMitraId,
        }),
      });
      setAssignModalOrder(null);
      setSelectedMitraId(null);
      alert('Mitra teknisi berhasil ditugaskan ke pesanan!');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Gagal menugaskan mitra');
    } finally {
      setIsAssigning(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-6xl">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight">
            Manajemen Seluruh Pesanan
          </h1>
          <p className="text-xs text-[var(--fg-muted)]">
            Monitoring status pengerjaan, penugasan teknisi, dan koordinasi lapangan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--fg-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari no order / customer..."
              className="w-full h-10 pl-9 pr-3 text-xs bg-[var(--bg-surface)] text-[var(--fg-primary)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: '', label: 'Semua Status' },
          { key: OrderStatus.WAITING_CONFIRMATION, label: 'Menunggu Konfirmasi' },
          { key: OrderStatus.ASSIGNED, label: 'Mitra Ditugaskan' },
          { key: OrderStatus.ACCEPTED, label: 'Diterima Teknisi' },
          { key: OrderStatus.IN_PROGRESS, label: 'Sedang Dikerjakan' },
          { key: OrderStatus.COMPLETED, label: 'Selesai' },
          { key: OrderStatus.PAID, label: 'Lunas' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedStatus(key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === key
                ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--fg-secondary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Orders List Table / Cards */}
      {orders && orders.length > 0 ? (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <GlassCard key={order.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[var(--brand-light)] text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[var(--fg-primary)]">
                      {order.orderNumber}
                    </span>
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[var(--fg-primary)] mt-1">
                    {order.service?.name}
                  </h3>
                  <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                    Customer: <b className="text-[var(--fg-primary)]">{order.customer?.user?.name || 'Customer'}</b> ({order.customer?.user?.phone})
                  </p>
                  {order.technician && (
                    <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium mt-0.5">
                      Teknisi: {order.technician.companyName}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--border-subtle)]">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-[var(--fg-muted)] block">Total</span>
                  <span className="text-sm font-black text-[var(--brand-primary)]">
                    Rp {Number(order.totalAmount).toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {order.status === OrderStatus.WAITING_CONFIRMATION && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setAssignModalOrder(order)}
                      leftIcon={<UserPlus className="w-3.5 h-3.5" />}
                    >
                      Tugaskan Mitra
                    </Button>
                  )}
                  <Link href={`/orders/${order.id}`}>
                    <Button size="sm" variant="secondary" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                      Detail
                    </Button>
                  </Link>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Clock}
          title="Tidak Ada Pesanan"
          description="Tidak ditemukan pesanan yang sesuai dengan filter atau kata kunci saat ini."
        />
      )}

      {/* Assign Mitra Modal */}
      <Modal
        isOpen={!!assignModalOrder}
        onClose={() => setAssignModalOrder(null)}
        title={`Tugaskan Mitra ke Order #${assignModalOrder?.orderNumber}`}
        description="Pilih mitra service yang kompeten dan beroperasi di area lokasi pengerjaan."
      >
        <form onSubmit={handleAssignMitraSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {mitras?.map((mitra) => {
              const isSelected = selectedMitraId === Number(mitra.id);
              return (
                <button
                  key={mitra.id}
                  type="button"
                  onClick={() => setSelectedMitraId(Number(mitra.id))}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--brand-light)] border-[var(--brand-primary)] text-[var(--brand-primary)] font-bold'
                      : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--fg-secondary)]'
                  }`}
                >
                  <div>
                    <p className="text-xs font-bold text-[var(--fg-primary)]">{mitra.companyName}</p>
                    <p className="text-[11px] text-[var(--fg-muted)] mt-0.5">{mitra.address || 'Area Aktif'} • ⭐ {Number(mitra.rating || 5).toFixed(1)}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-[var(--brand-primary)]" />}
                </button>
              );
            })}
          </div>

          <Button type="submit" variant="primary" isLoading={isAssigning} disabled={!selectedMitraId} className="w-full font-bold mt-2">
            Konfirmasi Penugasan Mitra
          </Button>
        </form>
      </Modal>
    </div>
  );
}
