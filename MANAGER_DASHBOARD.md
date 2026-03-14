# Manager Dashboard - WDP Eyewear

## 📋 Tổng Quan

Manager Dashboard là hệ thống quản lý dành riêng cho vai trò Manager trong dự án WDP Eyewear. Được xây dựng theo Atomic Design Pattern với đầy đủ chức năng quản lý sản phẩm, giá cả, người dùng, chính sách và báo cáo doanh thu.

## 🎯 Chức Năng Manager

### 1. **Quản Lý Sản Phẩm** (`/dashboard/manager/products`)

- Xem danh sách tất cả sản phẩm kính (gọng, lens, accessories)
- Tìm kiếm sản phẩm theo tên, SKU
- Lọc theo danh mục và trạng thái
- Thêm/sửa/xóa sản phẩm
- Quản lý biến thể sản phẩm (màu sắc, size, giá)
- Theo dõi tồn kho

### 2. **Quản Lý Giá & Khuyến Mãi** (`/dashboard/manager/pricing`)

- Quản lý giá bán gọng/tròng/dịch vụ
- Tạo và quản lý combo (gọng + tròng)
- Tạo mã khuyến mãi (giảm phần trăm, giảm giá cố định, free shipping)
- Theo dõi hiệu quả các chiến dịch khuyến mãi
- Quản lý thời gian và điều kiện áp dụng

### 3. **Quản Lý Người Dùng** (`/dashboard/manager/users`)

- Quản lý tài khoản nhân viên (Sales, Operations, Manager, Admin)
- Phân quyền và quản lý vai trò
- Theo dõi hoạt động đăng nhập
- Tạo/sửa/xóa/vô hiệu hóa tài khoản

### 4. **Quản Lý Chính Sách** (`/dashboard/manager/policies`)

- Quản lý chính sách mua hàng
- Quản lý chính sách đổi/trả hàng
- Quản lý chính sách bảo hành
- Quản lý chính sách vận chuyển
- Xem chi tiết và cập nhật nội dung chính sách

### 5. **Báo Cáo Doanh Thu** (`/dashboard/manager/revenue`)

- Xem tổng quan doanh thu theo tháng
- Phân tích doanh thu theo danh mục sản phẩm
- Top sản phẩm bán chạy nhất
- Chỉ số khách hàng (tổng số, mới, quay lại)
- Giá trị đơn hàng trung bình

## 🏗️ Cấu Trúc Atomic Design

### Atoms (Components cơ bản)

```
src/components/atoms/
├── Badge.tsx          # Hiển thị trạng thái
├── Button.tsx         # Nút bấm
├── Card.tsx           # Card container
├── Input.tsx          # Input field
├── Select.tsx         # Dropdown select
├── Table.tsx          # Bảng dữ liệu
├── Textarea.tsx       # Textarea
└── LanguageSelector.tsx  # Chuyển đổi ngôn ngữ
```

### Molecules (Components tổng hợp)

```
src/components/molecules/
├── StatCard.tsx       # Thẻ hiển thị thống kê
├── SearchBar.tsx      # Thanh tìm kiếm
├── FilterBar.tsx      # Thanh bộ lọc
├── DataTable.tsx      # Bảng dữ liệu có phân trang
└── FormField.tsx      # Trường form đầy đủ
```

### Organisms (Components phức tạp)

```
src/components/organisms/
├── ManagerSidebar.tsx    # Sidebar navigation cho Manager
├── ManagerHeader.tsx     # Header với user info
├── ProductTable.tsx      # Bảng sản phẩm chuyên dụng
├── UserTable.tsx         # Bảng người dùng chuyên dụng
└── RevenueChart.tsx      # Biểu đồ doanh thu
```

### Templates (Layout)

```
src/components/templates/
└── ManagerLayout.tsx     # Layout chung cho Manager pages
```

### Pages (Trang cụ thể)

```
app/[locale]/(dashboard)/dashboard/manager/
├── products/page.tsx     # Trang quản lý sản phẩm
├── pricing/page.tsx      # Trang quản lý giá & khuyến mãi
├── users/page.tsx        # Trang quản lý người dùng
├── policies/page.tsx     # Trang quản lý chính sách
└── revenue/page.tsx      # Trang báo cáo doanh thu
```

## 📊 Mock Data

Tất cả dữ liệu hiện tại đều là mock data, được tổ chức trong:

```
src/lib/mock-data/
├── products.ts    # Sản phẩm, biến thể, tùy chọn lens
├── users.ts       # Người dùng và phân quyền
├── policies.ts    # Chính sách và khuyến mãi
├── revenue.ts     # Dữ liệu doanh thu và thống kê
└── index.ts       # Export tổng hợp
```

### Các loại dữ liệu mock:

**Products:**

- 6 sản phẩm mẫu với các trạng thái khác nhau
- Biến thể màu sắc và size
- Tùy chọn lens (single vision, bifocal, progressive)

**Users:**

