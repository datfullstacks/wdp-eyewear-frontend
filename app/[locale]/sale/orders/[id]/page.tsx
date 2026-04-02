'use client';

import { OrderDetailPage } from '@/components/pages/OrderDetailPage';

export default function SaleOrderDetailPage() {
  return (
    <OrderDetailPage
      backHref="/sale/orders"
      backLabel="Quay lại danh sách đơn"
    />
  );
}
