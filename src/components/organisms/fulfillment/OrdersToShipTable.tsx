import { OrderToShip } from '@/types/fulfillment';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Package, Plus } from 'lucide-react';

interface OrdersToShipTableProps {
  orders: OrderToShip[];
  selectedOrders: string[];
  onToggleOrder: (orderId: string) => void;
  onToggleAll: () => void;
  onCreateShipment: () => void;
}

export const OrdersToShipTable = ({
  orders,
  selectedOrders,
  onToggleOrder,
  onToggleAll,
  onCreateShipment,
}: OrdersToShipTableProps) => {
  if (orders.length === 0) return null;

  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <div className="border-border flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="flex items-center gap-2 text-foreground/90 text-sm font-medium">
          <Package className="text-warning h-4 w-4" />
          Đơn hàng chờ tạo vận đơn ({orders.length})
        </div>
        {selectedOrders.length > 0 && (
          <Button onClick={onCreateShipment} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Tạo vận đơn ({selectedOrders.length})
          </Button>
        )}
      </div>
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={selectedOrders.length === orders.length}
                onCheckedChange={onToggleAll}
              />
            </TableHead>
            <TableHead>Mã đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead className="text-right">Thanh toán</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-muted/30">
              <TableCell>
                <Checkbox
                  checked={selectedOrders.includes(order.id)}
                  onCheckedChange={() => onToggleOrder(order.id)}
                />
              </TableCell>
              <TableCell className="text-foreground font-mono text-sm font-normal">
                {order.orderId}
              </TableCell>
              <TableCell>
                <div className="text-foreground">{order.customerName}</div>
                <div className="text-foreground/80 text-sm">
                  {order.customerPhone}
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-[200px] truncate text-foreground">
                  {order.address}
                </div>
                <div className="text-foreground/70 text-sm">
                  {order.district}, {order.city}
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-[150px] truncate text-foreground">
                  {order.products.join(', ')}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="text-foreground font-medium">
                  {order.total.toLocaleString('vi-VN')}đ
                </div>
                <Badge
                  variant={
                    order.paymentMethod === 'cod' ? 'secondary' : 'default'
                  }
                  className={order.paymentMethod === 'paid' ? 'bg-success' : ''}
                >
                  {order.paymentMethod === 'cod' ? 'COD' : 'Đã thanh toán'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
