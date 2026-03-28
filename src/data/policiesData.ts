// Mock data for Policies

export interface Policy {
  id: string;
  title: string;
  category:
    | 'warranty'
    | 'return'
    | 'refund'
    | 'shipping'
    | 'purchase'
    | 'privacy'
    | 'terms';
  content: string;
  summary: string;
  effectiveDate: string;
  expiryDate?: string;
  status: 'active' | 'inactive' | 'draft';
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export const policiesData: Policy[] = [
  {
    id: '1',
    title: 'Chính sách bảo hành sản phẩm',
    category: 'warranty',
    summary: 'Bảo hành 12 tháng cho gọng kính, 6 tháng cho tròng kính',
    content: `
## Chính sách bảo hành

### 1. Điều kiện bảo hành
- Sản phẩm còn trong thời hạn bảo hành
- Có phiếu bảo hành và hóa đơn mua hàng
- Lỗi do nhà sản xuất

### 2. Thời gian bảo hành
- **Gọng kính**: 12 tháng
- **Tròng kính**: 6 tháng  
- **Phụ kiện**: 3 tháng

### 3. Quyền lợi bảo hành
- Sửa chữa miễn phí các lỗi kỹ thuật
- Thay thế sản phẩm nếu không sửa được
- Vệ sinh và bảo dưỡng miễn phí

### 4. Trường hợp không bảo hành
- Sản phẩm bị hư hỏng do người dùng
- Bị ẩm mốc, rỉ sét do bảo quản không đúng cách
- Đã qua sửa chữa ở nơi khác
`,
    effectiveDate: '2024-01-01',
    status: 'active',
    version: '2.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    createdBy: 'Manager Admin',
  },
  {
    id: '2',
    title: 'Chính sách đổi trả hàng',
    category: 'return',
    summary: 'Đổi trả trong 30 ngày, sản phẩm còn nguyên vẹn',
    content: `
## Chính sách đổi trả

### 1. Thời gian đổi trả
- Trong vòng **30 ngày** kể từ ngày mua
- Áp dụng cho cả mua online và tại cửa hàng

### 2. Điều kiện đổi trả
- Sản phẩm còn nguyên vẹn, chưa qua sử dụng
- Còn đầy đủ tem, nhãn mác
- Có hóa đơn mua hàng

### 3. Quy trình đổi trả
1. Liên hệ bộ phận CSKH
2. Gửi sản phẩm về (nếu mua online)
3. Kiểm tra sản phẩm
4. Hoàn tiền hoặc đổi sản phẩm mới

### 4. Chi phí đổi trả
- **Miễn phí** nếu lỗi do nhà cung cấp
- Khách hàng chịu phí vận chuyển nếu đổi ý
`,
    effectiveDate: '2024-01-01',
    status: 'active',
    version: '1.5',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-10T14:20:00Z',
    createdBy: 'Manager Admin',
  },
  {
    id: '3',
    title: 'Chính sách vận chuyển',
    category: 'shipping',
    summary: 'Giao hàng toàn quốc, miễn phí đơn từ 500k',
    content: `
## Chính sách vận chuyển

### 1. Phạm vi giao hàng
- Giao hàng toàn quốc 63 tỉnh thành
- Ưu tiên nội thành Hà Nội và TP.HCM

### 2. Thời gian giao hàng
- **Nội thành**: 1-2 ngày
- **Tỉnh thành khác**: 3-5 ngày
- **Vùng xa**: 5-7 ngày

### 3. Phí vận chuyển
- **Miễn phí** cho đơn hàng từ 500.000đ
- Dưới 500k: 30.000đ (nội thành), 50.000đ (tỉnh)

### 4. Đóng gói
- Đóng gói cẩn thận, chuyên nghiệp
- Có hộp và túi brand
- Bảo vệ sản phẩm tốt nhất
`,
    effectiveDate: '2024-01-01',
    status: 'active',
    version: '1.2',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-03-05T09:15:00Z',
    createdBy: 'Manager Admin',
  },
  {
    id: '4',
    title: 'Chính sách thanh toán',
    category: 'purchase',
    summary: 'Hỗ trợ nhiều hình thức thanh toán, trả góp 0%',
    content: `
## Chính sách thanh toán

### 1. Phương thức thanh toán
- Tiền mặt tại cửa hàng
- Chuyển khoản ngân hàng
- Ví điện tử (MoMo, ZaloPay, VNPay)
- Thẻ tín dụng/ghi nợ

### 2. Trả góp 0%
- Áp dụng cho đơn hàng từ 3.000.000đ
- Thời gian: 3, 6, 9, 12 tháng
- Không lãi suất, không phí

### 3. Thanh toán online
- Bảo mật SSL 256-bit
- Không lưu thông tin thẻ
- Xác nhận đơn hàng ngay lập tức

### 4. Hóa đơn VAT
- Xuất hóa đơn VAT theo yêu cầu
- Thông báo trước khi thanh toán
`,
    effectiveDate: '2024-01-01',
    status: 'active',
    version: '1.3',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T11:00:00Z',
    createdBy: 'Manager Admin',
  },
  {
    id: '5',
    title: 'Chính sách bảo mật thông tin',
    category: 'privacy',
    summary: 'Cam kết bảo mật tuyệt đối thông tin khách hàng',
    content: `
## Chính sách bảo mật

### 1. Thu thập thông tin
- Họ tên, số điện thoại, email
- Địa chỉ giao hàng
- Lịch sử mua hàng

### 2. Sử dụng thông tin
- Xử lý đơn hàng
- Gửi thông báo khuyến mãi (nếu đồng ý)
- Cải thiện dịch vụ

### 3. Bảo mật thông tin
- Mã hóa dữ liệu
- Không chia sẻ với bên thứ ba
- Tuân thủ luật bảo vệ dữ liệu

### 4. Quyền của khách hàng
- Yêu cầu xem, sửa, xóa thông tin
- Từ chối nhận email marketing
- Khiếu nại về việc sử dụng dữ liệu
`,
    effectiveDate: '2024-01-01',
    status: 'active',
    version: '1.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'Manager Admin',
  },
  {
    id: '6',
    title: 'Điều khoản sử dụng website',
    category: 'terms',
    summary: 'Quy định chung khi sử dụng website và dịch vụ',
    content: `
## Điều khoản sử dụng

### 1. Chấp nhận điều khoản
- Khi sử dụng website = đồng ý với điều khoản
- Có hiệu lực ngay khi truy cập

### 2. Tài khoản người dùng
- Bảo mật thông tin đăng nhập
- Chịu trách nhiệm về hoạt động tài khoản
- Thông báo ngay nếu bị hack

### 3. Nội dung và hình ảnh
- Thuộc bản quyền của Eyes Dream
- Nghiêm cấm sao chép, sử dụng trái phép
- Vi phạm sẽ bị xử lý theo pháp luật

### 4. Quy tắc đặt hàng
- Cung cấp thông tin chính xác
- Không đặt hàng ảo, spam
- Thanh toán đúng hạn
`,
    effectiveDate: '2024-01-01',
    status: 'active',
    version: '1.1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-01T15:30:00Z',
    createdBy: 'Manager Admin',
  },
  {
    id: '7',
    title: 'Chính sách kiểm tra mắt miễn phí',
    category: 'purchase',
    summary: 'Khám và kiểm tra mắt miễn phí khi mua kính',
    content: `
## Chính sách kiểm tra mắt

### 1. Dịch vụ khám mắt
- Khám và đo độ miễn phí
- Tư vấn chọn kính phù hợp
- Bác sĩ chuyên khoa

### 2. Quy trình khám
1. Đăng ký lịch hẹn (online hoặc tại cửa hàng)
2. Kiểm tra thị lực
3. Đo độ kính chính xác
4. Tư vấn sản phẩm

### 3. Thời gian
- Mỗi buổi khám: 15-20 phút
- Làm việc từ 8h-20h hàng ngày

### 4. Lưu ý
- Mang theo đơn thuốc cũ (nếu có)
- Không cần nhịn ăn
- Trẻ em cần có phụ huynh đi cùng
`,
    effectiveDate: '2024-02-01',
    status: 'active',
    version: '1.0',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-01-25T10:00:00Z',
    createdBy: 'Manager Admin',
  },
  {
    id: '8',
    title: 'Chính sách vệ sinh và bảo dưỡng',
    category: 'warranty',
    summary: 'Vệ sinh và bảo dưỡng kính định kỳ miễn phí',
    content: `
## Chính sách vệ sinh bảo dưỡng

### 1. Dịch vụ miễn phí
- Vệ sinh kính chuyên nghiệp
- Kiểm tra và chỉnh sửa gọng
- Thay đệm mũi, vít nhỏ

### 2. Tần suất
- Khuyến khích 3-6 tháng/lần
- Không giới hạn số lần

### 3. Quy trình
- Làm sạch bằng thiết bị siêu âm
- Chỉnh gọng vừa vặn
- Kiểm tra độ bền

### 4. Lưu ý
- Mang theo thẻ khách hàng
- Thời gian: 10-15 phút
- Không cần đặt lịch trước
`,
    effectiveDate: '2024-01-01',
    status: 'active',
    version: '1.0',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    createdBy: 'Manager Admin',
  },
];
