import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DelayedOrderRow } from '@/components/molecules/DelayedOrderRow';
import { DelayedOrder } from '@/types/delayed';
import { ShieldAlert } from 'lucide-react';

interface DelayedOrderTableProps {
  orders: DelayedOrder[];
  selectedOrders: string[];
  onSelectOrder: (orderId: string) => void;
  onSelectAll: () => void;
  onViewDetail: (order: DelayedOrder) => void;
  onContact: (order: DelayedOrder) => void;
  onEscalate: (order: DelayedOrder) => void;
  onResolve: (order: DelayedOrder) => void;
}

export const DelayedOrderTable = ({
  orders,
  selectedOrders,
  onSelectOrder,

  onViewDetail,
  onContact,
  onEscalate,
  onResolve,
}: DelayedOrderTableProps) => {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[140px]">Mã đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Loại cảnh báo</TableHead>
            <TableHead>Mức độ</TableHead>
            <TableHead>Thời gian trễ</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Người xử lý</TableHead>
            <TableHead className="w-[120px] text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-12">
                <div className="text-muted-foreground text-center">
                  <ShieldAlert className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>Không có đơn hàng cảnh báo nào</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <DelayedOrderRow
                key={order.id}
                order={order}
                isSelected={selectedOrders.includes(order.id)}
                onSelect={onSelectOrder}
                onViewDetail={onViewDetail}
                onContact={onContact}
                onEscalate={onEscalate}
                onResolve={onResolve}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
