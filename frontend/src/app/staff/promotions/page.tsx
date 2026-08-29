'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Percent, Plus, Trash2, Clock, Tag } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { PromotionModel, DiscountType, TargetUser, PromotionStatus } from '@/types/api.generated';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { GlassCard } from '@/components/ui/glass-card';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';

export default function StaffPromotionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [promoName, setPromoName] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>(DiscountType.PERCENTAGE);
  const [discountValue, setDiscountValue] = useState('');
  const [targetUser, setTargetUser] = useState<TargetUser>(TargetUser.ALL_USER);
  const [bannerUrl, setBannerUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: promotions, isLoading, refetch } = useQuery<any[]>({
    queryKey: ['staff-promotions'],
    queryFn: () => apiClient<any[]>('promotions'),
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoName.trim() || !discountValue) return;

    try {
      setIsSubmitting(true);
      await apiClient('promotions', {
        method: 'POST',
        body: JSON.stringify({
          name: promoName.trim().toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          targetUser,
          bannerUrl: bannerUrl.trim() || undefined,
          image: bannerUrl.trim() || undefined,
          startDate: startDate || new Date().toISOString(),
          endDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
          status: PromotionStatus.ACTIVE,
        }),
      });
      setIsCreateModalOpen(false);
      setPromoName('');
      setDiscountValue('');
      setBannerUrl('');
      alert('Voucher promosi berhasil dibuat dan akan tayang di slider beranda!');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Gagal membuat voucher');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus voucher promosi ini?')) return;
    try {
      await apiClient(`promotions/${id}`, { method: 'DELETE' });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus voucher');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl">
        <Skeleton className="h-8 w-64 rounded-xl" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight">
            Manajemen Kupon & Promosi
          </h1>
          <p className="text-xs text-[var(--fg-muted)]">
            Buat voucher diskon bertarget untuk pengguna baru atau semua pelanggan
          </p>
        </div>

        <Button size="sm" variant="primary" onClick={() => setIsCreateModalOpen(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Buat Kupon Baru
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions?.map((p) => {
          const banner = p.bannerUrl || p.image;
          return (
            <GlassCard key={p.id} className="p-5 flex flex-col justify-between overflow-hidden relative">
              {banner && (
                <div className="w-full h-24 rounded-xl overflow-hidden mb-3 border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                  <img src={banner} alt={p.name} className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400">
                    {p.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(p.id)}
                    className="p-1 text-[var(--fg-muted)] hover:text-[var(--status-destructive)] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-sm font-bold text-[var(--fg-primary)] mt-2.5">
                  {p.discountType === 'PERCENTAGE' ? `Diskon ${Number(p.discountValue)}%` : `Potongan Rp ${Number(p.discountValue).toLocaleString('id-ID')}`}
                </p>
                <p className="text-xs text-[var(--fg-muted)] mt-1">
                  Target: {p.targetUser === 'NEW_USER' ? 'Pengguna Baru' : 'Semua Pelanggan'}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] mt-4 text-[11px] text-[var(--fg-muted)] flex items-center justify-between">
                <span>Hingga {new Date(p.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{p.status}</span>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Create Promotion Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat Voucher Promosi Baru"
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          <TextField
            label="Kode Kupon (Uppercase)"
            placeholder="Contoh: HEMAT50K"
            required
            value={promoName}
            onChange={(e) => setPromoName(e.target.value.toUpperCase())}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--fg-secondary)]">Tipe Diskon</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full h-11 px-3 text-xs bg-[var(--bg-surface)] text-[var(--fg-primary)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
              >
                <option value={DiscountType.PERCENTAGE}>Persentase (%)</option>
                <option value={DiscountType.FIXED}>Nominal Tetap (Rp)</option>
              </select>
            </div>

            <TextField
              label="Nilai Diskon"
              placeholder="Contoh: 10 atau 50000"
              type="number"
              required
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          </div>

          <TextField
            label="URL Gambar Banner Slider (Opsional)"
            placeholder="https://example.com/banner-promo.jpg"
            value={bannerUrl}
            onChange={(e) => setBannerUrl(e.target.value)}
            helperText="Banner ini akan tampil otomatis pada slider beranda dan halaman promo."
          />

          {bannerUrl && (
            <div className="relative w-full h-28 rounded-xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
              <img
                src={bannerUrl}
                alt="Preview Banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <span className="absolute bottom-1 right-2 text-[10px] font-bold bg-black/60 text-white px-2 py-0.5 rounded">
                Live Preview
              </span>
            </div>
          )}

          <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full font-bold mt-2">
            Simpan & Tayangkan Kupon
          </Button>
        </form>
      </Modal>
    </div>
  );
}
