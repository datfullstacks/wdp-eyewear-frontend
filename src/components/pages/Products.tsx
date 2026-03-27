'use client';
import { Header } from '@/components/organisms/Header';
import {
  ProductGrid,
  ProductCardItem,
} from '@/components/organisms/ProductGrid';
import { SearchBar } from '@/components/molecules/SearchBar';

import { Filter, Grid, List } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/atoms';
import productApi, { Product, ProductDetail } from '@/api/products';
import { ProductDetailModalContent } from './ProductDetailModalContent';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categoryFilterKeys = [
  { type: 'all', key: 'all' },
  { type: 'sunglasses', key: 'sunglasses' },
  { type: 'frame', key: 'frame' },
  { type: 'lens', key: 'lens' },
  { type: 'accessory', key: 'accessory' },
];

const typeLabels: Record<string, string> = {
  sunglasses: 'Kính mát',
  frame: 'Gọng kính',
  lens: 'Tròng kính',
  contact_lens: 'Tròng kính',
  accessory: 'Phụ kiện',
  service: 'Dịch vụ',
  bundle: 'Gói',
  gift_card: 'Thẻ quà tặng',
  other: 'Khác',
};

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

const Products = () => {
  const t = useTranslations('manager.products');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailLoadingId, setDetailLoadingId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<ProductDetail | null>(
    null
  );
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await productApi.getAll();
        if (isMounted) {
          setProducts(result.products);
        }
      } catch (err) {
        if (isMounted) {
          const message =
            (
              err as {
                response?: { data?: { message?: string } };
                message?: string;
              }
            )?.response?.data?.message ||
            (err as { message?: string })?.message ||
            'Không thể tải sản phẩm. Vui lòng thử lại.';
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    let rows =
      activeCategory === 'all'
        ? products
        : products.filter(
            (product) =>
              product.type === activeCategory ||
              product.category === activeCategory
          );

    if (q) {
      rows = rows.filter((product) => product.name.toLowerCase().includes(q));
    }

    return rows;
  }, [activeCategory, products, searchTerm]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredProducts.length / pageSize);
  }, [filteredProducts.length, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, pageSize, searchTerm]);

  useEffect(() => {
    if (totalPages <= 0) return;
    setCurrentPage((p) => Math.min(Math.max(1, p), totalPages));
  }, [totalPages]);

  const paginatedProducts = useMemo(() => {
    if (filteredProducts.length === 0) return [];
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [currentPage, filteredProducts, pageSize]);

  const gridItems: ProductCardItem[] = useMemo(
    () =>
      paginatedProducts.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        stock: product.stock,
        image: product.imageUrl,
        category: typeLabels[product.type] || product.category || product.type,
      })),
    [paginatedProducts]
  );

  const handlePreviewProduct = async (productId: string) => {
    if (!productId) return;
    setDetailOpen(true);
    setDetailProduct(null);
    setDetailError(null);
    setDetailLoadingId(productId);
    try {
      const detail = await productApi.getById(productId);
      setDetailProduct(detail);
    } catch (err) {
      setDetailError('Không thể tải chi tiết sản phẩm. Vui lòng thử lại.');
    } finally {
      setDetailLoadingId(null);
    }
  };

  return (
    <>
      <Header
        title={t('title')}
        subtitle={t('subtitle')}
        showAddButton
        addButtonLabel={t('addProduct')}
        titleClassName="text-black"
        subtitleClassName="text-black"
      />

      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="w-full sm:max-w-[320px]">
            <SearchBar
              placeholder={t('searchPlaceholder')}
              onChange={setSearchTerm}
            />
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gradient-gold gap-2 text-black hover:opacity-90"
                >
                  <Filter className="h-4 w-4" />
                  {t('filterButton')}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('filters.category')}</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={activeCategory}
                  onValueChange={setActiveCategory}
                >
                  {categoryFilterKeys.map((cat) => (
                    <DropdownMenuRadioItem key={cat.type} value={cat.type}>
                      {t(`categoryFilters.${cat.key}` as Parameters<typeof t>[0])}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 text-sm text-slate-600">
            {t('loading')}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
            {error}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 text-sm text-slate-600">
            {t('noProducts')}
          </div>
        ) : (
          <>
            <ProductGrid
              products={gridItems}
              onPreview={handlePreviewProduct}
              previewLoadingId={detailLoadingId}
            />

            {totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-sm text-slate-700">
                <p>
                  {t('page')} <span className="font-semibold">{currentPage}</span>/
                  {totalPages}{' '}
                  <span className="text-slate-500">
                    ({filteredProducts.length} {t('pagination.products')})
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) =>
                      setPageSize(Number(value) as (typeof PAGE_SIZE_OPTIONS)[number])
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="20 / trang" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={String(option)}>
                          {option} {t('perPage')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    {t('prevPage')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages}
                  >
                    {t('nextPage')}
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      <Dialog
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) {
            setDetailProduct(null);
            setDetailError(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle>{t('detailTitle')}</DialogTitle>
            <DialogDescription>
              {t('detailDescription')}
            </DialogDescription>
          </DialogHeader>

          {detailLoadingId && !detailProduct ? (
            <div className="rounded-lg border border-slate-200/70 bg-white/90 p-4 text-sm text-slate-600">
              {t('loadingDetail')}
            </div>
          ) : detailError ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
              {detailError}
            </div>
          ) : detailProduct ? (
            <ProductDetailModalContent product={detailProduct} />
          ) : null}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailOpen(false)}
              className="text-black"
            >
              {t('close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Products;
