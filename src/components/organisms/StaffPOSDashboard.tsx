'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { SearchBar } from '@/components/molecules/SearchBar';
import { StaffPOSCart, CartItem } from './StaffPOSCart';
import { StaffPOSCheckout, CheckoutFormData } from './StaffPOSCheckout';
import { productApi, checkoutApi, Product } from '@/api';
import { Glasses, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export const StaffPOSDashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

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

  // Checkout
  const handleCheckout = useCallback(
    async (paymentMethod: 'cash' | 'qr', formData: CheckoutFormData) => {
      try {
        const checkoutData = {
          items: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
          shippingFee: 0, // Không giao hàng - mua tại cửa hàng
          discountAmount: 0,
          shippingMethod: 'pickup', // Nhận tại cửa hàng
          shippingAddress: {
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email || '',
            line1: 'Cửa hàng Eyes Dream',
            line2: '',
            ward: '',
            district: '',
            province: '',
            country: 'VN',
            note: formData.note || '',
          },
          note: formData.note || '',
          paymentMethod,
        };

        const result = await checkoutApi.createOrder(checkoutData);

        // Show success message
        alert(
          `✅ Đơn hàng đã được tạo thành công!\n\nMã đơn: ${result.orderCode}\nPhương thức: ${paymentMethod === 'cash' ? 'Tiền mặt' : 'QR Code'}\nTổng tiền: ${result.total.toLocaleString('vi-VN')} ₫`
        );

        // Clear cart
        setCartItems([]);
      } catch (err) {
        console.error('Checkout error:', err);
        throw err;
      }
    },
    [cartItems]
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500">
              <Glasses className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                POS - Bán hàng
              </h1>
              <p className="text-sm text-gray-600">
                Eyes Dream Staff Dashboard
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">
              {new Date().toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-xs text-gray-600">
              {new Date().toLocaleTimeString('vi-VN')}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side - Products */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Search Bar */}
          <div className="border-b border-gray-200 bg-white p-4">
            <SearchBar
              placeholder="Tìm kiếm sản phẩm theo tên, loại, thương hiệu..."
              value={searchTerm}
              onChange={setSearchTerm}
              className="h-12 text-base"
            />
            <p className="mt-2 text-sm text-gray-600">
              Tìm thấy <strong>{filteredProducts.length}</strong> sản phẩm
            </p>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4">
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
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {filteredProducts.map((product) => (
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
            )}
          </div>
        </div>

        {/* Right Side - Cart & Checkout */}
        <div className="flex w-[420px] flex-col border-l border-gray-200 bg-white">
          <div className="flex h-1/2 flex-col border-b border-gray-200">
            <StaffPOSCart
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onClearCart={clearCart}
            />
          </div>
          <div className="flex h-1/2 flex-col">
            <StaffPOSCheckout
              subtotal={subtotal}
              itemCount={itemCount}
              disabled={isLoading}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
