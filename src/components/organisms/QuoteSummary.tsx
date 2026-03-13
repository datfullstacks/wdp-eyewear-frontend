import type { QuoteData } from '@/types/saleCheckout';

interface QuoteSummaryProps {
  quote: QuoteData;
}

function formatMoney(value?: number): string {
  return Number(value || 0).toLocaleString('vi-VN');
}

export const QuoteSummary: React.FC<QuoteSummaryProps> = ({ quote }) => {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Quote Summary</h2>
      <div className="space-y-2 text-sm text-gray-700">
        <div className="flex justify-between">
          <span>subtotal</span>
          <span>{formatMoney(quote.subtotal)} ₫</span>
        </div>
        <div className="flex justify-between">
          <span>shippingFee</span>
          <span>{formatMoney(quote.shippingFee)} ₫</span>
        </div>
        <div className="flex justify-between">
          <span>discountAmount</span>
          <span>{formatMoney(quote.discountAmount)} ₫</span>
        </div>
        <div className="flex justify-between">
          <span>total</span>
          <span>{formatMoney(quote.total)} ₫</span>
        </div>
        <div className="flex justify-between">
          <span>payNow</span>
          <span>{formatMoney(quote.payNow)} ₫</span>
        </div>
        <div className="flex justify-between">
          <span>payLater</span>
          <span>{formatMoney(quote.payLater)} ₫</span>
        </div>
        <div className="flex justify-between">
          <span>payNowTotal</span>
          <span>{formatMoney(quote.payNowTotal)} ₫</span>
        </div>
        <div className="flex justify-between">
          <span>payLaterTotal</span>
          <span>{formatMoney(quote.payLaterTotal)} ₫</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-2">
          <span>paymentMethod</span>
          <span className="font-medium uppercase">{quote.paymentMethod || '-'}</span>
        </div>
      </div>
    </div>
  );
};
