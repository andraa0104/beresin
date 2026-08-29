'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Wrench, Phone, MapPin, Star, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { MitraProfileModel } from '@/types/api.generated';
import { GlassCard } from '@/components/ui/glass-card';
import { StatusBadge } from '@/components/ui/status-badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function StaffMitraPage() {
  const { data: mitras, isLoading } = useQuery<MitraProfileModel[]>({
    queryKey: ['staff-mitra-list'],
    queryFn: () => apiClient<MitraProfileModel[]>('mitra'),
  });

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
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight">
          Direktori Mitra Service & Teknisi
        </h1>
        <p className="text-xs text-[var(--fg-muted)]">
          Daftar seluruh mitra teknisi terdaftar, status ketersediaan, dan performa rating
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mitras?.map((mitra) => (
          <GlassCard key={mitra.id} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-sm font-bold text-[var(--fg-primary)]">{mitra.companyName}</span>
                <StatusBadge status={mitra.status} size="sm" />
              </div>
              <p className="text-xs text-[var(--fg-muted)] flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span className="line-clamp-1">{mitra.address || 'Area Jakarta & Sekitarnya'}</span>
              </p>
              <p className="text-xs text-[var(--fg-muted)] flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>{mitra.user?.phone || '-'}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] mt-4 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 font-bold text-amber-500">
                <Star className="w-4 h-4 fill-amber-500" />
                {Number(mitra.rating || 5).toFixed(1)} / 5.0
              </span>
              <span className="text-[11px] font-semibold text-[var(--brand-primary)]">Mitra Resmi</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
