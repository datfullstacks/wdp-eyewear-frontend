import { useEffect, useState } from 'react';
import { AlertTriangle, CornerUpLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RefundRequest, formatCurrency } from '@/types/refund';

interface RefundEscalateModalProps {
  refund: RefundRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { note: string }) => Promise<void> | void;
  isSubmitting?: boolean;
  mode?: 'escalate' | 'send_back';
}

export const RefundEscalateModal = ({
  refund,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  mode = 'escalate',
}: RefundEscalateModalProps) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) {
      setNote('');
    }
  }, [open]);

  const isSendBack = mode === 'send_back';
  const Icon = isSendBack ? CornerUpLeft : AlertTriangle;
  const title = isSendBack ? 'Trả lại sale' : 'Chuyển manager';
  const description = isSendBack
    ? `Trả case ${refund?.id || ''} về sale để kiểm tra thêm`
    : `Chuyển case ${refund?.id || ''} lên manager phê duyệt`;
  const label = isSendBack ? 'Lý do trả lại *' : 'Lý do chuyển manager *';
  const placeholder = isSendBack
    ? 'Nhập lý do cần sale bổ sung xác minh...'
    : 'Nhập lý do cần manager can thiệp...';
  const confirmLabel = isSendBack ? 'Trả về sale' : 'Chuyển manager';

  const handleSubmit = async () => {
    const trimmed = note.trim();
    if (!trimmed) return;
    await onSubmit({ note: trimmed });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-md p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            {title}
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            {description}
          </DialogDescription>
        </DialogHeader>

        {refund && (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="mb-2 flex items-center gap-2 text-amber-700">
                <Icon className="h-5 w-5" />
                <span className="font-medium">
                  {isSendBack
                    ? 'Case cần bổ sung'
                    : 'Case cần exception approval'}
                </span>
              </div>
              <p className="text-sm text-slate-700">
                Số tiền:{' '}
                <span className="font-semibold">
                  {formatCurrency(refund.amount)}
                </span>
              </p>
              <p className="text-sm text-slate-700">Đơn: {refund.orderId}</p>
            </div>

            <div>
              <Label className="text-foreground/80">{label}</Label>
              <Textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={placeholder}
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
            Hủy
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !note.trim()}
          >
            <Icon className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Đang xử lý...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
