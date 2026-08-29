'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Percent,
  CheckCircle2,
  AlertCircle,
  Tag,
} from 'lucide-react';
import { useCart } from '@/lib/cart/cart-context';
import { apiClient } from '@/lib/api/client';
import { OrderItemType } from '@/types/api.generated';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { EmptyState } from '@/components/ui/empty-state';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    serviceConfig,
    subtotal,
    totalAmount,
    promotionCode,
    discountAmount,
    applyPromo,
    removePromo,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const [inputPromo, setInputPromo] = useState(promotionCode);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(
    promotionCode ? `Voucher ${promotionCode} aktif!` : null
  );

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPromo.trim()) return;

    try {
      setPromoLoading(true);
      setPromoError(null);
      setPromoSuccess(null);

      const res = await apiClient<{
        valid: boolean;
        discountAmount: number;
        discountType: string;
        discountValue: number;
        message: string;
      }>('promotions/validate', {
        method: 'POST',
        body: JSON.stringify({
          promotionCode: inputPromo.trim(),
          subtotal,
        }),
      });

      if (res.valid) {
        applyPromo(inputPromo.trim().toUpperCase(), res.discountAmount);
        setPromoSuccess(`Kupon berhasil digunakan! Diskon: Rp ${res.discountAmount.toLocaleString('id-ID')}`);
      } else {
        setPromoError(res.message || 'Kupon tidak dapat digunakan untuk pesanan ini');
      }
    } catch (err: any) {
      setPromoError(err.message || 'Gagal memvalidasi kupon');
    } finally {
      setPromoLoading(false);
    }
  };

  const handleRemovePromo = () => {
    removePromo();
    setInputPromo('');
    setPromoSuccess(null);
    setPromoError(null);
  };

  const hasItems = items.length > 0 || !!serviceConfig.packageId;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-12">
      {/* Title & Clear Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/services"
            className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] p-1 rounded-full"
            aria-label="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight">
              Keranjang Pesanan
            </h1>
            <p className="text-xs text-[var(--fg-muted)]">
              Periksa rincian layanan dan suku cadang sebelum checkout
            </p>
          </div>
        </div>

        {hasItems && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-[var(--status-destructive)] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Kosongkan</span>
          </button>
        )}
      </div>

      {!hasItems ? (
        <EmptyState
          icon={ShoppingBag}
          title="Keranjang Masih Kosong"
          description="Anda belum memilih paket jasa atau produk. Jelajahi katalog kami untuk memulai pemesanan."
          actionLabel="Lihat Katalog Layanan"
          onAction={() => router.push('/services')}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items List */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {/* Service Package Item (If selected) */}
            {serviceConfig.packageId && (
              <div className="liquid-card p-4 flex items-center justify-between gap-4 border-l-4 border-l-[var(--brand-primary)]">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--brand-primary)]">
                    Paket Jasa Utama
                  </span>
                  <h3 className="text-sm font-bold text-[var(--fg-primary)] mt-0.5">
                    {serviceConfig.serviceName} - {serviceConfig.packageName}
                  </h3>
                  <p className="text-xs text-[var(--fg-muted)] mt-1">
                    Rp {Number(serviceConfig.packagePrice).toLocaleString('id-ID')}
                  </p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 bg-[var(--bg-elevated)] rounded-full text-[var(--fg-secondary)]">
                  Qty: 1
                </span>
              </div>
            )}

            {/* Other Products and Accessories */}
            {items
              .filter((i) => i.itemType !== OrderItemType.SERVICE)
              .map((item) => (
                <div
                  key={`${item.itemType}-${item.referenceId}`}
                  className="liquid-card p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
                      {item.itemType === OrderItemType.PRODUCT ? 'Unit Produk' : 'Aksesoris'}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-[var(--fg-primary)] mt-0.5 line-clamp-1">
                      {item.nameSnapshot || `Item #${item.referenceId}`}
                    </h3>
                    <p className="text-xs font-semibold text-[var(--brand-primary)] mt-1">
                      Rp {Number(item.priceSnapshot || 0).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-[var(--bg-elevated)] px-2 py-1 rounded-xl border border-[var(--border-subtle)]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.itemType, Number(item.referenceId), item.qty - 1)}
                        className="p-1 text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                        aria-label="Kurangi"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-bold text-xs w-4 text-center">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.itemType, Number(item.referenceId), item.qty + 1)}
                        className="p-1 text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                        aria-label="Tambah"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.itemType, Number(item.referenceId))}
                      className="p-2 text-[var(--fg-muted)] hover:text-[var(--status-destructive)] transition-colors"
                      aria-label="Hapus item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* Checkout & Summary Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Voucher Promo Box */}
            <div className="liquid-card p-4">
              <span className="text-xs font-bold text-[var(--fg-primary)] mb-2 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-500" />
                <span>Kupon Promo / Diskon</span>
              </span>

              {discountAmount > 0 ? (
                <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mt-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{promotionCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-xs text-[var(--status-destructive)] hover:underline font-semibold"
                  >
                    Hapus
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={inputPromo}
                    onChange={(e) => setInputPromo(e.target.value.toUpperCase())}
                    placeholder="Contoh: DISKON50K"
                    className="w-full h-10 px-3 text-xs uppercase bg-[var(--bg-surface)] text-[var(--fg-primary)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
                  />
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    isLoading={promoLoading}
                    className="h-10 px-3 text-xs"
                  >
                    Pakai
                  </Button>
                </form>
              )}

              {promoError && (
                <p className="text-[11px] text-[var(--status-destructive)] mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{promoError}</span>
                </p>
              )}
              {promoSuccess && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                  {promoSuccess}
                </p>
              )}
            </div>

            {/* Price Summary */}
            <div className="liquid-card p-5 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border-subtle)] pb-2">
                Ringkasan Pembayaran
              </h3>

              <div className="flex justify-between text-xs text-[var(--fg-muted)]">
                <span>Subtotal Layanan & Produk</span>
                <span className="font-semibold text-[var(--fg-primary)]">
                  Rp {subtotal.toLocaleString('id-ID')}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Diskon Promo ({promotionCode})</span>
                  <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-[var(--fg-primary)] pt-3 border-t border-[var(--border-subtle)]">
                <span>Total Estimasi</span>
                <span className="text-[var(--brand-primary)] text-base">
                  Rp {totalAmount.toLocaleString('id-ID')}
                </span>
              </div>

              <Link href="/checkout" className="w-full mt-3">
                <Button size="lg" variant="primary" className="w-full font-bold shadow-md">
                  Lanjut ke Checkout <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
