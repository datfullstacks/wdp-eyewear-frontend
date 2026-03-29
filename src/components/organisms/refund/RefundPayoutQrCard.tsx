import { useEffect, useMemo, useState } from 'react';
import { Copy, ExternalLink, QrCode } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RefundRequest, formatCurrency } from '@/types/refund';

interface RefundPayoutQrCardProps {
  refund: RefundRequest;
  amount: number;
  title?: string;
  layout?: 'default' | 'compact';
}

function buildRefundPayoutTransferContent(refund: RefundRequest) {
  return String(refund.id || refund.orderId || 'REFUND')
    .trim()
    .replace(/[^A-Za-z0-9]/g, '')
    .toUpperCase()
    .slice(0, 20);
}

function buildRefundPayoutQrUrl(refund: RefundRequest, amount: number) {
  const bankName = String(refund.bankInfo?.bankName || '').trim();
  const accountNumber = String(refund.bankInfo?.accountNumber || '').trim();
  const roundedAmount = Math.round(Number(amount) || 0);

  if (!bankName || !accountNumber || roundedAmount <= 0) {
    return null;
  }

  const params = [
    `acc=${encodeURIComponent(accountNumber)}`,
    `bank=${encodeURIComponent(bankName)}`,
    `amount=${roundedAmount}`,
    `des=${encodeURIComponent(buildRefundPayoutTransferContent(refund))}`,
  ];

  return `https://qr.sepay.vn/img?${params.join('&')}`;
}

export const RefundPayoutQrCard = ({
  refund,
  amount,
  title = 'QR hoàn tiền',
  layout = 'default',
}: RefundPayoutQrCardProps) => {
  const [copied, setCopied] = useState<'content' | 'account' | null>(null);
  const isCompact = layout === 'compact';
  const transferContent = useMemo(
    () => buildRefundPayoutTransferContent(refund),
    [refund]
  );
  const qrUrl = useMemo(
    () => buildRefundPayoutQrUrl(refund, amount),
    [amount, refund]
  );

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(null), 1600);
    return () => window.clearTimeout(timer);
  }, [copied]);

  if (!qrUrl) {
    return null;
  }

  const handleCopy = async (value: string, field: 'content' | 'account') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(field);
    } catch {
      window.alert('Không thể sao chép. Vui lòng copy thủ công.');
    }
  };

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
      <div
        className={cn(
          'flex items-start justify-between gap-3',
          isCompact ? 'flex-col' : 'flex-col sm:flex-row'
        )}
      >
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-950">
            <QrCode className="h-4 w-4" />
            {title}
          </p>
          <p className="mt-1 text-sm text-emerald-900/80">
            Sale có thể quét hoặc mở QR để chuyển khoản nhanh cho khách.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className={cn(
            'h-9 shrink-0 border-emerald-700 bg-emerald-600 font-semibold text-white shadow-[0_10px_24px_rgba(5,150,105,0.28)] hover:bg-emerald-700 hover:text-white focus-visible:ring-emerald-500',
            isCompact ? 'w-full justify-center' : 'self-start'
          )}
        >
          <a href={qrUrl} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Mở QR
          </a>
        </Button>
      </div>

      <div
        className={cn(
          'mt-4 grid gap-4',
          isCompact
            ? 'grid-cols-1'
            : 'grid-cols-1 md:grid-cols-[188px_minmax(0,1fr)]'
        )}
      >
        <div
          className={cn(
            'rounded-xl border border-emerald-200 bg-white p-3',
            isCompact && 'mx-auto w-full max-w-[224px]'
          )}
        >
          <img
            src={qrUrl}
            alt={`QR hoàn tiền ${refund.id}`}
            className={cn(
              'mx-auto rounded-lg object-contain',
              isCompact ? 'h-44 w-44' : 'h-40 w-40'
            )}
          />
        </div>

        <div className="min-w-0 space-y-4 rounded-xl border border-emerald-200 bg-white p-4 text-sm text-slate-700">
          <div className="space-y-1">
            <span className="font-medium text-slate-600">Số tiền</span>
            <span className="block text-base font-semibold text-slate-950">
              {formatCurrency(amount)}
            </span>
          </div>

          <div className="space-y-1">
            <span className="font-medium text-slate-600">Ngân hàng</span>
            <span className="block break-words font-semibold text-slate-950">
              {refund.bankInfo?.bankName || '--'}
            </span>
          </div>

          <div className="space-y-2">
            <span className="font-medium text-slate-600">Số TK</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="break-all font-semibold text-slate-950">
                {refund.bankInfo?.accountNumber || '--'}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 px-2"
                onClick={() =>
                  void handleCopy(String(refund.bankInfo?.accountNumber || ''), 'account')
                }
              >
                <Copy className="mr-1 h-3.5 w-3.5" />
                {copied === 'account' ? 'Đã chép' : 'Copy'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <span className="font-medium text-slate-600">Nội dung CK</span>
            <div className="flex flex-wrap items-start gap-2">
              <span className="max-w-full break-all rounded-lg bg-slate-100 px-3 py-2 font-semibold text-slate-950">
                {transferContent}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 shrink-0 px-2"
                onClick={() => void handleCopy(transferContent, 'content')}
              >
                <Copy className="mr-1 h-3.5 w-3.5" />
                {copied === 'content' ? 'Đã chép' : 'Copy'}
              </Button>
            </div>
          </div>

          <p className="text-xs leading-5 text-slate-500">
            Nội dung chuyển khoản dùng để đối soát nhanh yêu cầu {refund.id}.
          </p>
        </div>
      </div>
    </div>
  );
};
