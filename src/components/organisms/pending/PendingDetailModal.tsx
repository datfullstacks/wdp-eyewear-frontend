import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { User, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { PendingOrder } from '@/types/pending';
import {
  priorityConfig,
  paymentStatusConfig,
  formatCurrency,
} from '@/data/pendingData';

interface PendingDetailModalProps {
  order: PendingOrder | null;
  onClose: () => void;
  onProcess: (order: PendingOrder) => void;
  onReject: (order: PendingOrder) => void;
}

export const PendingDetailModal = ({
  order,
  onClose,
  onProcess,
  onReject,
}: PendingDetailModalProps) => {
  if (!order) return null;

  return (
    <Dialog open={!!order} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[92vw] max-h-[70vh] overflow-y-auto p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Chi tiết đơn hàng {order.id}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Customer Info */}
          <div className="bg-muted/30 space-y-3 rounded-lg p-3">
            <h4 className="text-foreground flex items-center gap-2 font-semibold">
              <User className="h-4 w-4" />
              Thông tin khách hàng
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-foreground/90">Họ tên</p>
                <p className="font-medium">{order.customer}</p>
              </div>
              <div>
                <p className="text-foreground/90">Số điện thoại</p>
                <p className="flex items-center gap-1 font-medium">
                  <Phone className="h-3 w-3" />
                  {order.phone}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-foreground/90">Địa chỉ giao hàng</p>
                <p className="flex items-center gap-1 font-medium">
                  <MapPin className="h-3 w-3" />
                  {order.address}
                </p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="mb-3 font-medium">Sản phẩm đặt mua</h4>
            <div className="space-y-2">
              {order.products.map((product, idx) => (
                <div
                  key={idx}
                  className="bg-muted/30 flex items-center justify-between rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-foreground/85 text-sm">
                      {product.variant}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(product.price)}
                    </p>
                    <p className="text-foreground/85 text-sm">
                      x{product.qty}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex items-center gap-4">
              <StatusBadge status={priorityConfig[order.priority].color}>
                {priorityConfig[order.priority].label}
              </StatusBadge>
              <StatusBadge
                status={paymentStatusConfig[order.paymentStatus].color}
              >
                {paymentStatusConfig[order.paymentStatus].label}
              </StatusBadge>
            </div>
            <div className="text-right">
              <p className="text-foreground/90 text-sm">Tổng cộng</p>
              <p className="text-lg font-bold">{formatCurrency(order.total)}</p>
            </div>
          </div>

          {order.note && (
            <div className="bg-warning/10 border-warning/20 rounded-lg border p-3">
              <p className="text-warning text-sm font-medium">Ghi chú:</p>
              <p className="text-sm">{order.note}</p>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onClose();
                onReject(order);
              }}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Từ chối
            </Button>
            <Button
              onClick={() => {
                onClose();
                onProcess(order);
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Xác nhận xử lý
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
