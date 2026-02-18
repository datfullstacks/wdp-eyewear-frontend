import type { PreorderOrder } from '@/types/preorder';

export const mockPreorderOrders: PreorderOrder[] = [
  {
    id: '1',
    orderCode: 'PRE-2024-001',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0901234567',
    customerAddress: '123 Nguyễn Huệ, Q.1, TP.HCM',
    orderDate: '2024-01-10',
    expectedDate: '2024-01-25',
    products: [
      {
        sku: 'FR-RAY-001',
        name: 'Ray-Ban Aviator',
        variant: 'Gold / Green',
        quantity: 1,
        batchCode: 'BATCH-2024-001',
        batchExpectedDate: '2024-01-20',
        status: 'in_transit',
      },
    ],
    totalAmount: 4500000,
    paymentStatus: 'partial',
    depositAmount: 2000000,
    status: 'waiting_stock',
    notes: 'Khách cần gấp cho sinh nhật',
    priority: 'high',
  },
  {
    id: '2',
    orderCode: 'PRE-2024-002',
    customerName: 'Trần Thị Bình',
    customerPhone: '0912345678',
    customerAddress: '456 Lê Lợi, Q.3, TP.HCM',
    orderDate: '2024-01-08',
    expectedDate: '2024-01-22',
    products: [
      {
        sku: 'FR-OAK-002',
        name: 'Oakley Holbrook',
        variant: 'Matte Black',
        quantity: 1,
        batchCode: 'BATCH-2024-002',
        batchExpectedDate: '2024-01-18',
        status: 'arrived',
      },
      {
        sku: 'LENS-POL-001',
        name: 'Tròng phân cực',
        variant: 'Gray',
        quantity: 2,
        batchCode: null,
        batchExpectedDate: null,
        status: 'waiting',
      },
    ],
    totalAmount: 6200000,
    paymentStatus: 'paid',
    depositAmount: 6200000,
    status: 'partial_stock',
    notes: '',
    priority: 'normal',
  },
  {
    id: '3',
    orderCode: 'PRE-2024-003',
    customerName: 'Lê Minh Cường',
    customerPhone: '0923456789',
    customerAddress: '789 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',
    orderDate: '2024-01-05',
    expectedDate: '2024-01-15',
    products: [
      {
        sku: 'FR-GUC-001',
        name: 'Gucci GG0036S',
        variant: 'Black / Gold',
        quantity: 1,
        batchCode: 'BATCH-2024-001',
        batchExpectedDate: '2024-01-20',
        status: 'in_transit',
      },
    ],
    totalAmount: 12500000,
    paymentStatus: 'partial',
    depositAmount: 5000000,
    status: 'waiting_stock',
    notes: 'VIP - Khách quen',
    priority: 'urgent',
  },
  {
    id: '4',
    orderCode: 'PRE-2024-004',
    customerName: 'Phạm Thị Dung',
    customerPhone: '0934567890',
    customerAddress: '321 Cách Mạng Tháng 8, Q.10, TP.HCM',
    orderDate: '2024-01-12',
    expectedDate: '2024-01-28',
    products: [
      {
        sku: 'FR-TOM-001',
        name: 'Tom Ford FT0237',
        variant: 'Havana',
        quantity: 1,
        batchCode: 'BATCH-2024-003',
        batchExpectedDate: '2024-01-25',
        status: 'waiting',
      },
    ],
    totalAmount: 8900000,
    paymentStatus: 'pending',
    depositAmount: 0,
    status: 'waiting_stock',
    notes: '',
    priority: 'normal',
  },
  {
    id: '5',
    orderCode: 'PRE-2024-005',
    customerName: 'Hoàng Văn Em',
    customerPhone: '0945678901',
    customerAddress: '654 Võ Văn Tần, Q.3, TP.HCM',
    orderDate: '2024-01-11',
    expectedDate: '2024-01-20',
    products: [
      {
        sku: 'FR-PER-001',
        name: 'Persol PO3019S',
        variant: 'Tortoise',
        quantity: 1,
        batchCode: 'BATCH-2024-002',
        batchExpectedDate: '2024-01-18',
        status: 'arrived',
      },
      {
        sku: 'LENS-CR-001',
        name: 'Tròng cận CR39',
        variant: '1.56 Index',
        quantity: 2,
        batchCode: 'BATCH-2024-002',
        batchExpectedDate: '2024-01-18',
        status: 'arrived',
      },
    ],
    totalAmount: 5800000,
    paymentStatus: 'paid',
    depositAmount: 5800000,
    status: 'ready',
    notes: 'Đã đủ hàng, chờ liên hệ khách',
    priority: 'high',
  },
];

export const statusFilterOptions = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'waiting_stock', label: 'Chờ hàng' },
  { value: 'partial_stock', label: 'Đủ một phần' },
  { value: 'ready', label: 'Sẵn sàng' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export const priorityFilterOptions = [
  { value: 'all', label: 'Tất cả' },
  { value: 'urgent', label: 'Gấp' },
  { value: 'high', label: 'Ưu tiên' },
  { value: 'normal', label: 'Bình thường' },
];

export const batchOptions = [
  { value: 'BATCH-2024-001', label: 'BATCH-2024-001 (20/01/2024)' },
  { value: 'BATCH-2024-002', label: 'BATCH-2024-002 (18/01/2024)' },
  { value: 'BATCH-2024-003', label: 'BATCH-2024-003 (25/01/2024)' },
];

export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
    amount
  );

export const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('vi-VN');

export const isOverdue = (expectedDate: string) =>
  new Date(expectedDate) < new Date();
