'use client';

import React from 'react';
import { LucideIcon, Inbox, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-[var(--radius-xl)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] ${className}`}>
      <div className="w-14 h-14 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--fg-muted)] mb-4 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-[var(--fg-primary)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--fg-muted)] max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Gagal Memuat Data',
  message = 'Terjadi gangguan saat menghubungkan ke server. Silakan coba beberapa saat lagi.',
  onRetry,
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-[var(--radius-xl)] border border-[var(--status-destructive-border)] bg-[var(--status-destructive-bg)] ${className}`}>
      <div className="w-14 h-14 rounded-full bg-red-500/20 text-[var(--status-destructive)] flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-[var(--fg-primary)] mb-1">{title}</h3>
      <p className="text-xs text-[var(--fg-secondary)] max-w-sm mb-5 leading-relaxed">{message}</p>
      {onRetry && (
        <Button size="sm" onClick={onRetry} variant="secondary" leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Coba Lagi
        </Button>
      )}
    </div>
  );
}
