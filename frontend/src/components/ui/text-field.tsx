'use client';

import React, { useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-[var(--fg-secondary)]">
            {label}
            {props.required && <span className="text-[var(--status-destructive)] ml-0.5">*</span>}
          </label>
        )}
        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[var(--fg-muted)]">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={twMerge(
              clsx(
                'w-full h-11 px-3.5 text-sm bg-[var(--bg-surface)] text-[var(--fg-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] transition-all duration-150',
                'placeholder:text-[var(--fg-subtle)]',
                'focus:outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--focus-ring)]',
                'disabled:opacity-50 disabled:bg-[var(--bg-elevated)]',
                leftIcon && 'pl-10',
                rightIcon && 'pr-10',
                error && 'border-[var(--status-destructive)] focus:ring-[var(--status-destructive-bg)]',
                className
              )
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-[var(--fg-muted)]">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-[var(--status-destructive)] font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[var(--fg-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

TextField.displayName = 'TextField';

export const PasswordField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <TextField
        type={showPassword ? 'text' : 'password'}
        ref={ref}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="p-1 hover:text-[var(--fg-primary)] transition-colors focus:outline-none"
            aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordField.displayName = 'PasswordField';
