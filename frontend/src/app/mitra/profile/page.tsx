'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Wrench,
  Star,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  LogOut,
  Palette,
  Award,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { apiClient } from '@/lib/api/client';
import { MitraProfileModel } from '@/types/api.generated';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { ThemeSelector } from '@/components/ui/theme-selector';
import { Skeleton } from '@/components/ui/skeleton';

export default function MitraProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isMitra, isLoading: authLoading, logout } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isMitra)) {
      router.push('/auth/login?redirect=/mitra/profile');
    }
  }, [authLoading, isAuthenticated, isMitra, router]);

  // Fetch Mitra profile details
  const { data: mitras, isLoading } = useQuery<MitraProfileModel[]>({
    queryKey: ['mitra-profile-me'],
    queryFn: () => apiClient<MitraProfileModel[]>('mitra'),
    enabled: isAuthenticated && isMitra,
  });

  if (authLoading || isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
      </div>
    );
  }

  const myMitra = mitras?.[0];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-16">
      <div>
        <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-wider block">
          Portal Teknisi Lapangan
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight">
          Profil Mitra & Performa
        </h1>
        <p className="text-xs text-[var(--fg-muted)]">
          Informasi legalitas usaha, kontak teknisi, dan penilaian rating pelanggan
        </p>
      </div>

      {/* Main Mitra Identity Card */}
      <div className="liquid-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-l-4 border-l-cyan-500">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[var(--fg-primary)]">
                {myMitra?.companyName || user?.name}
              </h2>
              {myMitra?.status && <StatusBadge status={myMitra.status} size="sm" />}
            </div>
            <p className="text-xs text-[var(--fg-muted)] mt-0.5">{user?.phone} {user?.email ? `• ${user.email}` : ''}</p>
            <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Mitra Resmi Terverifikasi
            </span>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={logout} className="text-[var(--status-destructive)]">
          <LogOut className="w-4 h-4 mr-1.5" /> Keluar Sesi
        </Button>
      </div>

      {/* Performance & Rating Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="liquid-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] font-semibold">
            <span>Rating & Kepuasan</span>
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-3xl font-black text-[var(--fg-primary)]">
              {Number(myMitra?.rating || 5.0).toFixed(1)}
            </span>
            <span className="text-xs text-[var(--fg-muted)]">/ 5.0 Bintang</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
            Performa sangat memuaskan dari ulasan pelanggan
          </p>
        </div>

        <div className="liquid-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] font-semibold">
            <span>Wilayah Operasional</span>
            <MapPin className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-sm font-bold text-[var(--fg-primary)] mt-3 line-clamp-2">
            {myMitra?.address || 'Jakarta & Area Sekitarnya'}
          </p>
          <p className="text-[11px] text-[var(--fg-muted)] mt-2">
            Siap menerima penugasan di seluruh radius area terdaftar
          </p>
        </div>
      </div>

      {/* Theme Settings Card */}
      <div className="liquid-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>Tema Tampilan Aplikasi</span>
          </h3>
          <p className="text-xs text-[var(--fg-muted)] mt-0.5">
            Pilih mode tampilan System, Terang (Light), atau Gelap (Dark).
          </p>
        </div>
        <ThemeSelector />
      </div>
    </div>
  );
}
