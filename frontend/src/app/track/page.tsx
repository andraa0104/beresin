'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ClipboardList, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { GlassCard } from '@/components/ui/glass-card';

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderQuery, setOrderQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = orderQuery.trim();
    if (!clean) {
      setError('Masukkan nomor pesanan Anda.');
      return;
    }

    // Direct search or navigate to customer order view / login
    router.push(`/customer/orders?search=${encodeURIComponent(clean)}`);
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6 py-8 pb-16">
      <div className="text-center">
        <div className="w-16 h-16 rounded-3xl bg-sky-500/15 text-[var(--brand-primary)] flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Search className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--fg-primary)] tracking-tight">
          Lacak Status Pesanan
        </h1>
        <p className="text-xs sm:text-sm text-[var(--fg-muted)] mt-1.5 max-w-md mx-auto leading-relaxed">
          Pantau progres penugasan teknisi dan status pekerjaan secara langsung dengan nomor order Anda.
        </p>
      </div>

      <GlassCard className="p-6 sm:p-8">
        <form onSubmit={handleTrackSubmit} className="flex flex-col gap-4">
          <TextField
            label="Nomor Pesanan Beresin"
            placeholder="Contoh: BRS-20260829-1234"
            value={orderQuery}
            onChange={(e) => {
              setOrderQuery(e.target.value.toUpperCase());
              setError(null);
            }}
            leftIcon={<ClipboardList className="w-4 h-4" />}
            helperText="Nomor order tertera pada konfirmasi pesanan atau pesan WhatsApp Anda."
          />

          {error && (
            <p className="text-xs text-[var(--status-destructive)] font-semibold flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </p>
          )}

          <Button type="submit" size="lg" variant="primary" className="w-full font-bold mt-2">
            Lacak Pesanan Sekarang <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] flex flex-col gap-2.5 text-xs text-[var(--fg-muted)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Update status realtime teknisi menuju lokasi</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Transparan dengan foto dokumentasi pengerjaan</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
