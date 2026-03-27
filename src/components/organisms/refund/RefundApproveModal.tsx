import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';

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
import { RefundRequest, formatCurrency, methodConfig } from '@/types/refund';

interface RefundApproveModalProps {
  refund: RefundRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { note: string }) => Promise<void> | void;
  isSubmitting?: boolean;
  scope?: 'sale' | 'manager';
}

export const RefundApproveModal = ({
  refund,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  scope = 'sale',
}: RefundApproveModalProps) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) {
      setNote('');
    }
  }, [open]);

  const title =
    scope === 'manager' ? 'Phê duyệt case refund' : 'Duyệt yêu cầu hoàn tiền';
  const description =
    scope === 'manager'
      ? `Phê duyệt case exception ${refund?.id || ''}`
      : `Xác nhận duyệt yêu cầu hoàn tiền ${refund?.id || ''}`;

  const handleSubmit = async () => {
    await onSubmit({ note: note.trim() });
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
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <div className="mb-2 flex items-center gap-2 text-emerald-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Xác nhận duyệt hoàn tiền</span>
              </div>
              <p className="text-sm text-slate-700">
                Số tiền:{' '}
                <span className="font-bold">
                  {formatCurrency(refund.amount)}
                </span>
              </p>
              <p className="text-sm text-slate-700">
                Phương thức: {methodConfig[refund.method].label}
              </p>
            </div>

            <div>
              <Label className="text-foreground/80">Ghi chú (tùy chọn)</Label>
              <Textarea
                placeholder="Nhập ghi chú nếu có..."
                className="mt-1"
                value={note}
                onChange={(event) => setNote(event.target.value)}
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
            className="bg-success hover:bg-success/90"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Đang xử lý...' : 'Duyệt yêu cầu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
