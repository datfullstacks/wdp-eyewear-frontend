import { SupplementOrder } from '@/types/prescription';

export const mockSupplementOrders: SupplementOrder[] = [
  {
    id: 'SUP001',
    orderId: 'ORD-2024-0156',
    customer: 'Nguyễn Văn An',
    phone: '0901234567',
    email: 'an.nguyen@email.com',
    zalo: '0901234567',
    orderDate: '2024-01-15',
    products: [
      {
        name: 'Gọng kính Titan Classic',
        sku: 'TIT-001',
        frame: 'Đen',
        quantity: 1,
      },
    ],
    missingType: 'no_prescription',
    missingFields: [
      { field: 'sphere', label: 'SPH (Độ cầu)', eye: 'both' },
      { field: 'cylinder', label: 'CYL (Độ loạn)', eye: 'both' },
      { field: 'axis', label: 'AXIS (Trục)', eye: 'both' },
      { field: 'pd', label: 'PD (Khoảng cách đồng tử)' },
    ],
    priority: 'urgent',
    dueDate: '2024-01-18',
    daysPending: 3,
    contactAttempts: 2,
    lastContactDate: '2024-01-16',
    contactHistory: [
      {
        id: 'C1',
        type: 'sms',
        date: '2024-01-15 10:30',
        content:
          'Chào anh An, đơn hàng #ORD-2024-0156 cần bổ sung thông số mắt.',
        status: 'delivered',
        staff: 'Nhân viên A',
      },
      {
        id: 'C2',
        type: 'phone',
        date: '2024-01-16 14:00',
        content: 'Gọi điện - Khách không nghe máy',
        status: 'failed',
        staff: 'Nhân viên A',
      },
    ],
    notes: 'Khách đặt online, chưa cung cấp thông số mắt',
  },
  {
    id: 'SUP002',
    orderId: 'ORD-2024-0157',
    customer: 'Trần Thị Bình',
    phone: '0912345678',
    email: 'binh.tran@email.com',
    orderDate: '2024-01-14',
    products: [
      {
        name: 'Gọng kính Premium Gold',
        sku: 'PRE-002',
        frame: 'Vàng',
        quantity: 1,
      },
    ],
    missingType: 'incomplete_data',
    missingFields: [
      { field: 'cylinder', label: 'CYL (Độ loạn)', eye: 'OS' },
      { field: 'axis', label: 'AXIS (Trục)', eye: 'OS' },
      { field: 'add', label: 'ADD (Độ cộng)', eye: 'both' },
    ],
    priority: 'high',
    dueDate: '2024-01-19',
    daysPending: 2,
    contactAttempts: 1,
    lastContactDate: '2024-01-15',
    contactHistory: [
      {
        id: 'C3',
        type: 'email',
        date: '2024-01-15 09:00',
        content: 'Gửi email yêu cầu bổ sung thông số mắt trái và độ cộng',
        status: 'read',
        staff: 'Nhân viên B',
      },
    ],
    prescriptionImage: '/placeholder.svg',
    notes: 'Khách gửi ảnh đơn thuốc nhưng thiếu thông số mắt trái',
  },
  {
    id: 'SUP003',
    orderId: 'ORD-2024-0158',
    customer: 'Lê Minh Châu',
    phone: '0923456789',
    email: 'chau.le@email.com',
    zalo: '0923456789',
    orderDate: '2024-01-13',
    products: [
      {
        name: 'Gọng kính Sport Flex',
        sku: 'SPO-003',
        frame: 'Xanh',
        quantity: 1,
      },
    ],
    missingType: 'unclear_image',
    missingFields: [{ field: 'all', label: 'Toàn bộ thông số (ảnh không rõ)' }],
    priority: 'normal',
    dueDate: '2024-01-20',
    daysPending: 1,
    contactAttempts: 0,
    contactHistory: [],
    prescriptionImage: '/placeholder.svg',
    notes: 'Ảnh đơn thuốc bị mờ, không đọc được số liệu',
  },
  {
    id: 'SUP004',
    orderId: 'ORD-2024-0159',
    customer: 'Phạm Đức Dũng',
    phone: '0934567890',
    email: 'dung.pham@email.com',
    orderDate: '2024-01-12',
    products: [
      {
        name: 'Gọng kính Acetate Retro',
        sku: 'ACE-004',
        frame: 'Nâu',
        quantity: 1,
      },
    ],
    missingType: 'need_verification',
    missingFields: [
      {
        field: 'sphere',
        label: 'SPH (cần xác nhận giá trị bất thường)',
        eye: 'OD',
      },
    ],
    priority: 'high',
    dueDate: '2024-01-17',
    daysPending: 4,
    contactAttempts: 3,
    lastContactDate: '2024-01-16',
    contactHistory: [
      {
        id: 'C4',
        type: 'sms',
        date: '2024-01-13 10:00',
        content: 'Yêu cầu xác nhận thông số SPH -8.50 mắt phải',
        status: 'delivered',
        staff: 'Nhân viên C',
      },
      {
        id: 'C5',
        type: 'phone',
        date: '2024-01-14 15:30',
        content: 'Gọi điện - Khách xác nhận sẽ kiểm tra lại',
        status: 'delivered',
        staff: 'Nhân viên C',
      },
      {
        id: 'C6',
        type: 'zalo',
        date: '2024-01-16 09:00',
        content: 'Nhắc nhở qua Zalo về việc xác nhận thông số',
        status: 'read',
        staff: 'Nhân viên C',
      },
    ],
    notes: 'Độ cầu mắt phải cao bất thường (-8.50), cần xác nhận với khách',
    assignedTo: 'Nhân viên C',
  },
  {
    id: 'SUP005',
    orderId: 'ORD-2024-0160',
    customer: 'Hoàng Thị Em',
    phone: '0945678901',
    email: 'em.hoang@email.com',
    orderDate: '2024-01-11',
    products: [
      {
        name: 'Gọng kính Kids Color',
        sku: 'KID-006',
        frame: 'Hồng',
        quantity: 1,
      },
    ],
    missingType: 'no_prescription',
    missingFields: [{ field: 'all', label: 'Toàn bộ thông số mắt' }],
    priority: 'urgent',
    dueDate: '2024-01-16',
    daysPending: 5,
    contactAttempts: 4,
    lastContactDate: '2024-01-15',
    contactHistory: [
      {
        id: 'C7',
        type: 'sms',
        date: '2024-01-11 11:00',
        content: 'Yêu cầu gửi thông số mắt',
        status: 'delivered',
        staff: 'Nhân viên A',
      },
      {
        id: 'C8',
        type: 'phone',
        date: '2024-01-12 10:00',
        content: 'Khách hẹn sẽ đến cửa hàng đo mắt',
        status: 'delivered',
        staff: 'Nhân viên A',
      },
      {
        id: 'C9',
        type: 'sms',
        date: '2024-01-14 09:00',
        content: 'Nhắc nhở lịch hẹn đo mắt',
        status: 'delivered',
        staff: 'Nhân viên B',
      },
      {
        id: 'C10',
        type: 'phone',
        date: '2024-01-15 16:00',
        content: 'Khách xin hoãn, hẹn tuần sau',
        status: 'delivered',
        staff: 'Nhân viên B',
      },
    ],
    notes: 'Đơn hàng cho trẻ em, khách hẹn đến cửa hàng đo mắt nhưng chưa đến',
  },
];

