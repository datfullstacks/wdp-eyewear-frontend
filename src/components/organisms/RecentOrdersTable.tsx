'use client';

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
import { useEffect, useState } from 'react';
import { orderApi } from '@/api';
import { toDashboardOrder, type DashboardOrder } from '@/lib/orderAdapters';

type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

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
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      if (isMounted) {
        setIsLoading(true);
        setErrorMessage(null);
      }

      try {
        const result = await orderApi.getAll({ page: 1, limit: 20 });
        const mapped = result.orders.map(toDashboardOrder);
        if (isMounted) {
          setOrders(mapped);
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Không tải được đơn hàng gần đây.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

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
          {isLoading && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-foreground/70 py-10 text-center"
              >
                Đang tải đơn hàng...
              </TableCell>
            </TableRow>
          )}

          {!isLoading && errorMessage && (
            <TableRow>
              <TableCell colSpan={7} className="text-destructive py-10 text-center">
                {errorMessage}
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !errorMessage && orders.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-foreground/70 py-10 text-center"
              >
                Chưa có đơn hàng nào.
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            !errorMessage &&
            orders.map((order) => {
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
