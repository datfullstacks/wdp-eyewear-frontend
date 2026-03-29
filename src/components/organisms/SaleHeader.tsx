'use client';

import { ShoppingCart, Bell, Glasses } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaleHeaderProps {
  cartItemCount: number;
  onCartClick: () => void;
  className?: string;
}

export const SaleHeader: React.FC<SaleHeaderProps> = ({
  cartItemCount,
  onCartClick,
  className,
}) => {
  return (
    <div
      className={cn(
        'border-b border-gray-200 bg-white px-6 py-4 shadow-sm',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500">
            <Glasses className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">POS - Bán hàng</h1>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-4">
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

          {/* Notifications */}
          <button
            type="button"
            className="relative rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Thông báo"
          >
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              2
            </span>
          </button>

          {/* Cart */}
          <button
            type="button"
            onClick={onCartClick}
            className={cn(
              'relative rounded-full p-2 transition-colors',
              cartItemCount > 0
                ? 'text-yellow-600 hover:bg-yellow-50'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
            aria-label="Giỏ hàng"
          >
            <ShoppingCart className="h-6 w-6" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500 text-xs font-bold text-white shadow-md">
                {cartItemCount > 99 ? '99+' : cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
