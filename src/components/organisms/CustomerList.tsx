import { Avatar } from '@/components/atoms/Avatar';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockCustomers } from '@/data/customerData';
import { MoreHorizontal, Phone, Mail } from 'lucide-react';

export const CustomerList = () => {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Khách hàng</TableHead>
            <TableHead className="text-center">Đơn hàng</TableHead>
            <TableHead className="text-right">Tổng chi tiêu</TableHead>
            <TableHead className="text-center">Lần cuối</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockCustomers.map((customer) => (
            <TableRow key={customer.id} className="hover:bg-muted/30">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar
                    name={customer.name}
                    size="md"
                    className="bg-yellow-400 bg-none text-yellow-950 ring-yellow-500"
                  />
                  <div>
                    <p className="text-foreground font-normal">
                      {customer.name}
                    </p>
                    <div className="text-foreground/80 mt-1 flex items-center gap-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {customer.phone}
                      </span>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-center font-normal">
                {customer.totalOrders}
              </TableCell>
              <TableCell className="text-foreground text-right font-normal">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                  notation: 'compact',
                }).format(customer.totalSpent)}
              </TableCell>
              <TableCell className="text-foreground/90 text-center text-sm">
                {customer.lastVisit}
              </TableCell>
              <TableCell>
                <StatusBadge
                  status={customer.status === 'active' ? 'success' : 'error'}
                >
                  {customer.status === 'active'
                    ? 'Họat động'
                    : 'Không hoạt động'}
                </StatusBadge>
              </TableCell>
              <TableCell>
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
                    <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                    <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                    <DropdownMenuItem>Lịch sử đơn hàng</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
