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

  const { data: roles } = useQuery<any[]>({
    queryKey: ['all-roles'],
    queryFn: () => apiClient<any[]>('roles'),
    enabled: isAuthenticated && (isAdmin || isSuperAdmin),
  });

  const handleAssignRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignRoleUser) return;

    try {
      await apiClient(`users/${assignRoleUser.id}/roles`, {
        method: 'POST',
        body: JSON.stringify({ role: selectedRole }),
      });
      setAssignRoleUser(null);
      alert('Role berhasil diperbarui!');
      refetch();
    } catch (err: any) {
      alert(err.message || 'Gagal mengubah role');
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
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight">
          Manajemen User & Role (RBAC)
        </h1>
        <p className="text-xs text-[var(--fg-muted)]">
          Kelola akun pengguna, hak akses peran operasional, dan staf sistem
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {users?.map((u) => (
          <GlassCard key={u.id} className="p-4 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[var(--fg-primary)]">{u.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)] font-extrabold">
                  {u.userRoles?.map((ur: any) => ur.role?.name).join(', ') || 'CUSTOMER'}
                </span>
              </div>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5">{u.phone} {u.email ? `• ${u.email}` : ''}</p>
            </div>

            <Button size="sm" variant="secondary" onClick={() => setAssignRoleUser(u)}>
              Ubah Role
            </Button>
          </GlassCard>
        ))}
      </div>

      {/* Assign Role Modal */}
      <Modal
        isOpen={!!assignRoleUser}
        onClose={() => setAssignRoleUser(null)}
        title={`Ubah Role untuk ${assignRoleUser?.name}`}
      >
        <form onSubmit={handleAssignRoleSubmit} className="flex flex-col gap-4">
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

          <Button type="submit" variant="primary" className="w-full font-bold mt-2">
            Simpan Perubahan Role
          </Button>
        </form>
      </Modal>
    </div>
  );
}
