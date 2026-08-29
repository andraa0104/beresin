'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { LogIn, Phone, Lock, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { TextField, PasswordField } from '@/components/ui/text-field';
import { GlassCard } from '@/components/ui/glass-card';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneOrEmail.trim() || !password) {
      setError('Mohon isi nomor telepon/email dan password Anda.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await apiClient<{ user: any; token: string }>('auth/login', {
        method: 'POST',
        body: JSON.stringify({
          phoneOrEmail: phoneOrEmail.trim(),
          password,
        }),
      });

      login(res.user, res.token);

      // Smart Redirect based on role
      const roles: string[] = res.user?.roles || [];
      if (roles.includes('MITRA_SERVICE')) {
        router.push('/mitra');
      } else if (roles.some((r) => ['ADMIN', 'SUPER_ADMIN', 'MARKETING', 'CUSTOMER_SERVICE'].includes(r))) {
        router.push('/staff');
      } else {
        router.push(redirect);
      }
    } catch (err: any) {
      setError(err.message || 'Kredensial tidak valid. Silakan periksa kembali.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 flex flex-col gap-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-colors w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Beranda</span>
      </Link>

      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white text-xl font-black mx-auto mb-3 shadow-md">
          B
        </div>
        <h1 className="text-2xl font-black text-[var(--fg-primary)] tracking-tight">
          Masuk ke Beresin
        </h1>
        <p className="text-xs text-[var(--fg-muted)] mt-1">
          Gunakan nomor telepon atau email yang terdaftar
        </p>
      </div>

      <GlassCard className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Nomor Telepon atau Email"
            placeholder="081234567890 atau email@example.com"
            required
            value={phoneOrEmail}
            onChange={(e) => {
              setPhoneOrEmail(e.target.value);
              setError(null);
            }}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <PasswordField
            label="Password"
            placeholder="Masukkan password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            leftIcon={<Lock className="w-4 h-4" />}
          />

          {error && (
            <div className="p-3 bg-[var(--status-destructive-bg)] border border-[var(--status-destructive-border)] rounded-xl text-xs text-[var(--status-destructive)] font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" size="lg" variant="primary" isLoading={isLoading} className="w-full font-bold mt-2">
            Masuk Akun <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] text-center">
          <p className="text-xs text-[var(--fg-muted)]">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="font-bold text-[var(--brand-primary)] hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--fg-muted)]">Memuat halaman login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
