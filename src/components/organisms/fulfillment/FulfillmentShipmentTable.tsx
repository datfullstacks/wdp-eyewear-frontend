import {
  FulfillmentShipment,
  fulfillmentStatusConfig,
} from '@/types/fulfillment';

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
import { Eye, Printer, Copy } from 'lucide-react';

interface FulfillmentShipmentTableProps {
  shipments: FulfillmentShipment[];
  onViewDetail: (shipment: FulfillmentShipment) => void;
  onCopyTracking: (trackingNumber: string) => void;
}

export const FulfillmentShipmentTable = ({
  shipments,
  onViewDetail,
  onCopyTracking,
}: FulfillmentShipmentTableProps) => {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Mã vận đơn</TableHead>
            <TableHead>Mã đơn hàng</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Đơn vị VC</TableHead>
            <TableHead>COD</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {shipments.map((shipment) => {
            const config = fulfillmentStatusConfig[shipment.status];
            return (
              <TableRow key={shipment.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      {shipment.trackingNumber}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onCopyTracking(shipment.trackingNumber)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{shipment.orderId}</TableCell>
                <TableCell>
                  <div>{shipment.customerName}</div>
                  <div className="text-muted-foreground text-sm">
                    {shipment.customerPhone}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{shipment.carrier}</Badge>
                </TableCell>
                <TableCell>
                  {shipment.codAmount > 0 ? (
                    <span className="text-warning font-medium">
                      {shipment.codAmount.toLocaleString('vi-VN')}đ
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={config.variant} className={config.className}>
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div>{shipment.createdAt}</div>
                  <div className="text-muted-foreground text-sm">
                    Dự kiến: {shipment.estimatedDelivery}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onViewDetail(shipment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Printer className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          {shipments.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-muted-foreground py-8 text-center"
              >
                Không có vận đơn nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
