'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Pagination } from '@/components/molecules/Pagination';
import { SaleHeader } from './SaleHeader';
import { CartDrawer, CartItem } from './CartDrawer';
import { PrescriptionFormModal } from './PrescriptionFormModal';
import { productApi, Product } from '@/api';
import { Glasses, Loader2, AlertCircle, Eye, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PrescriptionData } from '@/types/rxPrescription';
import { Button } from '@/components/atoms';

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

const PRICE_RANGES = [
  { label: 'Tất cả', min: 0, max: Infinity },
  { label: 'Dưới 500K', min: 0, max: 500000 },
  { label: 'Dưới 1 triệu', min: 0, max: 1000000 },
  { label: 'Trên 1 triệu', min: 1000000, max: Infinity },
];

export const SalePOSDashboard: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Filters
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Prescription modal
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [selectedProductForPrescription, setSelectedProductForPrescription] = useState<Product | null>(null);
  const [isPrescriptionMode, setIsPrescriptionMode] = useState(false);

  // Load products
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await productApi.getAll();
        if (isMounted) {
          // Hiển thị tất cả sản phẩm active (có hoặc không có stock)
          const activeProducts = result.products.filter(
            (p) => p.status === 'active'
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

  // Get unique brands for filter
  const availableBrands = useMemo(() => {
    const brands = new Set(products.map((p) => p.brand).filter(Boolean));
    return Array.from(brands).sort();
  }, [products]);

  // Filter products by search, brand, and price
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Search filter
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((product) => {
        const name = product.name.toLowerCase();
        const type = typeLabels[product.type]?.toLowerCase() || '';
        const brand = product.brand?.toLowerCase() || '';
        return name.includes(q) || type.includes(q) || brand.includes(q);
      });
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter((p) => p.brand === selectedBrand);
    }

    // Price range filter
    const priceRange = PRICE_RANGES[selectedPriceRange];
    if (priceRange) {
      filtered = filtered.filter(
        (p) => p.price >= priceRange.min && p.price < priceRange.max
      );
    }

    return filtered;
  }, [products, searchTerm, selectedBrand, selectedPriceRange]);

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
    if (isPrescriptionMode) {
      // Open prescription modal for pre-order
      setSelectedProductForPrescription(product);
      setIsPrescriptionModalOpen(true);
    } else {
      // Regular product add to cart
      setCartItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.productId === product.id && !item.variantId && !item.isPrescription
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
    }
  }, [isPrescriptionMode]);

  const handlePrescriptionSubmit = useCallback((prescriptionData: PrescriptionData) => {
    if (!selectedProductForPrescription) return;

    setCartItems((prev) => [
      ...prev,
      {
        productId: selectedProductForPrescription.id,
        name: selectedProductForPrescription.name,
        price: selectedProductForPrescription.price,
        quantity: 1,
        imageUrl: selectedProductForPrescription.imageUrl,
        type: typeLabels[selectedProductForPrescription.type] || selectedProductForPrescription.type,
        isPrescription: true,
        prescription: prescriptionData,
      },
    ]);

    setIsPrescriptionModalOpen(false);
    setSelectedProductForPrescription(null);
  }, [selectedProductForPrescription]);

  const handleEditPrescription = useCallback((productId: string) => {
    const item = cartItems.find((i) => i.productId === productId && i.isPrescription);
    if (!item) return;

    // Find product
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setSelectedProductForPrescription(product);
    setIsPrescriptionModalOpen(true);
    setIsCartOpen(false);
  }, [cartItems, products]);

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
          {/* Search Bar & Filters */}
          <div className="border-b border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <SearchBar
                placeholder="Tìm kiếm sản phẩm theo tên, loại, thương hiệu..."
                value={searchTerm}
                onChange={setSearchTerm}
                className="h-12 flex-1 text-base"
              />
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'h-12',
                  showFilters && 'border-yellow-500 bg-yellow-50 text-yellow-700'
                )}
              >
                <Filter className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setIsPrescriptionMode(!isPrescriptionMode)}
                className={cn(
                  'h-12 gap-2',
                  isPrescriptionMode
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                )}
              >
                <Eye className="h-4 w-4" />
                Đặt kính theo đơn
              </Button>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 md:grid-cols-2">
                {/* Brand Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Thương hiệu
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  >
                    <option value="">Tất cả thương hiệu</option>
                    {availableBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Khoảng giá
                  </label>
                  <select
                    value={selectedPriceRange}
                    onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  >
                    {PRICE_RANGES.map((range, index) => (
                      <option key={index} value={index}>
                        {range.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                {(selectedBrand || selectedPriceRange !== 0) && (
                  <div className="col-span-full flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedBrand('');
                        setSelectedPriceRange(0);
                      }}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                      <X className="h-4 w-4" />
                      Xóa bộ lọc
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mode Indicator */}
            {isPrescriptionMode && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-blue-100 p-3 text-sm">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  Chế độ đặt kính theo đơn - Click vào sản phẩm để nhập thông số đo kính
                </span>
              </div>
            )}

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
                  {paginatedProducts.map((product) => {
                    const isOutOfStock = product.stock === 0;
                    const isLowStock = product.stock > 0 && product.stock <= 10;
                    
                    return (
                      <button
                        key={product.id}
                        onClick={() => addToCart(product)}
                        disabled={!isPrescriptionMode && isOutOfStock}
                        className={cn(
                          'group relative flex flex-col overflow-hidden rounded-xl border-2 bg-white transition-all',
                          isOutOfStock && !isPrescriptionMode
                            ? 'cursor-not-allowed border-gray-200 opacity-60'
                            : 'border-gray-200 hover:border-yellow-400 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-yellow-400',
                          isPrescriptionMode && 'border-blue-200 hover:border-blue-400 focus:ring-blue-400'
                        )}
                      >
                        {/* Stock Badge */}
                        {isOutOfStock ? (
                          <div className="absolute left-2 top-2 z-10 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-md">
                            Hết hàng
                          </div>
                        ) : isLowStock ? (
                          <div className="absolute left-2 top-2 z-10 rounded-full bg-orange-500 px-2 py-1 text-xs font-bold text-white shadow-md">
                            Còn {product.stock}
                          </div>
                        ) : (
                          <div className="absolute left-2 top-2 z-10 rounded-full bg-green-500 px-2 py-1 text-xs font-bold text-white shadow-md">
                            Còn {product.stock}
                          </div>
                        )}

                        {/* Prescription Badge */}
                        {isPrescriptionMode && (
                          <div className="absolute right-2 top-2 z-10 rounded-full bg-blue-500 px-2 py-1 text-xs font-bold text-white shadow-md">
                            Theo đơn
                          </div>
                        )}

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
                          <p className="mb-1 text-xs text-gray-500">
                            {typeLabels[product.type] || product.type}
                          </p>
                          {product.brand && (
                            <p className="mb-2 text-xs font-medium text-gray-700">
                              {product.brand}
                            </p>
                          )}
                          <div className="mt-auto">
                            <span className="text-base font-bold text-yellow-600">
                              {product.price.toLocaleString('vi-VN')} ₫
                            </span>
                          </div>
                        </div>

                        {/* Hover Overlay */}
                        {(!isOutOfStock || isPrescriptionMode) && (
                          <div className={cn(
                            'absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100',
                            isPrescriptionMode ? 'bg-blue-600/90' : 'bg-yellow-600/90'
                          )}>
                            <span className="text-lg font-semibold text-white">
                              {isPrescriptionMode ? '+ Nhập thông số' : '+ Thêm vào giỏ'}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
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
        onEditPrescription={handleEditPrescription}
      />

      {/* Prescription Form Modal */}
      <PrescriptionFormModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => {
          setIsPrescriptionModalOpen(false);
          setSelectedProductForPrescription(null);
        }}
        onSubmit={handlePrescriptionSubmit}
        productName={selectedProductForPrescription?.name}
        productImage={selectedProductForPrescription?.imageUrl}
        initialData={
          selectedProductForPrescription
            ? cartItems.find((i) => i.productId === selectedProductForPrescription.id && i.isPrescription)?.prescription
            : undefined
        }
      />
    </>
  );
};

