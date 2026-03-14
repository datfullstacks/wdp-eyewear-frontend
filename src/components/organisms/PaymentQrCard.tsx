import type { CheckoutData } from '@/types/saleCheckout';

interface PaymentQrCardProps {
  checkout: CheckoutData;
}

export const PaymentQrCard: React.FC<PaymentQrCardProps> = ({ checkout }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Thông tin chuyển khoản</h2>
      <p className="mb-2 text-sm text-gray-700">orderId: {checkout.orderId}</p>

      <div className="space-y-1 text-sm text-gray-700">
        <p>paymentCode: {checkout.payment?.paymentCode || '-'}</p>
        <p>content: {checkout.payment?.content || '-'}</p>
        <p>bankName: {checkout.payment?.bankName || '-'}</p>
        <p>bankAccountNumber: {checkout.payment?.bankAccountNumber || '-'}</p>
        <p>bankAccountName: {checkout.payment?.bankAccountName || '-'}</p>
        <p>description: {checkout.payment?.description || '-'}</p>
        <p>instruction: {checkout.payment?.instruction || '-'}</p>
      </div>

      {checkout.payment?.qrUrl && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-gray-800">QR SePay</p>
          <img
            src={checkout.payment.qrUrl}
            alt="SePay QR"
            className="h-56 w-56 rounded-lg border border-gray-200 bg-white object-contain p-2"
          />
          <a
            href={checkout.payment.qrUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block text-sm text-blue-700 underline"
          >
            Mở QR URL
          </a>
        </div>
      )}
    </div>
  );
};
