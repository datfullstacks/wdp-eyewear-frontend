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
import { RefundRequest, formatCurrency, methodConfig } from '@/types/refund';

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
      <DialogContent className="w-[92vw] max-w-md p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Hoan tat payout
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Nhap thong tin giao dich hoan tien cho yeu cau {refund?.id || ''}
          </DialogDescription>
        </DialogHeader>

        {refund && (
          <div className="space-y-4">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="mb-2 font-medium text-slate-900">
                Thong tin payout
              </p>
              <div className="space-y-1 text-sm text-slate-700">
                <p>
                  So tien: <span className="font-bold">{formatCurrency(amount)}</span>
                </p>
                <p>Phuong thuc: {methodConfig[refund.method].label}</p>
                {refund.bankInfo ? (
                  <>
                    <p>Bank: {refund.bankInfo.bankName || '--'}</p>
                    <p>So TK: {refund.bankInfo.accountNumber || '--'}</p>
                    <p>Chu TK: {refund.bankInfo.accountHolder || '--'}</p>
                  </>
                ) : (
                  <p>Khach chua cung cap thong tin tai khoan.</p>
                )}
              </div>
            </div>

            <div>
              <Label className="text-foreground/80">Ma giao dich</Label>
              <Input
                value={transactionRef}
                onChange={(event) => setTransactionRef(event.target.value)}
                placeholder="Nhap ma giao dich payout..."
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-foreground/80">Link chung tu payout (neu co)</Label>
              <Input
                value={payoutProofUrl}
                onChange={(event) => setPayoutProofUrl(event.target.value)}
                placeholder="https://... bang chung chuyen tien"
                className="mt-1"
              />
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => void handleProofUpload(event)}
                  disabled={uploadingProof}
                  className="text-sm"
                />
                {uploadingProof ? (
                  <p className="mt-1 text-xs text-slate-500">Dang upload chung tu...</p>
                ) : null}
              </div>
            </div>

            <div>
              <Label className="text-foreground/80">Ghi chu</Label>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Nhap ghi chu doi soat neu can..."
                className="mt-1"
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Huy
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !transactionRef.trim()}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Dang xu ly...' : 'Xac nhan da chuyen tien'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
