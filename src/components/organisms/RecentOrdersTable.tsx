import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Eye, MoreHorizontal } from 'lucide-react';

type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

const mockOrders = [
  {
    id: 'ORD-001',
    customerName: 'Nguyễn Văn A',
    products: ['Ray-Ban Aviator', 'Gọng Oakley'],
    total: 8300000,
    status: 'completed' as const,
    date: '30/01/2026',
  },
  {
    id: 'ORD-002',
    customerName: 'Trần Thị B',
    products: ['Gucci GG0061S'],
    total: 8500000,
    status: 'processing' as const,
    date: '30/01/2026',
  },
  {
    id: 'ORD-003',
    customerName: 'Lê Văn C',
    products: ['Tom Ford FT5401', 'Tròng cận 1.67'],
    total: 9200000,
    status: 'pending' as const,
    date: '29/01/2026',
  },
  {
    id: 'ORD-004',
    customerName: 'Phạm Thị D',
    products: ['Persol PO3019S'],
    total: 5100000,
    status: 'completed' as const,
    date: '29/01/2026',
  },
  {
    id: 'ORD-005',
    customerName: 'Hoàng Văn E',
    products: ['Ray-Ban Wayfarer'],
    total: 4200000,
    status: 'cancelled' as const,
    date: '28/01/2026',
  },
];

const statusMap: Record<
  OrderStatus,
  { label: string; type: 'warning' | 'info' | 'success' | 'error' }
> = {
  pending: { label: 'Chờ xử lý', type: 'warning' },
  processing: { label: 'Đang xử lý', type: 'info' },
  completed: { label: 'Hoàn thành', type: 'success' },
  cancelled: { label: 'Đã hủy', type: 'error' },
};

export const RecentOrdersTable = () => {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[120px]">Mã đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead className="text-right">Tổng tiền</TableHead>
            <TableHead className="text-center">Ngày</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockOrders.map((order) => {
            const statusInfo = statusMap[order.status];
            return (
              <TableRow key={order.id} className="hover:bg-muted/30">
                <TableCell className="text-foreground font-mono text-sm font-normal">
                  #{order.id}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={order.customerName}
                      size="md"
                      className="bg-yellow-400 bg-none text-yellow-950 ring-yellow-500"
                    />
                    <div>
                      <p className="text-foreground font-normal">
                        {order.customerName}
                      </p>
                      <p className="text-foreground/80 text-xs">
                        {order.products.length} sản phẩm
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-foreground/80 text-sm">
                  <p className="line-clamp-1">{order.products.join(', ')}</p>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-foreground font-semibold">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(order.total)}
                  </span>
                </TableCell>
                <TableCell className="text-center text-sm text-foreground/80">
                  {order.date}
                </TableCell>
                <TableCell>
                  <StatusBadge status={statusInfo.type}>
                    {statusInfo.label}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-foreground/80 hover:text-foreground"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-foreground/80 hover:text-foreground"
                        >
                          <MoreHorizontal className="h-4 w-4" />
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
