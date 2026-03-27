'use client';

import { PendingOrderDetailPage } from '@/components/pages/PendingOrderDetailPage';

export default function SalePendingOrderDetailPage() {
  return (
    <PendingOrderDetailPage
      scope="sale"
      backHref="/sale/orders/pending"
      backLabel="Quay lại danh sách đơn pending"
    />
  );
}
