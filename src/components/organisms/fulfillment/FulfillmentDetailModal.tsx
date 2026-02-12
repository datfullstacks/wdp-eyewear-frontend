import {
  FulfillmentShipment,
  fulfillmentStatusConfig,
} from '@/types/fulfillment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { User, Phone, MapPin, Package, Printer } from 'lucide-react';

interface FulfillmentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: FulfillmentShipment | null;
}

export const FulfillmentDetailModal = ({
  open,
  onOpenChange,
  shipment,
}: FulfillmentDetailModalProps) => {
  if (!shipment) return null;

  const config = fulfillmentStatusConfig[shipment.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết vận đơn</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-muted flex items-center justify-between rounded-lg p-4">
            <div>
              <p className="text-muted-foreground text-sm">Mã vận đơn</p>
              <p className="font-mono text-lg font-bold">
                {shipment.trackingNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm">Đơn vị vận chuyển</p>
              <p className="font-medium">{shipment.carrier}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium">Thông tin khách hàng</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="text-muted-foreground h-4 w-4" />
                  <span>{shipment.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <span>{shipment.customerPhone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div>
                    <p>{shipment.address}</p>
                    <p className="text-muted-foreground">
                      {shipment.district}, {shipment.city}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Thông tin đơn hàng</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã đơn hàng:</span>
                  <span className="font-medium">{shipment.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Khối lượng:</span>
                  <span>{shipment.weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển:</span>
                  <span>{shipment.shippingFee.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thu hộ (COD):</span>
                  <span className="text-warning font-medium">
                    {shipment.codAmount > 0
                      ? `${shipment.codAmount.toLocaleString('vi-VN')}đ`
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Sản phẩm</h4>
            <div className="rounded-lg border p-3">
              {shipment.products.map((product, index) => (
                <div key={index} className="flex items-center gap-2 py-1">
                  <Package className="text-muted-foreground h-4 w-4" />
                  <span>{product}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-muted-foreground text-sm">Trạng thái</p>
              <Badge variant={config.variant} className={config.className}>
                {config.label}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm">Dự kiến giao</p>
              <p className="font-medium">{shipment.estimatedDelivery}</p>
            </div>
          </div>

          {shipment.notes && (
            <div className="space-y-2">
              <h4 className="font-medium">Ghi chú</h4>
              <p className="bg-muted rounded-lg p-3 text-sm">
                {shipment.notes}
              </p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button>
            <Printer className="mr-2 h-4 w-4" />
            In nhãn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
