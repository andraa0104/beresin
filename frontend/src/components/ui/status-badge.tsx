'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  OrderStatus,
  PaymentStatus,
  AssignmentStatus,
  MitraStatus,
} from '@/types/api.generated';

export type AnyStatus =
  | OrderStatus
  | PaymentStatus
  | AssignmentStatus
  | MitraStatus
  | string;

interface StatusBadgeProps {
  status: AnyStatus;
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const meta = getStatusMetadata(status);

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors',
          meta.bg,
          meta.text,
          meta.border,
          size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs',
          className
        )
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', meta.dot)} />
      {meta.label}
    </span>
  );
}

function getStatusMetadata(status: AnyStatus): {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (status) {
    // Order Statuses
    case OrderStatus.WAITING_CONFIRMATION:
      return {
        label: 'Menunggu Konfirmasi',
        bg: 'bg-amber-500/10 dark:bg-amber-500/15',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-500/30',
        dot: 'bg-amber-500',
      };
    case OrderStatus.ASSIGNED:
      return {
        label: 'Mitra Ditugaskan',
        bg: 'bg-blue-500/10 dark:bg-blue-500/15',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-500/30',
        dot: 'bg-blue-500',
      };
    case OrderStatus.ACCEPTED:
      return {
        label: 'Diterima Teknisi',
        bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
        text: 'text-cyan-700 dark:text-cyan-400',
        border: 'border-cyan-500/30',
        dot: 'bg-cyan-500',
      };
    case OrderStatus.ON_THE_WAY:
      return {
        label: 'Teknisi Menuju Lokasi',
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
        text: 'text-indigo-700 dark:text-indigo-400',
        border: 'border-indigo-500/30',
        dot: 'bg-indigo-500 animate-pulse',
      };
    case OrderStatus.ARRIVED:
      return {
        label: 'Tiba di Lokasi',
        bg: 'bg-purple-500/10 dark:bg-purple-500/15',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-500/30',
        dot: 'bg-purple-500',
      };
    case OrderStatus.IN_PROGRESS:
      return {
        label: 'Sedang Dikerjakan',
        bg: 'bg-sky-500/10 dark:bg-sky-500/15',
        text: 'text-sky-700 dark:text-sky-400',
        border: 'border-sky-500/30',
        dot: 'bg-sky-500 animate-spin',
      };
    case OrderStatus.WAITING_APPROVAL:
      return {
        label: 'Menunggu Persetujuan',
        bg: 'bg-orange-500/10 dark:bg-orange-500/15',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-500/30',
        dot: 'bg-orange-500',
      };
    case OrderStatus.COMPLETED:
      return {
        label: 'Pekerjaan Selesai',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-500',
      };
    case OrderStatus.WAITING_PAYMENT:
      return {
        label: 'Menunggu Pembayaran',
        bg: 'bg-yellow-500/10 dark:bg-yellow-500/15',
        text: 'text-yellow-700 dark:text-yellow-400',
        border: 'border-yellow-500/30',
        dot: 'bg-yellow-500',
      };
    case OrderStatus.PAID:
      return {
        label: 'Lunas',
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-500',
      };
    case OrderStatus.CANCELLED:
      return {
        label: 'Dibatalkan',
        bg: 'bg-rose-500/10 dark:bg-rose-500/15',
        text: 'text-rose-700 dark:text-rose-400',
        border: 'border-rose-500/30',
        dot: 'bg-rose-500',
      };

    // Payment Statuses
    case PaymentStatus.WAITING_PAYMENT_VERIFICATION:
      return {
        label: 'Verifikasi Pembayaran',
        bg: 'bg-blue-500/10 dark:bg-blue-500/15',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-500/30',
        dot: 'bg-blue-500 animate-pulse',
      };
    case PaymentStatus.WAITING_ADMIN_CONFIRMATION:
      return {
        label: 'Konfirmasi Kasir/Admin',
        bg: 'bg-indigo-500/10 dark:bg-indigo-500/15',
        text: 'text-indigo-700 dark:text-indigo-400',
        border: 'border-indigo-500/30',
        dot: 'bg-indigo-500',
      };
    case PaymentStatus.REJECTED:
      return {
        label: 'Pembayaran Ditolak',
        bg: 'bg-red-500/10 dark:bg-red-500/15',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-500/30',
        dot: 'bg-red-500',
      };

    default:
      return {
        label: String(status).replace(/_/g, ' '),
        bg: 'bg-slate-500/10 dark:bg-slate-500/15',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-500/30',
        dot: 'bg-slate-500',
      };
  }
}
