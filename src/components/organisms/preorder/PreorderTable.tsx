import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PreorderOrderRow } from '@/components/molecules/PreorderOrderRow';
import { MessageSquare, Package } from 'lucide-react';
import type { PreorderOrder } from '@/types/preorder';

interface PreorderTableProps {
  orders: PreorderOrder[];
  selectedOrders: string[];
  showEmptyState?: boolean;
  onSelectOrder: (id: string) => void;
  onSelectAll: () => void;
  onViewDetail: (order: PreorderOrder) => void;
  onCancel: (order: PreorderOrder) => void;
  onMarkArrived: (order: PreorderOrder) => void;
  onStockIn: (order: PreorderOrder) => void;
  onMoveToPacking: (order: PreorderOrder) => void;
  onCreateShipment: (order: PreorderOrder) => void;
  onUpdateTracking: (order: PreorderOrder) => void;
}

export const PreorderTable = ({
  orders,
  selectedOrders,
  showEmptyState = true,
  onSelectOrder,
  onViewDetail,
  onCancel,
  onMarkArrived,
  onStockIn,
  onMoveToPacking,
  onCreateShipment,
  onUpdateTracking,
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
      <Table className="min-w-[1220px] text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Mã đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Cửa hàng</TableHead>
            <TableHead>Nhà cung cấp</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Ngày dự kiến</TableHead>
            <TableHead>Thanh toán</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[190px] text-right">
              Thao tác chính
            </TableHead>
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
              onCancel={onCancel}
              onMarkArrived={onMarkArrived}
              onStockIn={onStockIn}
              onMoveToPacking={onMoveToPacking}
              onCreateShipment={onCreateShipment}
              onUpdateTracking={onUpdateTracking}
            />
          ))}
        </TableBody>
      </Table>
    </div>
    {showEmptyState && orders.length === 0 && (
      <div className="p-12 text-center">
        <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
        <p className="text-muted-foreground">Không có đơn pre-order</p>
      </div>
    )}
  </div>
);
