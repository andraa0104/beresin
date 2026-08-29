'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none rounded-[var(--radius-md)] cursor-pointer';

    const variants = {
      primary:
        'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-hover)] shadow-sm hover:shadow-[var(--shadow-glow)]',
      secondary:
        'bg-[var(--bg-elevated)] text-[var(--fg-primary)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)]',
      glass:
        'bg-[var(--bg-glass)] backdrop-blur-md text-[var(--fg-primary)] border border-[var(--border-glass)] shadow-[var(--shadow-glass)] hover:bg-[var(--bg-glass-strong)]',
      outline:
        'border border-[var(--border-strong)] bg-transparent text-[var(--fg-primary)] hover:bg-[var(--bg-elevated)]',
      ghost:
        'bg-transparent text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-elevated)]',
      destructive:
        'bg-[var(--status-destructive)] text-white hover:opacity-90 shadow-sm',
    };

    const sizes = {
      sm: 'text-xs h-9 px-3 gap-1.5 min-w-[36px]',
      md: 'text-sm h-11 px-4 gap-2 min-h-[44px]',
      lg: 'text-base h-13 px-6 gap-2.5 min-h-[48px] rounded-[var(--radius-lg)] font-semibold',
      icon: 'h-11 w-11 min-h-[44px] min-w-[44px] p-0 rounded-full',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
