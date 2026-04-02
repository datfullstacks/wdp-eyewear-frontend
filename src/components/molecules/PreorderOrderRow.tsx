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
import {
  getPreorderOpsStatusMeta,
  isPreorderShipmentManagedStatus,
  type PreorderOpsTone,
} from '@/lib/preorderOps';
import type { PreorderOrder } from '@/types/preorder';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  Eye,
  Package,
  PackageCheck,
  Truck,
  XCircle,
} from 'lucide-react';

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
  onManageShipment: (order: PreorderOrder) => void;
  onRequestDeliveryAgain: (order: PreorderOrder) => void;
}

function getStatusTextClass(tone: PreorderOpsTone) {
  switch (tone) {
    case 'success':
      return 'text-success';
    case 'warning':
      return 'text-warning';
    case 'error':
      return 'text-destructive';
    case 'info':
      return 'text-primary';
    default:
      return 'text-foreground/80';
  }
}

function getPaymentTextClass(order: PreorderOrder) {
  if (order.paymentStatus === 'paid') return 'text-success';
  if (order.paymentStatus === 'partial') return 'text-primary';
  if (order.paymentStatus === 'pending') return 'text-warning';
  return 'text-foreground/80';
}

function getAdvancePackingLabel(order: PreorderOrder): string {
  if (order.opsStatus === 'stocked') return 'Sẵn sàng đóng gói';
  if (order.opsStatus === 'ready_to_pack') return 'Chuyển sang đóng gói';
  return 'Chốt đóng gói';
}

export const PreorderOrderRow = ({
  order,
  onViewDetail,
  onCancel,
  onMarkArrived,
  onStockIn,
  onMoveToPacking,
  onCreateShipment,
  onManageShipment,
  onRequestDeliveryAgain,
}: PreorderOrderRowProps) => {
  const statusMeta = getPreorderOpsStatusMeta(order.opsStatus);
  const isCancelled = order.status === 'cancelled';
  const canMarkArrived =
    !isCancelled &&
    (order.status === 'waiting_stock' || order.status === 'partial_stock') &&
    order.opsStatus === 'waiting_arrival';
  const canStockIn = !isCancelled && order.opsStatus === 'arrived';
  const canAdvancePacking =
    !isCancelled &&
    ['stocked', 'ready_to_pack', 'packing'].includes(order.opsStatus);
  const canCreateShipment =
    !isCancelled &&
    order.opsStatus === 'ready_to_ship' &&
    !String(order.trackingCode || '').trim();
  const canManageShipment =
    !isCancelled &&
    (isPreorderShipmentManagedStatus(order.opsStatus) ||
      Boolean(String(order.carrierId || '').trim()) ||
      Boolean(String(order.trackingCode || '').trim()));
  const canRequestDeliveryAgain =
    !isCancelled && order.opsStatus === 'waiting_redelivery';

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
        <span className="text-foreground/90">{order.storeName || '-'}</span>
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
              +{order.products.length - 2} sản phẩm khác
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
          <span
            className={cn('text-sm font-normal', getPaymentTextClass(order))}
          >
            {order.paymentStatus === 'paid'
              ? 'Đã thanh toán'
              : order.paymentStatus === 'partial'
                ? 'Thanh toán một phần'
                : order.paymentStatus === 'pending'
                  ? 'Cho thanh toán'
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
          <span
            className={cn(
              'text-sm font-normal',
              getStatusTextClass(statusMeta.tone)
            )}
          >
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
              aria-label="Mo thao tac chinh"
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
              <Truck className="h-4 w-4" />
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
              disabled={!canAdvancePacking}
            >
              <Package className="h-4 w-4" />
              {getAdvancePackingLabel(order)}
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
              onClick={() => onRequestDeliveryAgain(order)}
              className="gap-2"
              disabled={!canRequestDeliveryAgain}
            >
              <Truck className="h-4 w-4" />
              Yêu cầu giao lại
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onManageShipment(order)}
              className="gap-2"
              disabled={!canManageShipment}
            >
              <Truck className="h-4 w-4" />
              Quản lý lô hàng GHN
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
