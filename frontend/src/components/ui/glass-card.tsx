'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  strong?: boolean;
  interactive?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, strong = false, interactive = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            'rounded-[var(--radius-lg)] p-5 transition-all duration-200',
            strong ? 'liquid-glass-strong' : 'liquid-glass',
            interactive &&
              'cursor-pointer hover:border-[var(--brand-primary)] hover:shadow-lg active:scale-[0.99]',
            className
          )
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
