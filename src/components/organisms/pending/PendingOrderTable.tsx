import { Package } from 'lucide-react';

import { PendingOrderRow } from '@/components/molecules/PendingOrderRow';
import { PendingOrder } from '@/types/pending';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface PendingOrderTableProps {
  orders: PendingOrder[];
  scope?: 'sale' | 'manager';
  selectedOrders: string[];
  showEmptyState?: boolean;
  onSelectAll: (checked: boolean) => void;
  onSelectOrder: (orderId: string, checked: boolean) => void;
  onViewDetail: (order: PendingOrder) => void;
  onProcess: (order: PendingOrder) => void;
  onReject: (order: PendingOrder) => void;
  onEscalate: (order: PendingOrder) => void;
  onSendBack: (order: PendingOrder) => void;
}

export const PendingOrderTable = ({
  orders,
  scope = 'sale',
  selectedOrders,
  showEmptyState = true,
  onSelectOrder,
  onViewDetail,
  onProcess,
  onReject,
  onEscalate,
  onSendBack,
}: PendingOrderTableProps) => {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Mã đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Tổng tiền</TableHead>
            <TableHead>Thanh toán</TableHead>
            <TableHead>Loại đơn</TableHead>
            <TableHead>Thời gian</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <PendingOrderRow
              key={order.id}
              order={order}
              scope={scope}
              isSelected={selectedOrders.includes(order.id)}
              onSelect={onSelectOrder}
              onViewDetail={onViewDetail}
              onProcess={onProcess}
              onReject={onReject}
              onEscalate={onEscalate}
              onSendBack={onSendBack}
            />
          ))}
        </TableBody>
      </Table>

      {showEmptyState && orders.length === 0 && (
        <div className="p-12 text-center">
          <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
          <p className="text-muted-foreground">
            Không có đơn hàng nào cần xử lý
          </p>
        </div>
      )}
    </div>
  );
};
