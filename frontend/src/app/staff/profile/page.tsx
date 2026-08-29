'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  Phone,
  Mail,
  LogOut,
  Palette,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { Button } from '@/components/ui/button';
import { ThemeSelector } from '@/components/ui/theme-selector';
import { GlassCard } from '@/components/ui/glass-card';

export default function StaffProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isStaff, isLoading: authLoading, logout } = useAuth();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isStaff)) {
      router.push('/auth/login?redirect=/staff/profile');
    }
  }, [authLoading, isAuthenticated, isStaff, router]);

  if (authLoading) {
    return <div className="p-8 text-center text-sm text-[var(--fg-muted)]">Memuat profil staf...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-16">
      <div>
        <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-wider block">
          Pusat Staf & Manajemen
        </span>
        <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight">
          Profil Akun Staf Operasional
        </h1>
        <p className="text-xs text-[var(--fg-muted)]">
          Informasi peran, hak otorisasi sistem, dan preferensi akun
        </p>
      </div>

      {/* Staff Identity Card */}
      <div className="liquid-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-l-4 border-l-indigo-500">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 to-sky-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
            {user?.name?.charAt(0) || 'S'}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--fg-primary)]">{user?.name}</h2>
            <p className="text-xs text-[var(--fg-muted)] mt-0.5">{user?.phone} {user?.email ? `• ${user.email}` : ''}</p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {user?.roles?.map((r) => (
                <span
                  key={r}
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={logout} className="text-[var(--status-destructive)]">
          <LogOut className="w-4 h-4 mr-1.5" /> Keluar Sesi
        </Button>
      </div>

      {/* Role Privileges Card */}
      <GlassCard className="p-6">
        <h3 className="text-sm font-bold text-[var(--fg-primary)] mb-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Hak Akses Terotorisasi</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[var(--fg-secondary)]">
          <div className="p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Manajemen Antrean Pesanan & Status</span>
          </div>
          <div className="p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Penugasan Mitra & Dispatching</span>
          </div>
          <div className="p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Verifikasi Pembayaran & Bukti Transfer</span>
          </div>
          <div className="p-3 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Laporan Analytics & Corong Penjualan</span>
          </div>
        </div>
      </GlassCard>

      {/* Theme Settings Card */}
      <div className="liquid-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>Tema Tampilan Dashboard</span>
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
