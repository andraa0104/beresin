'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rect' | 'circle' | 'text';
}

export function Skeleton({ className, variant = 'rect', ...props }: SkeletonProps) {
  const variantClasses = {
    rect: 'rounded-[var(--radius-md)]',
    circle: 'rounded-full',
    text: 'rounded-[var(--radius-sm)] h-4 w-full',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'animate-pulse bg-[var(--bg-elevated)] border border-[var(--border-subtle)]/50',
          variantClasses[variant],
          className
        )
      )}
      {...props}
    />
  );
}
