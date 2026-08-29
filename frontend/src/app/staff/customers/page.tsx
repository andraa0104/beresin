'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Phone, ShoppingBag, CreditCard } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { CustomerProfileModel } from '@/types/api.generated';
import { GlassCard } from '@/components/ui/glass-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function StaffCustomersPage() {
  const { data: customers, isLoading } = useQuery<CustomerProfileModel[]>({
    queryKey: ['staff-customers-list'],
    queryFn: () => apiClient<CustomerProfileModel[]>('customers'),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 max-w-5xl">
        <Skeleton className="h-8 w-64 rounded-xl" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl pb-16">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-[var(--fg-primary)] tracking-tight">
          Data Pelanggan (Customer Directory)
        </h1>
        <p className="text-xs text-[var(--fg-muted)]">
          Daftar pelanggan terdaftar beserta riwayat total transaksi dan spending
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers?.map((cust) => (
          <GlassCard key={cust.id} className="p-5 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-wider">
                {cust.customerCode}
              </span>
              <h3 className="text-sm font-bold text-[var(--fg-primary)] mt-1">
                {cust.user?.name || 'Customer'}
              </h3>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {cust.user?.phone}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--border-subtle)] mt-4 flex items-center justify-between text-xs">
              <span className="text-[var(--fg-muted)]">
                {cust.totalTransaction || 0} Order
              </span>
              <span className="font-bold text-[var(--brand-primary)]">
                Rp {Number(cust.totalSpending || 0).toLocaleString('id-ID')}
              </span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
