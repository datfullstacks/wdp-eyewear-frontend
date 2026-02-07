# Migration Plan: Manager Pages to Shadcn UI

## 📊 Trạng thái hiện tại

### Pages đã tạo với Shadcn UI:
- ✅ `/manager/revenue-new` - Demo page hoàn chỉnh

### Pages cần chuyển đổi:
- ⏳ `/manager/products` - Quản lý sản phẩm
- ⏳ `/manager/pricing` - Quản lý giá
- ⏳ `/manager/users` - Quản lý người dùng  
- ⏳ `/manager/policies` - Quản lý chính sách
- ⏳ `/manager/revenue` - Trang revenue cũ

## 🎯 Chiến lược Migration

### Phase 1: Setup & Demo (✅ Hoàn thành)
- [x] Cài đặt Shadcn UI
- [x] Tạo ManagerLayoutNew
- [x] Tạo ManagerSidebarNew  
- [x] Tạo ManagerHeaderNew
- [x] Tạo StatCardNew
- [x] Tạo demo page: revenue-new

### Phase 2: Migrate Core Components
```bash
# Thay thế các trang hiện tại
1. Products Page
2. Users Page
3. Pricing Page
4. Policies Page
5. Revenue Page (replace old)
```

### Phase 3: Polish & Optimize
- [ ] Add animations
- [ ] Optimize performance
- [ ] Add error boundaries
- [ ] Add loading states
- [ ] Add empty states

## 📝 Chi tiết Migration cho từng trang

### 1. Products Page

**File**: `app/[locale]/(manager)/manager/products/page.tsx`

**Components cần:**
```bash
npx shadcn@latest add dialog checkbox
```

**Thay đổi:**
```tsx
// OLD
- Custom Card với gradient
- Custom Button với animations
- Custom Table

// NEW
+ Shadcn Card - clean white
+ Shadcn Button - variants
+ Shadcn Table - accessible
+ Shadcn Dialog - for edit/delete
+ Shadcn Checkbox - for select
+ Lucide icons
```

**Code mẫu:**
```tsx
import { ManagerLayoutNew } from '@/components/templates/ManagerLayoutNew';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Package, Plus, Edit, Trash } from 'lucide-react';

export default function ProductsPage() {
  return (
    <ManagerLayoutNew>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Products</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>All Products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              {/* Table content */}
            </Table>
          </CardContent>
        </Card>
      </div>
    </ManagerLayoutNew>
  );
}
```

---

### 2. Users Page

**File**: `app/[locale]/(manager)/manager/users/page.tsx`

**Components cần:**
```bash
npx shadcn@latest add avatar switch
```

**Thay đổi:**
```tsx
// OLD
- Custom role cards với gradient
- Custom user table
- Inline edit

// NEW
+ Shadcn Avatar - user photos
+ Shadcn Badge - roles
+ Shadcn Switch - toggle active/inactive
+ Shadcn Table - user list
```

**Code mẫu:**
```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';

<TableRow>
  <TableCell>
    <div className="flex items-center gap-3">
      <Avatar>
        <AvatarImage src={user.avatar} />
        <AvatarFallback>{user.initials}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium">{user.name}</p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
      </div>
    </div>
  </TableCell>
  <TableCell>
    <Badge>{user.role}</Badge>
  </TableCell>
  <TableCell>
    <Switch checked={user.isActive} />
  </TableCell>
</TableRow>
```

---

### 3. Pricing Page

**File**: `app/[locale]/(manager)/manager/pricing/page.tsx`

**Components cần:**
```bash
npx shadcn@latest add form select
```

**Thay đổi:**
```tsx
// OLD
- Custom pricing cards
- Custom input fields
- Gradient backgrounds

// NEW
+ Shadcn Card - pricing tiers
+ Shadcn Form - edit pricing
+ Shadcn Select - currency selector
+ Shadcn Input - price fields
```

---

### 4. Policies Page

**File**: `app/[locale]/(manager)/manager/policies/page.tsx`

**Components cần:**
```bash
npx shadcn@latest add textarea accordion
```

**Thay đổi:**
```tsx
// OLD
- Custom policy cards
- Expandable sections

// NEW
+ Shadcn Accordion - policy sections
+ Shadcn Textarea - edit content
+ Shadcn Button - save/cancel
```

**Code mẫu:**
```tsx
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

<Accordion type="single" collapsible>
  <AccordionItem value="privacy">
    <AccordionTrigger>Privacy Policy</AccordionTrigger>
    <AccordionContent>
      {/* Policy content */}
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="terms">
    <AccordionTrigger>Terms of Service</AccordionTrigger>
    <AccordionContent>
      {/* Terms content */}
    </AccordionContent>
  </AccordionItem>
</Accordion>
```

