import { Shipment, ShippingStatus } from '@/types/shipping';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, MapPin, Phone } from 'lucide-react';

interface ShipmentTableProps {
  shipments: Shipment[];
  onViewDetail: (shipment: Shipment) => void;
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

export const ShipmentTable = ({
  shipments,
  onViewDetail,
}: ShipmentTableProps) => {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Mã vận đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Hãng VC</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">COD</TableHead>
            <TableHead>Cập nhật</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((shipment) => {
            const statusConfig = statusLabels[shipment.status];
            return (
              <TableRow key={shipment.id} className="hover:bg-muted/30">
                <TableCell>
                  <div>
                    <p className="text-foreground font-medium">
                      {shipment.trackingCode}
                    </p>
                    <p className="text-foreground/80 text-xs">
                      {shipment.orderId}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-foreground font-medium">
                      {shipment.customerName}
                    </p>
                    <div className="text-foreground/80 flex items-center gap-1 text-xs">
                      <Phone className="h-3 w-3" />
                      {shipment.customerPhone}
                    </div>
                    <div className="text-foreground/80 flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3" />
                      <span className="max-w-[200px] truncate">
                        {shipment.address}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{shipment.carrier}</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={statusConfig.status}>
                    {statusConfig.label}
                  </StatusBadge>
                </TableCell>
                <TableCell className="text-foreground text-right font-medium">
                  {formatCurrency(shipment.codAmount)}
                </TableCell>
                <TableCell>
                  <p className="text-foreground/80 text-sm">
                    {shipment.updatedAt}
                  </p>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground/80 hover:text-foreground"
                    onClick={() => onViewDetail(shipment)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {shipments.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-foreground/70 py-8 text-center"
              >
                Kh�ng c� v?n don n�o
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
