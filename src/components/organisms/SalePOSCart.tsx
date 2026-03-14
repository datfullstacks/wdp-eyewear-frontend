'use client';

import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/atoms';
import { cn } from '@/lib/utils';

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  type?: string;
}

interface SalePOSCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  onRemoveItem: (productId: string, variantId: string | undefined) => void;
  onClearCart: () => void;
}

export const SalePOSCart: React.FC<SalePOSCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Giỏ hàng
              {itemCount > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({itemCount} sản phẩm)
                </span>
              )}
            </h3>
          </div>
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
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const key = `${item.productId}-${item.variantId}`;
              return (
                <div
                  key={key}
                  className="flex gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-shadow hover:shadow-md"
                >
                  {/* Product Image */}
                  {item.imageUrl && (
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
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
                      <h4 className="truncate text-sm font-medium text-gray-900">
                        {item.name}
                      </h4>
                      {item.type && (
                        <p className="mt-0.5 text-xs text-gray-500">{item.type}</p>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-1.5">
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
                          className="h-7 w-7 p-0"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium text-gray-900">
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
                          className="h-7 w-7 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
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

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(item.productId, item.variantId)}
                    className="h-7 w-7 flex-shrink-0 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subtotal */}
      {items.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Tạm tính:</span>
            <span className="text-xl font-bold text-gray-900">
              {subtotal.toLocaleString('vi-VN')} ₫
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

