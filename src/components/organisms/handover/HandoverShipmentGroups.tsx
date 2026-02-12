import {
  ShipmentForHandover,
  HandoverCarrierType,
  HandoverStatus,
  handoverCarrierColors,
} from '@/types/handover';
import { StatusBadge } from '@/components/atoms/StatusBadge';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Truck, Package } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface HandoverShipmentGroupsProps {
  groupedByCarrier: Record<string, ShipmentForHandover[]>;
  selectedShipments: string[];
  onToggleShipment: (id: string) => void;
  onSelectAllByCarrier: (carrier: HandoverCarrierType) => void;
}

const getStatusBadge = (status: HandoverStatus) => {
  switch (status) {
    case 'pending':
      return <StatusBadge status="warning">Chờ bàn giao</StatusBadge>;
    case 'ready':
      return <StatusBadge status="info">Sẵn sàng</StatusBadge>;
    case 'handed_over':
      return <StatusBadge status="warning">Đã bàn giao</StatusBadge>;
    case 'confirmed':
      return <StatusBadge status="success">Đã xác nhận</StatusBadge>;
  }
};

export const HandoverShipmentGroups = ({
  groupedByCarrier,
  selectedShipments,
  onToggleShipment,
  onSelectAllByCarrier,
}: HandoverShipmentGroupsProps) => {
  if (Object.keys(groupedByCarrier).length === 0) {
    return (
      <div className="glass-card rounded-xl p-12 text-center">
        <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <h3 className="mb-2 text-lg font-medium">Không có vận đơn nào</h3>
        <p className="text-muted-foreground">
          Chưa có vận đơn nào sẵn sàng để bàn giao
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedByCarrier).map(([carrier, carrierShipments]) => {
        const allSelected = carrierShipments.every((s) =>
          selectedShipments.includes(s.id)
        );
        const someSelected = carrierShipments.some((s) =>
          selectedShipments.includes(s.id)
        );

        return (
          <div key={carrier} className="glass-card overflow-hidden rounded-xl">
            <div className="border-border/60 flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) {
                      (
                        el as HTMLButtonElement & { indeterminate: boolean }
                      ).indeterminate = someSelected && !allSelected;
                    }
                  }}
                  onCheckedChange={() =>
                    onSelectAllByCarrier(carrier as HandoverCarrierType)
                  }
                />
                <div className="flex items-center gap-2">
                  <Truck className="text-muted-foreground h-5 w-5" />
                  <h3 className="text-foreground text-base font-medium">
                    {carrier}
                  </h3>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-medium ${handoverCarrierColors[carrier as HandoverCarrierType]}`}
                  >
                    {carrierShipments.length} vận đơn
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onSelectAllByCarrier(carrier as HandoverCarrierType)
                }
              >
                {allSelected ? 'B? ch?n' : 'Ch?n t?t c?'}
              </Button>
            </div>
            <Table className="text-sm font-normal">
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Mã vận đơn</TableHead>
                  <TableHead>Đơn hàng</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Kiện/KL</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carrierShipments.map((shipment) => (
                  <TableRow key={shipment.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Checkbox
                        checked={selectedShipments.includes(shipment.id)}
                        onCheckedChange={() => onToggleShipment(shipment.id)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {shipment.trackingNumber}
                    </TableCell>
                    <TableCell className="text-primary font-medium">
                      {shipment.orderId}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{shipment.customerName}</p>
                        <p className="text-muted-foreground text-xs">
                          {shipment.customerPhone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      <p className="max-w-xs truncate">{shipment.address}</p>
                    </TableCell>
                    <TableCell className="text-sm">
                      {shipment.packageCount} kiện � {shipment.weight} kg
                    </TableCell>
                    <TableCell>{getStatusBadge(shipment.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      })}
    </div>
  );
};
