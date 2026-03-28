'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/atoms';
import { Pagination } from '@/components/molecules/Pagination';
import { SearchBar } from '@/components/molecules/SearchBar';
import { CartDrawer } from './CartDrawer';
import { SaleHeader } from './SaleHeader';
import { getProducts } from '@/api/saleCheckout';
import {
  mapProductToCartItem,
  mapProductToOption,
  reconcileCartItems,
} from '@/lib/saleCheckout';
import { useSaleCartStore } from '@/stores/saleCartStore';
import type { SaleProduct } from '@/types/saleCheckout';

const ITEMS_PER_PAGE = 16;

const typeLabels: Record<string, string> = {
  sunglasses: 'Kính mát',
  frame: 'Gọng kính',
  lens: 'Tròng kính',
  contact_lens: 'Kính áp tròng',
  accessory: 'Phụ kiện',
  service: 'Dịch vụ',
  bundle: 'Combo',
  gift_card: 'Thẻ quà tặng',
  other: 'Khác',
};

export const SalePOSDashboard: React.FC = () => {
  const router = useRouter();

  const [products, setProducts] = useState<SaleProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const [selectedVariantByProduct, setSelectedVariantByProduct] = useState<
    Record<string, string>
  >({});
  const [quantityByProduct, setQuantityByProduct] = useState<
    Record<string, number>
  >({});

  const cartItems = useSaleCartStore((state) => state.items);
  const addToCart = useSaleCartStore((state) => state.addToCart);
  const replaceItems = useSaleCartStore((state) => state.replaceItems);
  const removeFromCart = useSaleCartStore((state) => state.removeFromCart);
  const updateQuantity = useSaleCartStore((state) => state.updateQuantity);
  const clearCart = useSaleCartStore((state) => state.clearCart);

  useEffect(() => {
    let mounted = true;

    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError('');

        const rows = await getProducts();
        if (!mounted) return;

        setProducts(rows);

        const autoVariantMap: Record<string, string> = {};
        const autoQtyMap: Record<string, number> = {};

        rows.forEach((product) => {
          if (product.variants.length === 1 && product.variants[0]?._id) {
            autoVariantMap[product._id] = product.variants[0]._id;
          }
          autoQtyMap[product._id] = 1;
        });

        setSelectedVariantByProduct(autoVariantMap);
        setQuantityByProduct(autoQtyMap);
      } catch (loadError) {
        const message =
          (
            loadError as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (loadError as { message?: string })?.message ||
          'Không thể tải danh sách sản phẩm.';

        if (mounted) {
          setError(message);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (products.length === 0 || cartItems.length === 0) return;

    const { items, removedItems } = reconcileCartItems(cartItems, products);
    const hasChanges = JSON.stringify(items) !== JSON.stringify(cartItems);

    if (!hasChanges && removedItems.length === 0) return;

    replaceItems(items);

    if (removedItems.length > 0) {
      const removedNames = Array.from(
        new Set(removedItems.map((item) => item.productName).filter(Boolean))
      );
      setActionError(
        `Da xoa ${removedNames.join(', ')} khoi gio hang vi bien the da bi xoa hoac thay doi. Vui long chon lai bien the moi nhat.`
      );
    }
  }, [cartItems, products, replaceItems]);

  const filteredProducts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return products;

    return products.filter((product) => {
      const text = [
        product.name,
        product.brand,
        product.type,
        product.description,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return text.includes(keyword);
    });
  }, [products, searchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  );
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product: SaleProduct) => {
    setActionError('');
    const variantId = selectedVariantByProduct[product._id];
    const variant = product.variants.find((item) => item._id === variantId);

    if (!variant) {
      setActionError(
        `Bạn cần chọn variant cho sản phẩm "${product.name}" trước khi thêm giỏ hàng.`
      );
      return;
    }

    const stock = Number(variant.stock || 0);
    if (stock <= 0) {
      setActionError(`Variant đang hết hàng: ${product.name}`);
      return;
    }

    const quantity = Math.max(1, Number(quantityByProduct[product._id] || 1));
    const mapped = mapProductToCartItem(product, variant, quantity);
    addToCart(mapped);
    setIsCartOpen(true);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      setActionError('Giỏ hàng đang trống, chưa thể thanh toán.');
      return;
    }

    setIsCartOpen(false);
    router.push('/sale/checkout');
  };

  return (
    <>
      <div className="flex h-screen flex-col bg-gray-50">
        <SaleHeader
          cartItemCount={itemCount}
          onCartClick={() => setIsCartOpen(true)}
        />

        <div className="border-b border-gray-200 bg-white p-6">
          <div className="w-full max-w-[420px]">
            <SearchBar
              placeholder="Tìm sản phẩm theo tên / brand / type..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="h-11"
            />
          </div>

          {actionError && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {actionError}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
                <p className="mt-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {paginatedProducts.map((product) => {
                  const selectedVariantId =
                    selectedVariantByProduct[product._id] || '';
                  const selectedVariant =
                    product.variants.find(
                      (variant) => variant._id === selectedVariantId
                    ) || null;
                  const selectedStock = Number(selectedVariant?.stock || 0);
                  const selectedPrice = Number(
                    selectedVariant?.price ??
                      product.pricing?.salePrice ??
                      product.pricing?.basePrice ??
                      0
                  );
                  const qty = Math.max(
                    1,
                    Number(quantityByProduct[product._id] || 1)
                  );
                  const option = mapProductToOption(product);

                  return (
                    <div
                      key={product._id}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex gap-3">
                        <img
                          src={option.imageUrl}
                          alt={product.name}
                          className="h-20 w-20 rounded-md border border-gray-200 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                            {product.name}
                          </p>
                          <p className="mt-1 text-sm text-gray-700">
                            {product.brand || '-'} •{' '}
                            {typeLabels[product.type || ''] ||
                              product.type ||
                              '-'}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-blue-700">
                            {selectedPrice.toLocaleString('vi-VN')} ₫
                          </p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="mb-2 block text-sm font-semibold text-gray-900">
                          Biến thể
                        </label>
                        <select
                          value={selectedVariantId}
                          onChange={(event) =>
                            setSelectedVariantByProduct((prev) => ({
                              ...prev,
                              [product._id]: event.target.value,
                            }))
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                        >
                          <option value="">-- Chọn variant --</option>
                          {product.variants.map((variant) => {
                            const color = variant.options?.color || '-';
                            const size = variant.options?.size || '-';
                            const stock = Number(variant.stock || 0);
                            const price = Number(
                              variant.price || 0
                            ).toLocaleString('vi-VN');

                            return (
                              <option
                                key={variant._id}
                                value={variant._id}
                                disabled={stock <= 0}
                              >
                                {color}/{size} • {price} ₫ • Tồn kho: {stock}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div>
                          <label className="mb-2 block text-sm font-semibold text-gray-900">
                            Số lượng
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={Math.max(1, selectedStock || 1)}
                            value={qty}
                            onChange={(event) => {
                              const next = Math.max(
                                1,
                                Number(event.target.value || 1)
                              );
                              setQuantityByProduct((prev) => ({
                                ...prev,
                                [product._id]: next,
                              }));
                            }}
                            className="w-28 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100"
                          />
                        </div>

                        <div className="rounded-lg bg-slate-50 px-3 py-2 text-right text-sm text-gray-800">
                          <p className="font-medium">
                            Tồn kho: {selectedStock || 0}
                          </p>
                          <p className="mt-1 font-medium">
                            Thành tiền:{' '}
                            {(selectedPrice * qty).toLocaleString('vi-VN')} ₫
                          </p>
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        disabled={!selectedVariant || selectedStock <= 0}
                        className="mt-3 w-full bg-yellow-500 hover:bg-yellow-600"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Thêm vào giỏ
                      </Button>
                    </div>
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
            </>
          )}
        </div>
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onCheckout={handleCheckout}
      />
    </>
  );
};
