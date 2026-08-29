'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className={twMerge(
          clsx(
            'relative w-full z-10 bg-[var(--bg-surface)] border border-[var(--border-glass)] rounded-[var(--radius-xl)] shadow-2xl p-6 overflow-hidden',
            'animate-in zoom-in-95 duration-200',
            maxWidthClasses[maxWidth]
          )
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              {title && typeof title === 'string' ? (
                <h3 className="text-lg font-bold text-[var(--fg-primary)] tracking-tight">
                  {title}
                </h3>
              ) : (
                title
              )}
              {description && (
                <p className="text-xs text-[var(--fg-muted)] mt-1">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="touch-target text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-elevated)] rounded-full transition-colors"
                aria-label="Tutup dialog"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="max-h-[80vh] overflow-y-auto pr-1">{children}</div>
      </div>
    </div>
  );
}
