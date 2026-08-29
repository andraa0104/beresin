'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { PublicHeader } from './public-header';
import { MobileBottomNav } from './mobile-bottom-nav';
import { DesktopSidebar } from './desktop-sidebar';
import { OfflineBanner, InstallPromptBanner } from './offline-banner';
import { ThemeSelector } from '@/components/ui/theme-selector';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStaffRoute = pathname.startsWith('/staff');
  const isMitraRoute = pathname.startsWith('/mitra');
  const isAuthRoute = pathname.startsWith('/auth');

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-base)] text-[var(--fg-primary)] transition-colors">
      <OfflineBanner />
      {!isAuthRoute && <PublicHeader />}

      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {(isStaffRoute || isMitraRoute) && <DesktopSidebar />}
        <main
          id="main-content"
          className="flex-1 w-full p-4 sm:p-6 md:p-8 pb-24 md:pb-12 max-w-full overflow-x-hidden"
        >
          {children}
        </main>
      </div>

      {/* Clean Public Footer (Non-Intrusive) */}
      {!isAuthRoute && !isStaffRoute && !isMitraRoute && (
        <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-6 px-4 sm:px-6 mb-16 md:mb-0 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--fg-muted)]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--fg-primary)]">Beresin.id</span>
              <span>© {new Date().getFullYear()} PT Beresin Solusi Indonesia. Seluruh hak cipta dilindungi.</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-[11px] font-medium">Tema:</span>
              <ThemeSelector />
            </div>
          </div>
        </footer>
      )}

      <InstallPromptBanner />
      {!isAuthRoute && <MobileBottomNav />}
    </div>
  );
}
