import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/data/preorderData';
import type { PreorderOrder } from '@/types/preorder';
import {
  ChevronDown,
  Eye,
  HandCoins,
  Package,
  PackageCheck,
  Truck,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreorderOrderRowProps {
  order: PreorderOrder;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onViewDetail: (order: PreorderOrder) => void;
  onCancel: (order: PreorderOrder) => void;
  onMarkArrived: (order: PreorderOrder) => void;
  onStockIn: (order: PreorderOrder) => void;
  onMoveToPacking: (order: PreorderOrder) => void;
  onCreateShipment: (order: PreorderOrder) => void;
  onUpdateTracking: (order: PreorderOrder) => void;
}

function getStatusMeta(order: PreorderOrder) {
  if (order.status === 'cancelled') {
    return { label: 'Đã hủy', className: 'text-destructive' };
  }

  if (order.opsStatus === 'shipment_created') {
    return { label: 'Đã có GHN', className: 'text-success' };
  }

  if (order.opsStatus === 'packing') {
    return { label: 'Đang đóng gói', className: 'text-warning' };
  }

  if (order.opsStatus === 'ready_to_pack') {
    return { label: 'Sẵn sàng đóng gói', className: 'text-primary' };
  }

  if (order.opsStatus === 'stocked') {
    return { label: 'Đã nhập kho', className: 'text-primary' };
  }

  if (order.opsStatus === 'arrived') {
    return { label: 'Hàng đã về', className: 'text-success' };
  }

  if (order.status === 'partial_stock') {
    return { label: 'Đủ một phần', className: 'text-primary' };
  }

  return { label: 'Chờ hàng', className: 'text-warning' };
}

export const PreorderOrderRow = ({
  order,
  onViewDetail,
  onCancel,
  onMarkArrived,
  onStockIn,
  onMoveToPacking,
  onCreateShipment,
  onUpdateTracking,
}: PreorderOrderRowProps) => {
  const statusTextClass: Record<string, string> = {
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
    info: 'text-primary',
    default: 'text-foreground/80',
  };
  const paymentTextClass =
    order.paymentStatus === 'paid'
      ? statusTextClass.success
      : order.paymentStatus === 'partial'
        ? statusTextClass.info
        : order.paymentStatus === 'pending'
          ? statusTextClass.warning
          : statusTextClass.default;
  const statusMeta = getStatusMeta(order);
  const isCancelled = order.status === 'cancelled';
  const canMarkArrived =
    !isCancelled &&
    (order.status === 'waiting_stock' || order.status === 'partial_stock') &&
    order.opsStatus === 'waiting_arrival';
  const canStockIn = !isCancelled && order.opsStatus === 'arrived';
  const canMoveToPacking =
    !isCancelled &&
    (order.opsStatus === 'stocked' || order.opsStatus === 'ready_to_pack');
  const canCreateShipment =
    !isCancelled &&
    order.opsStatus === 'packing' &&
    !String(order.trackingCode || '').trim();
  const canUpdateTracking =
    !isCancelled &&
    (order.opsStatus === 'shipment_created' ||
      Boolean(String(order.carrierId || '').trim()) ||
      Boolean(String(order.trackingCode || '').trim()));

  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="text-foreground font-mono text-sm font-normal">
        <div className="flex flex-col gap-1">
          <span>{order.orderCode}</span>
          <span className="text-foreground/70 text-xs">
            {formatDate(order.orderDate)}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col">
          <span className="text-foreground font-normal">
            {order.customerName}
          </span>
          <span className="text-foreground/80 text-sm">
            {order.customerPhone}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col gap-1">
          {order.products.slice(0, 2).map((product, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-foreground text-sm">{product.name}</span>
            </div>
          ))}
          {order.products.length > 2 && (
            <span className="text-foreground/70 text-xs">
              +{order.products.length - 2} san pham khac
            </span>
          )}
        </div>
      </TableCell>

      <TableCell>
        <span className="text-foreground/90">
          {formatDate(order.expectedDate)}
        </span>
      </TableCell>

      <TableCell>
        <div className="flex flex-col gap-1">
          <span className={cn('text-sm font-normal', paymentTextClass)}>
            {order.paymentStatus === 'paid'
              ? 'Đã thanh toán'
              : order.paymentStatus === 'partial'
                ? 'Thanh toán một phần'
                : order.paymentStatus === 'pending'
                  ? 'Chờ thanh toán'
                  : 'COD'}
          </span>
          {order.depositAmount > 0 &&
            order.depositAmount < order.totalAmount && (
              <span className="text-foreground/70 text-xs">
                Đặt cọc: {formatCurrency(order.depositAmount)}
              </span>
            )}
        </div>
      </TableCell>

      <TableCell>
        <div className="flex flex-col gap-1">
          <span className={cn('text-sm font-normal', statusMeta.className)}>
            {statusMeta.label}
          </span>
          {order.trackingCode && (
            <span className="text-foreground/70 font-mono text-xs">
              {order.trackingCode}
            </span>
          )}
        </div>
      </TableCell>

      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-slate-300 bg-white font-semibold text-slate-950 hover:bg-slate-100 hover:text-slate-950"
              aria-label="Mở thao tác chính"
            >
              Thao tác
              <ChevronDown className="h-4 w-4 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Hoạt động chính</DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => onMarkArrived(order)}
              className="gap-2"
              disabled={!canMarkArrived}
            >
              <HandCoins className="h-4 w-4" />
              Cập nhật hàng đã về
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onStockIn(order)}
              className="gap-2"
              disabled={!canStockIn}
            >
              <PackageCheck className="h-4 w-4" />
              Nhập kho
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onMoveToPacking(order)}
              className="gap-2"
              disabled={!canMoveToPacking}
            >
              <Package className="h-4 w-4" />
              {order.opsStatus === 'stocked'
                ? 'Sẵn sàng đóng gói'
                : 'Chuyển sang đóng gói'}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onCreateShipment(order)}
              className="gap-2"
              disabled={!canCreateShipment}
            >
              <Truck className="h-4 w-4" />
              Tạo vận đơn GHN
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onUpdateTracking(order)}
              className="gap-2"
              disabled={!canUpdateTracking}
            >
              <Truck className="h-4 w-4" />
              Đồng bộ GHN
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Tiện ích</DropdownMenuLabel>

            <DropdownMenuItem onClick={() => onViewDetail(order)}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>

            {!isCancelled && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onCancel(order)}>
                  <XCircle className="text-destructive mr-2 h-4 w-4" />
                  Hủy đơn
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
