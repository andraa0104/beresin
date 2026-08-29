'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  ShieldCheck,
  User,
  Phone,
  Lock,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wrench,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/cart/cart-context';
import { apiClient, ApiError } from '@/lib/api/client';
import {
  CustomerProfileModel,
  LocationModel,
  OrderModel,
} from '@/types/api.generated';
import { Button } from '@/components/ui/button';
import { TextField, PasswordField } from '@/components/ui/text-field';
import { GlassCard } from '@/components/ui/glass-card';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, login } = useAuth();
  const {
    items,
    serviceConfig,
    subtotal,
    totalAmount,
    promotionCode,
    discountAmount,
    sessionId,
    clearCart,
  } = useCart();

  // Guest Quick Register/Login Fields
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestPassword, setGuestPassword] = useState('');

  // Location / Address State
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch Customer Profile if authenticated
  const { data: customerProfile } = useQuery<CustomerProfileModel>({
    queryKey: ['customer-profile-me'],
    queryFn: () => apiClient<CustomerProfileModel>('customers/profile/me'),
    enabled: isAuthenticated,
  });

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!serviceConfig.serviceId) {
      setErrorMessage('Silakan pilih layanan terlebih dahulu.');
      return;
    }

    if (!address.trim() && !selectedLocationId) {
      setErrorMessage('Mohon isi alamat lengkap lokasi pengerjaan.');
      return;
    }

    try {
      setIsSubmitting(true);
      let authToken = localStorage.getItem('beresin_auth_token');

      // 1. If Guest: Quick Register / Login
      if (!isAuthenticated || !authToken) {
        if (!guestName.trim() || !guestPhone.trim() || !guestPassword) {
          setErrorMessage('Mohon lengkapi nama, nomor telepon/WhatsApp, dan password akun Anda.');
          setIsSubmitting(false);
          return;
        }

        try {
          const authRes = await apiClient<{ user: any; token: string }>('auth/register', {
            method: 'POST',
            body: JSON.stringify({
              name: guestName.trim(),
              phone: guestPhone.trim(),
              password: guestPassword,
            }),
          });
          login(authRes.user, authRes.token);
          authToken = authRes.token;
        } catch (regErr: any) {
          // If phone already registered, attempt login
          if (regErr.message?.includes('terdaftar')) {
            const loginRes = await apiClient<{ user: any; token: string }>('auth/login', {
              method: 'POST',
              body: JSON.stringify({
                phone: guestPhone.trim(),
                password: guestPassword,
              }),
            });
            login(loginRes.user, loginRes.token);
            authToken = loginRes.token;
          } else {
            throw regErr;
          }
        }
      }

      // 2. Save Location if new address entered
      let finalLocationId = selectedLocationId;
      if (!finalLocationId && address.trim()) {
        try {
          const locRes = await apiClient<LocationModel>('customers/locations', {
            method: 'POST',
            body: JSON.stringify({
              address: address.trim(),
              notes: notes.trim() || undefined,
            }),
            token: authToken,
          });
          if (locRes && locRes.id) {
            finalLocationId = Number(locRes.id);
          }
        } catch {
          // Continue if location saving fails
        }
      }

      // 3. Create Order Atomically via Backend
      const orderPayload: any = {
        serviceId: serviceConfig.serviceId,
        servicePackageId: serviceConfig.packageId || undefined,
        locationId: finalLocationId || undefined,
        sessionId: sessionId || undefined,
        promotionCode: promotionCode || undefined,
      };

      const createdOrder = await apiClient<OrderModel>('orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload),
        token: authToken,
      });

      // 4. Success: Clear Cart & Redirect to Order Confirmation
      await clearCart();
      router.push(`/orders/${createdOrder.id}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'Gagal membuat pesanan. Silakan periksa kembali data Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-16">
      {/* Title & Back Link */}
      <div className="flex items-center gap-3">
        <Link
          href="/cart"
          className="text-[var(--fg-muted)] hover:text-[var(--fg-primary)] p-1 rounded-full"
          aria-label="Kembali ke keranjang"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight">
            Konfirmasi & Checkout
          </h1>
          <p className="text-xs text-[var(--fg-muted)]">
            Lengkapi data pengerjaan untuk memproses pemesanan Anda
          </p>
        </div>
      </div>

      <form onSubmit={handleOrderSubmit} className="flex flex-col gap-6">
        {/* ========================================================================= */}
        {/* 1. CUSTOMER IDENTITY / 1-STEP AUTH */}
        {/* ========================================================================= */}
        <div className="liquid-card p-5 sm:p-6">
          <h2 className="text-sm font-bold text-[var(--fg-primary)] mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-sky-500" />
            <span>1. Informasi Pemesan</span>
          </h2>

          {isAuthenticated ? (
            <div className="p-3.5 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[var(--fg-primary)]">{user?.name}</p>
                <p className="text-xs text-[var(--fg-muted)] mt-0.5">{user?.phone} {user?.email ? `• ${user.email}` : ''}</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                Buat akun Beresin instan dalam 1 langkah untuk pelacakan dan jaminan garansi service Anda.
              </p>
              <TextField
                label="Nama Lengkap"
                placeholder="Contoh: Budi Santoso"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />
              <TextField
                label="Nomor WhatsApp / Telepon"
                placeholder="Contoh: 081234567890"
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                leftIcon={<Phone className="w-4 h-4" />}
                helperText="Notifikasi status teknisi akan dikirimkan ke nomor ini."
              />
              <PasswordField
                label="Password Akun"
                placeholder="Minimal 6 karakter"
                required
                value={guestPassword}
                onChange={(e) => setGuestPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
              />
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. SERVICE LOCATION / ADDRESS */}
        {/* ========================================================================= */}
        <div className="liquid-card p-5 sm:p-6">
          <h2 className="text-sm font-bold text-[var(--fg-primary)] mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>2. Lokasi Alamat Pengerjaan</span>
          </h2>

          {/* Saved Addresses (If Customer has any) */}
          {customerProfile?.locations && customerProfile.locations.length > 0 && (
            <div className="mb-4 flex flex-col gap-2">
              <span className="text-xs font-semibold text-[var(--fg-secondary)]">Pilih Alamat Tersimpan:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {customerProfile.locations.map((loc) => {
                  const isSelected = selectedLocationId === loc.id;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => {
                        setSelectedLocationId(isSelected ? null : loc.id);
                        if (!isSelected) setAddress(loc.address);
                      }}
                      className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--brand-light)] border-[var(--brand-primary)] text-[var(--fg-primary)] font-semibold'
                          : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--fg-secondary)]'
                      }`}
                    >
                      <p className="line-clamp-2">{loc.address}</p>
                      {loc.notes && <p className="text-[10px] text-[var(--fg-muted)] mt-1 font-normal">Patokan: {loc.notes}</p>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Address Input */}
          <div className="flex flex-col gap-3">
            <div className="w-full flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--fg-secondary)]">
                Alamat Lengkap <span className="text-[var(--status-destructive)]">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  setSelectedLocationId(null);
                }}
                placeholder="Jl. Mawar No. 123, RT 01/RW 02, Kelurahan, Kecamatan, Kota..."
                className="w-full p-3 text-xs sm:text-sm bg-[var(--bg-surface)] text-[var(--fg-primary)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] leading-relaxed"
              />
            </div>

            <TextField
              label="Patokan / Catatan Lokasi (Opsional)"
              placeholder="Contoh: Rumah pagar hitam samping minimarket"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. ORDER SUMMARY */}
        {/* ========================================================================= */}
        <div className="liquid-card p-5 sm:p-6 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-[var(--fg-primary)] border-b border-[var(--border-subtle)] pb-2 flex items-center justify-between">
            <span>Ringkasan Order</span>
            <span className="text-xs font-semibold text-[var(--brand-primary)]">
              {serviceConfig.serviceName || 'Layanan'}
            </span>
          </h2>

          <div className="flex justify-between text-xs text-[var(--fg-muted)]">
            <span>Paket Jasa</span>
            <span className="font-bold text-[var(--fg-primary)]">
              {serviceConfig.packageName || 'Layanan Standard'} (Rp {Number(serviceConfig.packagePrice || 0).toLocaleString('id-ID')})
            </span>
          </div>

          {items
            .filter((i) => i.itemType !== 'SERVICE')
            .map((item) => (
              <div key={item.id} className="flex justify-between text-xs text-[var(--fg-muted)]">
                <span>
                  {item.nameSnapshot} <b className="text-[var(--fg-primary)]">x{item.qty}</b>
                </span>
                <span className="font-semibold text-[var(--fg-primary)]">
                  Rp {Number(item.subtotal || 0).toLocaleString('id-ID')}
                </span>
              </div>
            ))}

          {discountAmount > 0 && (
            <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              <span>Diskon ({promotionCode})</span>
              <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-black text-[var(--fg-primary)] pt-3 border-t border-[var(--border-subtle)]">
            <span>Total Tagihan</span>
            <span className="text-[var(--brand-primary)]">
              Rp {totalAmount.toLocaleString('id-ID')}
            </span>
          </div>

          <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-500/20 text-xs text-sky-800 dark:text-sky-300 flex items-center gap-2 mt-2">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Pembayaran dilakukan setelah teknisi tiba atau pekerjaan selesai.</span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-[var(--status-destructive-bg)] border border-[var(--status-destructive-border)] text-xs text-[var(--status-destructive)] font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Submit Action */}
        <Button
          type="submit"
          size="lg"
          variant="primary"
          isLoading={isSubmitting}
          className="w-full font-bold h-13 text-base shadow-lg rounded-2xl"
        >
          Konfirmasi & Buat Pesanan <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </form>
    </div>
  );
}
