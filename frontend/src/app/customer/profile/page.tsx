'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Plus,
  LogOut,
  Shield,
  CreditCard,
  Building,
  Palette,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { apiClient } from '@/lib/api/client';
import { CustomerProfileModel, LocationModel } from '@/types/api.generated';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Modal } from '@/components/ui/modal';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeSelector } from '@/components/ui/theme-selector';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();

  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isSavingLoc, setIsSavingLoc] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login?redirect=/customer/profile');
    }
  }, [authLoading, isAuthenticated, router]);

  const { data: profile, isLoading, refetch } = useQuery<CustomerProfileModel>({
    queryKey: ['customer-profile-me'],
    queryFn: () => apiClient<CustomerProfileModel>('customers/profile/me'),
    enabled: isAuthenticated,
  });

  const handleAddLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;

    try {
      setIsSavingLoc(true);
      await apiClient('customers/locations', {
        method: 'POST',
        body: JSON.stringify({
          address: newAddress.trim(),
          notes: newNotes.trim() || undefined,
        }),
      });
      setIsAddLocationOpen(false);
      setNewAddress('');
      setNewNotes('');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan alamat');
    } finally {
      setIsSavingLoc(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight">
          Profil Pelanggan
        </h1>
        <p className="text-xs text-[var(--fg-muted)]">
          Kelola data akun, informasi kontak, dan daftar alamat pengerjaan
        </p>
      </div>

      {/* Profile Card */}
      <div className="liquid-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[var(--fg-primary)]">{user?.name}</h2>
            <p className="text-xs text-[var(--fg-muted)] mt-0.5">{user?.phone}</p>
            {user?.email && <p className="text-xs text-[var(--fg-muted)]">{user.email}</p>}
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--brand-light)] text-[var(--brand-primary)]">
              Kode Customer: {profile?.customerCode || 'CUST-MEMBER'}
            </span>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={logout} className="text-[var(--status-destructive)]">
          <LogOut className="w-4 h-4 mr-1.5" /> Keluar Sesi
        </Button>
      </div>

      {/* Transaction Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="liquid-card p-4 text-center">
          <span className="text-[11px] text-[var(--fg-muted)] font-medium block">Total Transaksi</span>
          <span className="text-xl font-black text-[var(--fg-primary)] mt-1 block">
            {profile?.totalTransaction || 0} Pesanan
          </span>
        </div>
        <div className="liquid-card p-4 text-center">
          <span className="text-[11px] text-[var(--fg-muted)] font-medium block">Total Belanja</span>
          <span className="text-xl font-black text-[var(--brand-primary)] mt-1 block">
            Rp {Number(profile?.totalSpending || 0).toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Saved Locations */}
      <div className="liquid-card p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <span>Alamat Tersimpan ({profile?.locations?.length || 0})</span>
          </h3>
          <Button size="sm" variant="primary" onClick={() => setIsAddLocationOpen(true)} leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Tambah Alamat
          </Button>
        </div>

        {profile?.locations && profile.locations.length > 0 ? (
          <div className="flex flex-col gap-2.5">
            {profile.locations.map((loc) => (
              <div key={loc.id} className="p-3.5 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] text-xs">
                <p className="font-semibold text-[var(--fg-primary)]">{loc.address}</p>
                {loc.notes && <p className="text-[11px] text-[var(--fg-muted)] mt-1">Patokan: {loc.notes}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--fg-muted)] py-4 text-center">Belum ada alamat tersimpan.</p>
        )}
      </div>

      {/* Theme Settings Card */}
      <div className="liquid-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--fg-primary)] flex items-center gap-2">
            <Palette className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>Tema Tampilan</span>
          </h3>
          <p className="text-xs text-[var(--fg-muted)] mt-0.5">
            Pilih mode tampilan System (otomatis), Terang (Light), atau Gelap (Dark).
          </p>
        </div>
        <ThemeSelector />
      </div>

      {/* Add Location Modal */}
      <Modal
        isOpen={isAddLocationOpen}
        onClose={() => setIsAddLocationOpen(false)}
        title="Tambah Alamat Baru"
      >
        <form onSubmit={handleAddLocationSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--fg-secondary)]">Alamat Lengkap</label>
            <textarea
              required
              rows={3}
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="Jl. Melati No. 45, RT 02/05..."
              className="w-full p-3 text-xs bg-[var(--bg-surface)] text-[var(--fg-primary)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            />
          </div>

          <TextField
            label="Catatan / Patokan Lokasi"
            placeholder="Contoh: Depan pos satpam"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
          />

          <Button type="submit" variant="primary" isLoading={isSavingLoc} className="w-full font-bold mt-2">
            Simpan Alamat
          </Button>
        </form>
      </Modal>
    </div>
  );
}
