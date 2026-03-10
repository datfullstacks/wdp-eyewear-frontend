'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Pagination } from '@/components/molecules/Pagination';
import { SaleHeader } from './SaleHeader';
import { CartDrawer, CartItem } from './CartDrawer';
import { productApi, Product } from '@/api';
import { Glasses, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 16;

const typeLabels: Record<string, string> = {
  sunglasses: 'Kính mát',
  frame: 'Gọng kính',
  lens: 'Tròng kính',
  contact_lens: 'Tròng kính áp tròng',
  accessory: 'Phụ kiện',
  service: 'Dịch vụ',
  bundle: 'Gói sản phẩm',
  gift_card: 'Thẻ quà tặng',
  other: 'Khác',
};

export const SalePOSDashboard: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load products
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await productApi.getAll();
        if (isMounted) {
          // Chỉ hiển thị sản phẩm active và có stock
          const activeProducts = result.products.filter(
            (p) => p.status === 'active' && p.stock > 0
          );
          setProducts(activeProducts);
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

  // Filter products by search
  const filteredProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return products;
    return products.filter((product) => {
      const name = product.name.toLowerCase();
      const type = typeLabels[product.type]?.toLowerCase() || '';
      const brand = product.brand?.toLowerCase() || '';
      return name.includes(q) || type.includes(q) || brand.includes(q);
    });
  }, [products, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Cart operations
  const addToCart = useCallback((product: Product) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.productId === product.id && !item.variantId
      );

      if (existingIndex >= 0) {
        // Update quantity if exists
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      } else {
        // Add new item
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            imageUrl: product.imageUrl,
            type: typeLabels[product.type] || product.type,
          },
        ];
      }
    });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, variantId: string | undefined, quantity: number) => {
      setCartItems((prev) =>
        prev.map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity }
            : item
        )
      );
    },
    []
  );

  const removeItem = useCallback(
    (productId: string, variantId: string | undefined) => {
      setCartItems((prev) =>
        prev.filter(
          (item) =>
            !(item.productId === productId && item.variantId === variantId)
        )
      );
    },
    []
  );

  const clearCart = useCallback(() => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
      setCartItems([]);
    }
  }, []);

  // Navigate to checkout
  const handleCheckout = useCallback(() => {
    setIsCartOpen(false);
    // Store cart items in sessionStorage for checkout page
    sessionStorage.setItem('checkoutCart', JSON.stringify(cartItems));
    router.push('/sale/checkout');
  }, [cartItems, router]);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div className="flex h-screen flex-col bg-gray-50">
        {/* Header */}
        <SaleHeader 
          cartItemCount={itemCount}
          onCartClick={() => setIsCartOpen(true)}
        />

        {/* Main Content - Products Only */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="border-b border-gray-200 bg-white p-6">
            <SearchBar
              placeholder="Tìm kiếm sản phẩm theo tên, loại, thương hiệu..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="h-12 text-base"
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
              </p>
              {totalPages > 1 && (
                <p className="text-sm text-gray-600">
                  Trang <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
                </p>
              )}
            </div>
          </div>

          {/* Product Grid - Full Screen */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Loader2 className="mx-auto h-12 w-12 animate-spin text-yellow-600" />
                  <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
                  <p className="mt-4 text-red-600">{error}</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Glasses className="mx-auto h-16 w-16 text-gray-300" />
                  <p className="mt-4 text-lg font-medium text-gray-600">
                    Không tìm thấy sản phẩm
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Thử tìm kiếm với từ khóa khác
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-[1800px]">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {paginatedProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className={cn(
                        'group relative flex flex-col overflow-hidden rounded-xl border-2 border-gray-200 bg-white transition-all hover:border-yellow-400 hover:shadow-lg',
                        'focus:outline-none focus:ring-2 focus:ring-yellow-400'
                      )}
                    >
                      {/* Product Image */}
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E`;
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-1 flex-col p-3">
                        <h3 className="mb-1 line-clamp-2 text-sm font-medium text-gray-900">
                          {product.name}
                        </h3>
                        <p className="mb-2 text-xs text-gray-500">
                          {typeLabels[product.type] || product.type}
                        </p>
                        <div className="mt-auto flex items-baseline justify-between">
                          <span className="text-base font-bold text-yellow-600">
                            {product.price.toLocaleString('vi-VN')} ₫
                          </span>
                          {product.stock <= 10 && (
                            <span className="text-xs text-orange-600">
                              {product.stock} sp
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-yellow-600/90 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="text-lg font-semibold text-white">
                          + Thêm vào giỏ
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      itemsPerPage={ITEMS_PER_PAGE}
                      totalItems={filteredProducts.length}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        onCheckout={handleCheckout}
      />
    </>
  );
};

