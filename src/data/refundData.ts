import { RefundRequest } from '@/types/refund';

export const mockRefunds: RefundRequest[] = [
  {
    id: 'RF001',
    orderId: 'ORD-2024-001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    amount: 2500000,
    reason: 'Sản phẩm lỗi, không thể sử dụng',
    method: 'bank_transfer',
    status: 'pending',
    createdAt: '2024-01-15 09:30',
    bankInfo: {
      bankName: 'Vietcombank',
      accountNumber: '1234567890',
      accountHolder: 'NGUYEN VAN A',
    },
  },
  {
    id: 'RF002',
    orderId: 'ORD-2024-002',
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    amount: 1800000,
    reason: 'Đổi ý không muốn mua',
    method: 'card',
    status: 'reviewing',
    createdAt: '2024-01-14 14:20',
  },
  {
    id: 'RF003',
    orderId: 'ORD-2024-003',
    customerName: 'Lê Văn C',
    customerPhone: '0923456789',
    amount: 3200000,
    reason: 'Giao sai sản phẩm',
    method: 'bank_transfer',
    status: 'approved',
    createdAt: '2024-01-13 11:45',
    bankInfo: {
      bankName: 'Techcombank',
      accountNumber: '9876543210',
      accountHolder: 'LE VAN C',
    },
  },
  {
    id: 'RF004',
    orderId: 'ORD-2024-004',
    customerName: 'Phạm Thị D',
    customerPhone: '0934567890',
    amount: 950000,
    reason: 'Sản phẩm không đúng mô tả',
    method: 'wallet',
    status: 'processing',
    createdAt: '2024-01-12 16:00',
  },
  {
    id: 'RF005',
    orderId: 'ORD-2024-005',
    customerName: 'Hoàng Văn E',
    customerPhone: '0945678901',
    amount: 4500000,
    reason: 'Hủy đơn trước khi giao',
    method: 'bank_transfer',
    status: 'completed',
    createdAt: '2024-01-10 08:15',
    processedAt: '2024-01-11 10:30',
    bankInfo: {
      bankName: 'BIDV',
      accountNumber: '5555666677',
      accountHolder: 'HOANG VAN E',
    },
  },
  {
    id: 'RF006',
    orderId: 'ORD-2024-006',
    customerName: 'Vũ Thị F',
    customerPhone: '0956789012',
    amount: 1200000,
    reason: 'Yêu cầu hoàn tiền không hợp lệ',
    method: 'cash',
    status: 'rejected',
    createdAt: '2024-01-09 13:40',
    notes: 'Sản phẩm đã qua sử dụng, không đủ điều kiện hoàn tiền',
  },
];

export const getRefundStats = (refunds: RefundRequest[]) => ({
  pending: refunds.filter((r) => r.status === 'pending').length,
  reviewing: refunds.filter((r) => r.status === 'reviewing').length,
  processing: refunds.filter(
    (r) => r.status === 'processing' || r.status === 'approved'
  ).length,
  completed: refunds.filter((r) => r.status === 'completed').length,
  totalAmount: refunds
    .filter((r) =>
      ['pending', 'reviewing', 'approved', 'processing'].includes(r.status)
    )
    .reduce((sum, r) => sum + r.amount, 0),
});
