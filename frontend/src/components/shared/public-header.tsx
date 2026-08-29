'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, User as UserIcon, Wrench, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/cart/cart-context';
import { Button } from '@/components/ui/button';

export function PublicHeader() {
  const [mounted, setMounted] = React.useState(false);
  const { user, isAuthenticated, isMitra, isStaff } = useAuth();
  const { itemCount } = useCart();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="floating-top-bar w-full border-b border-[var(--border-subtle)] bg-[var(--bg-glass)] backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform">
            B
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-[var(--fg-primary)] leading-none">
              Beresin<span className="text-[var(--brand-primary)]">.id</span>
            </span>
            <span className="text-[10px] font-medium text-[var(--fg-muted)] tracking-wider uppercase">
              Service Commerce
            </span>
          </div>
        </Link>

        {/* Search Bar / Quick Nav for Desktop */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/services"
            className="text-sm font-medium text-[var(--fg-secondary)] hover:text-[var(--brand-primary)] transition-colors"
          >
            Layanan Beresin
          </Link>
          <Link
            href="/track"
            className="text-sm font-medium text-[var(--fg-secondary)] hover:text-[var(--brand-primary)] transition-colors"
          >
            Lacak Pesanan
          </Link>
          <Link
            href="/promotions"
            className="text-sm font-medium text-[var(--fg-secondary)] hover:text-[var(--brand-primary)] transition-colors"
          >
            Promo Untuk Anda
          </Link>
        </div>

        {/* Right Action Tools (Desktop only - Mobile uses Floating Bottom Nav) */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Cart Icon & Badge */}
          <Link
            href="/cart"
            className="relative touch-target text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-elevated)] rounded-full transition-colors"
            aria-label="Buka Keranjang"
          >
            <ShoppingBag className="w-5 h-5" />
            {mounted && itemCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[var(--brand-primary)] text-white text-[11px] font-bold flex items-center justify-center animate-in zoom-in-50 duration-150">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {/* User Auth Action */}
          {!mounted ? (
            <div className="flex items-center gap-1.5">
              <Link href="/auth/login">
                <Button size="sm" variant="ghost">
                  Masuk
                </Button>
              </Link>
              <Link href="/auth/register" className="hidden sm:inline-flex">
                <Button size="sm" variant="primary">
                  Daftar
                </Button>
              </Link>
            </div>
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2">
              {isMitra ? (
                <Link href="/mitra">
                  <Button size="sm" variant="secondary" leftIcon={<Wrench className="w-4 h-4 text-cyan-500" />}>
                    Area Teknisi
                  </Button>
                </Link>
              ) : isStaff ? (
                <Link href="/staff">
                  <Button size="sm" variant="secondary" leftIcon={<LayoutDashboard className="w-4 h-4 text-indigo-500" />}>
                    Portal Staf
                  </Button>
                </Link>
              ) : (
                <Link href="/customer/profile">
                  <Button size="sm" variant="secondary" leftIcon={<UserIcon className="w-4 h-4 text-blue-500" />}>
                    {user?.name?.split(' ')[0] || 'Profil Akun'}
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link href="/auth/login">
                <Button size="sm" variant="ghost">
                  Masuk
                </Button>
              </Link>
              <Link href="/auth/register" className="hidden sm:inline-flex">
                <Button size="sm" variant="primary">
                  Daftar
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
