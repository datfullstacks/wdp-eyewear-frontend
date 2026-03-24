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
import { paymentStatusConfig, formatCurrency } from '@/data/pendingData';
import {
  canManagerApprovePendingOrder,
  canManagerHandlePendingOrder,
  canSaleHandlePendingOrder,
  needsManagerReview,
  PENDING_ORDER_APPROVAL_MESSAGE,
  PENDING_ORDER_MANAGER_APPROVAL_MESSAGE,
  PENDING_ORDER_MANAGER_MESSAGE,
  PENDING_ORDER_SENT_BACK_MESSAGE,
  wasSentBackToSale,
} from '@/lib/pendingOrders';

interface PendingOrderRowProps {
  order: PendingOrder;
  scope?: 'sale' | 'manager';
  isSelected: boolean;
  onSelect: (orderId: string, checked: boolean) => void;
  onViewDetail: (order: PendingOrder) => void;
  onProcess: (order: PendingOrder) => void;
  onReject: (order: PendingOrder) => void;
  onEscalate: (order: PendingOrder) => void;
  onSendBack: (order: PendingOrder) => void;
}

export const PendingOrderRow = ({
  order,
  scope = 'sale',
  isSelected,
  onViewDetail,
  onProcess,
  onReject,
  onEscalate,
  onSendBack,
}: PendingOrderRowProps) => {
  const statusTextClass: Record<string, string> = {
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-destructive',
    info: 'text-primary',
    default: 'text-muted-foreground',
  };

  const paymentColor = paymentStatusConfig[order.paymentStatus].color;
  const isEscalated = needsManagerReview(order);
  const isSentBack = wasSentBackToSale(order);
  const canApprove =
    scope === 'manager'
      ? canManagerApprovePendingOrder(order)
      : canSaleHandlePendingOrder(order);
  const helperText =
    scope === 'manager'
      ? isEscalated
        ? canApprove
          ? order.managerReviewReason || PENDING_ORDER_MANAGER_MESSAGE
          : order.managerReviewReason || PENDING_ORDER_MANAGER_APPROVAL_MESSAGE
        : ''
      : isEscalated
        ? 'Da chuyen manager xu ly.'
        : isSentBack
          ? order.managerReviewReason || PENDING_ORDER_SENT_BACK_MESSAGE
          : !canApprove
            ? PENDING_ORDER_APPROVAL_MESSAGE
            : '';

  return (
    <TableRow className={cn('hover:bg-muted/30', isSelected && 'bg-primary/5')}>
      <TableCell className="text-foreground font-mono text-sm font-normal">
        <div className="flex items-center gap-2">
          <span>{order.id}</span>
          {order.hasPrescription && (
            <span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-1.5 py-0.5 text-[10px] font-medium">
              Rx
            </span>
          )}
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
              +{order.products.length - 1} san pham khac
            </p>
          )}
        </div>
      </TableCell>

      <TableCell className="text-foreground font-normal">
        {formatCurrency(order.total)}
      </TableCell>

      <TableCell>
        <div className="space-y-1">
          <span
            className={cn(
              'text-sm font-normal',
              statusTextClass[paymentColor] ?? statusTextClass.default
            )}
          >
            {paymentStatusConfig[order.paymentStatus].label}
          </span>
          {!!helperText && (
            <p className="text-xs font-medium text-amber-700">{helperText}</p>
          )}
        </div>
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
              Xem chi tiet
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={!canApprove}
              className={
                !canApprove ? 'text-amber-700 data-[disabled]:opacity-100' : ''
              }
              onClick={() => onProcess(order)}
            >
              <CheckCircle className="text-success mr-2 h-4 w-4" />
              {scope === 'manager' ? 'Manager xac nhan' : 'Xac nhan xu ly'}
            </DropdownMenuItem>

            {scope === 'sale' && !canApprove && !isEscalated && (
              <DropdownMenuItem onClick={() => onEscalate(order)}>
                <Send className="mr-2 h-4 w-4" />
                Chuyen manager
              </DropdownMenuItem>
            )}

            {scope === 'manager' && isEscalated && (
              <DropdownMenuItem onClick={() => onSendBack(order)}>
                <Send className="mr-2 h-4 w-4" />
                Tra lai sale
              </DropdownMenuItem>
            )}

            <DropdownMenuItem onClick={() => onReject(order)}>
              <XCircle className="text-destructive mr-2 h-4 w-4" />
              Tu choi
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              Xem don thuoc
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Printer className="mr-2 h-4 w-4" />
              In don hang
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Send className="mr-2 h-4 w-4" />
              Gui thong bao
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
