export type RequestType = 'exchange' | 'return' | 'warranty';
export type RequestStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected';

export interface ReturnProduct {
  name: string;
  sku: string;
  quantity: number;
  price: number;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customer: string;
  phone: string;
  type: RequestType;
  status: RequestStatus;
  reason: string;
  products: ReturnProduct[];
  createdAt: string;
  totalValue: number;
  images: string[];
  notes: string;
  assignee?: string;
}

export const typeLabels: Record<RequestType, string> = {
  exchange: 'Đổi hàng',
  return: 'Trả hàng',
  warranty: 'Bảo hành',
};

export const typeColors: Record<
  RequestType,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  exchange: 'secondary',
  return: 'destructive',
  warranty: 'outline',
};

export const statusLabels: Record<RequestStatus, string> = {
  pending: 'Chờ xử lý',
  reviewing: 'Đang xem xét',
  approved: 'Đã duyệt',
  processing: 'Đang xử lý',
  completed: 'Hoàn thành',
  rejected: 'Từ chối',
};

export const statusTypes: Record<
  RequestStatus,
  'warning' | 'info' | 'success' | 'error' | 'default'
> = {
  pending: 'warning',
  reviewing: 'info',
  approved: 'success',
  processing: 'info',
  completed: 'success',
  rejected: 'error',
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

export const rejectReasons = [
  { value: 'expired', label: 'Quá thời hạn đổi/trả' },
  { value: 'damaged', label: 'Sản phẩm bị hư hỏng do người dùng' },
  { value: 'used', label: 'Sản phẩm đã qua sử dụng' },
  { value: 'no_receipt', label: 'Không có hóa đơn/chứng từ' },
  { value: 'out_of_warranty', label: 'Hết hạn bảo hành' },
  { value: 'other', label: 'Lý do khác' },
];
