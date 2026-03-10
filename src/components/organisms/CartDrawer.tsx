'use client';

import { X, Minus, Plus, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { Button } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  type?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  onRemoveItem: (productId: string, variantId: string | undefined) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-full flex-col bg-white shadow-2xl transition-transform duration-300 sm:w-[480px]',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-yellow-600" />
            <h2 id="cart-drawer-title" className="text-lg font-semibold text-gray-900">
              Giỏ hàng
              {itemCount > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({itemCount} sản phẩm)
                </span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearCart}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Xóa tất cả
              </Button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Đóng giỏ hàng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
                <ShoppingCart className="h-12 w-12 text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-900">Giỏ hàng trống</p>
              <p className="mt-1 text-sm text-gray-500">
                Thêm sản phẩm vào giỏ để bắt đầu
              </p>
              <Button
                variant="outline"
                onClick={onClose}
                className="mt-6"
              >
                Tiếp tục mua sắm
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const key = `${item.productId}-${item.variantId || 'default'}`;
                return (
                  <div
                    key={key}
                    className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md"
                  >
                    {/* Product Image */}
                    {item.imageUrl && (
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Product Info */}
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">
                          {item.name}
                        </h4>
                        {item.type && (
                          <p className="mt-0.5 text-xs text-gray-500">{item.type}</p>
                        )}
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              onUpdateQuantity(
                                item.productId,
                                item.variantId,
                                Math.max(1, item.quantity - 1)
                              )
                            }
                            className="h-8 w-8 p-0"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center text-sm font-medium text-gray-900">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              onUpdateQuantity(
                                item.productId,
                                item.variantId,
                                item.quantity + 1
                              )
                            }
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => onRemoveItem(item.productId, item.variantId)}
                          className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50"
                          aria-label={`Xóa ${item.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="mt-2 text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-xs text-gray-500">
                            {item.price.toLocaleString('vi-VN')} ₫ / sp
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer - Summary & Checkout */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <div className="space-y-3">
              {/* Subtotal */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tạm tính:</span>
                <span className="text-lg font-semibold text-gray-900">
                  {subtotal.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              {/* VAT Notice */}
              <p className="text-xs text-gray-500">
                VAT (10%): 0 ₫
              </p>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-base font-medium text-gray-900">Tổng cộng:</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {subtotal.toLocaleString('vi-VN')} ₫
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Tiếp tục mua
                </Button>
                <Button
                  onClick={onCheckout}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600"
                >
                  Thanh toán
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
