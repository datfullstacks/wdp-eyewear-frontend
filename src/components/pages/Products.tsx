'use client';
import { Header } from '@/components/organisms/Header';
import {
  ProductGrid,
  ProductCardItem,
} from '@/components/organisms/ProductGrid';

import { Filter, Grid, List } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
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

type CategoryFilter = {
  label: string;
  type: string;
};

const categoryFilters: CategoryFilter[] = [
  { label: 'Tất cả', type: 'all' },
  { label: 'Kính mát', type: 'sunglasses' },
  { label: 'Gọng kính', type: 'frame' },
  { label: 'Tròng kính', type: 'lens' },
  { label: 'Phụ kiện', type: 'accessory' },
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

const Products = () => {
  const [activeCategory, setActiveCategory] = useState('all');
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
    if (activeCategory === 'all') return products;
    return products.filter(
      (product) =>
        product.type === activeCategory || product.category === activeCategory
    );
  }, [activeCategory, products]);

  const gridItems: ProductCardItem[] = useMemo(
    () =>
      filteredProducts.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        stock: product.stock,
        image: product.imageUrl,
        category: typeLabels[product.type] || product.category || product.type,
      })),
    [filteredProducts]
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
        title="Sản phẩm"
        subtitle="Quản lý kho hàng mắt kính"
        showAddButton
        addButtonLabel="Thêm sản phẩm"
        titleClassName="text-black"
        subtitleClassName="text-black"
      />

      <div className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div />

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gradient-gold gap-2 text-black hover:opacity-90"
                >
                  <Filter className="h-4 w-4" />
                  Bộ lọc
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Danh mục</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={activeCategory}
                  onValueChange={setActiveCategory}
                >
                  {categoryFilters.map((cat) => (
                    <DropdownMenuRadioItem key={cat.type} value={cat.type}>
                      {cat.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 text-sm text-slate-600">
            Đang tải sản phẩm...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
            {error}
          </div>
        ) : gridItems.length === 0 ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 text-sm text-slate-600">
            Không có sản phẩm phù hợp.
          </div>
        ) : (
          <ProductGrid
            products={gridItems}
            onPreview={handlePreviewProduct}
            previewLoadingId={detailLoadingId}
          />
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
            <DialogTitle>Chi tiết sản phẩm</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết theo dữ liệu hệ thống.
            </DialogDescription>
          </DialogHeader>

          {detailLoadingId && !detailProduct ? (
            <div className="rounded-lg border border-slate-200/70 bg-white/90 p-4 text-sm text-slate-600">
              Đang tải chi tiết sản phẩm...
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
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Products;
