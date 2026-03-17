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
    <DialogContent className="max-h-[80vh] w-[92vw] max-w-md overflow-y-auto border border-border bg-background p-4 shadow-xl sm:p-5">
      <DialogHeader>
        <DialogTitle className="text-foreground text-base font-semibold">
          Chi tiết đơn Pre-order
        </DialogTitle>
        <DialogDescription className="text-foreground text-sm">
          {order?.orderCode} - {formatDate(order?.orderDate || '')}
        </DialogDescription>
      </DialogHeader>
      {order && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 rounded-lg border border-border bg-card p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <User className="text-foreground h-4 w-4" />
              <div>
                <p className="text-foreground text-sm font-medium">Khách hàng</p>
                <p className="text-foreground font-semibold">{order.customerName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="text-foreground h-4 w-4" />
              <div>
                <p className="text-foreground text-sm font-medium">Số điện thoại</p>
                <p className="text-foreground font-semibold">{order.customerPhone}</p>
              </div>
            </div>
            <div className="col-span-2 flex items-start gap-2">
              <MapPin className="text-foreground mt-0.5 h-4 w-4" />
              <div>
                <p className="text-foreground text-sm font-medium">Địa chỉ</p>
                <p className="text-foreground font-semibold">{order.customerAddress}</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-foreground font-semibold">Sản phẩm đặt trước</h4>
            <div className="space-y-3">
              {order.products.map((product, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-sm"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-semibold">{product.name}</span>
                      <PreorderProductStatusBadge status={product.status} />
                    </div>
                    <p className="text-foreground text-sm">
                      {product.sku} - {product.variant} x{product.quantity}
                    </p>
                    {product.batchCode && (
                      <div className="mt-1 flex items-center gap-2">
                        <Truck className="text-foreground h-3 w-3" />
                        <span className="text-foreground/90 text-xs font-medium">
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

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-sm">
            <div>
              <p className="text-foreground text-sm font-medium">Tổng tiền</p>
              <p className="text-foreground text-lg font-bold">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-foreground text-sm font-medium">Đã thanh toán</p>
              <p className="text-success text-lg font-medium">
                {formatCurrency(order.depositAmount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-foreground text-sm font-medium">Còn lại</p>
              <p className="text-warning text-lg font-medium">
                {formatCurrency(order.totalAmount - order.depositAmount)}
              </p>
            </div>
          </div>

          {order.notes && (
            <div className="bg-warning/10 border-warning/20 rounded-lg border p-3">
              <p className="text-warning text-sm font-medium">Ghi chú:</p>
              <p className="text-foreground text-sm">{order.notes}</p>
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
