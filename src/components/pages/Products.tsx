'use client';
import { Header } from '@/components/organisms/Header';
import { ProductGrid } from '@/components/organisms/ProductGrid';

import { Filter, Grid, List } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/atoms';

const categories = [
  'Tất cả',
  'Kính mát',
  'Gọng kính',
  'Tròng kính',
  'Phụ kiện',
];

const Products = () => {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <>
      <Header
        title="Sản phẩm"
        subtitle="Quản lý kho hàng mắt kính"
        showAddButton
        addButtonLabel="Thêm sản phẩm"
        titleClassName="text-black"
        subtitleClassName="text-black"
      />

      <div className="space-y-6 p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant="outline"
                size="sm"
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'text-black hover:opacity-90',
                  activeCategory === cat &&
                    'border-yellow-400 bg-yellow-400 text-black hover:bg-yellow-500'
                )}
              >
                {cat}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gradient-gold gap-2 text-black hover:opacity-90"
            >
              <Filter className="h-4 w-4" />
              Bộ lọc
            </Button>
            <div className="border-border flex overflow-hidden rounded-lg border">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'rounded-none text-black hover:opacity-90',
                  viewMode === 'grid' ? 'gradient-gold' : 'opacity-70'
                )}
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'rounded-none text-black hover:opacity-90',
                  viewMode === 'list' ? 'gradient-gold' : 'opacity-70'
                )}
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <ProductGrid />
      </div>
    </>
  );
};

export default Products;
