import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PreorderProductStatusBadge } from '@/components/atoms/PreorderStatusBadge';
import { batchOptions } from '@/data/preorderData';
import type { PreorderOrder } from '@/types/preorder';

interface LinkBatchModalProps {
  order: PreorderOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const LinkBatchModal = ({
  order,
  open,
  onOpenChange,
  onConfirm,
}: LinkBatchModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md w-[92vw] max-h-[80vh] overflow-y-auto p-4 sm:p-5">
      <DialogHeader>
        <DialogTitle className="text-foreground text-base font-semibold">
          Liên kết đợt hàng
        </DialogTitle>
        <DialogDescription className="text-foreground/70">
          Liên kết sản phẩm trong đơn {order?.orderCode} với đợt hàng Pre-order
        </DialogDescription>
      </DialogHeader>
      {order && (
        <div className="space-y-4">
          {order.products.map((product, idx) => (
            <div key={idx} className="bg-muted/30 space-y-3 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-foreground/70 text-sm">
                    {product.variant}
                  </p>
                </div>
                <PreorderProductStatusBadge status={product.status} />
              </div>
              <Select defaultValue={product.batchCode || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đợt hàng" />
                </SelectTrigger>
                <SelectContent>
                  {batchOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Hủy
        </Button>
        <Button onClick={onConfirm}>Lưu liên kết</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
