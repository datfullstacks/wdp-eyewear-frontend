import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { SeverityBadge } from '@/components/atoms/SeverityBadge';
import { DelayTypeBadge } from '@/components/atoms/DelayTypeBadge';
import { DelayedOrder } from '@/types/delayed';
import {
  Phone,
  ArrowUpRight,
  CheckCircle,
  Clock,
  MoreHorizontal,
} from 'lucide-react';

interface DelayedOrderRowProps {
  order: DelayedOrder;
  isSelected: boolean;
  onSelect: (orderId: string) => void;
  onViewDetail: (order: DelayedOrder) => void;
  onContact: (order: DelayedOrder) => void;
  onEscalate: (order: DelayedOrder) => void;
  onResolve: (order: DelayedOrder) => void;
}

export const DelayedOrderRow = ({
  order,
  onViewDetail,
  onContact,
  onEscalate,
  onResolve,
}: DelayedOrderRowProps) => {
  return (
    <TableRow className="hover:bg-muted/30">
      <TableCell className="text-foreground font-mono text-sm font-normal">
        <button
          onClick={() => onViewDetail(order)}
          className="text-primary font-medium hover:underline"
        >
          {order.id}
        </button>
      </TableCell>
      <TableCell>
        <div>
          <p className="text-foreground font-normal">{order.customerName}</p>
          <p className="text-foreground/80 text-sm">{order.customerPhone}</p>
        </div>
      </TableCell>
      <TableCell>
        <DelayTypeBadge delayType={order.delayType} variant="text" />
      </TableCell>
      <TableCell>
        <SeverityBadge severity={order.severity} variant="text" />
      </TableCell>
      <TableCell>
        <div className="text-destructive flex items-center gap-1 font-normal">
          <Clock className="h-4 w-4" />
          {order.delayDuration}
        </div>
      </TableCell>
      <TableCell>
        <StatusBadge status="warning">{order.currentStatus}</StatusBadge>
      </TableCell>
      <TableCell className="text-foreground/90 text-sm">
        <span
          className={
            order.assignedTo === 'Chưa gán' ? 'text-muted-foreground italic' : ''
          }
        >
          {order.assignedTo}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground/80 hover:text-foreground h-8 w-8"
              aria-label="Thao tác"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onContact(order)}>
              <Phone className="mr-2 h-4 w-4" />
              Liên hệ khách
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEscalate(order)}>
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Leo thang
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onResolve(order)}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Xử lý
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};
