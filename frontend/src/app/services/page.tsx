'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search, Wrench, ArrowRight, Filter } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { ServiceCategoryModel, ServiceModel } from '@/types/api.generated';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';

function ServicesContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('categoryId') || '';

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  // 1. Fetch Categories
  const { data: categories } = useQuery<ServiceCategoryModel[]>({
    queryKey: ['service-categories'],
    queryFn: () => apiClient<ServiceCategoryModel[]>('services/categories'),
  });

  // 2. Fetch Services with Filters
  const { data: services, isLoading } = useQuery<ServiceModel[]>({
    queryKey: ['services', selectedCategory, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      return apiClient<ServiceModel[]>(`services?${params.toString()}`);
    },
  });

  // Filter client-side if search query entered
  const filteredServices = (services || []).filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || (s.description && s.description.toLowerCase().includes(q));
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--fg-primary)] tracking-tight">
            Katalog Seluruh Layanan & Jasa
          </h1>
          <p className="text-xs sm:text-sm text-[var(--fg-muted)] mt-1">
            Temukan solusi perbaikan, perawatan, instalasi, dan bantuan teknisi untuk semua kebutuhan Anda
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--fg-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari layanan..."
            className="w-full h-11 pl-10 pr-4 text-sm bg-[var(--bg-surface)] text-[var(--fg-primary)] border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]"
          />
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === ''
              ? 'bg-[var(--brand-primary)] text-white shadow-sm'
              : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--fg-secondary)] hover:border-[var(--brand-primary)]'
          }`}
        >
          Semua Kategori
        </button>
        {categories?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(String(cat.id))}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === String(cat.id)
                ? 'bg-[var(--brand-primary)] text-white shadow-sm'
                : 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--fg-secondary)] hover:border-[var(--brand-primary)]'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Service List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-52 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => {
            const lowestPrice =
              service.packages && service.packages.length > 0
                ? Math.min(...service.packages.map((p) => Number(p.price)))
                : null;

            return (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="liquid-card liquid-card-interactive p-5 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold text-[var(--fg-primary)] group-hover:text-[var(--brand-primary)] transition-colors line-clamp-1">
                      {service.name}
                    </h3>
                    {service.category && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--bg-elevated)] text-[var(--fg-secondary)] shrink-0">
                        {service.category.name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--fg-muted)] line-clamp-2 leading-relaxed mb-4">
                    {service.description || 'Layanan teknisi terverifikasi dengan jaminan garansi pengerjaan.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-[10px] text-[var(--fg-muted)] block">Mulai dari</span>
                    <span className="text-sm font-extrabold text-[var(--brand-primary)]">
                      {lowestPrice !== null
                        ? `Rp ${lowestPrice.toLocaleString('id-ID')}`
                        : 'Konsultasi CS'}
                    </span>
                  </div>
                  <Button size="sm" variant="primary" className="rounded-xl px-3 py-1 text-xs">
                    Pilih Layanan
                  </Button>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Wrench}
          title="Layanan Tidak Ditemukan"
          description="Coba ubah kata kunci pencarian atau pilih kategori yang lain."
          actionLabel="Reset Filter"
          onAction={() => {
            setSearch('');
            setSelectedCategory('');
          }}
        />
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-[var(--fg-muted)]">Memuat katalog layanan...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
