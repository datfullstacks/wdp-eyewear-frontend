'use client';

import { OrderDetailPage } from '@/components/pages/OrderDetailPage';

export default function ManagerOrderDetailPage() {
  return (
    <OrderDetailPage
      backHref="/manager/orders"
      backLabel="Quay lai danh sach don"
    />
  );
}
