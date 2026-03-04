'use client';

import { OrderRow } from '@/components/molecules/OrderRow';
import { useEffect, useState } from 'react';
import { orderApi } from '@/api';
import { toDashboardOrder, type DashboardOrder } from '@/lib/orderAdapters';

export const OrderList = () => {
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
        const result = await orderApi.getAll({ page: 1, limit: 10 });
        const mapped = result.orders.map(toDashboardOrder);
        if (isMounted) {
          setOrders(mapped);
        }
      } catch {
        if (isMounted) {
          setErrorMessage('Không tải được danh sách đơn hàng.');
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

  if (isLoading) {
    return (
      <p className="text-foreground/70 py-4 text-sm">
        Đang tải danh sách đơn hàng...
      </p>
    );
  }

  if (errorMessage) {
    return <p className="text-destructive py-4 text-sm">{errorMessage}</p>;
  }

  if (orders.length === 0) {
    return <p className="text-foreground/70 py-4 text-sm">Chưa có đơn hàng.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <OrderRow key={order.id} {...order} />
      ))}
    </div>
  );
};
