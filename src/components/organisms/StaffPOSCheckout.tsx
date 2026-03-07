'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms';
import { Input } from '@/components/atoms';
import { CreditCard, Banknote, QrCode, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface CheckoutFormData {
  fullName: string;
  phone: string;
  email: string;
  note: string;
}

interface StaffPOSCheckoutProps {
  subtotal: number;
  itemCount: number;
  disabled?: boolean;
  onCheckout: (paymentMethod: 'cash' | 'qr', formData: CheckoutFormData) => Promise<void>;
}

export const StaffPOSCheckout: React.FC<StaffPOSCheckoutProps> = ({
  subtotal,
  itemCount,
  disabled = false,
  onCheckout,
}) => {
  const [formData, setFormData] = useState<CheckoutFormData>({
    fullName: '',
    phone: '',
    email: '',
    note: '',
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [orderCode, setOrderCode] = useState<string>('');

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCashPayment = async () => {
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      alert('Vui lòng nhập tên và số điện thoại khách hàng');
      return;
    }

    setIsProcessing(true);
    try {
      await onCheckout('cash', formData);
      // Reset form
      setFormData({ fullName: '', phone: '', email: '', note: '' });
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQRPayment = async () => {
    if (!formData.fullName.trim() || !formData.phone.trim()) {
      alert('Vui lòng nhập tên và số điện thoại khách hàng');
      return;
    }

    setIsProcessing(true);
    try {
      // Gọi API để tạo đơn hàng với thanh toán QR
      await onCheckout('qr', formData);
      
      // Giả lập QR code (trong thực tế sẽ nhận từ API)
      const mockQRCode = `https://api.vietqr.io/image/970422-0123456789-compact2.jpg?amount=${subtotal}&addInfo=DH${Date.now()}`;
      const mockOrderCode = `WDP-${Date.now()}`;
      
      setQrCodeUrl(mockQRCode);
      setOrderCode(mockOrderCode);
      setShowQRModal(true);
      
      // Reset form
      setFormData({ fullName: '', phone: '', email: '', note: '' });
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.');
    } finally {
      setIsProcessing(false);
    }
  };

  const tax = subtotal * 0.1; // 10% VAT
  const total = subtotal + tax;

  return (
    <>
      <div className="flex h-full flex-col border-t-2 border-gray-200 bg-white">
        {/* Form Section */}
        <div className="flex-1 overflow-y-auto p-4">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Thông tin khách hàng
          </h3>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tên khách hàng <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                placeholder="Nhập tên khách hàng"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                disabled={disabled || isProcessing}
                className="h-11"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={disabled || isProcessing}
                className="h-11"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email (không bắt buộc)
              </label>
              <Input
                type="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={disabled || isProcessing}
                className="h-11"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ghi chú
              </label>
              <textarea
                placeholder="Ghi chú đơn hàng"
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                disabled={disabled || isProcessing}
                className="min-h-[80px] w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
              />
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tạm tính:</span>
              <span className="font-medium text-gray-900">
                {subtotal.toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">VAT (10%):</span>
              <span className="font-medium text-gray-900">
                {tax.toLocaleString('vi-VN')} ₫
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-300 pt-2">
              <span className="text-base font-semibold text-gray-900">
                Tổng cộng:
              </span>
              <span className="text-xl font-bold text-yellow-600">
                {total.toLocaleString('vi-VN')} ₫
              </span>
            </div>
          </div>

          {/* Payment Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleCashPayment}
              disabled={disabled || itemCount === 0 || isProcessing}
              className={cn(
                'h-14 w-full flex-col gap-1 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50',
                isProcessing && 'cursor-wait'
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-xs">Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Banknote className="h-5 w-5" />
                  <span className="text-xs font-medium">Tiền mặt</span>
                </>
              )}
            </Button>

            <Button
              onClick={handleQRPayment}
              disabled={disabled || itemCount === 0 || isProcessing}
              className={cn(
                'h-14 w-full flex-col gap-1 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50',
                isProcessing && 'cursor-wait'
              )}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-xs">Đang xử lý...</span>
                </>
              ) : (
                <>
                  <QrCode className="h-5 w-5" />
                  <span className="text-xs font-medium">QR Code</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Quét mã QR để thanh toán</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowQRModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Khách hàng vui lòng quét mã QR để hoàn tất thanh toán
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-4 py-4">
            <div className="rounded-lg border-4 border-blue-600 p-4">
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="h-64 w-64 object-contain"
                onError={(e) => {
                  // Fallback placeholder
                  e.currentTarget.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Crect width='256' height='256' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='monospace' font-size='20' fill='%23999'%3EQR Code%3C/text%3E%3C/svg%3E`;
                }}
              />
            </div>

            <div className="text-center">
              <p className="text-sm font-medium text-gray-900">Mã đơn hàng:</p>
              <p className="text-lg font-bold text-blue-600">{orderCode}</p>
            </div>

            <div className="w-full rounded-lg bg-blue-50 p-4">
              <p className="text-center text-sm font-medium text-blue-900">
                Số tiền: {total.toLocaleString('vi-VN')} ₫
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowQRModal(false)}
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
