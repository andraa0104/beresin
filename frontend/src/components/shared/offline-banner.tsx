'use client';

import React from 'react';
import { WifiOff, Download, X } from 'lucide-react';
import { usePwa } from '@/lib/pwa/pwa-context';
import { Button } from '@/components/ui/button';

export function OfflineBanner() {
  const { isOnline } = usePwa();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="sticky top-0 z-50 bg-[var(--status-destructive)] text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-200"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Koneksi internet terputus. Mode offline aktif.</span>
    </div>
  );
}

export function InstallPromptBanner() {
  const { isInstallable, promptInstall } = usePwa();
  const [dismissed, setDismissed] = React.useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 liquid-glass-strong rounded-[var(--radius-lg)] p-4 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md">
          <Download className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-[var(--fg-primary)]">Pasang Aplikasi Beresin</h4>
          <p className="text-[11px] text-[var(--fg-muted)]">Akses cepat & pengalaman seperti aplikasi native.</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <Button size="sm" variant="primary" onClick={promptInstall}>
          Pasang
        </Button>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 text-[var(--fg-muted)] hover:text-[var(--fg-primary)] rounded-full"
          aria-label="Tutup saran instalasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
