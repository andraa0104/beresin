'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Grid,
  ShoppingBag,
  ClipboardList,
  User,
  Wrench,
  History,
  LayoutDashboard,
  Users,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useCart } from '@/lib/cart/cart-context';
import { clsx } from 'clsx';

export function MobileBottomNav() {
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isMitra, isStaff } = useAuth();
  const { itemCount } = useCart();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAuth = mounted && isAuthenticated;
  const isM = mounted && isMitra;
  const isS = mounted && isStaff;
  const count = mounted ? itemCount : 0;

  // Navigation Items depending on Actor
  let navItems = [
    { label: 'Beranda', href: '/', icon: Home },
    { label: 'Layanan', href: '/services', icon: Grid },
    { label: 'Keranjang', href: '/cart', icon: ShoppingBag, badge: count },
    {
      label: 'Pesanan',
      href: isAuth ? '/customer/orders' : '/track',
      icon: ClipboardList,
    },
    {
      label: 'Akun',
      href: isAuth ? '/customer/profile' : '/auth/login',
      icon: User,
    },
  ];

  if (isM && pathname.startsWith('/mitra')) {
    navItems = [
      { label: 'Tugas Aktif', href: '/mitra', icon: Wrench },
      { label: 'Riwayat', href: '/mitra/history', icon: History },
      { label: 'Profil Mitra', href: '/mitra/profile', icon: User },
    ];
  } else if (isS && pathname.startsWith('/staff')) {
    navItems = [
      { label: 'Dashboard', href: '/staff', icon: LayoutDashboard },
      { label: 'Pesanan', href: '/staff/orders', icon: ClipboardList },
      { label: 'Mitra', href: '/staff/mitra', icon: Users },
      { label: 'Analytics', href: '/staff/analytics', icon: BarChart3 },
      { label: 'Profil', href: '/staff/profile', icon: User },
    ];
  }

  return (
    <nav
      aria-label="Navigasi Bawah Mobile"
      className="md:hidden floating-bottom-nav liquid-glass-strong border border-[var(--border-glass)] py-2 px-3 shadow-2xl transition-all duration-300"
    >
      <div className="flex items-center justify-around">
        {navItems.map(({ label, href, icon: Icon, badge }) => {
          const isRootHref = href === '/' || href === '/staff' || href === '/mitra';
          const isActive = isRootHref ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 select-none',
                isActive
                  ? 'text-[var(--brand-primary)] font-bold scale-105'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg-primary)]'
              )}
            >
              <div className="relative">
                <Icon className={clsx('w-5 h-5 transition-transform', isActive && 'stroke-[2.5]')} />
                {typeof badge === 'number' && badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 w-4 h-4 bg-[var(--brand-primary)] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-in zoom-in-50">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1">{label}</span>
              {isActive && (
                <span className="w-1.5 h-1 bg-[var(--brand-primary)] rounded-full mt-0.5" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
