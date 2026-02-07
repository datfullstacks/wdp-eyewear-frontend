import { Avatar } from '@/components/atoms/Avatar';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Phone, Mail, MoreVertical } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/atoms';

interface CustomerRowProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastVisit: string;
  status: 'active' | 'inactive';
}

export const CustomerRow = ({
  name,
  email,
  phone,
  totalOrders,
  totalSpent,
  lastVisit,
  status,
}: CustomerRowProps) => {
  return (
    <div className="bg-card border-border hover:border-accent/30 flex items-center gap-4 rounded-lg border p-4 transition-colors">
      <Avatar
        name={name}
        size="md"
        className="bg-none bg-yellow-400 text-yellow-950 ring-yellow-500"
      />

      <div className="min-w-0 flex-1">
        <h4 className="text-foreground truncate font-semibold">{name}</h4>
        <div className="text-muted-foreground mt-1 flex items-center gap-3 text-sm">
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {email}
          </span>
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            {phone}
          </span>
        </div>
      </div>

      <div className="hidden text-center md:block">
        <p className="text-foreground text-sm font-medium">{totalOrders}</p>
        <p className="text-muted-foreground text-xs">Đơn hàng</p>
      </div>

      <div className="hidden text-center md:block">
        <p className="text-foreground text-sm font-medium">
          {new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            notation: 'compact',
          }).format(totalSpent)}
        </p>
        <p className="text-muted-foreground text-xs">Tổng chi tiêu</p>
      </div>

      <div className="hidden text-center lg:block">
        <p className="text-muted-foreground text-sm">{lastVisit}</p>
        <p className="text-muted-foreground text-xs">Lần cuối</p>
      </div>

      <StatusBadge status={status === 'active' ? 'success' : 'error'}>
        {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
      </StatusBadge>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
          <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
          <DropdownMenuItem>Lịch sử đơn hàng</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">Xóa</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