---

## 🔧 Component Mapping

### Atoms Level
| Old Component | Shadcn UI Component | Package |
|--------------|-------------------|---------|
| Button | button | ✅ Installed |
| Input | input | ✅ Installed |
| Card | card | ✅ Installed |
| Badge | badge | ✅ Installed |
| Select | select | ⏳ Need install |
| Textarea | textarea | ⏳ Need install |

### Molecules Level
| Old Component | New Component | Status |
|--------------|--------------|---------|
| StatCard | StatCardNew | ✅ Created |
| ProductCard | ProductCardNew | ⏳ To create |
| UserCard | UserCardNew | ⏳ To create |
| PricingCard | PricingCardNew | ⏳ To create |

### Organisms Level
| Old Component | New Component | Status |
|--------------|--------------|---------|
| ManagerSidebar | ManagerSidebarNew | ✅ Created |
| ManagerHeader | ManagerHeaderNew | ✅ Created |
| ProductList | ProductListNew | ⏳ To create |
| UserTable | UserTableNew | ⏳ To create |

### Templates Level
| Old Template | New Template | Status |
|-------------|-------------|---------|
| ManagerLayout | ManagerLayoutNew | ✅ Created |

## 📦 Additional Components to Install

```bash
# Form components
npx shadcn@latest add form select checkbox radio-group switch

# Navigation
npx shadcn@latest add tabs navigation-menu

# Feedback
npx shadcn@latest add toast alert dialog

# Data display
npx shadcn@latest add accordion calendar chart

# Layout
npx shadcn@latest add aspect-ratio scroll-area resizable
```

## 🎨 Design System

### Colors
```tsx
// Primary actions
<Button variant="default">Primary Action</Button>

// Secondary actions  
<Button variant="secondary">Secondary</Button>

// Destructive actions
<Button variant="destructive">Delete</Button>

// Ghost buttons
<Button variant="ghost">Cancel</Button>

// Outline buttons
<Button variant="outline">More Info</Button>
```

### Status Badges
```tsx
// Success
<Badge variant="default">Active</Badge>

// Warning
<Badge variant="secondary">Pending</Badge>

// Error
<Badge variant="destructive">Inactive</Badge>

// Neutral
<Badge variant="outline">Draft</Badge>
```

### Typography
```tsx
// Page title
<h1 className="text-3xl font-bold tracking-tight">Page Title</h1>

// Section title
<h2 className="text-2xl font-semibold">Section Title</h2>

// Card title
<CardTitle className="text-lg font-medium">Card Title</CardTitle>

// Muted text
<p className="text-sm text-muted-foreground">Helper text</p>
```

## 🚀 Implementation Steps

### Step 1: Install additional components
```bash
npx shadcn@latest add dialog checkbox select form accordion
```

### Step 2: Create reusable molecules
```tsx
// src/components/molecules/ProductCardNew.tsx
// src/components/molecules/UserCardNew.tsx
// src/components/molecules/PricingCardNew.tsx
```

### Step 3: Migrate pages one by one
1. Copy old page to backup
2. Replace imports
3. Update component usage
4. Test functionality
5. Fix styling
6. Commit changes

### Step 4: Cleanup
- Remove old components after migration
- Update documentation
- Remove unused dependencies

## ✅ Testing Checklist

Cho mỗi page sau khi migrate:

- [ ] Layout hiển thị đúng
- [ ] Sidebar hoạt động
- [ ] Header hoạt động
- [ ] Buttons có hover states
- [ ] Forms validate đúng
- [ ] Tables sortable/filterable
- [ ] Responsive trên mobile
- [ ] Dark mode (nếu có)
- [ ] i18n hoạt động
- [ ] No TypeScript errors
- [ ] No console warnings

## 📱 Responsive Design

Shadcn components responsive sẵn:

```tsx
// Grid layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// Flex layout  
<div className="flex flex-col md:flex-row gap-4">

// Hidden on mobile
<div className="hidden md:block">

// Show only on mobile
<div className="block md:hidden">
```

## 🎯 Success Metrics

- ✅ Build thành công không errors
- ✅ TypeScript types đầy đủ
- ✅ Performance không giảm
- ✅ Accessibility score cao
- ✅ Code dễ maintain hơn
- ✅ Design nhất quán hơn

## 📞 Support

Nếu gặp vấn đề:
1. Check Shadcn docs: https://ui.shadcn.com/
2. Check component examples
3. Review SHADCN_INTEGRATION_GUIDE.md
4. Ask team for help

---

**Last Updated**: 2026-01-30
**Status**: Phase 1 Complete, Ready for Phase 2
