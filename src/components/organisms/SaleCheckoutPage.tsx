'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Wallet, Loader2 } from 'lucide-react';
import { Button } from '@/components/atoms';
import { checkoutApi } from '@/api';
import { cn } from '@/lib/utils';

interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  type?: string;
}

interface CheckoutFormData {
  fullName: string;
  phone: string;
  email?: string;
  note?: string;
}

export const SaleCheckoutPage: React.FC = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    phone: '',
    email: '',
    note: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qr'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load cart from sessionStorage
  useEffect(() => {
    const storedCart = sessionStorage.getItem('checkoutCart');
    if (storedCart) {
      try {
        const items = JSON.parse(storedCart) as CartItem[];
        setCartItems(items);
      } catch (error) {
        console.error('Failed to parse cart:', error);
        router.push('/sale/products');
      }
    } else {
      // No cart items, redirect back
      router.push('/sale/products');
    }
  }, [router]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vat = Math.round(subtotal * 0.1);
  const total = subtotal + vat;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone) {
      alert('Vui lòng điền đầy đủ thông tin khách hàng!');
      return;
    }

    if (cartItems.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }

    try {
      setIsSubmitting(true);

      const checkoutData = {
        items: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        shippingFee: 0,
        discountAmount: 0,
        shippingMethod: 'pickup',
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

      // Clear cart from session storage
      sessionStorage.removeItem('checkoutCart');

      // Show success message
      alert(
        `✅ Đơn hàng đã được tạo thành công!\n\nMã đơn: ${result.orderCode}\nPhương thức: ${paymentMethod === 'cash' ? 'Tiền mặt' : 'QR Code'}\nTổng tiền: ${total.toLocaleString('vi-VN')} ₫`
      );

      // Redirect back to products
      router.push('/sale/products');
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Quay lại</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Thanh toán đơn hàng</h1>
          </div>
        </div>

        {/* Main Content */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left - Products (2 columns) */}
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Sản phẩm ({cartItems.length})
                </h2>
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const key = `${item.productId}-${item.variantId || 'default'}`;
                    return (
                      <div
                        key={key}
                        className="flex gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4"
                      >
                        {/* Product Image */}
                        {item.imageUrl && (
                          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-white">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}

                        {/* Product Info */}
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{item.name}</h3>
                            {item.type && (
                              <p className="mt-1 text-sm text-gray-500">{item.type}</p>
                            )}
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Số lượng: <strong>{item.quantity}</strong>
                            </span>
                            <span className="font-semibold text-gray-900">
                              {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right - Customer Info & Payment (1 column) */}
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Thông tin khách hàng
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="mb-1 block text-sm font-medium text-gray-700">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      placeholder="Nhập họ và tên"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                      Email (tùy chọn)
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      placeholder="Nhập email"
                    />
                  </div>

                  <div>
                    <label htmlFor="note" className="mb-1 block text-sm font-medium text-gray-700">
                      Ghi chú (tùy chọn)
                    </label>
                    <textarea
                      id="note"
                      rows={3}
                      value={formData.note}
                      onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      placeholder="Ghi chú thêm..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Phương thức thanh toán
                </h2>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border-2 p-4 transition-all',
                      paymentMethod === 'cash'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <Wallet className={cn('h-5 w-5', paymentMethod === 'cash' ? 'text-yellow-600' : 'text-gray-400')} />
                    <span className={cn('font-medium', paymentMethod === 'cash' ? 'text-yellow-900' : 'text-gray-700')}>
                      Tiền mặt
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('qr')}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg border-2 p-4 transition-all',
                      paymentMethod === 'qr'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <CreditCard className={cn('h-5 w-5', paymentMethod === 'qr' ? 'text-yellow-600' : 'text-gray-400')} />
                    <span className={cn('font-medium', paymentMethod === 'qr' ? 'text-yellow-900' : 'text-gray-700')}>
                      QR Code
                    </span>
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">Tổng kết</h2>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính:</span>
                    <span>{subtotal.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>VAT (10%):</span>
                    <span>{vat.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-900">
                      <span>Tổng cộng:</span>
                      <span className="text-yellow-600">{total.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 w-full bg-yellow-500 hover:bg-yellow-600"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    'Xác nhận thanh toán'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
