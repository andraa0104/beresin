'use client';

import React from 'react';
import { Sun, Moon, Laptop } from 'lucide-react';
import { useTheme, ThemeMode } from '@/lib/theme/theme-context';
import { clsx } from 'clsx';

export function ThemeSelector({
  className = '',
  fullWidth = false,
}: {
  className?: string;
  fullWidth?: boolean;
}) {
  const { theme, setTheme } = useTheme();

  const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'system', label: 'System', icon: <Laptop className="w-3.5 h-3.5 shrink-0" /> },
    { mode: 'light', label: 'Terang', icon: <Sun className="w-3.5 h-3.5 shrink-0" /> },
    { mode: 'dark', label: 'Gelap', icon: <Moon className="w-3.5 h-3.5 shrink-0" /> },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Pilih tema tampilan"
      className={clsx(
        'p-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl shadow-xs',
        fullWidth ? 'grid grid-cols-3 w-full gap-1' : 'inline-flex items-center gap-1',
        className
      )}
    >
      {options.map(({ mode, label, icon }) => {
        const isSelected = theme === mode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => setTheme(mode)}
            className={clsx(
              'flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer select-none',
              isSelected
                ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)] shadow-sm font-bold border border-[var(--border-glass)]'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-surface)]/50'
            )}
          >
            {icon}
            <span className="truncate">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
