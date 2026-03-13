'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/atoms';
import { createCheckout, createQuote } from '@/api/saleCheckout';
import { QuoteSummary } from './QuoteSummary';
import { PaymentQrCard } from './PaymentQrCard';
import { RealtimeStatusCard } from './RealtimeStatusCard';
import { useOrderPolling } from '@/hooks/useOrderPolling';
import { buildCheckoutPayload } from '@/lib/saleCheckout';
import { useSaleCartStore } from '@/stores/saleCartStore';
import type { CheckoutData, QuoteData, ShippingAddressForm } from '@/types/saleCheckout';

const REQUIRED_SHIPPING_FIELDS: Array<keyof ShippingAddressForm> = [
  'fullName',
  'phone',
  'email',
  'line1',
  'ward',
  'district',
  'province',
  'country',
];

const defaultShippingForm: ShippingAddressForm = {
  fullName: '',
  phone: '',
  email: '',
  line1: '',
  line2: '',
  ward: '',
  district: '',
  province: '',
  country: 'VN',
  note: '',
};

export const SaleCheckoutPage: React.FC = () => {
  const router = useRouter();

  const cartItems = useSaleCartStore((state) => state.items);
  const clearCart = useSaleCartStore((state) => state.clearCart);

  const [shippingForm, setShippingForm] = useState<ShippingAddressForm>(defaultShippingForm);
  const [quoteResult, setQuoteResult] = useState<QuoteData | null>(null);
  const [checkoutResult, setCheckoutResult] = useState<CheckoutData | null>(null);

  const [quoteError, setQuoteError] = useState('');
  const [checkoutError, setCheckoutError] = useState('');
  const [isQuoting, setIsQuoting] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const {
    orderDetail,
    statuses,
    isPolling,
    pollingError,
    pollingTimedOut,
    setOrderDetail,
    startOrderPolling,
    stopOrderPolling,
  } = useOrderPolling();

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const validateCheckoutInput = (): string => {
    if (cartItems.length === 0) return 'Giỏ hàng đang trống.';

    const invalidQtyItem = cartItems.find((item) => item.quantity < 1);
    if (invalidQtyItem) return `Số lượng không hợp lệ ở sản phẩm: ${invalidQtyItem.productName}`;

    const missingField = REQUIRED_SHIPPING_FIELDS.find(
      (field) => !String(shippingForm[field] || '').trim()
    );

    if (missingField) {
      return `Thiếu thông tin giao hàng bắt buộc: ${missingField}`;
    }

    return '';
  };

  const fillSwaggerSampleShipping = () => {
    setShippingForm({
      fullName: 'MINH',
      phone: '0866679409',
      email: 'minh@gmail.com',
      line1: 'A',
      line2: 'A',
      ward: 'A',
      district: 'A',
      province: 'A',
      country: 'VN',
      note: '',
    });
  };

  const handleCalculateQuote = async () => {
    const validationError = validateCheckoutInput();
    setQuoteError(validationError);
    setCheckoutError('');
    if (validationError) return;

    try {
      setIsQuoting(true);
      const payload = buildCheckoutPayload({
        cartItems,
        shippingAddress: shippingForm,
        note: shippingForm.note,
      });
      const quote = await createQuote(payload);
      setQuoteResult(quote);
      setCheckoutResult(null);
      setOrderDetail(null);
    } catch (error) {
      const message =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Tính tiền thất bại.';
      setQuoteError(message);
      setQuoteResult(null);
    } finally {
      setIsQuoting(false);
    }
  };

  const handleCheckout = async () => {
    const validationError = validateCheckoutInput();
    setCheckoutError(validationError);
    if (validationError) return;

    if (!quoteResult) {
      setCheckoutError('Bạn cần bấm "Tính tiền" trước khi thanh toán.');
      return;
    }

    try {
      setIsCheckingOut(true);
      const payload = buildCheckoutPayload({
        cartItems,
        shippingAddress: shippingForm,
        note: shippingForm.note,
      });

      const checkout = await createCheckout(payload);
      setCheckoutResult(checkout);

      if (checkout.orderId) {
        startOrderPolling(checkout.orderId);
      }
    } catch (error) {
      const message =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        'Tạo đơn thanh toán thất bại.';
      setCheckoutError(message);
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sale Checkout</h1>
            <p className="mt-1 text-sm text-gray-600">Flow: cart items → quote → checkout → poll payment status</p>
          </div>

          <Button type="button" variant="outline" onClick={() => router.push('/sale/products')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại products
          </Button>
        </div>

        {cartItems.length === 0 ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-800">
            Giỏ hàng đang trống. Hãy chọn sản phẩm + variant ở trang products rồi quay lại checkout.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h2 className="mb-3 text-lg font-semibold text-gray-900">Danh sách item từ giỏ hàng</h2>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={`${item.productId}-${item.variantId}`} className="rounded-lg border border-gray-200 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-gray-900">{item.productName}</p>
                          <p className="text-xs text-gray-600">{item.brand || '-'} • {item.productType || '-'}</p>
                          <p className="text-xs text-gray-600">
                            Variant: {item.variantOptions.color || '-'} / {item.variantOptions.size || '-'}
                          </p>
                          <p className="text-xs text-gray-600">
                            quantity: {item.quantity} • stock: {item.stock}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{item.price.toLocaleString('vi-VN')} ₫</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
                  <span className="text-sm text-gray-600">Subtotal tạm tính</span>
                  <span className="font-semibold text-gray-900">{subtotal.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Địa chỉ giao hàng</h2>
                    <p className="mt-1 text-xs text-gray-600">
                      Bắt buộc: fullName, phone, email, line1, ward, district, province, country
                    </p>
                  </div>
                  <Button type="button" variant="outline" className="h-9" onClick={fillSwaggerSampleShipping}>
                    Điền mẫu Swagger
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {([
                    ['fullName', 'MINH'],
                    ['phone', '0866679409'],
                    ['email', 'minh@gmail.com'],
                    ['line1', 'A'],
                    ['line2', 'A'],
                    ['ward', 'A'],
                    ['district', 'A'],
                    ['province', 'A'],
                    ['country', 'VN'],
                  ] as Array<[keyof ShippingAddressForm, string]>).map(([field, placeholder]) => (
                    <div key={field}>
                      <label className="mb-1 block text-xs font-medium text-gray-700">
                        {field}
                        {REQUIRED_SHIPPING_FIELDS.includes(field) ? ' *' : ''}
                      </label>
                      <input
                        value={shippingForm[field]}
                        onChange={(event) =>
                          setShippingForm((prev) => ({ ...prev, [field]: event.target.value }))
                        }
                        placeholder={`Ví dụ: ${placeholder}`}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                      />
                    </div>
                  ))}
                </div>

                <label className="mt-3 mb-1 block text-xs font-medium text-gray-700">note</label>
                <textarea
                  value={shippingForm.note}
                  onChange={(event) =>
                    setShippingForm((prev) => ({ ...prev, note: event.target.value }))
                  }
                  rows={3}
                  placeholder="Ghi chú đơn hàng (nếu có)"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                />

                <label className="mt-3 mb-1 block text-xs font-medium text-gray-700">voucherCode (UI placeholder)</label>
                <input
                  disabled
                  value=""
                  placeholder="Chưa hỗ trợ backend"
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500"
                />

                {(quoteError || checkoutError) && (
                  <div className="mt-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4" />
                    <p>{quoteError || checkoutError}</p>
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={handleCalculateQuote}
                    disabled={isQuoting}
                    className="bg-blue-600 px-5 hover:bg-blue-700"
                  >
                    {isQuoting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Tính tiền...
                      </span>
                    ) : (
                      'Tính tiền'
                    )}
                  </Button>

                  <Button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isCheckingOut || !quoteResult}
                    className="bg-green-600 px-5 hover:bg-green-700"
                  >
                    {isCheckingOut ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Thanh toán...
                      </span>
                    ) : (
                      'Thanh toán'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      clearCart();
                      stopOrderPolling();
                      setQuoteResult(null);
                      setCheckoutResult(null);
                      setOrderDetail(null);
                    }}
                  >
                    Xóa giỏ hàng
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {quoteResult && <QuoteSummary quote={quoteResult} />}
              {checkoutResult && <PaymentQrCard checkout={checkoutResult} />}

              <RealtimeStatusCard
                statuses={statuses}
                isPolling={isPolling}
                pollingError={pollingError}
                pollingTimedOut={pollingTimedOut}
                canPoll={Boolean(checkoutResult?.orderId)}
                onPollAgain={() => checkoutResult?.orderId && startOrderPolling(checkoutResult.orderId)}
                onStopPolling={stopOrderPolling}
              />

              {orderDetail && (
                <div className="rounded-lg border border-gray-200 bg-white p-4 text-xs text-gray-600">
                  orderRef: {orderDetail._id}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
