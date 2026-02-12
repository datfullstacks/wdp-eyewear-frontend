import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';
import { PendingOrder } from '@/types/pending';
import { formatCurrency } from '@/data/pendingData';

interface ProcessModalProps {
  order: PendingOrder | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const ProcessModal = ({
  order,
  onClose,
  onConfirm,
}: ProcessModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[92vw] p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle>Xác nhận xử lý đơn hàng</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-foreground/90">
            Bạn có chắc muốn xác nhận xử lý đơn hàng <strong>{order.id}</strong>
            ?
          </p>
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="font-medium">{order.customer}</p>
            <p className="text-foreground/70 text-sm">
              {order.products.length} sản phẩm - {formatCurrency(order.total)}
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button onClick={onConfirm}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Xác nhận
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
