import { TableCell, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  FileText,
  Send,
  Printer,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PendingOrder } from '@/types/pending';
import {
  priorityConfig,
  paymentStatusConfig,
  formatCurrency,
} from '@/data/pendingData';

interface PendingOrderRowProps {
  order: PendingOrder;
  isSelected: boolean;
  onSelect: (orderId: string, checked: boolean) => void;
  onViewDetail: (order: PendingOrder) => void;
  onProcess: (order: PendingOrder) => void;
  onReject: (order: PendingOrder) => void;
}

export const PendingOrderRow = ({
  order,
  isSelected,

  onViewDetail,
  onProcess,
  onReject,
}: PendingOrderRowProps) => {
  const statusTextClass: Record<string, string> = {
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
    info: 'text-primary',
    default: 'text-muted-foreground',
  };
  const paymentColor = paymentStatusConfig[order.paymentStatus].color;
  const priorityColor = priorityConfig[order.priority].color;

  return (
    <TableRow
      className={cn(
        'hover:bg-muted/30',
        order.priority === 'urgent' && 'bg-destructive/5',
        isSelected && 'bg-primary/5'
      )}
    >
      <TableCell className="text-foreground font-mono text-sm font-normal">
        <div className="flex items-center gap-2">
          <span>{order.id}</span>
          {order.hasPrescription}
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="text-foreground font-normal">{order.customer}</p>
          <p className="text-foreground/80 text-sm">{order.phone}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-[200px]">
          <p className="text-foreground truncate font-normal">
            {order.products[0].name}
          </p>
          {order.products.length > 1 && (
            <p className="text-foreground/80 text-sm">
              +{order.products.length - 1} sản phẩm khác
            </p>
          )}
        </div>
      </TableCell>
      <TableCell className="text-foreground font-normal">
        {formatCurrency(order.total)}
      </TableCell>
      <TableCell>
        <span
          className={cn(
            'text-sm font-normal',
            statusTextClass[paymentColor] ?? statusTextClass.default
          )}
        >
          {paymentStatusConfig[order.paymentStatus].label}
        </span>
      </TableCell>
      <TableCell>
        <span
          className={cn(
            'text-sm font-normal',
            statusTextClass[priorityColor] ?? statusTextClass.default
          )}
        >
          {priorityConfig[order.priority].label}
        </span>
      </TableCell>
      <TableCell className="text-foreground/90 text-sm">
        {order.createdAt}
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
            <DropdownMenuItem onClick={() => onProcess(order)}>
              <CheckCircle className="text-success mr-2 h-4 w-4" />
              Xác nhận xử lý
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onReject(order)}>
              <XCircle className="text-destructive mr-2 h-4 w-4" />
              Từ chối
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              Xem đơn thuốc
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Printer className="mr-2 h-4 w-4" />
              In đơn hàng
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Send className="mr-2 h-4 w-4" />
              Gửi thông báo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
