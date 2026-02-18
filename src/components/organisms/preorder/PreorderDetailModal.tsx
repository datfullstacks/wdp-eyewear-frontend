import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PreorderProductStatusBadge } from '@/components/atoms/PreorderStatusBadge';
import { formatCurrency, formatDate } from '@/data/preorderData';
import type { PreorderOrder } from '@/types/preorder';
import { User, Phone, MapPin, Truck } from 'lucide-react';

interface PreorderDetailModalProps {
  order: PreorderOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PreorderDetailModal = ({
  order,
  open,
  onOpenChange,
}: PreorderDetailModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md w-[92vw] max-h-[80vh] overflow-y-auto p-4 sm:p-5">
      <DialogHeader>
        <DialogTitle className="text-foreground text-base font-semibold">
          Chi tiết đơn Pre-order
        </DialogTitle>
        <DialogDescription className="text-foreground/70">
          {order?.orderCode} - {formatDate(order?.orderDate || '')}
        </DialogDescription>
      </DialogHeader>
      {order && (
        <div className="space-y-4">
          <div className="bg-muted/30 grid grid-cols-2 gap-3 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <User className="text-foreground/70 h-4 w-4" />
              <div>
                <p className="text-foreground/80 text-sm">Khách hàng</p>
                <p className="font-medium">{order.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="text-foreground/70 h-4 w-4" />
              <div>
                <p className="text-foreground/80 text-sm">Số điện thoại</p>
                <p className="font-medium">{order.customerPhone}</p>
              </div>
            </div>
            <div className="col-span-2 flex items-start gap-2">
              <MapPin className="text-foreground/70 mt-0.5 h-4 w-4" />
              <div>
                <p className="text-foreground/80 text-sm">Địa chỉ</p>
                <p className="font-medium">{order.customerAddress}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 font-medium">Sản phẩm đặt trước</h4>
            <div className="space-y-3">
              {order.products.map((product, idx) => (
                <div
                  key={idx}
                  className="bg-muted/30 flex items-center justify-between rounded-lg p-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.name}</span>
                      <PreorderProductStatusBadge status={product.status} />
                    </div>
                    <p className="text-foreground/70 text-sm">
                      {product.sku} - {product.variant} x{product.quantity}
                    </p>
                    {product.batchCode && (
                      <div className="mt-1 flex items-center gap-2">
                        <Truck className="text-foreground/70 h-3 w-3" />
                        <span className="text-foreground/70 text-xs">
                          Lô: {product.batchCode} - Dự kiến:{' '}
                          {formatDate(product.batchExpectedDate || '')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted/30 flex items-center justify-between gap-3 rounded-lg p-3">
            <div>
              <p className="text-foreground/80 text-sm">Tổng tiền</p>
              <p className="text-lg font-bold">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-foreground/80 text-sm">Đã thanh toán</p>
              <p className="text-success text-lg font-medium">
                {formatCurrency(order.depositAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-foreground/80 text-sm">Còn lại</p>
              <p className="text-warning text-lg font-medium">
                {formatCurrency(order.totalAmount - order.depositAmount)}
              </p>
            </div>
          </div>

          {order.notes && (
            <div className="bg-warning/10 border-warning/20 rounded-lg border p-3">
              <p className="text-warning text-sm font-medium">Ghi chú:</p>
              <p className="text-warning/90 text-sm">{order.notes}</p>
            </div>
          )}
        </div>
      )}
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Đóng
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
