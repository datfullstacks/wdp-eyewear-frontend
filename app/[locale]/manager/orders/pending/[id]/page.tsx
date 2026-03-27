'use client';

import { PendingOrderDetailPage } from '@/components/pages/PendingOrderDetailPage';

export default function ManagerPendingOrderDetailPage() {
  return (
    <PendingOrderDetailPage
      scope="manager"
      backHref="/manager/orders/pending"
      backLabel="Quay lại danh sách đơn"
    />
  );
}
