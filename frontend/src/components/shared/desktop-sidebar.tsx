'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Wrench,
  Percent,
  CreditCard,
  BarChart3,
  LogOut,
  ChevronRight,
  ShieldAlert,
  User,
  ChevronUp,
  Palette,
  Check,
  Laptop,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { useTheme, ThemeMode } from '@/lib/theme/theme-context';
import { clsx } from 'clsx';

export function DesktopSidebar() {
  const pathname = usePathname();
  const { user, isStaff, isMitra, isSuperAdmin, isAdmin, isMarketing, logout } =
    useAuth();
  const { theme, setTheme } = useTheme();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isThemeSubmenuOpen, setIsThemeSubmenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
        setIsThemeSubmenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isStaff && !isMitra) return null;

  const staffNavItems = [
    { label: 'Overview Dashboard', href: '/staff', icon: LayoutDashboard, visible: isStaff },
    { label: 'Semua Pesanan', href: '/staff/orders', icon: ClipboardList, visible: isStaff },
    { label: 'Mitra Teknisi', href: '/staff/mitra', icon: Wrench, visible: isStaff },
    { label: 'Data Pelanggan', href: '/staff/customers', icon: Users, visible: isStaff },
    { label: 'Verifikasi Pembayaran', href: '/staff/payments', icon: CreditCard, visible: isStaff },
    { label: 'Promo & Diskon', href: '/staff/promotions', icon: Percent, visible: isMarketing || isAdmin || isSuperAdmin },
    { label: 'Laporan Analytics', href: '/staff/analytics', icon: BarChart3, visible: isMarketing || isAdmin || isSuperAdmin },
    { label: 'Manajemen Role & User', href: '/staff/users', icon: ShieldAlert, visible: isAdmin || isSuperAdmin },
  ];

  const mitraNavItems = [
    { label: 'Tugas Pekerjaan', href: '/mitra', icon: Wrench, visible: isMitra },
    { label: 'Riwayat Tugas', href: '/mitra/history', icon: ClipboardList, visible: isMitra },
  ];

  const items = (isStaff ? staffNavItems : mitraNavItems).filter((i) => i.visible);
  const profileHref = isStaff ? '/staff/profile' : '/mitra/profile';

  const themeOptions: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'system', label: 'Otomatis (Sistem)', icon: <Laptop className="w-4 h-4 text-sky-500" /> },
    { mode: 'light', label: 'Mode Terang', icon: <Sun className="w-4 h-4 text-amber-500" /> },
    { mode: 'dark', label: 'Mode Gelap', icon: <Moon className="w-4 h-4 text-indigo-400" /> },
  ];

  const currentThemeLabel =
    theme === 'light' ? 'Terang' : theme === 'dark' ? 'Gelap' : 'Otomatis';

  return (
    <aside
      aria-label="Sidebar Navigasi Panel"
      className="hidden lg:flex flex-col w-64 shrink-0 h-[calc(100vh-4rem)] sticky top-16 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 justify-between select-none"
    >
      <div className="flex flex-col gap-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[var(--fg-muted)]">
          {isStaff ? 'Portal Operasional Staf' : 'Portal Mitra Teknisi'}
        </div>

        {items.map(({ label, href, icon: Icon }) => {
          const isActive = href === '/staff' || href === '/mitra' ? pathname === href : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center justify-between px-3.5 py-2.5 rounded-[var(--radius-md)] text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-[var(--brand-light)] text-[var(--brand-primary)] font-semibold shadow-xs'
                  : 'text-[var(--fg-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--fg-primary)]'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={clsx('w-4 h-4', isActive ? 'text-[var(--brand-primary)]' : 'text-[var(--fg-muted)]')} />
                <span>{label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5" />}
            </Link>
          );
        })}
      </div>

      <div className="pt-4 border-t border-[var(--border-subtle)] relative">
        <div ref={userMenuRef} className="relative">
          {isUserMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl z-50 flex flex-col gap-1 animate-in fade-in-0 zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-[var(--border-subtle)] mb-0.5">
                <p className="text-xs font-bold text-[var(--fg-primary)] truncate">{user?.name}</p>
                <p className="text-[10px] text-[var(--fg-muted)] truncate">{user?.email || user?.phone}</p>
              </div>

              <Link
                href={profileHref}
                onClick={() => {
                  setIsUserMenuOpen(false);
                  setIsThemeSubmenuOpen(false);
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--fg-primary)] hover:bg-[var(--brand-light)] hover:text-[var(--brand-primary)] rounded-xl transition-colors"
              >
                <User className="w-4 h-4 text-[var(--brand-primary)]" />
                <span>Profil Saya</span>
              </Link>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsThemeSubmenuOpen((prev) => !prev)}
                  onMouseEnter={() => setIsThemeSubmenuOpen(true)}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-left',
                    isThemeSubmenuOpen
                      ? 'bg-[var(--brand-light)] text-[var(--brand-primary)]'
                      : 'text-[var(--fg-primary)] hover:bg-[var(--bg-elevated)]'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Palette className="w-4 h-4 text-purple-500" />
                    <span>Tema Tampilan</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-[var(--fg-muted)]">
                    <span className="font-normal">{currentThemeLabel}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[var(--fg-muted)]" />
                  </div>
                </button>

                {isThemeSubmenuOpen && (
                  <div
                    onMouseLeave={() => setIsThemeSubmenuOpen(false)}
                    className="absolute left-[calc(100%+8px)] bottom-0 w-52 p-1.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl z-50 flex flex-col gap-1 animate-in fade-in-0 slide-in-from-left-2 duration-150"
                  >
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--fg-muted)] border-b border-[var(--border-subtle)]">
                      Pilih Tema
                    </div>

                    {themeOptions.map((opt) => {
                      const isSelected = theme === opt.mode;
                      return (
                        <button
                          key={opt.mode}
                          type="button"
                          onClick={() => {
                            setTheme(opt.mode);
                            setIsThemeSubmenuOpen(false);
                          }}
                          className={clsx(
                            'flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-colors cursor-pointer text-left select-none',
                            isSelected
                              ? 'bg-[var(--brand-light)] text-[var(--brand-primary)] font-bold'
                              : 'text-[var(--fg-primary)] hover:bg-[var(--bg-elevated)]'
                          )}
                        >
                          <div className="flex items-center gap-2.5">
                            {opt.icon}
                            <span>{opt.label}</span>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-[var(--brand-primary)] stroke-[2.5]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="h-px bg-[var(--border-subtle)] my-0.5" />

              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(false);
                  setIsThemeSubmenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[var(--status-destructive)] hover:bg-[var(--status-destructive-bg)] rounded-xl transition-colors cursor-pointer text-left w-full"
              >
                <LogOut className="w-4 h-4" />
                <span>Keluar Sesi</span>
              </button>
            </div>
          )}

          {/* Clickable User Trigger Card */}
          <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className={clsx(
              'w-full p-3 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)]/80 border rounded-2xl flex items-center gap-3 shadow-xs group transition-all text-left cursor-pointer',
              isUserMenuOpen
                ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/20'
                : 'border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/40'
            )}
            aria-expanded={isUserMenuOpen}
            aria-haspopup="true"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-sm font-black shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <p className="text-xs font-bold text-[var(--fg-primary)] truncate group-hover:text-[var(--brand-primary)] transition-colors">
                {user?.name}
              </p>
              <p className="text-[10px] text-[var(--brand-primary)] font-extrabold truncate uppercase tracking-wider">
                {user?.roles?.[0]?.replace('_', ' ') || 'STAFF'}
              </p>
            </div>
            <ChevronUp
              className={clsx(
                'w-4 h-4 text-[var(--fg-muted)] group-hover:text-[var(--brand-primary)] transition-transform duration-200',
                isUserMenuOpen ? 'rotate-0 text-[var(--brand-primary)]' : 'rotate-180'
              )}
            />
          </button>
        </div>
      </div>
    </aside>
  );
}
