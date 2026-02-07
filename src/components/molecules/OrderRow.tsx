import { Avatar } from '@/components/atoms/Avatar';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Eye, MoreVertical } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/atoms';

type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

interface OrderRowProps {
  id: string;
  customerName: string;
  products: string[];
  total: number;
  status: OrderStatus;
  date: string;
}

const statusMap: Record<
  OrderStatus,
  { label: string; type: 'warning' | 'info' | 'success' | 'error' }
> = {
  pending: { label: 'Chờ xử lý', type: 'warning' },
  processing: { label: 'Đang xử lý', type: 'info' },
  completed: { label: 'Hoàn thành', type: 'success' },
  cancelled: { label: 'Đã hủy', type: 'error' },
};

export const OrderRow = ({
  id,
  customerName,
  products,
  total,
  status,
  date,
}: OrderRowProps) => {
  const statusInfo = statusMap[status];

  return (
    <div className="bg-card border-border hover:border-accent/30 flex items-center gap-4 rounded-lg border p-4 transition-colors">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar
          name={customerName}
          size="md"
          className="bg-yellow-400 bg-none text-yellow-950 ring-yellow-500"
        />
        <div>
          <p className="text-foreground font-medium">#{id}</p>
          <p className="text-muted-foreground truncate text-sm">
            {customerName}
          </p>
        </div>
      </div>

      <div className="hidden flex-1 md:block">
        <p className="text-foreground line-clamp-1 text-sm">
          {products.join(', ')}
        </p>
        <p className="text-muted-foreground text-xs">
          {products.length} sản phẩm
        </p>
      </div>

      <div className="text-right">
        <p className="text-foreground font-semibold">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(total)}
        </p>
        <p className="text-muted-foreground text-xs">{date}</p>
      </div>

      <StatusBadge status={statusInfo.type}>{statusInfo.label}</StatusBadge>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
            <DropdownMenuItem>Cập nhật trạng thái</DropdownMenuItem>
            <DropdownMenuItem>In hóa đơn</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Hủy đơn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
