import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Avatar } from '@/components/atoms/Avatar';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  Eye,
  CreditCard,
  Package,
} from 'lucide-react';
import { Button, Input } from '@/components/atoms';

export interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  lastVisit: string;
  status: 'active' | 'inactive';
  address?: string;
  notes?: string;
}

interface CustomerDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerData | null;
}

export const CustomerDetailModal = ({
  open,
  onOpenChange,
  customer,
}: CustomerDetailModalProps) => {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Chi tiết khách hàng</DialogTitle>
          <DialogDescription>
            Thông tin chi tiết về khách hàng
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Thông tin</TabsTrigger>
            <TabsTrigger value="prescription">Prescription</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4 space-y-4">
            <div className="bg-muted/50 flex items-center gap-4 rounded-lg p-4">
              <Avatar name={customer.name} size="lg" />
              <div>
                <h3 className="text-lg font-semibold">{customer.name}</h3>
                <StatusBadge
                  status={customer.status === 'active' ? 'success' : 'default'}
                >
                  {customer.status === 'active'
                    ? 'Hoạt động'
                    : 'Không hoạt động'}
                </StatusBadge>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="text-muted-foreground h-4 w-4" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="text-muted-foreground h-4 w-4" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="text-muted-foreground h-4 w-4" />
                <span>{customer.address || 'Chưa cập nhật địa chỉ'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="text-muted-foreground h-4 w-4" />
                <span>Lần cuối ghé: {customer.lastVisit}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t pt-4">
              <div className="bg-accent/10 rounded-lg p-3 text-center">
                <ShoppingBag className="text-accent mx-auto mb-1 h-5 w-5" />
                <p className="text-lg font-semibold">{customer.totalOrders}</p>
                <p className="text-muted-foreground text-xs">Đơn hàng</p>
              </div>
              <div className="bg-accent/10 rounded-lg p-3 text-center">
                <CreditCard className="text-accent mx-auto mb-1 h-5 w-5" />
                <p className="text-lg font-semibold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    notation: 'compact',
                  }).format(customer.totalSpent)}
                </p>
                <p className="text-muted-foreground text-xs">Tổng chi tiêu</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="prescription" className="mt-4">
            <div className="text-muted-foreground bg-muted/30 rounded-lg p-6 text-center">
              <Eye className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>Chưa có thông tin prescription</p>
              <Button variant="outline" size="sm" className="mt-3">
                Thêm Prescription
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface CustomerEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerData | null;
  onSave: (customer: CustomerData) => void;
}

export const CustomerEditModal = ({
  open,
  onOpenChange,
  customer,
  onSave,
}: CustomerEditModalProps) => {
  const [formData, setFormData] = useState<CustomerData | null>(customer);

  if (!customer || !formData) return null;

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa khách hàng</DialogTitle>
          <DialogDescription>Cập nhật thông tin khách hàng</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Họ và tên</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Số điện thoại</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              value={formData.address || ''}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Nhập địa chỉ"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Trạng thái</Label>
            <select
              id="status"
              className="border-input bg-background flex h-10 w-full rounded-md border px-3 py-2 text-sm"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'active' | 'inactive',
                })
              }
            >
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave} className="gradient-gold text-primary">
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface CustomerDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerData | null;
  onConfirm: () => void;
}

export const CustomerDeleteDialog = ({
  open,
  onOpenChange,
  customer,
  onConfirm,
}: CustomerDeleteDialogProps) => {
  if (!customer) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa khách hàng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa khách hàng{' '}
            <strong>{customer.name}</strong>? Hành động này không thể hoàn tác
            và sẽ xóa tất cả dữ liệu liên quan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Hủy</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Xóa khách hàng
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

interface OrderHistoryItem {
  id: string;
  date: string;
  items: string;
  total: number;
  status: 'completed' | 'pending' | 'cancelled';
}

interface CustomerOrderHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerData | null;
}

const mockOrderHistory: OrderHistoryItem[] = [
  {
    id: 'ORD-001',
    date: '2024-01-15',
    items: 'Gọng Rayban Aviator + Tròng cận 1.67',
    total: 4500000,
    status: 'completed',
  },
  {
    id: 'ORD-002',
    date: '2024-02-20',
    items: 'Kính râm Gucci GG0516S',
    total: 8900000,
    status: 'completed',
  },
  {
    id: 'ORD-003',
    date: '2024-03-10',
    items: 'Gọng Titan + Tròng đổi màu',
    total: 6200000,
    status: 'pending',
  },
];

export const CustomerOrderHistoryModal = ({
  open,
  onOpenChange,
  customer,
}: CustomerOrderHistoryModalProps) => {
  if (!customer) return null;

  const getStatusBadge = (status: OrderHistoryItem['status']) => {
    switch (status) {
      case 'completed':
        return <StatusBadge status="success">Hoàn thành</StatusBadge>;
      case 'pending':
        return <StatusBadge status="warning">Đang xử lý</StatusBadge>;
      case 'cancelled':
        return <StatusBadge status="error">Đã hủy</StatusBadge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Lịch sử đơn hàng</DialogTitle>
          <DialogDescription>
            Lịch sử mua hàng của {customer.name}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3">
            {mockOrderHistory.length > 0 ? (
              mockOrderHistory.map((order) => (
                <div
                  key={order.id}
                  className="bg-muted/30 border-border flex items-center gap-4 rounded-lg border p-4"
                >
                  <div className="bg-accent/10 rounded-lg p-2">
                    <Package className="text-accent h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-muted-foreground mt-1 truncate text-sm">
                      {order.items}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {new Date(order.date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-accent font-semibold">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(order.total)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-muted-foreground p-6 text-center">
                <ShoppingBag className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>Chưa có đơn hàng nào</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
