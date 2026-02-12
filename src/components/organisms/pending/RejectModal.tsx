import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { XCircle } from 'lucide-react';
import { PendingOrder } from '@/types/pending';
import { useState } from 'react';

interface RejectModalProps {
  order: PendingOrder | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export const RejectModal = ({
  order,
  onClose,
  onConfirm,
}: RejectModalProps) => {
  const [reason, setReason] = useState('');

  if (!order) return null;

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  const handleClose = () => {
    onClose();
    setReason('');
  };

  return (
    <Dialog open={!!order} onOpenChange={handleClose}>
      <DialogContent className="max-w-md w-[92vw] p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle>Từ chối đơn hàng</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-foreground/90">
            Từ chối đơn hàng <strong>{order.id}</strong> của khách hàng{' '}
            <strong>{order.customer}</strong>?
          </p>
          <div>
            <label className="text-sm font-medium text-foreground/80">
              Lý do từ chối *
            </label>
            <Textarea
              placeholder="Nhập lý do từ chối đơn hàng..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!reason.trim()}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Xác nhận từ chối
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
