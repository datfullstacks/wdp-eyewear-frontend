# Hướng dẫn tích hợp Shadcn UI vào dự án WDP Eyewear

## 📋 Tổng quan

Dự án đã được tích hợp thành công **Shadcn UI** - một thư viện component chất lượng cao được xây dựng trên Radix UI và Tailwind CSS. Shadcn UI không phải là một dependency mà là tập hợp các components mà bạn sao chép vào dự án và tùy chỉnh theo ý muốn.

## ✅ Đã hoàn thành

### 1. Cài đặt Shadcn UI
```bash
npx shadcn@latest init -d
```

### 2. Các components đã cài đặt
- ✅ **button** - Nút bấm với nhiều variants
- ✅ **card** - Card container với header, content, footer
- ✅ **input** - Input field
- ✅ **label** - Label cho form
- ✅ **badge** - Badge hiển thị trạng thái
- ✅ **table** - Table component
- ✅ **dropdown-menu** - Menu dropdown
- ✅ **avatar** - Avatar hiển thị người dùng
- ✅ **separator** - Đường phân cách
- ✅ **sheet** - Side panel
- ✅ **sidebar** - Sidebar component
- ✅ **tooltip** - Tooltip
- ✅ **skeleton** - Loading skeleton

### 3. Cấu trúc thư mục mới

```
src/
├── components/
│   ├── ui/                    # Shadcn UI components (Atoms level)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   ├── sidebar.tsx
│   │   └── ...
│   ├── atoms/                 # Custom atoms
│   ├── molecules/             # Composed components
│   │   ├── StatCardNew.tsx   # ⭐ NEW: Stat card với Shadcn
│   ├── organisms/             # Complex sections
│   │   ├── ManagerSidebarNew.tsx  # ⭐ NEW: Sidebar với Shadcn
│   │   ├── ManagerHeaderNew.tsx   # ⭐ NEW: Header với Shadcn
│   └── templates/
│       ├── ManagerLayoutNew.tsx   # ⭐ NEW: Layout với Shadcn
```

## 🎨 Atomic Design với Shadcn UI

### Nguyên tắc áp dụng

1. **Atoms (src/components/ui/)** - Shadcn UI components
   - Các components cơ bản từ Shadcn UI
   - Không chứa business logic
   - Có thể tùy chỉnh styling

2. **Molecules (src/components/molecules/)** - Kết hợp atoms
   - Ví dụ: `StatCardNew` = Card + Badge + Icons
   - Có props và logic đơn giản

3. **Organisms (src/components/organisms/)** - Complex sections
   - Ví dụ: `ManagerSidebarNew`, `ManagerHeaderNew`
   - Chứa business logic, state management
   - Sử dụng hooks (useTranslations, useLocale, etc.)

4. **Templates (src/components/templates/)** - Page layouts
   - Ví dụ: `ManagerLayoutNew`
   - Kết hợp organisms thành layout hoàn chỉnh

5. **Pages (app/[locale]/(manager)/)** - Specific pages
   - Sử dụng templates và điền data thực

## 📝 Ví dụ: Trang Manager mới với Shadcn UI

### 1. StatCardNew (Molecule)
```tsx
// src/components/molecules/StatCardNew.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCardNew = ({ title, value, icon, trend }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {icon && <div>{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {trend && (
          <Badge variant={trend.isPositive ? 'default' : 'destructive'}>
            {trend.value}%
          </Badge>
        )}
      </CardContent>
    </Card>
  );
};
```

### 2. ManagerSidebarNew (Organism)
```tsx
// src/components/organisms/ManagerSidebarNew.tsx
import { Sidebar, SidebarContent, SidebarMenu } from '@/components/ui/sidebar';
import { LayoutDashboard, Package, Users } from 'lucide-react';

export function ManagerSidebarNew() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarMenu>
          {/* Menu items với icons từ lucide-react */}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
```

### 3. ManagerLayoutNew (Template)
```tsx
// src/components/templates/ManagerLayoutNew.tsx
import { SidebarProvider } from '@/components/ui/sidebar';
import { ManagerSidebarNew } from '@/components/organisms/ManagerSidebarNew';
import { ManagerHeaderNew } from '@/components/organisms/ManagerHeaderNew';

export const ManagerLayoutNew = ({ children }) => {
  return (
    <SidebarProvider>
      <ManagerSidebarNew />
      <main>{children}</main>
    </SidebarProvider>
  );
};
```

### 4. Revenue Page (Page)
```tsx
// app/[locale]/(manager)/manager/revenue-new/page.tsx
import { ManagerLayoutNew } from '@/components/templates/ManagerLayoutNew';
import { StatCardNew } from '@/components/molecules/StatCardNew';
import { Table } from '@/components/ui/table';

export default function ManagerRevenuePage() {
  return (
    <ManagerLayoutNew>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCardNew title="Total Revenue" value="$124,500" />
        {/* More stat cards */}
      </div>
      <Table>{/* Table content */}</Table>
    </ManagerLayoutNew>
  );
}
```

## 🚀 Chuyển đổi các trang Manager cũ sang Shadcn UI

### Bước 1: Thay thế components cũ
```tsx
// CŨ
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';

// MỚI
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
```

### Bước 2: Cập nhật props
Shadcn UI có API khác một chút:
```tsx
// CŨ
<Button variant="primary" size="md">Click</Button>

// MỚI
<Button variant="default" size="default">Click</Button>
```

### Bước 3: Sử dụng Lucide Icons
```tsx
import { DollarSign, ShoppingCart, Users } from 'lucide-react';

<DollarSign className="h-5 w-5" />
```

