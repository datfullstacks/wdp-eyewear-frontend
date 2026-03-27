'use client';

import { CustomerDetailPage } from '@/components/pages/CustomerDetailPage';

export default function SaleCustomerDetailPage() {
  return (
    <CustomerDetailPage
      backHref="/sale/customers"
      backLabel="Quay lại danh sách khách hàng"
    />
  );
}
