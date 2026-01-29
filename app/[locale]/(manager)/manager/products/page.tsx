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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-gray-600">{t('subtitle')}</p>
        </div>
        <Button variant="primary">
          <svg
            className="mr-2 h-4 w-4"
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
