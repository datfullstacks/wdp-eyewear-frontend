'use client';

import { OrderDetailPage } from '@/components/pages/OrderDetailPage';

export default function OperationProcessingOrderDetailPage() {
  return (
    <OrderDetailPage
      backHref="/operation/orders/processing"
      backLabel="Quay lai danh sach don dang gia cong"
    />
  );
}
