import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Camera } from 'lucide-react';
import {
  ReturnRequest,
  typeLabels,
  typeColors,
  statusLabels,
  statusTypes,
  formatCurrency,
} from '@/types/returns';

interface ReturnDetailModalProps {
  request: ReturnRequest | null;
  onClose: () => void;
}

export const ReturnDetailModal = ({
  request,
  onClose,
}: ReturnDetailModalProps) => {
  return (
    <Dialog open={!!request} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] w-[92vw] max-w-lg overflow-y-auto p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2 text-base font-semibold">
            Chi tiết yêu cầu {request?.id}
            <Badge variant={typeColors[request?.type || 'exchange']}>
              {typeLabels[request?.type || 'exchange']}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        {request && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground/80">Mã đơn hàng</Label>
                <p className="text-foreground font-medium">{request.orderId}</p>
              </div>
              <div>
                <Label className="text-foreground/80">Trạng thái</Label>
                <div className="mt-1">
                  <StatusBadge status={statusTypes[request.status]}>
                    {statusLabels[request.status]}
                  </StatusBadge>
                </div>
              </div>
              <div>
                <Label className="text-foreground/80">Khách hàng</Label>
                <p className="font-medium">{request.customer}</p>
                <p className="text-foreground/70 text-sm">{request.phone}</p>
              </div>
              <div>
                <Label className="text-foreground/80">Ngày tạo</Label>
                <p className="font-medium">{request.createdAt}</p>
              </div>
            </div>

            <div>
              <Label className="text-foreground/80">Lý do</Label>
              <p className="font-medium">{request.reason}</p>
            </div>

            <div>
              <Label className="text-foreground/80">Sản phẩm</Label>
              <div className="mt-2 space-y-2">
                {request.products.map((product, index) => (
                  <div
                    key={index}
                    className="bg-muted/30 flex items-center justify-between rounded-lg p-3"
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-foreground/70 text-sm">
                        SKU: {product.sku} | SL: {product.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex justify-between border-t pt-3">
                <span className="font-medium">Tổng giá trị:</span>
                <span className="text-lg font-bold">
                  {formatCurrency(request.totalValue)}
                </span>
              </div>
            </div>

            {request.images.length > 0 && (
              <div>
                <Label className="text-foreground/80 flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Hình ảnh đính kèm ({request.images.length})
                </Label>
                <div className="mt-2 flex gap-2">
                  {request.images.map((index) => (
                    <div
                      key={index}
                      className="bg-muted/30 flex h-20 w-20 items-center justify-center rounded-lg"
                    >
                      <Camera className="text-muted-foreground h-8 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {request.notes && (
              <div>
                <Label className="text-foreground/80">Ghi chú</Label>
                <p className="bg-muted/30 mt-1 rounded-lg p-3">
                  {request.notes}
                </p>
              </div>
            )}

            {request.assignee && (
              <div>
                <Label className="text-foreground/80">Người xử lý</Label>
                <p className="font-medium">{request.assignee}</p>
              </div>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
