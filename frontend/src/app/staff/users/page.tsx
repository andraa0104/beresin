'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Users, Shield, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Modal } from '@/components/ui/modal';
import { TextField } from '@/components/ui/text-field';
import { Skeleton } from '@/components/ui/skeleton';

export default function StaffUsersPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, isSuperAdmin, isLoading: authLoading } = useAuth();
  const [assignRoleUser, setAssignRoleUser] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState('CUSTOMER_SERVICE');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newUserForm, setNewUserForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'CUSTOMER_SERVICE',
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (!isAdmin && !isSuperAdmin))) {
      router.push('/auth/login?redirect=/staff/users');
    }
  }, [authLoading, isAuthenticated, isAdmin, isSuperAdmin, router]);

  const { data: users, isLoading, refetch } = useQuery<any[]>({
    queryKey: ['staff-all-users'],
    queryFn: () => apiClient<any[]>('users'),
    enabled: isAuthenticated && (isAdmin || isSuperAdmin),
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.phone) {
      alert('Nama dan Nomor Telepon wajib diisi');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient('users', {
        method: 'POST',
        body: JSON.stringify({
          name: newUserForm.name,
          phone: newUserForm.phone,
          email: newUserForm.email || undefined,
          password: newUserForm.password || 'password123',
          role: newUserForm.role,
        }),
      });
      alert(`User "${newUserForm.name}" berhasil dibuat dengan role ${newUserForm.role}!`);
      setIsAddUserOpen(false);
      setNewUserForm({
        name: '',
        phone: '',
        email: '',
        password: '',
        role: 'CUSTOMER_SERVICE',
      });
      refetch();
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignRoleUser) return;

    try {
      setIsSubmitting(true);
      await apiClient(`users/${assignRoleUser.id}/roles/sync`, {
        method: 'POST',
        body: JSON.stringify({ roles: [selectedRole] }),
      });
      setAssignRoleUser(null);
      alert('Role berhasil diperbarui!');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah role');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl">
        <Skeleton className="h-8 w-64 rounded-xl" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight">
            Manajemen User & Role (RBAC)
          </h1>
          <p className="text-xs text-[var(--fg-muted)]">
            Kelola akun pengguna, hak akses peran operasional, dan staf sistem
          </p>
        </div>

        {isSuperAdmin && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddUserOpen(true)}
            className="font-bold gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah User Baru
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {users?.map((u) => {
          const roleNames = u.userRoles?.map((ur: any) => ur.role?.name) || [];
          const currentRole = roleNames[0] || 'CUSTOMER';

          return (
            <GlassCard key={u.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[var(--fg-primary)]">{u.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)] font-extrabold">
                    {roleNames.join(', ') || 'CUSTOMER'}
                  </span>
                </div>
                <p className="text-xs text-[var(--fg-muted)] mt-0.5">{u.phone} {u.email ? `• ${u.email}` : ''}</p>
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setSelectedRole(currentRole);
                  setAssignRoleUser(u);
                }}
              >
                Ubah Role
              </Button>
            </GlassCard>
          );
        })}
      </div>

      {/* Tambah User Modal (Super Admin) */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Tambah User Baru (Super Admin)"
      >
        <form onSubmit={handleCreateUser} className="flex flex-col gap-3.5">
          <TextField
            label="Nama Lengkap"
            placeholder="Contoh: Budi Santoso"
            value={newUserForm.name}
            onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
            required
          />

          <TextField
            label="Nomor WhatsApp / Telepon"
            placeholder="Contoh: 081234567890"
            value={newUserForm.phone}
            onChange={(e) => setNewUserForm({ ...newUserForm, phone: e.target.value })}
            required
          />

          <TextField
            label="Email (Opsional)"
            type="email"
            placeholder="Contoh: budi@beresin.id"
            value={newUserForm.email}
            onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
          />

          <TextField
            label="Password Akun"
            type="password"
            placeholder="Minimal 6 karakter (default: password123)"
            value={newUserForm.password}
            onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--fg-secondary)]">
              Peran & Hak Akses (Role):
            </label>
            <select
              value={newUserForm.role}
              onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
              className="w-full h-11 px-3 text-xs bg-[var(--bg-surface)] text-[var(--fg-primary)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <option value="CUSTOMER">CUSTOMER (Pelanggan)</option>
              <option value="MITRA_SERVICE">MITRA_SERVICE (Teknisi Lapangan)</option>
              <option value="CUSTOMER_SERVICE">CUSTOMER_SERVICE (Layanan Pelanggan)</option>
              <option value="MARKETING">MARKETING (Promosi & Kupon)</option>
              <option value="ADMIN">ADMIN (Operasional Staf)</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN (Penuh)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddUserOpen(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="font-bold"
            >
              {isSubmitting ? 'Menyimpan...' : 'Buat User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Assign Role Modal */}
      <Modal
        isOpen={!!assignRoleUser}
        onClose={() => setAssignRoleUser(null)}
        title={`Ubah Role untuk ${assignRoleUser?.name}`}
      >
        <form onSubmit={handleAssignRoleSubmit} className="flex flex-col gap-4">
          <div className="p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] text-xs">
            <p className="font-bold text-[var(--fg-primary)]">{assignRoleUser?.name}</p>
            <p className="text-[var(--fg-muted)]">{assignRoleUser?.phone} {assignRoleUser?.email ? `• ${assignRoleUser?.email}` : ''}</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--fg-secondary)]">Pilih Role Akses:</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[var(--bg-surface)] text-[var(--fg-primary)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              {['CUSTOMER', 'MITRA_SERVICE', 'CUSTOMER_SERVICE', 'MARKETING', 'ADMIN', 'SUPER_ADMIN'].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setAssignRoleUser(null)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" variant="primary" className="font-bold" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Role'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
