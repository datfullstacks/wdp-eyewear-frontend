import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PreorderOrderRow } from '@/components/molecules/PreorderOrderRow';
import { MessageSquare } from 'lucide-react';
import type { PreorderOrder } from '@/types/preorder';

interface PreorderTableProps {
  orders: PreorderOrder[];
  selectedOrders: string[];
  onSelectOrder: (id: string) => void;
  onSelectAll: () => void;
  onViewDetail: (order: PreorderOrder) => void;
  onLinkBatch: (order: PreorderOrder) => void;
  onContact: (order: PreorderOrder) => void;
  onCancel: (order: PreorderOrder) => void;
  onProcess: (order: PreorderOrder) => void;
}

export const PreorderTable = ({
  orders,
  selectedOrders,
  onSelectOrder,

  onViewDetail,
  onLinkBatch,
  onContact,
  onCancel,
  onProcess,
}: PreorderTableProps) => (
  <div className="glass-card overflow-hidden rounded-xl">
    {selectedOrders.length > 0 && (
      <div className="border-border flex items-center justify-between gap-2 border-b px-4 py-3">
        <span className="text-foreground/80 text-sm">
          Đã chọn {selectedOrders.length} đơn
        </span>
        <Button size="sm" variant="outline" className="gap-2">
          <MessageSquare className="h-4 w-4" />
          Liên hệ hàng loạt
        </Button>
      </div>
    )}
    <div className="overflow-x-auto">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Mã đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Ngày dự kiến</TableHead>
            <TableHead>Thanh toán</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <PreorderOrderRow
              key={order.id}
              order={order}
              isSelected={selectedOrders.includes(order.id)}
              onSelect={onSelectOrder}
              onViewDetail={onViewDetail}
              onLinkBatch={onLinkBatch}
              onContact={onContact}
              onCancel={onCancel}
              onProcess={onProcess}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
);
