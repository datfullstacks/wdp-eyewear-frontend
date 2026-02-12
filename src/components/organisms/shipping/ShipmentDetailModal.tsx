import { Shipment, ShippingStatus } from '@/types/shipping';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { ShipmentHistoryItem } from '@/components/molecules/ShipmentHistoryItem';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Package,
  Phone,
  MapPin,
  Calendar,
  Scale,
  DollarSign,
} from 'lucide-react';

interface ShipmentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: Shipment | null;
}

const statusLabels: Record<
  ShippingStatus,
  {
    label: string;
    status: 'success' | 'warning' | 'error' | 'info' | 'default';
  }
> = {
  picking: { label: 'Chờ lấy', status: 'warning' },
  in_transit: { label: 'Đang vận chuyển', status: 'info' },
  delivering: { label: 'Đang giao', status: 'info' },
  delivered: { label: 'Đã giao', status: 'success' },
  returned: { label: 'Hoàn hàng', status: 'error' },
  failed: { label: 'Giao thất bại', status: 'error' },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const ShipmentDetailModal = ({
  open,
  onOpenChange,
  shipment,
}: ShipmentDetailModalProps) => {
  if (!shipment) return null;

  const statusConfig = statusLabels[shipment.status];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Chi tiết vận đơn - {shipment.trackingCode}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status & Basic Info */}
          <div className="bg-muted/50 flex items-center justify-between rounded-lg p-4">
            <div>
              <p className="text-muted-foreground text-sm">Trạng thái</p>
              <StatusBadge status={statusConfig.status} className="mt-1">
                {statusConfig.label}
              </StatusBadge>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm">Hãng vận chuyển</p>
              <p className="font-medium">{shipment.carrier}</p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-muted-foreground text-sm font-medium">
                Thông tin khách hàng
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Package className="text-muted-foreground h-4 w-4" />
                  <span>{shipment.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <span>{shipment.customerPhone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <span className="text-sm">{shipment.address}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-muted-foreground text-sm font-medium">
                Thông tin đơn hàng
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span>Mã đơn: {shipment.orderId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Scale className="text-muted-foreground h-4 w-4" />
                  <span>{shipment.weight} kg</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="text-muted-foreground h-4 w-4" />
                  <span>COD: {formatCurrency(shipment.codAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Fee Summary */}
          <div className="bg-accent/10 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Phí vận chuyển</span>
              <span className="font-medium">
                {formatCurrency(shipment.shippingFee)}
              </span>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <h4 className="text-muted-foreground text-sm font-medium">
              Lịch trình vận chuyển
            </h4>
            <div className="pl-2">
              {[...shipment.history].reverse().map((event, idx) => (
                <ShipmentHistoryItem
                  key={idx}
                  time={event.time}
                  status={event.status}
                  location={event.location}
                  note={event.note}
                  isLast={idx === shipment.history.length - 1}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
