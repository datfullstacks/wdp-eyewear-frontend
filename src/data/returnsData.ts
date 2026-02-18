import { ReturnRequest } from '@/types/returns';

export const mockReturnRequests: ReturnRequest[] = [
  {
    id: 'RET-001',
    orderId: 'ORD-2024-001',
    customer: 'Nguyễn Văn An',
    phone: '0901234567',
    type: 'exchange',
    status: 'pending',
    reason: 'Sai kích thước gọng',
    products: [
      {
        name: 'Gọng Rayban RB5154',
        sku: 'RB5154-BLK',
        quantity: 1,
        price: 2500000,
      },
    ],
    createdAt: '2024-01-15 09:30',
    totalValue: 2500000,
    images: ['img1.jpg', 'img2.jpg'],
    notes: 'Khách muốn đổi size 51 sang 49',
  },
  {
    id: 'RET-002',
    orderId: 'ORD-2024-002',
    customer: 'Trần Thị Bình',
    phone: '0912345678',
    type: 'return',
    status: 'reviewing',
    reason: 'Sản phẩm bị lỗi',
    products: [
      {
        name: 'Tròng Essilor Crizal',
        sku: 'ESS-CRIZAL-167',
        quantity: 2,
        price: 3200000,
      },
    ],
    createdAt: '2024-01-14 14:20',
    totalValue: 3200000,
    images: ['img3.jpg'],
    notes: 'Tròng bị xước khi nhận hàng',
    assignee: 'Nhân viên A',
  },
  {
    id: 'RET-003',
    orderId: 'ORD-2024-003',
    customer: 'Lê Hoàng Cường',
    phone: '0923456789',
    type: 'warranty',
    status: 'approved',
    reason: 'Bong tróc lớp phủ',
    products: [
      {
        name: 'Gọng Oakley OX8046',
        sku: 'OAK-8046-GRY',
        quantity: 1,
        price: 4500000,
      },
    ],
    createdAt: '2024-01-13 10:45',
    totalValue: 4500000,
    images: ['img4.jpg', 'img5.jpg'],
    notes: 'Còn 8 tháng bảo hành, đã xác nhận lỗi do nhà sản xuất',
    assignee: 'Nhân viên B',
  },
  {
    id: 'RET-004',
    orderId: 'ORD-2024-004',
    customer: 'Phạm Minh Đức',
    phone: '0934567890',
    type: 'exchange',
    status: 'processing',
    reason: 'Đổi màu sắc',
    products: [
      {
        name: 'Gọng Gucci GG0061',
        sku: 'GUC-0061-BRN',
        quantity: 1,
        price: 8500000,
      },
    ],
    createdAt: '2024-01-12 16:00',
    totalValue: 8500000,
    images: [],
    notes: 'Đổi từ màu nâu sang đen, đã nhận hàng cũ',
    assignee: 'Nhân viên C',
  },
  {
    id: 'RET-005',
    orderId: 'ORD-2024-005',
    customer: 'Hoàng Thị Hoa',
    phone: '0945678901',
    type: 'return',
    status: 'completed',
    reason: 'Không hài lòng sản phẩm',
    products: [
      {
        name: 'Kính mát Polaroid PLD6003',
        sku: 'POL-6003-BLU',
        quantity: 1,
        price: 1800000,
      },
    ],
    createdAt: '2024-01-10 11:30',
    totalValue: 1800000,
    images: ['img6.jpg'],
    notes: 'Đã hoàn tiền qua chuyển khoản',
    assignee: 'Nhân viên A',
  },
  {
    id: 'RET-006',
    orderId: 'ORD-2024-006',
    customer: 'Võ Văn Giang',
    phone: '0956789012',
    type: 'warranty',
    status: 'rejected',
    reason: 'Gãy càng kính',
    products: [
      {
        name: 'Gọng Silhouette Titan',
        sku: 'SIL-TITAN-SLV',
        quantity: 1,
        price: 12000000,
      },
    ],
    createdAt: '2024-01-09 15:20',
    totalValue: 12000000,
    images: ['img7.jpg', 'img8.jpg'],
    notes: 'Từ chối - lỗi do va đập, không thuộc phạm vi bảo hành',
  },
];

export const calculateReturnStats = (requests: ReturnRequest[]) => ({
  pending: requests.filter((r) => r.status === 'pending').length,
  reviewing: requests.filter((r) => r.status === 'reviewing').length,
  processing: requests.filter(
    (r) => r.status === 'approved' || r.status === 'processing'
  ).length,
  completed: requests.filter((r) => r.status === 'completed').length,
});

export const calculateTypeStats = (requests: ReturnRequest[]) => ({
  exchange: requests.filter((r) => r.type === 'exchange').length,
  return: requests.filter((r) => r.type === 'return').length,
  warranty: requests.filter((r) => r.type === 'warranty').length,
});
