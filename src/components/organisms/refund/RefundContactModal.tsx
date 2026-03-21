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
            Yeu cau bo sung thong tin
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Chuyen refund {refund?.id} sang trang thai cho khach bo sung
          </DialogDescription>
        </DialogHeader>

        {refund && (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-3">
              <p className="font-medium">{refund.customerName}</p>
              <p className="text-foreground/70">{refund.customerPhone}</p>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-slate-700">
              Ghi ro thong tin staff dang can khach hang bo sung: ly do, hinh
              anh, tai khoan nhan tien, hoac xac nhan tinh trang don.
            </div>

            <div>
              <Label className="text-foreground/80">Noi dung yeu cau *</Label>
              <Textarea
                placeholder="Nhap noi dung staff can khach hang bo sung..."
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
            Dong
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || !note.trim()}
          >
            <MessageSquareWarning className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Dang gui...' : 'Gui yeu cau'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
