'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { ProductTable } from '@/components/organisms/ProductTable';
import { SearchBar, FilterBar } from '@/components/molecules';
import { Button } from '@/components/atoms';
import { mockProducts } from '@/lib/mock-data';

export default function ManagerProductsPage() {
  const t = useTranslations('manager.products');
  const [filteredProducts, setFilteredProducts] = React.useState(mockProducts);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredProducts(mockProducts);
      return;
    }
    const filtered = mockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.sku.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  const filters = [
    {
      name: 'category',
      label: t('filters.category'),
      options: [
        { value: '', label: 'All Categories' },
        { value: 'sunglasses', label: 'Sunglasses' },
        { value: 'eyeglasses', label: 'Eyeglasses' },
        { value: 'sports', label: 'Sports' },
        { value: 'computer', label: 'Computer Glasses' },
      ],
    },
    {
      name: 'status',
      label: t('filters.status'),
      options: [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'out_of_stock', label: 'Out of Stock' },
      ],
    },
  ];

  const handleFilterChange = (filters: Record<string, string>) => {
    let filtered = [...mockProducts];

    if (filters.category) {
      filtered = filtered.filter((p) =>
        p.category.toLowerCase().includes(filters.category.toLowerCase())
      );
    }

    if (filters.status) {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    setFilteredProducts(filtered);
  };

  return (
    <div className="space-y-8">
      {/* Page Header with Decorative Elements */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-200 to-purple-200 opacity-30 blur-3xl" />
        <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-30 blur-3xl" />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 p-3 shadow-lg shadow-indigo-500/30">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-4xl font-bold text-transparent">
                {t('title')}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-gray-600">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500" />
                {t('subtitle')}
              </p>
            </div>
          </div>
          <Button variant="primary" className="shadow-xl shadow-indigo-500/30">
            <svg
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t('addProduct')}
          </Button>
        </div>
      </div>

      {/* Search Section */}
      <div className="flex items-center justify-between gap-4">
        <SearchBar
          placeholder={t('searchPlaceholder')}
          onChange={handleSearch}
        />
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={() => setFilteredProducts(mockProducts)}
      />

      <ProductTable
        products={filteredProducts}
        onEdit={(product) => console.log('Edit:', product)}
        onDelete={(product) => console.log('Delete:', product)}
        onView={(product) => console.log('View:', product)}
      />
    </div>
  );
}
