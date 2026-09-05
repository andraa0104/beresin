'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Wrench,
  Users,
  CreditCard,
  ArrowRight,
  UserPlus,
  ShieldCheck,
  Key,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { apiClient } from '@/lib/api/client';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { Modal } from '@/components/ui/modal';
import { TextField } from '@/components/ui/text-field';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/ui/status-badge';

export default function StaffOverviewPage() {
  const router = useRouter();
  const { isAuthenticated, isStaff, isSuperAdmin, isLoading: authLoading } = useAuth();

  // Super Admin Action States
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [assignRoleUser, setAssignRoleUser] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState('CUSTOMER_SERVICE');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New User Form State
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    role: 'CUSTOMER_SERVICE',
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isStaff)) {
      router.push('/auth/login?redirect=/staff');
    }
  }, [authLoading, isAuthenticated, isStaff, router]);

  // Fetch Dashboard Metrics
  const { data: dashboard, isLoading } = useQuery<any>({
    queryKey: ['admin-operations-dashboard'],
    queryFn: () => apiClient<any>('admin/operations/dashboard'),
    enabled: isAuthenticated && isStaff,
    refetchInterval: 15000,
  });

  // Fetch Users for Super Admin
  const { data: users, refetch: refetchUsers } = useQuery<any[]>({
    queryKey: ['staff-users-preview'],
    queryFn: () => apiClient<any[]>('users'),
    enabled: isAuthenticated && !!isSuperAdmin,
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
      refetchUsers();
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
      alert(`Role untuk ${assignRoleUser.name} berhasil diatur ke ${selectedRole}!`);
      setAssignRoleUser(null);
      refetchUsers();
    } catch (err: any) {
      alert(err.message || 'Gagal mengatur role');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-6xl">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const metrics = dashboard?.metrics || {};
  const urgentOrders = dashboard?.urgentOrders || [];

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      <div>
        <span className="text-xs font-bold text-[var(--brand-primary)] uppercase tracking-wider block">
          Pusat Kendali Operasional
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-[var(--fg-primary)] tracking-tight mt-0.5">
          Dashboard Operasional Staf
        </h1>
        <p className="text-xs text-[var(--fg-muted)]">
          Agregasi pesanan real-time, status mitra teknisi, dan antrean mendesak
        </p>
      </div>

      {/* 4 Core Operational Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mb-2">
            <span>Perlu Ditugaskan</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
            {metrics.waitingConfirmation || 0}
          </span>
          <span className="text-[11px] text-[var(--fg-muted)] mt-2">Menunggu penugasan mitra</span>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mb-2">
            <span>Sedang Berjalan</span>
            <Wrench className="w-4 h-4 text-sky-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">
            {(metrics.assigned || 0) + (metrics.inProgress || 0)}
          </span>
          <span className="text-[11px] text-[var(--fg-muted)] mt-2">Pengerjaan di lapangan</span>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mb-2">
            <span>Selesai Hari Ini</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {metrics.completed || 0}
          </span>
          <span className="text-[11px] text-[var(--fg-muted)] mt-2">Layanan tuntas</span>
        </GlassCard>

        <GlassCard className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mb-2">
            <span>Total Pendapatan</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-indigo-600 dark:text-indigo-400 truncate">
            Rp {Number(metrics.totalRevenue || 0).toLocaleString('id-ID')}
          </span>
          <span className="text-[11px] text-[var(--fg-muted)] mt-2">Akumulasi penjualan</span>
        </GlassCard>
      </div>

      {/* Quick Operational Actions Section */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-[var(--fg-primary)] flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-indigo-500" />
          <span>Aksi Cepat & Navigasi Modul</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/staff/orders"
            className="liquid-card liquid-card-interactive p-4 flex flex-col items-center justify-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--fg-primary)]">Tugaskan Order</span>
          </Link>

          <Link
            href="/staff/payments"
            className="liquid-card liquid-card-interactive p-4 flex flex-col items-center justify-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--fg-primary)]">Verifikasi Bayar</span>
          </Link>

          <Link
            href="/staff/promotions"
            className="liquid-card liquid-card-interactive p-4 flex flex-col items-center justify-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--fg-primary)]">Kupon & Banner</span>
          </Link>

          <Link
            href="/staff/mitra"
            className="liquid-card liquid-card-interactive p-4 flex flex-col items-center justify-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--fg-primary)]">Data Mitra</span>
          </Link>

          <Link
            href="/staff/analytics"
            className="liquid-card liquid-card-interactive p-4 flex flex-col items-center justify-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--fg-primary)]">Analytics Funnel</span>
          </Link>

          <Link
            href="/staff/users"
            className="liquid-card liquid-card-interactive p-4 flex flex-col items-center justify-center text-center gap-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[var(--fg-primary)]">User & Roles</span>
          </Link>
        </div>
      </div>

      {/* Urgent Orders Queue */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h2 className="text-base font-bold text-[var(--fg-primary)]">
              Antrean Pesanan Masuk (Perlu Tindakan)
            </h2>
          </div>
          <Link href="/staff/orders" className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1">
            Lihat Semua Pesanan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {urgentOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {urgentOrders.map((order: any) => (
              <GlassCard key={order.id} className="p-5 flex flex-col justify-between gap-3 border-amber-500/20">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-black text-[var(--fg-primary)]">
                      {order.orderNumber}
                    </span>
                    <h3 className="text-sm font-bold text-[var(--fg-primary)] mt-1">
                      {order.service?.name}
                    </h3>
                  </div>
                  <StatusBadge status={order.status} size="sm" />
                </div>

                <div className="text-xs text-[var(--fg-muted)] flex flex-col gap-0.5">
                  <p>Pemesan: <b className="text-[var(--fg-primary)]">{order.customer?.user?.name || 'Customer'}</b> ({order.customer?.user?.phone})</p>
                  <p className="line-clamp-1">Alamat: {order.location?.address || '-'}</p>
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between mt-auto">
                  <span className="text-sm font-black text-[var(--brand-primary)]">
                    Rp {Number(order.totalAmount).toLocaleString('id-ID')}
                  </span>
                  <Link href={`/orders/${order.id}`} className="text-xs font-bold text-[var(--brand-primary)] hover:underline">
                    Kelola Order →
                  </Link>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-[var(--bg-surface)] rounded-2xl border border-[var(--border-subtle)] text-xs text-[var(--fg-muted)]">
            Tidak ada antrean pesanan mendesak saat ini. Semua pesanan telah ditangani.
          </div>
        )}
      </div>

      {/* Super Admin Control Section (User & Role Management) */}
      {isSuperAdmin && (
        <div className="flex flex-col gap-4 pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent p-4 sm:p-5 rounded-2xl border border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Privilege Super Admin
                </span>
                <h2 className="text-base font-bold text-[var(--fg-primary)]">
                  Manajemen User & Pengaturan Role
                </h2>
                <p className="text-xs text-[var(--fg-muted)]">
                  Buat akun staf/operator baru dan sesuaikan hak akses peran sistem
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddUserOpen(true)}
                className="gap-1.5 font-bold shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                Tambah User Baru
              </Button>
              <Link href="/staff/users">
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <Users className="w-4 h-4" />
                  Semua User ({users?.length || 0})
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick User List with Role Action */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {users?.slice(0, 6).map((u) => {
              const roleList = u.userRoles?.map((ur: any) => ur.role?.name) || [];
              const primaryRole = roleList[0] || 'CUSTOMER';

              return (
                <GlassCard key={u.id} className="p-4 flex flex-col justify-between gap-3 border-[var(--border-subtle)] hover:border-purple-500/30 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-[var(--fg-primary)] truncate">
                          {u.name}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--fg-muted)] truncate mt-0.5">
                        {u.phone} {u.email ? `• ${u.email}` : ''}
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      primaryRole === 'SUPER_ADMIN'
                        ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                        : primaryRole === 'ADMIN'
                        ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                        : primaryRole === 'MITRA_SERVICE'
                        ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {primaryRole}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-xs">
                    <span className="text-[11px] text-[var(--fg-muted)]">
                      {roleList.length > 1 ? `+${roleList.length - 1} role lain` : 'Role Aktif'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedRole(primaryRole);
                        setAssignRoleUser(u);
                      }}
                      className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                    >
                      <Key className="w-3 h-3" /> Atur Role
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Tambah User Baru (Super Admin) */}
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

      {/* Modal Atur Role User (Super Admin) */}
      <Modal
        isOpen={!!assignRoleUser}
        onClose={() => setAssignRoleUser(null)}
        title={`Atur Hak Akses Role: ${assignRoleUser?.name}`}
      >
        <form onSubmit={handleAssignRoleSubmit} className="flex flex-col gap-4">
          <div className="p-3 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] text-xs">
            <p className="font-bold text-[var(--fg-primary)]">{assignRoleUser?.name}</p>
            <p className="text-[var(--fg-muted)]">{assignRoleUser?.phone} {assignRoleUser?.email ? `• ${assignRoleUser?.email}` : ''}</p>
            <p className="mt-1 text-[11px] text-[var(--brand-primary)]">
              Role Saat Ini: {assignRoleUser?.userRoles?.map((ur: any) => ur.role?.name).join(', ') || 'CUSTOMER'}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--fg-secondary)]">
              Pilih Role Baru:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full h-11 px-3 text-xs bg-[var(--bg-surface)] text-[var(--fg-primary)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
            >
              <option value="CUSTOMER">CUSTOMER (Pelanggan)</option>
              <option value="MITRA_SERVICE">MITRA_SERVICE (Teknisi Lapangan)</option>
              <option value="CUSTOMER_SERVICE">CUSTOMER_SERVICE (Customer Service)</option>
              <option value="MARKETING">MARKETING (Kupon & Promosi)</option>
              <option value="ADMIN">ADMIN (Operasional)</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN (Akses Tertinggi)</option>
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
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="font-bold"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Role'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
