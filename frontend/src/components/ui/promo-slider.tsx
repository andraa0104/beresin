'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Tag,
  Clock,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import { PromotionModel } from '@/types/api.generated';
import { Button } from './button';

interface PromoSliderProps {
  promotions: (PromotionModel & { bannerUrl?: string; image?: string; description?: string })[];
  autoSlideInterval?: number;
}

export function PromoSlider({
  promotions = [],
  autoSlideInterval = 4500,
}: PromoSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const touchStartX = useRef<number | null>(null);

  const total = promotions.length;

  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, autoSlideInterval);

    return () => clearInterval(timer);
  }, [total, isPaused, autoSlideInterval]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handleCopy = (e: React.MouseEvent, code: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartX.current = null;
  };

  if (!promotions || promotions.length === 0) return null;

  const validIndex = currentIndex >= promotions.length ? 0 : Math.max(0, currentIndex);
  const currentPromo = promotions[validIndex];
  if (!currentPromo) return null;

  const discountLabel =
    currentPromo.discountType === 'PERCENTAGE'
      ? `Diskon ${Number(currentPromo.discountValue)}%`
      : `Potongan Rp ${Number(currentPromo.discountValue).toLocaleString('id-ID')}`;

  const bannerImg = currentPromo.bannerUrl || currentPromo.image;

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl shadow-xl group transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Slider Slide Container */}
      <div className="relative min-h-[220px] sm:min-h-[260px] md:min-h-[280px] w-full bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 text-white flex items-center p-6 sm:p-10 border border-white/10 overflow-hidden">
        {/* Background Banner Image if uploaded by Marketing */}
        {bannerImg ? (
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105"
            style={{ backgroundImage: `url(${bannerImg})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/70 to-transparent" />
          </div>
        ) : (
          <>
            {/* Liquid Glow Accent Spheres */}
            <div className="absolute -top-16 -right-16 w-72 h-72 bg-sky-500/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />
          </>
        )}

        {/* Slide Content */}
        <div className="relative z-10 max-w-xl flex flex-col gap-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/90 text-white text-xs font-black shadow-md uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-white" />
              <span>Promo Spesial</span>
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-sky-300 text-xs font-extrabold border border-white/20">
              <Sparkles className="w-3 h-3" />
              {currentPromo.targetUser === 'NEW_USER' ? 'Khusus Pengguna Baru' : 'Semua Pelanggan'}
            </span>
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-snug">
              {discountLabel} Untuk Pemesanan Jasa Anda!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              Gunakan kode voucher saat checkout. Berlaku hingga{' '}
              {new Date(currentPromo.endDate).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              .
            </p>
          </div>

          {/* Action Voucher Code & CTA */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={(e) => handleCopy(e, currentPromo.name)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md text-white font-mono font-black text-sm tracking-wider transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Tag className="w-4 h-4 text-sky-400" />
              <span>{currentPromo.name}</span>
              {copiedCode === currentPromo.name ? (
                <span className="text-[11px] font-sans font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Disalin
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            <Link href="/services">
              <Button size="sm" variant="primary" className="rounded-xl font-bold px-4 h-10 shadow-md">
                Gunakan Kupon <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Manual Navigation Controls (Desktop hover) */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Promo Sebelumnya"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Promo Berikutnya"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Slider Indicator Dots */}
      {total > 1 && (
        <div className="absolute bottom-3 right-4 sm:right-6 flex items-center gap-1.5 z-20">
          {promotions.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? 'w-6 bg-sky-400 shadow-sm'
                  : 'w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
