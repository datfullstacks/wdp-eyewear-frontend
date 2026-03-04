'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { ProductTable } from '@/components/organisms/manager';
import { Button } from '@/components/atoms';
import { Input } from '@/components/atoms/Input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Package, ShoppingCart, AlertTriangle, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { productApi, type Product } from '@/api';

type TabType = 'all' | 'active' | 'low-stock' | 'inactive';

const ITEMS_PER_PAGE = 10;
const LOW_STOCK_THRESHOLD = 10;

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const response = await productApi.getAll();
      setProducts(response.products);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && product.status === 'active';
    if (activeTab === 'inactive') return matchesSearch && product.status !== 'active';
    if (activeTab === 'low-stock') return matchesSearch && product.stock < LOW_STOCK_THRESHOLD;
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = [
    {
      title: 'Tổng sản phẩm',
      value: products.length.toString(),
      icon: Package,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Đang bán',
      value: products.filter((p) => p.status === 'active').length.toString(),
      icon: ShoppingCart,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Sắp hết hàng',
      value: products.filter((p) => p.stock < LOW_STOCK_THRESHOLD).length.toString(),
      icon: AlertTriangle,
      trend: { value: 0, isPositive: false },
    },
  ];

  const handleView = (product: Product) => {
    router.push(`/manager/products/${product.id}`);
  };

  const handleEdit = (product: Product) => {
    router.push(`/manager/products/${product.id}/edit`);
  };

  const handleOpenDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      await productApi.remove(selectedProduct.id);
      await loadProducts();
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      const newStatus: 'active' | 'inactive' = product.status === 'active' ? 'inactive' : 'active';
      await productApi.updateStatus(product.id, newStatus);
      await loadProducts();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Update failed');
    }
  };

  return (
    <>
      <Header
        title="Quản lý Sản phẩm"
        subtitle="Quản lý toàn bộ sản phẩm kính mắt"
        showAddButton
        addButtonLabel="Thêm sản phẩm"
        onAdd={() => router.push('/manager/products/create')}
      />

      <div className="space-y-6 p-6">
        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </section>

        {/* Error Message */}
        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Tabs */}
        <section className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'active', label: 'Đang bán' },
              { id: 'low-stock', label: 'Sắp hết' },
              { id: 'inactive', label: 'Ngừng bán' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as TabType);
                  setCurrentPage(1);
                }}
                className={`border-b-2 px-1 py-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </section>

        {/* Search */}
        <section>
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </section>

        {/* Products Table */}
        <section className="rounded-lg border border-gray-200 bg-white">
          {isLoading ? (
            <div className="p-12 text-center text-gray-500">Loading...</div>
          ) : (
            <ProductTable
              products={paginatedProducts}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleOpenDeleteDialog}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <section className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of{' '}
              {filteredProducts.length} products
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  onClick={() => setCurrentPage(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </section>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa sản phẩm "{selectedProduct?.name}"? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
