import { useEffect, useState } from 'react';
import { MessageSquareWarning } from 'lucide-react';

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
import { RefundRequest } from '@/types/refund';

interface RefundContactModalProps {
  refund: RefundRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (payload: { note: string }) => Promise<void> | void;
  isSubmitting?: boolean;
}

export const RefundContactModal = ({
  refund,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: RefundContactModalProps) => {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!open) {
      setNote('');
    }
  }, [open]);

  const helperText =
    'Ghi rõ thông tin sale đang cần khách hàng bổ sung: lý do, hình ảnh, tài khoản nhận tiền, hoặc xác nhận tình trạng đơn.';
  const inputPlaceholder =
    'Nhập nội dung sale cần khách hàng bổ sung...';

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
            Yêu cầu bổ sung thông tin
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Chuyển refund {refund?.id} sang trạng thái chờ khách bổ sung
          </DialogDescription>
        </DialogHeader>

        {refund && (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="font-medium">{refund.customerName}</p>
              <p className="text-foreground/70">{refund.customerPhone}</p>
            </div>

            <div
              className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-slate-700"
              title={helperText}
            >
              Ghi rõ thông tin sale đang cần khách hàng bổ sung: lý do, hình
              ảnh, tài khoản nhận tiền, hoặc xác nhận tình trạng đơn.
            </div>

            <div>
              <Label className="text-foreground/80">Nội dung yêu cầu *</Label>
              <Textarea
                aria-label={inputPlaceholder}
                placeholder="Nhập nội dung sale cần khách hàng bổ sung..."
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
            Đóng
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !note.trim()}
          >
            <MessageSquareWarning className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
