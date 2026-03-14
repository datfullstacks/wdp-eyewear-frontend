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
import { MoreHorizontal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { orderApi } from '@/api';
import type { OrderRecord } from '@/api/orders';
import {
  getCustomerOrderStatusMeta,
  getCustomerShippingStatusMeta,
} from '@/lib/customerOrderStatus';
import { toDashboardOrder } from '@/lib/orderAdapters';
import { OrderDetailModal } from '@/components/organisms/orders/OrderDetailModal';

type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled';

function orderTypeLabel(orderType: string): string {
  const normalized = String(orderType || '').trim().toLowerCase();
  if (normalized === 'ready_stock') return 'Hang co san';
  if (normalized === 'pre_order' || normalized === 'preorder')
    return 'Dat truoc';
  return orderType || '-';
}

type RecentOrdersTableProps = {
  limit?: number;
  searchTerm?: string;
  statusFilter?: 'all' | OrderStatus;
  filter?: (order: OrderRecord) => boolean;
  emptyMessage?: string;
};

export const RecentOrdersTable = ({
  limit = 20,
  searchTerm = '',
  statusFilter = 'all',
  filter,
  emptyMessage = 'Chua co don hang nao.',
}: RecentOrdersTableProps) => {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [detailOrder, setDetailOrder] = useState<OrderRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      if (isMounted) {
        setIsLoading(true);
        setErrorMessage(null);
      }

      try {
        const result = await orderApi.getAll({ page: 1, limit });
        if (isMounted) setOrders(result.orders);
      } catch {
        if (isMounted) setErrorMessage('Khong tai duoc don hang gan day.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, [limit]);

  const visibleOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const predicate = filter ?? (() => true);

    return orders
      .filter(predicate)
      .filter((order) =>
        statusFilter === 'all'
          ? true
          : getCustomerOrderStatusMeta(order).category === statusFilter
      )
      .filter((order) => {
        if (!query) return true;
        const haystack = [
          order.code,
          order.customerName,
          order.customerPhone,
          ...order.items.map((item) => item.name),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      });
  }, [filter, orders, searchTerm, statusFilter]);

  const handleOpenDetail = (order: OrderRecord) => {
    setDetailOrder(order);
    setDetailOpen(true);
  };

  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[140px] whitespace-nowrap">Ma don</TableHead>
            <TableHead>Khach hang</TableHead>
            <TableHead>San pham</TableHead>
            <TableHead className="text-right">Tong tien</TableHead>
            <TableHead className="text-center">Ngay</TableHead>
            <TableHead className="whitespace-nowrap">Loai don</TableHead>
            <TableHead>Trang thai</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={8} className="text-foreground/70 py-10 text-center">
                Dang tai don hang...
              </TableCell>
            </TableRow>
          )}

          {!isLoading && errorMessage && (
            <TableRow>
              <TableCell colSpan={8} className="text-destructive py-10 text-center">
                {errorMessage}
              </TableCell>
            </TableRow>
          )}

          {!isLoading && !errorMessage && visibleOrders.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-foreground/70 py-10 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            !errorMessage &&
            visibleOrders.map((order) => {
              const dashboard = toDashboardOrder(order);
              const statusInfo = getCustomerOrderStatusMeta(order);
              const shippingInfo = getCustomerShippingStatusMeta(order);

              return (
                <TableRow key={order.id} className="hover:bg-muted/30">
                  <TableCell className="text-foreground font-mono text-sm font-normal whitespace-nowrap">
                    <span title={String(dashboard.id).replace(/^#/, '')}>
                      {String(dashboard.id).replace(/^#/, '')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={dashboard.customerName}
                        size="md"
                        className="bg-yellow-400 bg-none text-yellow-950 ring-yellow-500"
                      />
                      <div>
                        <p className="text-foreground font-normal">
                          {dashboard.customerName}
                        </p>
                        <p className="text-foreground/80 text-xs">
                          {dashboard.products.length} san pham
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground/80 text-sm">
                    <p className="line-clamp-1">{dashboard.products.join(', ')}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-foreground font-semibold">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(dashboard.total)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-sm text-foreground/80">
                    {dashboard.date}
                  </TableCell>
                  <TableCell className="text-foreground/80 text-sm whitespace-nowrap">
                    {orderTypeLabel(order.orderType)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <StatusBadge status={statusInfo.type}>
                        {statusInfo.label}
                      </StatusBadge>
                      {shippingInfo && (
                        <p className="text-foreground/70 text-xs">
                          VC: {shippingInfo.label}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
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
                          <DropdownMenuItem onClick={() => handleOpenDetail(order)}>
                            Xem chi tiet
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

      <OrderDetailModal
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setDetailOrder(null);
        }}
        order={detailOrder}
      />
    </div>
  );
};
