'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({ isOpen, onClose, title, children, className }: BottomSheetProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Content */}
      <div
        role="dialog"
        aria-modal="true"
        className={twMerge(
          clsx(
            'relative z-10 w-full max-w-lg mx-auto bg-[var(--bg-surface)] border-t border-[var(--border-glass)] rounded-t-[2rem] shadow-2xl p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]',
            'animate-in slide-in-from-bottom duration-300',
            className
          )
        )}
      >
        {/* Handle Bar */}
        <div className="w-12 h-1.5 bg-[var(--border-strong)] rounded-full mx-auto mb-4" />

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-4">
            <div className="text-base font-bold text-[var(--fg-primary)]">{title}</div>
            <button
              onClick={onClose}
              className="touch-target text-[var(--fg-muted)] hover:text-[var(--fg-primary)] p-1 rounded-full"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="max-h-[75dvh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
