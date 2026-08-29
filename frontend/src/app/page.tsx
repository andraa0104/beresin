'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles,
  Search,
  ShieldCheck,
  Clock,
  ThumbsUp,
  ArrowRight,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import {
  ServiceCategoryModel,
  ServiceModel,
  PromotionModel,
} from '@/types/api.generated';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PromoSlider } from '@/components/ui/promo-slider';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch Categories
  const { data: categories, isLoading: loadingCategories } = useQuery<ServiceCategoryModel[]>({
    queryKey: ['service-categories'],
    queryFn: () => apiClient<ServiceCategoryModel[]>('services/categories'),
  });

  // 2. Fetch Services
  const { data: services, isLoading: loadingServices } = useQuery<ServiceModel[]>({
    queryKey: ['services-popular'],
    queryFn: () => apiClient<ServiceModel[]>('services'),
  });

  // 3. Fetch Active Promotions
  const { data: promotions } = useQuery<PromotionModel[]>({
    queryKey: ['active-promotions'],
    queryFn: () => apiClient<PromotionModel[]>('promotions'),
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex flex-col gap-10 sm:gap-14 max-w-6xl mx-auto">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-sky-950 to-blue-950 text-white p-6 sm:p-10 md:p-14 shadow-2xl border border-white/10">
        {/* Glow Spheres */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl flex flex-col gap-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-sky-300 w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Service Commerce & Multi-Jasa Terpercaya</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            Solusi Segala Jasa Jadi <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-cyan-300">Beres & Tenang</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
            Pesan teknisi dan tenaga profesional untuk berbagai kebutuhan perbaikan, instalasi, perawatan, dan layanan pengerjaan di lokasi Anda. Transparan, bergaransi, dan praktis.
          </p>

          {/* Search & Track Action Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-2 flex flex-col sm:flex-row gap-2.5 w-full max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari layanan atau jasa yang Anda butuhkan..."
                className="w-full h-12 pl-10 pr-4 text-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-all"
              />
            </div>
            <Button type="submit" size="md" variant="primary" className="h-12 px-6 rounded-2xl font-bold">
              Cari Jasa
            </Button>
          </form>

          {/* Trust Highlights */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-3 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Garansi Pengerjaan</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Teknisi Siap Datang</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-yellow-400" />
              <span>Harga Transparan</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. AUTOMATIC PROMOTIONS SLIDER (MARKETING BANNERS) */}
      {/* ========================================================================= */}
      {promotions && promotions.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-bold text-[var(--fg-primary)] tracking-tight">
                Penawaran & Promo Spesial
              </h2>
            </div>
            <Link
              href="/promotions"
              className="text-xs font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
            >
              Lihat Semua Kupon <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <PromoSlider promotions={promotions} />
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. DYNAMIC DATABASE CATEGORIES (TOP 3 + LIHAT SEMUA) */}
      {/* ========================================================================= */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--fg-primary)] tracking-tight">
              Kategori Layanan
            </h2>
            <p className="text-xs text-[var(--fg-muted)]">
              Pilihan kategori utama untuk berbagai kebutuhan Anda
            </p>
          </div>
          <Link
            href="/services"
            className="text-xs font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
          >
            Lihat Semua Layanan <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingCategories ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categories.slice(0, 3).map((cat) => (
              <Link
                key={cat.id}
                href={`/services?categoryId=${cat.id}`}
                className="liquid-card liquid-card-interactive p-5 flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500/15 via-blue-500/10 to-indigo-500/15 text-[var(--brand-primary)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform font-black text-lg shadow-xs">
                  {cat.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-[var(--fg-primary)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[var(--fg-muted)] line-clamp-2 mt-0.5">
                    {cat.description || 'Solusi layanan dan perbaikan profesional.'}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[var(--fg-muted)] group-hover:text-[var(--brand-primary)] group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] text-xs text-[var(--fg-muted)]">
            Kategori layanan sedang dimuat dari sistem...
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 4. POPULAR / AVAILABLE SERVICES */}
      {/* ========================================================================= */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--fg-primary)] tracking-tight">
              Pilihan Layanan Terpopuler
            </h2>
            <p className="text-xs text-[var(--fg-muted)]">
              Pilih paket pengerjaan atau konfigurasi dengan produk suku cadang
            </p>
          </div>
          <Link href="/services" className="text-xs font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1">
            Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingServices ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))}
          </div>
        ) : services && services.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => {
              const lowestPackagePrice =
                service.packages && service.packages.length > 0
                  ? Math.min(...service.packages.map((p) => Number(p.price)))
                  : null;

              return (
                <Link
                  key={service.id}
                  href={`/services/${service.id}`}
                  className="liquid-card liquid-card-interactive p-5 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-base font-bold text-[var(--fg-primary)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-1">
                        {service.name}
                      </h3>
                      {service.category && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--bg-elevated)] text-[var(--fg-secondary)] shrink-0">
                          {service.category.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--fg-muted)] line-clamp-2 leading-relaxed mb-4">
                      {service.description || 'Layanan teknisi terpercaya bergaransi dengan peralatan lengkap.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between mt-auto">
                    <div>
                      <span className="text-[10px] text-[var(--fg-muted)] block">Mulai dari</span>
                      <span className="text-sm font-extrabold text-[var(--brand-primary)]">
                        {lowestPackagePrice !== null
                          ? `Rp ${lowestPackagePrice.toLocaleString('id-ID')}`
                          : 'Hubungi CS'}
                      </span>
                    </div>
                    <Button size="sm" variant="primary" className="rounded-xl px-3 py-1 text-xs">
                      Pesan Jasa
                    </Button>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)]">
            <p className="text-sm text-[var(--fg-muted)]">Belum ada layanan untuk kategori yang dipilih.</p>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW IT WORKS (CARA KERJA) */}
      {/* ========================================================================= */}
      <section className="bg-[var(--bg-surface)] rounded-3xl border border-[var(--border-subtle)] p-6 sm:p-10">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl font-bold text-[var(--fg-primary)] tracking-tight mb-2">
            Cara Mudah Pesan Layanan di Beresin
          </h2>
          <p className="text-xs text-[var(--fg-muted)]">
            4 langkah praktis dari pemesanan hingga pekerjaan selesai dengan jaminan garansi
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Pilih Layanan & Paket',
              desc: 'Tentukan jasa, opsi paket perbaikan, dan suku cadang yang dibutuhkan.',
            },
            {
              step: '02',
              title: 'Teknisi Ditugaskan',
              desc: 'Admin/CS menugaskan mitra teknisi ahli terdekat menuju lokasi Anda.',
            },
            {
              step: '03',
              title: 'Pengerjaan & Bukti',
              desc: 'Pekerjaan dilakukan dengan foto dokumentasi sebelum & sesudah pengerjaan.',
            },
            {
              step: '04',
              title: 'Pembayaran Aman',
              desc: 'Selesaikan pembayaran tunai atau transfer setelah pekerjaan terbukti tuntas.',
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600 mb-2">
                {step}
              </span>
              <h4 className="text-sm font-bold text-[var(--fg-primary)] mb-1">{title}</h4>
              <p className="text-xs text-[var(--fg-muted)] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