## 🎯 Kế hoạch chuyển đổi toàn bộ Manager pages

### Các trang cần chuyển đổi:
1. ✅ **revenue-new** - Đã tạo mẫu
2. ⏳ **products** - Chuyển sang Shadcn Table, Button, Badge
3. ⏳ **pricing** - Chuyển sang Shadcn Card, Input, Button
4. ⏳ **users** - Chuyển sang Shadcn Table, Avatar, Badge
5. ⏳ **policies** - Chuyển sang Shadcn Card, Textarea

### Template chuyển đổi:

```tsx
// 1. Thay đổi import
- import { ManagerLayout } from '@/components/templates/ManagerLayout';
+ import { ManagerLayoutNew } from '@/components/templates/ManagerLayoutNew';

- import { StatCard } from '@/components/molecules/StatCard';
+ import { StatCardNew } from '@/components/molecules/StatCardNew';

+ import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
+ import { Button } from '@/components/ui/button';
+ import { Table, TableHeader, TableBody, TableRow, TableCell } from '@/components/ui/table';

// 2. Thay đổi component usage
- <ManagerLayout>
+ <ManagerLayoutNew>

- <StatCard title="Revenue" value="$124K" variant="primary" />
+ <StatCardNew title="Revenue" value="$124K" />

// 3. Sử dụng Lucide icons
+ import { DollarSign, Package, Users } from 'lucide-react';
+ <DollarSign className="h-5 w-5" />
```

## 📚 Thêm components Shadcn mới

Khi cần thêm component:
```bash
npx shadcn@latest add [component-name]

# Ví dụ:
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add tabs
npx shadcn@latest add form
```

## 🎨 Tùy chỉnh theme

Chỉnh sửa file `app/globals.css`:
```css
:root {
  --primary: oklch(0.5 0.2 250);  /* Blue */
  --secondary: oklch(0.9 0.02 250); /* Light gray */
  --destructive: oklch(0.577 0.245 27.325); /* Red */
  --radius: 0.75rem; /* Border radius */
}
```

## ✨ Ưu điểm của Shadcn UI

1. **Không phải dependency** - Code được copy vào dự án, bạn có toàn quyền kiểm soát
2. **Accessible** - Xây dựng trên Radix UI, đảm bảo accessibility
3. **Customizable** - Dễ dàng tùy chỉnh với Tailwind CSS
4. **Type-safe** - Full TypeScript support
5. **Modern design** - Clean, professional, minimal aesthetic
6. **Production-ready** - Đã được test kỹ lưỡng

## 📖 Tài liệu tham khảo

- Shadcn UI: https://ui.shadcn.com/
- Radix UI: https://www.radix-ui.com/
- Lucide Icons: https://lucide.dev/
- Tailwind CSS: https://tailwindcss.com/

## 🔄 Workflow khuyến nghị

### Khi tạo feature mới:

1. **Xác định components cần thiết**
   ```bash
   npx shadcn@latest add button card input
   ```

2. **Tạo Molecules (nếu cần)**
   - Kết hợp Shadcn components
   - Thêm props tùy chỉnh
   - Example: `StatCardNew`, `ProductCardNew`

3. **Tạo Organisms**
   - Sử dụng molecules + atoms
   - Thêm business logic
   - Example: `ProductListNew`, `UserTableNew`

4. **Tạo Template**
   - Kết hợp organisms thành layout
   - Example: `DashboardLayoutNew`

5. **Tạo Page**
   - Sử dụng template và điền data

## 🏗️ Ví dụ: Tạo trang Products mới

```tsx
// 1. Molecule: ProductCard
export const ProductCardNew = ({ product }) => (
  <Card>
    <CardHeader>
      <img src={product.image} />
    </CardHeader>
    <CardContent>
      <h3>{product.name}</h3>
      <p>{product.price}</p>
      <Button>Add to Cart</Button>
    </CardContent>
  </Card>
);

// 2. Organism: ProductGrid
export const ProductGridNew = ({ products }) => (
  <div className="grid grid-cols-3 gap-4">
    {products.map(product => (
      <ProductCardNew key={product.id} product={product} />
    ))}
  </div>
);

// 3. Page: Products
export default function ProductsPage() {
  return (
    <ManagerLayoutNew>
      <ProductGridNew products={mockProducts} />
    </ManagerLayoutNew>
  );
}
```

## 🎯 Next Steps

1. **Test trang mẫu**: Truy cập `/vi/manager/revenue-new` để xem demo
2. **Chuyển đổi từng trang**: Bắt đầu với trang đơn giản nhất
3. **Tạo molecules tái sử dụng**: ProductCard, UserCard, OrderCard, etc.
4. **Thêm animations**: Sử dụng Framer Motion hoặc Tailwind animations
5. **Dark mode**: Shadcn hỗ trợ dark mode sẵn

## 💡 Tips & Tricks

1. **Copy-paste từ Shadcn docs** - Shadcn có nhiều examples sẵn
2. **Sử dụng cn() utility** - Để merge Tailwind classes
3. **Lucide icons** - Thư viện icons đẹp và nhẹ
4. **Variants API** - Sử dụng class-variance-authority cho variants
5. **Responsive design** - Shadcn components responsive sẵn

---

✅ **Build thành công!** Bạn có thể bắt đầu sử dụng Shadcn UI ngay bây giờ.

Demo page: `/vi/manager/revenue-new` hoặc `/en/manager/revenue-new`
