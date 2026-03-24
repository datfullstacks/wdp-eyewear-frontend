import { PendingOrder, PaymentStatusConfig } from '@/types/pending';

export const pendingOrders: PendingOrder[] = [
  {
    id: 'ORD-2024-001',
    customer: 'Nguyen Van An',
    phone: '0901234567',
    address: '123 Nguyen Hue, Q1, TP.HCM',
    products: [
      {
        name: 'Gong kinh Titan Pro',
        variant: 'Den - Size M',
        qty: 1,
        price: 2500000,
      },
      {
        name: 'Trong can Essilor',
        variant: '1.67 - Crizal',
        qty: 2,
        price: 3200000,
      },
    ],
    total: 5700000,
    status: 'pending',
    createdAt: '2024-01-15 09:30',
    note: 'Khach can gap trong tuan nay',
    hasPrescription: true,
    paymentStatus: 'paid',
    approvalState: 'none',
  },
  {
    id: 'ORD-2024-002',
    customer: 'Tran Thi Binh',
    phone: '0912345678',
    address: '456 Le Loi, Q3, TP.HCM',
    products: [
      {
        name: 'Kinh mat Rayban Aviator',
        variant: 'Gold - G15',
        qty: 1,
        price: 4500000,
      },
    ],
    total: 4500000,
    status: 'pending',
    createdAt: '2024-01-15 10:15',
    note: '',
    hasPrescription: false,
    paymentStatus: 'pending',
    approvalState: 'none',
  },
  {
    id: 'ORD-2024-003',
    customer: 'Le Hoang Cuong',
    phone: '0923456789',
    address: '789 Hai Ba Trung, Q1, TP.HCM',
    products: [
      {
        name: 'Gong kinh Oakley',
        variant: 'Den mo - Size L',
        qty: 1,
        price: 3800000,
      },
      {
        name: 'Trong doi mau Transitions',
        variant: '1.60 - Brown',
        qty: 2,
        price: 4500000,
      },
    ],
    total: 8300000,
    status: 'pending',
    createdAt: '2024-01-15 08:00',
    note: 'Khach VIP - uu tien xu ly',
    hasPrescription: true,
    paymentStatus: 'paid',
    approvalState: 'none',
  },
  {
    id: 'ORD-2024-004',
    customer: 'Pham Minh Duc',
    phone: '0934567890',
    address: '321 CMT8, Q10, TP.HCM',
    products: [
      {
        name: 'Gong kinh nhua Classic',
        variant: 'Nau - Size S',
        qty: 1,
        price: 1200000,
      },
    ],
    total: 1200000,
    status: 'pending',
    createdAt: '2024-01-15 14:20',
    note: '',
    hasPrescription: false,
    paymentStatus: 'cod',
    approvalState: 'none',
  },
  {
    id: 'ORD-2024-005',
    customer: 'Vo Thi Em',
    phone: '0945678901',
    address: '654 Dien Bien Phu, Binh Thanh, TP.HCM',
    products: [
      {
        name: 'Gong kinh thoi trang',
        variant: 'Hong - Size M',
        qty: 1,
        price: 1800000,
      },
      {
        name: 'Trong chong anh sang xanh',
        variant: '1.56 - Clear',
        qty: 2,
        price: 1500000,
      },
    ],
    total: 3300000,
    status: 'pending',
    createdAt: '2024-01-15 11:45',
    note: 'Goi xac nhan truoc khi giao',
    hasPrescription: true,
    paymentStatus: 'partial',
    approvalState: 'none',
  },
];

export const paymentStatusConfig: Record<string, PaymentStatusConfig> = {
  paid: { label: 'Da thanh toan', color: 'success' },
  pending: { label: 'Chua thanh toan', color: 'warning' },
  partial: { label: 'Thanh toan mot phan', color: 'info' },
  cod: { label: 'COD', color: 'default' },
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};
