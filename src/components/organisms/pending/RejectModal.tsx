import { XCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PendingOrder } from '@/types/pending';

interface RejectModalProps {
  order: PendingOrder | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const RejectModal = ({
  order,
  onClose,
  onConfirm,
}: RejectModalProps) => {
  if (!order) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={!!order} onOpenChange={handleClose}>
      <DialogContent className="w-[92vw] max-w-md p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle>Từ chối đơn hàng</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-foreground/90">
            Từ chối đơn hàng <strong>{order.id}</strong> của khách hàng{' '}
            <strong>{order.customer}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-slate-300 bg-white font-semibold text-slate-950 hover:bg-slate-100 hover:text-slate-950"
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
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
