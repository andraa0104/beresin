'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Flame, Tag, Clock, ArrowLeft, Copy, Check } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { PromotionModel } from '@/types/api.generated';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PromoSlider } from '@/components/ui/promo-slider';

export default function PromotionsPage() {
  const router = useRouter();
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const { data: promotions, isLoading } = useQuery<PromotionModel[]>({
    queryKey: ['all-promotions'],
    queryFn: () => apiClient<PromotionModel[]>('promotions'),
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-12">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] p-1 rounded-full"
          aria-label="Kembali"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            <span>Kupon & Promo Diskon</span>
          </h1>
          <p className="text-xs text-[var(--fg-muted)]">
            Gunakan kode voucher saat checkout untuk menikmati potongan harga spesial
          </p>
        </div>
      </div>

      {/* Top Banner Slider */}
      {promotions && promotions.length > 0 && (
        <PromoSlider promotions={promotions} />
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : promotions && promotions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promo) => (
            <GlassCard key={promo.id} className="p-5 flex flex-col justify-between border-sky-500/20">
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-600 dark:text-sky-400">
                    {promo.targetUser === 'NEW_USER' ? 'Pengguna Baru' : 'Semua Pengguna'}
                  </span>
                  <span className="text-xs font-black text-[var(--brand-primary)]">
                    {promo.discountType === 'PERCENTAGE'
                      ? `Diskon ${Number(promo.discountValue)}%`
                      : `Potongan Rp ${Number(promo.discountValue).toLocaleString('id-ID')}`}
                  </span>
                </div>

                <div className="p-3 bg-[var(--bg-elevated)] rounded-xl border border-dashed border-[var(--border-strong)] flex items-center justify-between mt-3">
                  <span className="font-mono font-black text-sm text-[var(--fg-primary)] tracking-wider">
                    {promo.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(promo.name)}
                    className="text-xs text-[var(--brand-primary)] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {copiedCode === promo.name ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Disalin
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Salin
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-subtle)] mt-4 text-[11px] text-[var(--fg-muted)] flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Hingga {new Date(promo.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
                <Link href="/services" className="font-bold text-[var(--brand-primary)] hover:underline">
                  Pakai Kupon →
                </Link>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Tag}
          title="Belum Ada Kupon Aktif"
          description="Nantikan penawaran promo dan diskon spesial berikutnya dari Beresin."
          actionLabel="Lihat Layanan"
          onAction={() => router.push('/services')}
        />
      )}
    </div>
  );
}