- 7 người dùng với 4 vai trò (sales, operations, manager, admin)
- Trạng thái: active, inactive, suspended
- Lịch sử đăng nhập

**Policies:**

- 5 chính sách mẫu
- 4 loại: purchase, return, warranty, shipping

**Promotions:**

- 4 chương trình khuyến mãi
- 3 loại: percentage, fixed_amount, free_shipping

**Revenue:**

- Dữ liệu 6 tháng
- Phân tích theo danh mục
- Top 5 sản phẩm bán chạy

## 🌍 Đa Ngôn Ngữ (i18n)

Hỗ trợ tiếng Việt và tiếng Anh:

```
messages/
├── en/manager.json    # English translations
└── vi/manager.json    # Vietnamese translations
```

## 🎨 UI/UX Features

- **Responsive Design**: Hoạt động mượt mà trên mọi thiết bị
- **Dark Gradient Sidebar**: Màu gradient đẹp mắt từ indigo đến purple
- **Interactive Components**: Hover effects, transitions mượt mà
- **Status Badges**: Màu sắc rõ ràng cho từng trạng thái
- **Search & Filter**: Tìm kiếm và lọc dữ liệu nhanh chóng
- **Data Visualization**: Biểu đồ doanh thu trực quan

## 🔐 Bảo Mật & Phân Quyền

File proxy.ts đã được giữ nguyên để:

- Kiểm tra authentication
- Redirect người dùng chưa đăng nhập
- Bảo vệ routes của Manager (chỉ Manager và Admin mới truy cập được)

## 🚀 Cách Sử Dụng

### 1. Truy cập Manager Dashboard

```bash
# Đăng nhập với tài khoản Manager
# Sau đó truy cập:
http://localhost:3000/vi/dashboard/manager/products
http://localhost:3000/en/dashboard/manager/products
```

### 2. Navigation

Sử dụng sidebar bên trái để điều hướng giữa các trang:

- Dashboard (trang chính)
- Product Management
- Pricing & Promotions
- User Management
- Policies & Terms
- Revenue Reports

### 3. Thao tác cơ bản

**Tìm kiếm:**

- Nhập từ khóa vào SearchBar
- Nhấn Enter hoặc click nút Search

**Lọc dữ liệu:**

- Chọn các tiêu chí trong FilterBar
- Click "Reset" để xóa bộ lọc

**Thêm/Sửa/Xóa:**

- Click nút "Add New..." để thêm mới
- Click "Edit" trong bảng để sửa
- Click "Delete" để xóa (có xác nhận)

## 📝 Lưu Ý Quan Trọng

### Atomic Design Pattern

1. **Atoms**: Chỉ chứa logic UI cơ bản, không có business logic
2. **Molecules**: Kết hợp atoms, có thể có state đơn giản
3. **Organisms**: Có business logic, kết nối với mock data
4. **Templates**: Chỉ định nghĩa layout structure
5. **Pages**: Kết nối tất cả với routing và data fetching

### Khi có API thật:

1. Tạo API endpoints trong `src/api/`:

```typescript
// src/api/manager.ts
export const managerApi = {
  getProducts: () => apiClient.get('/manager/products'),
  createProduct: (data) => apiClient.post('/manager/products', data),
  // ...
};
```

2. Thay thế mock data bằng React Query hooks:

```typescript
// src/hooks/useManagerProducts.ts
import { useQuery } from '@tanstack/react-query';
import { managerApi } from '@/api/manager';

export const useProducts = () => {
  return useQuery({
    queryKey: ['manager', 'products'],
    queryFn: managerApi.getProducts,
  });
};
```

3. Update components sử dụng hooks thay vì mock data:

```typescript
// pages/products/page.tsx
const { data: products, isLoading } = useProducts();
```

## 🔄 Tích Hợp API Trong Tương Lai

Khi backend sẵn sàng:

1. **Cập nhật API Client** (`src/api/manager.ts`)
2. **Tạo Hooks** (`src/hooks/useManagerProducts.ts`, etc.)
3. **Thay Mock Data** trong các pages
4. **Thêm Loading & Error States**
5. **Implement Mutations** (Create, Update, Delete)

## 🎓 Best Practices

1. **Component Reusability**: Sử dụng lại components nhiều nhất có thể
2. **Type Safety**: Tất cả đều có TypeScript types
3. **i18n First**: Luôn sử dụng translations, không hardcode text
4. **Separation of Concerns**: Logic riêng, UI riêng
5. **Mock Data Structure**: Giống như API response thật

## 📚 Tài Liệu Tham Khảo

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [next-intl](https://next-intl-docs.vercel.app/)

## 🤝 Đóng Góp

Khi phát triển thêm features:

1. Tuân thủ Atomic Design Pattern
2. Tạo mock data tương ứng
3. Thêm translations (en & vi)
4. Viết TypeScript types đầy đủ
5. Test trên cả mobile và desktop

---

**Created by:** WDP Team  
**Date:** January 29, 2026  
**Version:** 1.0.0