export const contactTemplates = {
  sms: [
    {
      id: 'sms1',
      name: 'Yêu cầu gửi đơn thuốc',
      content:
        'Chào {customer}, đơn hàng #{orderId} cần bổ sung đơn thuốc mắt. Quý khách vui lòng gửi ảnh đơn thuốc qua Zalo hoặc trả lời SMS này. Xin cảm ơn!',
    },
    {
      id: 'sms2',
      name: 'Nhắc nhở lần 2',
      content:
        'Kính gửi {customer}, chúng tôi vẫn chưa nhận được thông số mắt cho đơn #{orderId}. Để tránh chậm trễ, xin vui lòng phản hồi trong 24h. Hotline: 1900xxx',
    },
    {
      id: 'sms3',
      name: 'Cảnh báo hủy đơn',
      content:
        'Thông báo: Đơn hàng #{orderId} sẽ bị hủy sau 48h nếu không nhận được thông số mắt. Vui lòng liên hệ ngay: 1900xxx',
    },
  ],
  email: [
    {
      id: 'email1',
      name: 'Yêu cầu bổ sung chi tiết',
      content:
        'Kính gửi Quý khách {customer},\n\nĐơn hàng #{orderId} đang chờ bổ sung thông tin đo mắt.\n\nThông tin còn thiếu:\n{missingFields}\n\nTrân trọng!',
    },
  ],
  zalo: [
    {
      id: 'zalo1',
      name: 'Tin nhắn Zalo chuẩn',
      content:
        'Xin chào {customer}! 👋\n\nĐơn hàng #{orderId} cần bổ sung thông số mắt ạ.\n\nEm cảm ơn ạ! 🙏',
    },
  ],
  phone: [],
};
