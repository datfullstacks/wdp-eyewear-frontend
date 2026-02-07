'use client';

import { Header } from '@/components/organisms/Header';

// import { Badge } from '@/components/ui/badge';

// import { StatusBadge } from '@/components/atoms/StatusBadge';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Package,
  User,
  Phone,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
// import { cn } from '@/lib/utils';
import { Button, Input } from '@/components/atoms';

// Mock data for pending orders
const pendingOrders = [
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

// const priorityConfig = {
//   urgent: { label: 'Khẩn cấp', color: 'error' as const, icon: AlertTriangle },
//   high: { label: 'Cao', color: 'warning' as const, icon: Clock },
//   normal: { label: 'Bình thường', color: 'info' as const, icon: Package },
//   low: { label: 'Thấp', color: 'default' as const, icon: Package },
// };

// const paymentStatusConfig = {
//   paid: { label: 'Đã thanh toán', color: 'success' as const },
//   pending: { label: 'Chưa thanh toán', color: 'warning' as const },
//   partial: { label: 'Thanh toán một phần', color: 'info' as const },
//   cod: { label: 'COD', color: 'default' as const },
// };

const OrdersPending = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [detailModal, setDetailModal] = useState<
    (typeof pendingOrders)[0] | null
  >(null);
  const [processModal, setProcessModal] = useState<
    (typeof pendingOrders)[0] | null
  >(null);
  const [rejectModal, setRejectModal] = useState<
    (typeof pendingOrders)[0] | null
  >(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredOrders = pendingOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);
    const matchesPriority =
      priorityFilter === 'all' || order.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // const handleSelectAll = (checked: boolean) => {
  //   if (checked) {
  //     setSelectedOrders(filteredOrders.map((o) => o.id));
  //   } else {
  //     setSelectedOrders([]);
  //   }
  // };

  // const handleSelectOrder = (orderId: string, checked: boolean) => {
  //   if (checked) {
  //     setSelectedOrders([...selectedOrders, orderId]);
  //   } else {
  //     setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
  //   }
  // };

  const handleProcessOrder = () => {
    setProcessModal(null);
  };

  const handleRejectOrder = () => {
    setRejectModal(null);
    setRejectReason('');
  };

  const handleBulkProcess = () => {
    setSelectedOrders([]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const urgentCount = pendingOrders.filter(
    (o) => o.priority === 'urgent'
  ).length;
  const highCount = pendingOrders.filter((o) => o.priority === 'high').length;

  return (
    <>
      <Header title="Đơn cần xử lý" subtitle="Xác nhận và xử lý đơn hàng mới" />

      <div className="space-y-6 p-6 text-black">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="bg-card border-border rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 rounded-lg p-2">
                <Package className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Tổng đơn chờ</p>
                <p className="text-2xl font-normal">{pendingOrders.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-destructive/10 rounded-lg p-2">
                <AlertTriangle className="text-destructive h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Khẩn cấp</p>
                <p className="text-destructive text-2xl font-normal">
                  {urgentCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-warning/10 rounded-lg p-2">
                <Clock className="text-warning h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Ưu tiên cao</p>
                <p className="text-warning text-2xl font-normal">{highCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border-border rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-success/10 rounded-lg p-2">
                <CheckCircle className="text-success h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Đã chọn</p>
                <p className="text-2xl font-normal">{selectedOrders.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
              <Input
                placeholder="Tìm mã đơn, tên KH, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-[300px] pl-10"
              />
            </div>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Độ ưu tiên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="urgent">Khẩn cấp</SelectItem>
                <SelectItem value="high">Ưu tiên cao</SelectItem>
                <SelectItem value="normal">Bình thường</SelectItem>
                <SelectItem value="low">Thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedOrders.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedOrders([])}
              >
                Bỏ chọn ({selectedOrders.length})
              </Button>
              <Button size="sm" className="gap-2" onClick={handleBulkProcess}>
                <CheckCircle className="h-4 w-4" />
                Xác nhận hàng loạt
              </Button>
            </div>
          )}

          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
        </div>

        {/* Orders Table */}
        <div className="bg-card border-border overflow-hidden rounded-xl border">
          <Table className="w-full table-fixed">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[14%]">Mã đơn</TableHead>
                <TableHead className="w-[16%]">Khách hàng</TableHead>
                <TableHead className="w-[18%]">Sản phẩm</TableHead>
                <TableHead className="w-[10%]">Tổng tiền</TableHead>
                <TableHead className="w-[10%]">Thanh toán</TableHead>
                <TableHead className="w-[10%]">Độ ưu tiên</TableHead>
                <TableHead className="w-[12%]">Thời gian</TableHead>
                <TableHead className="w-[7%] text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const PriorityIcon =
                  priorityConfig[order.priority as keyof typeof priorityConfig]
                    .icon;
                return (
                  <TableRow
                    key={order.id}
                    className={cn(
                      'hover:bg-muted/30',
                      order.priority === 'urgent' && 'bg-destructive/5',
                      selectedOrders.includes(order.id) && 'bg-primary/5'
                    )}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-normal">{order.id}</span>
                        {order.hasPrescription && (
                          <Badge variant="outline" className="text-xs">
                            Rx
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-normal">{order.customer}</p>
                        <p className="text-muted-foreground text-sm">
                          {order.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <p className="truncate">{order.products[0].name}</p>
                        {order.products.length > 1 && (
                          <p className="text-muted-foreground text-sm">
                            +{order.products.length - 1} sản phẩm khác
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-normal">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center',
                          order.paymentStatus === 'paid' && 'text-success',
                          order.paymentStatus === 'pending' && 'text-warning',
                          order.paymentStatus === 'partial' && 'text-primary',
                          order.paymentStatus === 'cod' &&
                            'text-muted-foreground'
                        )}
                      >
                        {
                          paymentStatusConfig[
                            order.paymentStatus as keyof typeof paymentStatusConfig
                          ].label
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center',
                          order.priority === 'urgent' && 'text-destructive',
                          order.priority === 'high' && 'text-warning',
                          order.priority === 'normal' && 'text-primary',
                          order.priority === 'low' && 'text-muted-foreground'
                        )}
                      >
                        {
                          priorityConfig[
                            order.priority as keyof typeof priorityConfig
                          ].label
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{order.createdAt}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-success hover:text-success h-7 w-7 bg-transparent p-0 hover:bg-transparent"
                          onClick={() => setProcessModal(order)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive h-7 w-7 bg-transparent p-0 hover:bg-transparent"
                          onClick={() => setRejectModal(order)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 bg-transparent p-0 hover:bg-transparent"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setDetailModal(order)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Xem đơn thuốc
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Printer className="mr-2 h-4 w-4" />
                              In đơn hàng
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Send className="mr-2 h-4 w-4" />
                              Gửi thông báo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })} */}
            </TableBody>
          </Table>

          {filteredOrders.length === 0 && (
            <div className="p-12 text-center">
              <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
              <p className="text-muted-foreground">
                Không có đơn hàng nào cần xử lý
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
        <DialogContent className="max-h-[70vh] max-w-lg overflow-y-auto p-4 text-sm text-black">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng {detailModal?.id}</DialogTitle>
          </DialogHeader>
          {detailModal && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="bg-muted/30 space-y-3 rounded-lg p-4">
                <h4 className="flex items-center gap-2 font-normal">
                  <User className="h-4 w-4" />
                  Thông tin khách hàng
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Họ tên</p>
                    <p className="font-normal">{detailModal.customer}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Số điện thoại</p>
                    <p className="flex items-center gap-1 font-normal">
                      <Phone className="h-3 w-3" />
                      {detailModal.phone}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Địa chỉ giao hàng</p>
                    <p className="flex items-center gap-1 font-normal">
                      <MapPin className="h-3 w-3" />
                      {detailModal.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h4 className="mb-3 font-normal">Sản phẩm đặt mua</h4>
                <div className="space-y-2">
                  {detailModal.products.map((product, idx) => (
                    <div
                      key={idx}
                      className="bg-muted/30 flex items-center justify-between rounded-lg p-3"
                    >
                      <div>
                        <p className="font-normal">{product.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {product.variant}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-normal">
                          {formatCurrency(product.price)}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          x{product.qty}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              {/* <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-4">
                  <StatusBadge
                    status={
                      priorityConfig[
                        detailModal.priority as keyof typeof priorityConfig
                      ].color
                    }
                  >
                    {
                      priorityConfig[
                        detailModal.priority as keyof typeof priorityConfig
                      ].label
                    }
                  </StatusBadge>
                  <StatusBadge
                    status={
                      paymentStatusConfig[
                        detailModal.paymentStatus as keyof typeof paymentStatusConfig
                      ].color
                    }
                  >
                    {
                      paymentStatusConfig[
                        detailModal.paymentStatus as keyof typeof paymentStatusConfig
                      ].label
                    }
                  </StatusBadge>
                </div>
                <div className="text-right">
                  <p className="text-muted-foreground text-sm">Tổng cộng</p>
                  <p className="text-xl font-normal">
                    {formatCurrency(detailModal.total)}
                  </p>
                </div>
              </div> */}

              {detailModal.note && (
                <div className="bg-warning/10 border-warning/20 rounded-lg border p-3">
                  <p className="text-warning text-sm font-normal">Ghi chú:</p>
                  <p className="text-sm">{detailModal.note}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDetailModal(null)}>
                  Đóng
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDetailModal(null);
                    setRejectModal(detailModal);
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Từ chối
                </Button>
                <Button
                  onClick={() => {
                    setDetailModal(null);
                    setProcessModal(detailModal);
                  }}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Xác nhận xử lý
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Process Confirmation Modal */}
      <Dialog open={!!processModal} onOpenChange={() => setProcessModal(null)}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle>Xác nhận xử lý đơn hàng</DialogTitle>
          </DialogHeader>
          {processModal && (
            <div className="space-y-4">
              <p>
                Bạn có chắc muốn xác nhận xử lý đơn hàng{' '}
                <strong>{processModal.id}</strong>?
              </p>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="font-normal">{processModal.customer}</p>
                <p className="text-muted-foreground text-sm">
                  {processModal.products.length} sản phẩm -{' '}
                  {formatCurrency(processModal.total)}
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setProcessModal(null)}>
                  Hủy
                </Button>
                <Button onClick={handleProcessOrder}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Xác nhận
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={!!rejectModal} onOpenChange={() => setRejectModal(null)}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle>Từ chối đơn hàng</DialogTitle>
          </DialogHeader>
          {rejectModal && (
            <div className="space-y-4">
              <p>
                Từ chối đơn hàng <strong>{rejectModal.id}</strong> của khách
                hàng <strong>{rejectModal.customer}</strong>?
              </p>
              <div>
                <label className="text-sm font-normal">Lý do từ chối *</label>
                <Textarea
                  placeholder="Nhập lý do từ chối đơn hàng..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setRejectModal(null)}>
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRejectOrder}
                  disabled={!rejectReason.trim()}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Xác nhận từ chối
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OrdersPending;
