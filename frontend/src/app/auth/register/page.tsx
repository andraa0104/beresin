'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, User, Phone, Mail, Lock, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { TextField, PasswordField } from '@/components/ui/text-field';
import { GlassCard } from '@/components/ui/glass-card';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !password) {
      setError('Mohon lengkapi nama, nomor telepon, dan password.');
      return;
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await apiClient<{ user: any; token: string }>('auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          password,
        }),
      });

      login(res.user, res.token);
      router.push('/services');
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Nomor telepon mungkin sudah digunakan.');
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
          Daftar Akun Beresin
        </h1>
        <p className="text-xs text-[var(--fg-muted)] mt-1">
          Dapatkan kemudahan pemesanan service terpercaya dan jaminan garansi
        </p>
      </div>

      <GlassCard className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField
            label="Nama Lengkap"
            placeholder="Contoh: Budi Santoso"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            leftIcon={<User className="w-4 h-4" />}
          />

          <TextField
            label="Nomor WhatsApp / Telepon"
            placeholder="Contoh: 081234567890"
            required
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setError(null);
            }}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          <TextField
            label="Email (Opsional)"
            placeholder="budi@example.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <PasswordField
            label="Password"
            placeholder="Minimal 6 karakter"
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
            Daftar Sekarang <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] text-center">
          <p className="text-xs text-[var(--fg-muted)]">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="font-bold text-[var(--brand-primary)] hover:underline">
              Masuk di Sini
            </Link>
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
