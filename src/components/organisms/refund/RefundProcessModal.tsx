import { type ChangeEvent, useEffect, useMemo, useState } from 'react';
import { CreditCard } from 'lucide-react';

import { uploadApi } from '@/api';
import { Input } from '@/components/atoms';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RefundPayoutQrCard } from './RefundPayoutQrCard';
import {
  RefundRequest,
  formatCurrency,
  hasRefundBankInfo,
  methodConfig,
} from '@/types/refund';

interface RefundProcessModalProps {
  refund: RefundRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: {
    transactionRef: string;
    payoutProofUrl: string;
    note: string;
  }) => Promise<void> | void;
  isSubmitting?: boolean;
}

export const RefundProcessModal = ({
  refund,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: RefundProcessModalProps) => {
  const [transactionRef, setTransactionRef] = useState('');
  const [payoutProofUrl, setPayoutProofUrl] = useState('');
  const [note, setNote] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    if (!open) {
      setTransactionRef('');
      setPayoutProofUrl('');
      setNote('');
      return;
    }

    setTransactionRef(refund?.transactionRef || '');
    setPayoutProofUrl(refund?.payoutProofUrl || '');
  }, [open, refund]);

  const amount = useMemo(() => {
    if (!refund) return 0;
    return (
      refund.approvedBreakdown.total ||
      refund.requestedBreakdown.total ||
      refund.amount
    );
  }, [refund]);

  const hasBankInfo = useMemo(
    () => hasRefundBankInfo(refund?.bankInfo),
    [refund]
  );

  const handleSubmit = async () => {
    await onSubmit({
      transactionRef: transactionRef.trim(),
      payoutProofUrl: payoutProofUrl.trim(),
      note: note.trim(),
    });
  };

  const handleProofUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingProof(true);
      const result = await uploadApi.uploadFile(file, {
        folder: 'refund-payout-proofs',
      });
      setPayoutProofUrl(result.url);
    } finally {
      setUploadingProof(false);
      event.target.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] w-[95vw] max-w-xl overflow-y-auto p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Hoàn tất payout
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Nhập thông tin giao dịch hoàn tiền cho yêu cầu {refund?.id || ''}
          </DialogDescription>
        </DialogHeader>

        {refund && (
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="mb-2 font-medium text-slate-900">Thông tin payout</p>
              <div className="space-y-1 text-sm text-slate-700">
                <p>
                  Số tiền: <span className="font-bold">{formatCurrency(amount)}</span>
                </p>
                <p>Phương thức: {methodConfig[refund.method].label}</p>
                {hasBankInfo && refund.bankInfo ? (
                  <>
                    <p>Ngân hàng: {refund.bankInfo.bankName || '--'}</p>
                    <p>Số TK: {refund.bankInfo.accountNumber || '--'}</p>
                    <p>Chủ TK: {refund.bankInfo.accountHolder || '--'}</p>
                  </>
                ) : (
                  <p>
                    Khách chưa cung cấp tài khoản hoàn tiền. Hãy yêu cầu bổ sung
                    trước khi xác nhận chuyển tiền.
                  </p>
                )}
              </div>
            </div>

            {hasBankInfo && refund.method === 'bank_transfer' ? (
              <RefundPayoutQrCard
                refund={refund}
                amount={amount}
                title="QR chuyển khoản hoàn tiền"
                layout="compact"
              />
            ) : null}

            <div>
              <Label className="text-foreground/80">Mã giao dịch</Label>
              <Input
                value={transactionRef}
                onChange={(event) => setTransactionRef(event.target.value)}
                placeholder="Nhập mã giao dịch payout..."
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-foreground/80">
                Link chứng từ payout (nếu có)
              </Label>
              <Input
                value={payoutProofUrl}
                onChange={(event) => setPayoutProofUrl(event.target.value)}
                placeholder="https://... bằng chứng chuyển tiền"
                className="mt-1"
              />
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handleProofUpload(event)}
                  disabled={uploadingProof}
                  className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium"
                />
                {uploadingProof ? (
                  <p className="mt-1 text-xs text-slate-500">
                    Đang upload chứng từ...
                  </p>
                ) : null}
              </div>
            </div>

            <div>
              <Label className="text-foreground/80">Ghi chú</Label>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Nhập ghi chú đối soát nếu cần..."
                className="mt-1"
              />
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !transactionRef.trim() || !hasBankInfo}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đã chuyển tiền'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
