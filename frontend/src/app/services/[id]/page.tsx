'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Wrench,
  Clock,
  Check,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import {
  ServiceConfigurationDetail,
  OrderItemType,
  ProductVariantModel,
} from '@/types/api.generated';
import { useCart } from '@/lib/cart/cart-context';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/empty-state';

export default function ServiceDetailPage() {
  const routeParams = useParams();
  const serviceId = Number(routeParams?.id);
  const router = useRouter();
  const { setService, addItem } = useCart();

  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Record<number, number>>({}); // variantId -> qty
  const [selectedAccessories, setSelectedAccessories] = useState<Record<number, number>>({}); // variantId -> qty
  const [addedToast, setAddedToast] = useState(false);

  // 1. Fetch Complete Service Configuration (Service + Packages + Products + Accessories)
  const { data: config, isLoading, error, refetch } = useQuery<ServiceConfigurationDetail>({
    queryKey: ['service-config', serviceId],
    queryFn: () => apiClient<ServiceConfigurationDetail>(`service-configuration/${serviceId}`),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <Skeleton className="h-8 w-40 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !config || !config.service) {
    return (
      <div className="max-w-md mx-auto py-12">
        <ErrorState
          title="Layanan Tidak Ditemukan"
          message="Data konfigurasi layanan ini belum tersedia atau terjadi kesalahan."
          onRetry={refetch}
        />
      </div>
    );
  }

  const { service, packages, recommendedProducts, accessories } = config;

  // Selected package details
  const currentPackage = packages?.find((p) => Number(p.id) === selectedPackageId) || packages?.[0];
  const activePackageId = selectedPackageId || (currentPackage ? Number(currentPackage.id) : null);
  const activePackagePrice = currentPackage ? Number(currentPackage.price) : 0;

  // Calculate live estimation
  let productsSum = 0;
  // Sum products
  recommendedProducts?.forEach((p) => {
    p.variants?.forEach((v) => {
      const qty = selectedProducts[v.id] || 0;
      productsSum += Number(v.price) * qty;
    });
  });
  // Sum accessories
  accessories?.forEach((p) => {
    p.variants?.forEach((v) => {
      const qty = selectedAccessories[v.id] || 0;
      productsSum += Number(v.price) * qty;
    });
  });

  const estimatedTotal = activePackagePrice + productsSum;

  const handleProductQtyChange = (variantId: number, delta: number) => {
    setSelectedProducts((prev) => {
      const next = (prev[variantId] || 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[variantId];
        return copy;
      }
      return { ...prev, [variantId]: next };
    });
  };

  const handleAccessoryQtyChange = (variantId: number, delta: number) => {
    setSelectedAccessories((prev) => {
      const next = (prev[variantId] || 0) + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[variantId];
        return copy;
      }
      return { ...prev, [variantId]: next };
    });
  };

  const handleAddToCart = async () => {
    if (activePackageId && currentPackage) {
      setService(
        service.id,
        service.name,
        activePackageId,
        currentPackage.name,
        activePackagePrice
      );
      await addItem(OrderItemType.SERVICE, activePackageId, 1, {
        name: `${service.name} - ${currentPackage.name}`,
        price: activePackagePrice,
      });
    }

    // Add selected products
    for (const [vId, qty] of Object.entries(selectedProducts)) {
      if (qty > 0) {
        // find variant snapshot
        let variant: ProductVariantModel | undefined;
        recommendedProducts?.forEach((p) => {
          const found = p.variants?.find((v) => Number(v.id) === Number(vId));
          if (found) variant = found;
        });
        if (variant) {
          await addItem(OrderItemType.PRODUCT, Number(vId), qty, {
            name: `${variant.product?.name || 'Produk'} (SKU: ${variant.sku})`,
            price: Number(variant.price),
          });
        }
      }
    }

    // Add selected accessories
    for (const [vId, qty] of Object.entries(selectedAccessories)) {
      if (qty > 0) {
        let variant: ProductVariantModel | undefined;
        accessories?.forEach((p) => {
          const found = p.variants?.find((v) => Number(v.id) === Number(vId));
          if (found) variant = found;
        });
        if (variant) {
          await addItem(OrderItemType.ACCESSORY, Number(vId), qty, {
            name: `${variant.product?.name || 'Aksesoris'} (SKU: ${variant.sku})`,
            price: Number(variant.price),
          });
        }
      }
    }

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleDirectCheckout = async () => {
    await handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-16">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed top-20 right-4 z-50 bg-[var(--status-success)] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-xs font-bold">Layanan berhasil ditambahkan ke keranjang!</span>
        </div>
      )}

      {/* Back Link */}
      <Link
        href="/services"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Katalog Layanan</span>
      </Link>

      {/* Header Info */}
      <div className="liquid-card p-6 sm:p-8 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-elevated)]">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider">
              {service.category?.name || 'Layanan'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[var(--fg-primary)] tracking-tight mt-1">
              {service.name}
            </h1>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[var(--brand-light)] text-[var(--brand-primary)] flex items-center justify-center shrink-0 shadow-sm">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[var(--fg-muted)] leading-relaxed max-w-2xl mb-4">
          {service.description || 'Layanan profesional dengan teknisi berpengalaman, peralatan lengkap, dan garansi pengerjaan resmi.'}
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-[var(--border-subtle)] text-xs text-[var(--fg-secondary)]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>Garansi Pekerjaan 30 Hari</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-500" />
            <span>Estimasi 60-120 Menit</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. SERVICE PACKAGES SELECTION */}
      {/* ========================================================================= */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-[var(--fg-primary)] tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-sky-500" />
          <span>1. Pilih Paket Jasa</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {packages?.map((pkg) => {
            const isSelected = activePackageId === Number(pkg.id);
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedPackageId(Number(pkg.id))}
                className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'bg-[var(--brand-light)] border-[var(--brand-primary)] shadow-md ring-2 ring-[var(--focus-ring)]'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--brand-primary)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-bold text-[var(--fg-primary)]">{pkg.name}</span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected
                        ? 'bg-[var(--brand-primary)] border-[var(--brand-primary)] text-white'
                        : 'border-[var(--border-strong)]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-xs text-[var(--fg-muted)] line-clamp-2 mb-3">
                  {pkg.description || 'Pengerjaan komprehensif oleh teknisi tersertifikasi.'}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs">
                  <span className="text-[var(--fg-muted)] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {pkg.durationMinutes || 60} Menit
                  </span>
                  <span className="font-extrabold text-[var(--brand-primary)] text-sm">
                    Rp {Number(pkg.price).toLocaleString('id-ID')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. RECOMMENDED PRODUCTS (IF AVAILABLE) */}
      {/* ========================================================================= */}
      {recommendedProducts && recommendedProducts.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-[var(--fg-primary)] tracking-tight">
            2. Tambah Unit Produk Baru (Opsional)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendedProducts.map((prod) => (
              <div
                key={prod.id}
                className="liquid-card p-4 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">
                    {prod.brand || 'Beresin Store'}
                  </span>
                  <h4 className="text-xs font-bold text-[var(--fg-primary)]">{prod.name}</h4>
                  <p className="text-[11px] text-[var(--fg-muted)] line-clamp-1 mt-0.5">
                    {prod.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2">
                  {prod.variants?.map((v) => {
                    const qty = selectedProducts[v.id] || 0;
                    return (
                      <div key={v.id} className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold block text-[var(--fg-primary)]">
                            SKU: {v.sku}
                          </span>
                          <span className="text-[var(--brand-primary)] font-bold">
                            Rp {Number(v.price).toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 bg-[var(--bg-elevated)] px-2 py-1 rounded-xl border border-[var(--border-subtle)]">
                          <button
                            type="button"
                            onClick={() => handleProductQtyChange(v.id, -1)}
                            disabled={qty <= 0}
                            className="p-1 text-[var(--fg-muted)] hover:text-[var(--fg-primary)] disabled:opacity-30"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold w-4 text-center">{qty}</span>
                          <button
                            type="button"
                            onClick={() => handleProductQtyChange(v.id, 1)}
                            className="p-1 text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. ACCESSORIES (IF AVAILABLE) */}
      {/* ========================================================================= */}
      {accessories && accessories.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold text-[var(--fg-primary)] tracking-tight">
            3. Tambah Aksesoris & Material Pemasangan (Opsional)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {accessories.map((acc) => (
              <div key={acc.id} className="liquid-card p-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[var(--fg-primary)]">{acc.name}</h4>
                  <p className="text-[11px] text-[var(--fg-muted)] line-clamp-1 mt-0.5">
                    {acc.description}
                  </p>
                </div>

                <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex flex-col gap-2">
                  {acc.variants?.map((v) => {
                    const qty = selectedAccessories[v.id] || 0;
                    return (
                      <div key={v.id} className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold block text-[var(--fg-primary)]">
                            SKU: {v.sku}
                          </span>
                          <span className="text-[var(--brand-primary)] font-bold">
                            Rp {Number(v.price).toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 bg-[var(--bg-elevated)] px-2 py-1 rounded-xl border border-[var(--border-subtle)]">
                          <button
                            type="button"
                            onClick={() => handleAccessoryQtyChange(v.id, -1)}
                            disabled={qty <= 0}
                            className="p-1 text-[var(--fg-muted)] hover:text-[var(--fg-primary)] disabled:opacity-30"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold w-4 text-center">{qty}</span>
                          <button
                            type="button"
                            onClick={() => handleAccessoryQtyChange(v.id, 1)}
                            className="p-1 text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. FLOATING PRICE & ACTION BAR */}
      {/* ========================================================================= */}
      <div className="sticky bottom-4 z-30 liquid-glass-strong p-4 rounded-2xl shadow-2xl border border-[var(--border-glass)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[11px] text-[var(--fg-muted)] block font-medium">Estimasi Subtotal</span>
          <span className="text-xl font-black text-[var(--brand-primary)] tracking-tight">
            Rp {estimatedTotal.toLocaleString('id-ID')}
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 sm:flex-initial"
            onClick={handleAddToCart}
            leftIcon={<ShoppingBag className="w-4 h-4" />}
          >
            Tambah ke Keranjang
          </Button>
          <Button
            type="button"
            variant="primary"
            className="flex-1 sm:flex-initial font-bold"
            onClick={handleDirectCheckout}
          >
            Pesan Sekarang
          </Button>
        </div>
      </div>
    </div>
  );
}
