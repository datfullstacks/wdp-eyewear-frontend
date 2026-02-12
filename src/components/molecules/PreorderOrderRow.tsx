import { Button } from '@/components/ui/button';

import { TableCell, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/data/preorderData';
import type { PreorderOrder } from '@/types/preorder';
import {
  MoreHorizontal,
  Eye,
  Link2,
  MessageSquare,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PreorderOrderRowProps {
  order: PreorderOrder;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onViewDetail: (order: PreorderOrder) => void;
  onLinkBatch: (order: PreorderOrder) => void;
  onContact: (order: PreorderOrder) => void;
  onCancel: (order: PreorderOrder) => void;
  onProcess: (order: PreorderOrder) => void;
}

export const PreorderOrderRow = ({
  order,

  onViewDetail,
  onLinkBatch,
  onContact,
  onCancel,
  onProcess,
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
  const orderStatusTextClass =
    order.status === 'ready'
      ? statusTextClass.success
      : order.status === 'waiting_stock'
        ? statusTextClass.warning
        : order.status === 'partial_stock'
          ? statusTextClass.info
          : order.status === 'cancelled'
            ? statusTextClass.error
            : statusTextClass.default;

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
          <span className={cn('text-sm font-normal', paymentTextClass)}>
            {order.paymentStatus === 'paid'
              ? 'Đã TT'
              : order.paymentStatus === 'partial'
                ? 'TT một phần'
                : order.paymentStatus === 'pending'
                  ? 'Chờ TT'
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
        <span className={cn('text-sm font-normal', orderStatusTextClass)}>
          {order.status === 'waiting_stock'
            ? 'Chờ hàng'
            : order.status === 'partial_stock'
              ? 'Đủ một phần'
              : order.status === 'ready'
                ? 'Sẵn sàng'
                : 'Đã hủy'}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/80 hover:text-foreground h-8 w-8"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetail(order)}>
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLinkBatch(order)}>
              <Link2 className="mr-2 h-4 w-4" />
              Liên kết đợt hàng
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onContact(order)}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Liên hệ khách
            </DropdownMenuItem>
            {order.status === 'ready' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onProcess(order)}>
                  <CheckCircle className="text-success mr-2 h-4 w-4" />
                  Xử lý đơn
                </DropdownMenuItem>
              </>
            )}
            {order.status !== 'cancelled' && order.status !== 'ready' && (
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
