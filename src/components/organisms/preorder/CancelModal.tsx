import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { formatCurrency } from '@/data/preorderData';
import type { PreorderOrder } from '@/types/preorder';

interface CancelModalProps {
  order: PreorderOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cancelReason: string;
  onCancelReasonChange: (reason: string) => void;
  onConfirm: () => void;
}

export const CancelModal = ({
  order,
  open,
  onOpenChange,
  cancelReason,
  onCancelReasonChange,
  onConfirm,
}: CancelModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md w-[92vw] p-4 sm:p-5">
      <DialogHeader>
        <DialogTitle className="text-foreground text-base font-semibold">
          Hủy đơn Pre-order
        </DialogTitle>
        <DialogDescription className="text-foreground/70">
          Bạn có chắc chắn muốn hủy đơn {order?.orderCode}?
        </DialogDescription>
      </DialogHeader>
      {order && (
        <div className="space-y-4">
          <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-3">
            <p className="text-destructive text-sm">
              <strong>Lưu ý:</strong> Đơn hàng sau khi hủy sẽ không thể khôi
              phục.
              {order.depositAmount > 0 && (
                <span>
                  {' '}
                  Khách đã đặt cọc {formatCurrency(order.depositAmount)}.
                </span>
              )}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground/80">
              Lý do hủy <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Nhập lý do hủy đơn..."
              value={cancelReason}
              onChange={(e) => onCancelReasonChange(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Quay lại
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          disabled={!cancelReason.trim()}
        >
          Xác nhận hủy
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
