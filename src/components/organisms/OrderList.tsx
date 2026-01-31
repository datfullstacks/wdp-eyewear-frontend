import { OrderRow } from '@/components/molecules/OrderRow';

const mockOrders = [
  {
    id: 'ORD-001',
    customerName: 'Nguyễn Văn A',
    products: ['Ray-Ban Aviator', 'Gọng Oakley'],
    total: 8300000,
    status: 'completed' as const,
    date: '30/01/2026',
  },
  {
    id: 'ORD-002',
    customerName: 'Trần Thị B',
    products: ['Gucci GG0061S'],
    total: 8500000,
    status: 'processing' as const,
    date: '30/01/2026',
  },
  {
    id: 'ORD-003',
    customerName: 'Lê Văn C',
    products: ['Tom Ford FT5401', 'Tròng cận 1.67'],
    total: 9200000,
    status: 'pending' as const,
    date: '29/01/2026',
  },
  {
    id: 'ORD-004',
    customerName: 'Phạm Thị D',
    products: ['Persol PO3019S'],
    total: 5100000,
    status: 'completed' as const,
    date: '29/01/2026',
  },
  {
    id: 'ORD-005',
    customerName: 'Hoàng Văn E',
    products: ['Ray-Ban Wayfarer'],
    total: 4200000,
    status: 'cancelled' as const,
    date: '28/01/2026',
  },
];

export const OrderList = () => {
  return (
    <div className="space-y-3">
      {mockOrders.map((order) => (
        <OrderRow key={order.id} {...order} />
      ))}
    </div>
  );
};
