import {
  PendingOrder,
  PriorityConfig,
  PaymentStatusConfig,
} from '@/types/pending';
import { AlertTriangle, Clock, Package } from 'lucide-react';

export const pendingOrders: PendingOrder[] = [
  {
    id: 'ORD-2024-001',
    customer: 'Nguyễn Văn An',
    phone: '0901234567',
    address: '123 Nguyễn Huệ, Q1, TP.HCM',
    products: [
      {
        name: 'Gọng kính Titan Pro',
        variant: 'Đen - Size M',
        qty: 1,
        price: 2500000,
      },
      {
        name: 'Tròng cận Essilor',
        variant: '1.67 - Crizal',
        qty: 2,
        price: 3200000,
      },
    ],
    total: 5700000,
    status: 'pending',
    priority: 'high',
    createdAt: '2024-01-15 09:30',
    note: 'Khách cần gấp trong tuần này',
    hasPrescription: true,
    paymentStatus: 'paid',
  },
  {
    id: 'ORD-2024-002',
    customer: 'Trần Thị Bình',
    phone: '0912345678',
    address: '456 Lê Lợi, Q3, TP.HCM',
    products: [
      {
        name: 'Kính mát Rayban Aviator',
        variant: 'Gold - G15',
        qty: 1,
        price: 4500000,
      },
    ],
    total: 4500000,
    status: 'pending',
    priority: 'normal',
    createdAt: '2024-01-15 10:15',
    note: '',
    hasPrescription: false,
    paymentStatus: 'pending',
  },
  {
    id: 'ORD-2024-003',
    customer: 'Lê Hoàng Cường',
    phone: '0923456789',
    address: '789 Hai Bà Trưng, Q1, TP.HCM',
    products: [
      {
        name: 'Gọng kính Oakley',
        variant: 'Đen mờ - Size L',
        qty: 1,
        price: 3800000,
      },
      {
        name: 'Tròng đổi màu Transitions',
        variant: '1.60 - Brown',
        qty: 2,
        price: 4500000,
      },
    ],
    total: 8300000,
    status: 'pending',
    priority: 'urgent',
    createdAt: '2024-01-15 08:00',
    note: 'Khách VIP - ưu tiên xử lý',
    hasPrescription: true,
    paymentStatus: 'paid',
  },
  {
    id: 'ORD-2024-004',
    customer: 'Phạm Minh Đức',
    phone: '0934567890',
    address: '321 CMT8, Q10, TP.HCM',
    products: [
      {
        name: 'Gọng kính nhựa Classic',
        variant: 'Nâu - Size S',
        qty: 1,
        price: 1200000,
      },
    ],
    total: 1200000,
    status: 'pending',
    priority: 'low',
    createdAt: '2024-01-15 14:20',
    note: '',
    hasPrescription: false,
    paymentStatus: 'cod',
  },
  {
    id: 'ORD-2024-005',
    customer: 'Võ Thị Em',
    phone: '0945678901',
    address: '654 Điện Biên Phủ, Bình Thạnh, TP.HCM',
    products: [
      {
        name: 'Gọng kính thời trang',
        variant: 'Hồng - Size M',
        qty: 1,
        price: 1800000,
      },
      {
        name: 'Tròng chống ánh sáng xanh',
        variant: '1.56 - Clear',
        qty: 2,
        price: 1500000,
      },
    ],
    total: 3300000,
    status: 'pending',
    priority: 'normal',
    createdAt: '2024-01-15 11:45',
    note: 'Gọi xác nhận trước khi giao',
    hasPrescription: true,
    paymentStatus: 'partial',
  },
];

export const priorityConfig: Record<string, PriorityConfig> = {
  urgent: { label: 'Khẩn cấp', color: 'error', icon: AlertTriangle },
  high: { label: 'Cao', color: 'warning', icon: Clock },
  normal: { label: 'Bình thường', color: 'info', icon: Package },
  low: { label: 'Thấp', color: 'default', icon: Package },
};

export const paymentStatusConfig: Record<string, PaymentStatusConfig> = {
  paid: { label: 'Đã thanh toán', color: 'success' },
  pending: { label: 'Chưa thanh toán', color: 'warning' },
  partial: { label: 'Thanh toán một phần', color: 'info' },
  cod: { label: 'COD', color: 'default' },
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};
