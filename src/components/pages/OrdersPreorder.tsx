'use client';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { Badge } from '@/components/ui/badge';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StatCard } from '@/components/molecules/StatCard';

import {
  Search,
  Filter,
  Eye,
  Package,
  Clock,
  AlertTriangle,
  CheckCircle,
  Truck,
  Calendar,
  User,
  Phone,
  MapPin,
  Link2,
  MessageSquare,
  XCircle,
  MoreHorizontal,
} from 'lucide-react';
import { Card, CardContent, Input } from '@/components/atoms';
import { Header } from '@/components/organisms/Header';

interface PreorderOrder {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  orderDate: string;
  expectedDate: string;
  products: {
    sku: string;
    name: string;
    variant: string;
    quantity: number;
    batchCode: string | null;
    batchExpectedDate: string | null;
    status: 'waiting' | 'in_transit' | 'arrived' | 'partial';
  }[];
  totalAmount: number;
  paymentStatus: 'paid' | 'partial' | 'pending' | 'cod';
  depositAmount: number;
  status: 'waiting_stock' | 'partial_stock' | 'ready' | 'cancelled';
  notes: string;
  priority: 'normal' | 'high' | 'urgent';
}

const mockPreorderOrders: PreorderOrder[] = [
  {
    id: '1',
    orderCode: 'PRE-2024-001',
    customerName: 'Nguyễn Văn An',
    customerPhone: '0901234567',
    customerAddress: '123 Nguyễn Huệ, Q.1, TP.HCM',
    orderDate: '2024-01-10',
    expectedDate: '2024-01-25',
    products: [
      {
        sku: 'FR-RAY-001',
        name: 'Ray-Ban Aviator',
        variant: 'Gold / Green',
        quantity: 1,
        batchCode: 'BATCH-2024-001',
        batchExpectedDate: '2024-01-20',
        status: 'in_transit',
      },
    ],
    totalAmount: 4500000,
    paymentStatus: 'partial',
    depositAmount: 2000000,
    status: 'waiting_stock',
    notes: 'Khách cần gấp cho sinh nhật',
    priority: 'high',
  },
  {
    id: '2',
    orderCode: 'PRE-2024-002',
    customerName: 'Trần Thị Bình',
    customerPhone: '0912345678',
    customerAddress: '456 Lê Lợi, Q.3, TP.HCM',
    orderDate: '2024-01-08',
    expectedDate: '2024-01-22',
    products: [
      {
        sku: 'FR-OAK-002',
        name: 'Oakley Holbrook',
        variant: 'Matte Black',
        quantity: 1,
        batchCode: 'BATCH-2024-002',
        batchExpectedDate: '2024-01-18',
        status: 'arrived',
      },
      {
        sku: 'LENS-POL-001',
        name: 'Tròng phân cực',
        variant: 'Gray',
        quantity: 2,
        batchCode: null,
        batchExpectedDate: null,
        status: 'waiting',
      },
    ],
    totalAmount: 6200000,
    paymentStatus: 'paid',
    depositAmount: 6200000,
    status: 'partial_stock',
    notes: '',
    priority: 'normal',
  },
  {
    id: '3',
    orderCode: 'PRE-2024-003',
    customerName: 'Lê Minh Cường',
    customerPhone: '0923456789',
    customerAddress: '789 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',
    orderDate: '2024-01-05',
    expectedDate: '2024-01-15',
    products: [
      {
        sku: 'FR-GUC-001',
        name: 'Gucci GG0036S',
        variant: 'Black / Gold',
        quantity: 1,
        batchCode: 'BATCH-2024-001',
        batchExpectedDate: '2024-01-20',
        status: 'in_transit',
      },
    ],
    totalAmount: 12500000,
    paymentStatus: 'partial',
    depositAmount: 5000000,
    status: 'waiting_stock',
    notes: 'VIP - Khách quen',
    priority: 'urgent',
  },
  {
    id: '4',
    orderCode: 'PRE-2024-004',
    customerName: 'Phạm Thị Dung',
    customerPhone: '0934567890',
    customerAddress: '321 Cách Mạng Tháng 8, Q.10, TP.HCM',
    orderDate: '2024-01-12',
    expectedDate: '2024-01-28',
    products: [
      {
        sku: 'FR-TOM-001',
        name: 'Tom Ford FT0237',
        variant: 'Havana',
        quantity: 1,
        batchCode: 'BATCH-2024-003',
        batchExpectedDate: '2024-01-25',
        status: 'waiting',
      },
    ],
    totalAmount: 8900000,
    paymentStatus: 'pending',
    depositAmount: 0,
    status: 'waiting_stock',
    notes: '',
    priority: 'normal',
  },
  {
    id: '5',
    orderCode: 'PRE-2024-005',
    customerName: 'Hoàng Văn Em',
    customerPhone: '0945678901',
    customerAddress: '654 Võ Văn Tần, Q.3, TP.HCM',
    orderDate: '2024-01-11',
    expectedDate: '2024-01-20',
    products: [
      {
        sku: 'FR-PER-001',
        name: 'Persol PO3019S',
        variant: 'Tortoise',
        quantity: 1,
        batchCode: 'BATCH-2024-002',
        batchExpectedDate: '2024-01-18',
        status: 'arrived',
      },
      {
        sku: 'LENS-CR-001',
        name: 'Tròng cận CR39',
        variant: '1.56 Index',
        quantity: 2,
        batchCode: 'BATCH-2024-002',
        batchExpectedDate: '2024-01-18',
        status: 'arrived',
      },
    ],
    totalAmount: 5800000,
    paymentStatus: 'paid',
    depositAmount: 5800000,
    status: 'ready',
    notes: 'Đã đủ hàng, chờ liên hệ khách',
    priority: 'high',
  },
];

const OrdersPreorder = () => {
  const [orders, setOrders] = useState<PreorderOrder[]>(mockPreorderOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  // const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  // const [showFilters, setShowFilters] = useState(false);
  const [detailOrder, setDetailOrder] = useState<PreorderOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLinkBatchOpen, setIsLinkBatchOpen] = useState(false);
  const [linkBatchOrder, setLinkBatchOrder] = useState<PreorderOrder | null>(
    null
  );
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactOrder, setContactOrder] = useState<PreorderOrder | null>(null);
  const [contactNote, setContactNote] = useState('');
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelOrder, setCancelOrder] = useState<PreorderOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || order.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: orders.length,
    waitingStock: orders.filter((o) => o.status === 'waiting_stock').length,
    partialStock: orders.filter((o) => o.status === 'partial_stock').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    urgent: orders.filter((o) => o.priority === 'urgent').length,
  };

  // const handleSelectOrder = (orderId: string) => {
  //   setSelectedOrders((prev) =>
  //     prev.includes(orderId)
  //       ? prev.filter((id) => id !== orderId)
  //       : [...prev, orderId]
  //   );
  // };

  // const handleSelectAll = () => {
  //   if (selectedOrders.length === filteredOrders.length) {
  //     setSelectedOrders([]);
  //   } else {
  //     setSelectedOrders(filteredOrders.map((o) => o.id));
  //   }
  // };

  const handleViewDetail = (order: PreorderOrder) => {
    setDetailOrder(order);
    setIsDetailOpen(true);
  };

  const handleLinkBatch = (order: PreorderOrder) => {
    setLinkBatchOrder(order);
    setIsLinkBatchOpen(true);
  };

  const handleContact = (order: PreorderOrder) => {
    setContactOrder(order);
    setContactNote('');
    setIsContactOpen(true);
  };

  const handleSaveContact = () => {};

  const handleCancelOrder = (order: PreorderOrder) => {
    setCancelOrder(order);
    setCancelReason('');
    setIsCancelOpen(true);
  };

  const handleConfirmCancel = () => {
    if (cancelOrder && cancelReason.trim()) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === cancelOrder.id ? { ...o, status: 'cancelled' as const } : o
        )
      );

      setIsCancelOpen(false);
    }
  };

  // const handleProcessReady = (order: PreorderOrder) => {};

  const getStatusBadge = (status: PreorderOrder['status']) => {
    switch (status) {
      case 'waiting_stock':
        return (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            Chờ hàng
          </Badge>
        );
      case 'partial_stock':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            Đủ một phần
          </Badge>
        );
      case 'ready':
        return (
          <Badge
            variant="secondary"
            className="bg-emerald-100 text-emerald-700"
          >
            Sẵn sàng
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-700">
            Đã hủy
          </Badge>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: PreorderOrder['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Gấp</Badge>;
      case 'high':
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            Ưu tiên
          </Badge>
        );
      default:
        return null;
    }
  };

  const getProductStatusBadge = (
    status: PreorderOrder['products'][0]['status']
  ) => {
    switch (status) {
      case 'waiting':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Chờ hàng
          </Badge>
        );
      case 'in_transit':
        return (
          <Badge variant="outline" className="border-blue-300 text-blue-600">
            Đang về
          </Badge>
        );
      case 'arrived':
        return (
          <Badge
            variant="outline"
            className="border-emerald-300 text-emerald-600"
          >
            Đã về
          </Badge>
        );
      case 'partial':
        return (
          <Badge variant="outline" className="border-amber-300 text-amber-600">
            Một phần
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const isOverdue = (expectedDate: string) => {
    return new Date(expectedDate) < new Date();
  };

  return (
    <>
      <Header
        title=" Đơn Pre-order"
        subtitle=" Quản lý đơn hàng đặt trước chờ hàng về"
      />
      <div className="space-y-6 p-6 text-black">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <StatCard
            title="Tổng đơn"
            value={stats.total.toString()}
            icon={Package}
            iconColor="text-primary"
            showIcon={false}
            inline
            titleClassName="text-xs"
            valueClassName="text-xl"
            className="bg-transparent p-3 shadow-none ring-0"
          />
          <StatCard
            title="Chờ hàng"
            value={stats.waitingStock.toString()}
            icon={Clock}
            iconColor="text-amber-500"
            showIcon={false}
            inline
            titleClassName="text-xs"
            valueClassName="text-xl"
            className="bg-transparent p-3 shadow-none ring-0"
          />
          <StatCard
            title="Đủ một phần"
            value={stats.partialStock.toString()}
            icon={Package}
            iconColor="text-blue-500"
            showIcon={false}
            inline
            titleClassName="text-xs"
            valueClassName="text-xl"
            className="bg-transparent p-3 shadow-none ring-0"
          />
          <StatCard
            title="Sẵn sàng"
            value={stats.ready.toString()}
            icon={CheckCircle}
            iconColor="text-emerald-500"
            showIcon={false}
            inline
            titleClassName="text-xs"
            valueClassName="text-xl"
            className="bg-transparent p-3 shadow-none ring-0"
          />
          <StatCard
            title="Cần gấp"
            value={stats.urgent.toString()}
            icon={AlertTriangle}
            iconColor="text-red-500"
            showIcon={false}
            inline
            titleClassName="text-xs"
            valueClassName="text-xl"
            className="bg-transparent p-3 shadow-none ring-0"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Tìm theo mã đơn, tên khách, SĐT..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="waiting_stock">Chờ hàng</SelectItem>
              <SelectItem value="partial_stock">Đủ một phần</SelectItem>
              <SelectItem value="ready">Sẵn sàng</SelectItem>
              <SelectItem value="cancelled">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Độ ưu tiên" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="urgent">Gấp</SelectItem>
              <SelectItem value="high">Ưu tiên</SelectItem>
              <SelectItem value="normal">Bình thường</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Ngày dự kiến</TableHead>
                  <TableHead>Thanh toán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className={
                      order.priority === 'urgent'
                        ? 'bg-red-50/50'
                        : order.priority === 'high'
                          ? 'bg-amber-50/50'
                          : ''
                    }
                  >
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{order.orderCode}</span>
                        <span className="text-muted-foreground text-xs">
                          {formatDate(order.orderDate)}
                        </span>
                        {getPriorityBadge(order.priority)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {order.customerName}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          {order.customerPhone}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {order.products.slice(0, 2).map((product, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-sm">{product.name}</span>
                            {getProductStatusBadge(product.status)}
                          </div>
                        ))}
                        {order.products.length > 2 && (
                          <span className="text-muted-foreground text-xs">
                            +{order.products.length - 2} sản phẩm khác
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="text-muted-foreground h-4 w-4" />
                        <span
                          className={
                            isOverdue(order.expectedDate)
                              ? 'font-medium text-red-600'
                              : ''
                          }
                        >
                          {formatDate(order.expectedDate)}
                        </span>
                        {isOverdue(order.expectedDate) && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {order.paymentStatus === 'paid' && (
                          <Badge
                            variant="secondary"
                            className="bg-emerald-100 text-emerald-700"
                          >
                            Đã TT
                          </Badge>
                        )}
                        {order.paymentStatus === 'partial' && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700"
                          >
                            TT một phần
                          </Badge>
                        )}
                        {order.paymentStatus === 'pending' && (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-700"
                          >
                            Chờ TT
                          </Badge>
                        )}
                        {order.paymentStatus === 'cod' && (
                          <Badge
                            variant="secondary"
                            className="bg-gray-100 text-gray-700"
                          >
                            COD
                          </Badge>
                        )}
                        {order.depositAmount > 0 &&
                          order.depositAmount < order.totalAmount && (
                            <span className="text-muted-foreground text-xs">
                              Đặt cọc: {formatCurrency(order.depositAmount)}
                            </span>
                          )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="text-black"
                          >
                            <DropdownMenuItem
                              onClick={() => handleViewDetail(order)}
                              className="text-black"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleLinkBatch(order)}
                              className="text-black"
                            >
                              <Link2 className="mr-2 h-4 w-4" />
                              Liên kết đợt hàng
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleContact(order)}
                              className="text-black"
                            >
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Liên hệ khách hàng
                            </DropdownMenuItem>
                            {order.status === 'ready' && (
                              <>
                                <DropdownMenuSeparator />
                                {/* <DropdownMenuItem
                                  onClick={() => handleProcessReady(order)}
                                >
                                  Xử lý
                                </DropdownMenuItem> */}
                              </>
                            )}
                            {order.status !== 'cancelled' &&
                              order.status !== 'ready' && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() => handleCancelOrder(order)}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Hủy đơn
                                  </DropdownMenuItem>
                                </>
                              )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-h-[70vh] max-w-xl overflow-y-auto p-4 text-sm text-black">
            <DialogHeader>
              <DialogTitle>Chi tiết đơn Pre-order</DialogTitle>
              <DialogDescription>
                {detailOrder?.orderCode} -{' '}
                {formatDate(detailOrder?.orderDate || '')}
              </DialogDescription>
            </DialogHeader>
            {detailOrder && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="bg-muted/50 grid grid-cols-2 gap-4 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <User className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Khách hàng
                      </p>
                      <p className="font-medium">{detailOrder.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="text-muted-foreground h-4 w-4" />
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Số điện thoại
                      </p>
                      <p className="font-medium">{detailOrder.customerPhone}</p>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-start gap-2">
                    <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <div>
                      <p className="text-muted-foreground text-sm">Địa chỉ</p>
                      <p className="font-medium">
                        {detailOrder.customerAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div>
                  <h4 className="mb-3 font-medium">Sản phẩm đặt trước</h4>
                  <div className="space-y-3">
                    {detailOrder.products.map((product, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{product.name}</span>
                            {getProductStatusBadge(product.status)}
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {product.sku} - {product.variant} x
                            {product.quantity}
                          </p>
                          {product.batchCode && (
                            <div className="mt-1 flex items-center gap-2">
                              <Truck className="text-muted-foreground h-3 w-3" />
                              <span className="text-muted-foreground text-xs">
                                Lô: {product.batchCode} - Dự kiến:{' '}
                                {formatDate(product.batchExpectedDate || '')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-muted/50 flex items-center justify-between rounded-lg p-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Tổng tiền</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(detailOrder.totalAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-sm">
                      Đã thanh toán
                    </p>
                    <p className="text-lg font-medium text-emerald-600">
                      {formatCurrency(detailOrder.depositAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground text-sm">Còn lại</p>
                    <p className="text-lg font-medium text-amber-600">
                      {formatCurrency(
                        detailOrder.totalAmount - detailOrder.depositAmount
                      )}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {detailOrder.notes && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-medium text-amber-800">
                      Ghi chú:
                    </p>
                    <p className="text-sm text-amber-700">
                      {detailOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Đóng
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Link Batch Modal */}
        <Dialog open={isLinkBatchOpen} onOpenChange={setIsLinkBatchOpen}>
          <DialogContent className="text-black">
            <DialogHeader>
              <DialogTitle>Liên kết đợt hàng</DialogTitle>
              <DialogDescription>
                Liên kết sản phẩm trong đơn {linkBatchOrder?.orderCode} với đợt
                hàng Pre-order
              </DialogDescription>
            </DialogHeader>
            {linkBatchOrder && (
              <div className="space-y-4">
                {linkBatchOrder.products.map((product, idx) => (
                  <div key={idx} className="space-y-3 rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-muted-foreground text-sm">
                          {product.variant}
                        </p>
                      </div>
                      {getProductStatusBadge(product.status)}
                    </div>
                    <Select defaultValue={product.batchCode || ''}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn đợt hàng" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BATCH-2024-001">
                          BATCH-2024-001 (20/01/2024)
                        </SelectItem>
                        <SelectItem value="BATCH-2024-002">
                          BATCH-2024-002 (18/01/2024)
                        </SelectItem>
                        <SelectItem value="BATCH-2024-003">
                          BATCH-2024-003 (25/01/2024)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsLinkBatchOpen(false)}
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  setIsLinkBatchOpen(false);
                }}
              >
                Lưu liên kết
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Contact Modal */}
        <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
          <DialogContent className="text-black">
            <DialogHeader>
              <DialogTitle>Liên hệ khách hàng</DialogTitle>
              <DialogDescription>
                Ghi chú liên hệ cho đơn {contactOrder?.orderCode}
              </DialogDescription>
            </DialogHeader>
            {contactOrder && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="font-medium">{contactOrder.customerName}</p>
                  <p className="text-muted-foreground text-sm">
                    {contactOrder.customerPhone}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ghi chú liên hệ</label>
                  <Textarea
                    placeholder="Nhập nội dung đã trao đổi với khách..."
                    value={contactNote}
                    onChange={(e) => setContactNote(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsContactOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSaveContact}>Lưu ghi chú</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Modal */}
        <Dialog open={isCancelOpen} onOpenChange={setIsCancelOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Hủy đơn Pre-order</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn hủy đơn {cancelOrder?.orderCode}?
              </DialogDescription>
            </DialogHeader>
            {cancelOrder && (
              <div className="space-y-4">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">
                    <strong>Lưu ý:</strong> Đơn hàng sau khi hủy sẽ không thể
                    khôi phục.
                    {cancelOrder.depositAmount > 0 && (
                      <span>
                        {' '}
                        Khách đã đặt cọc{' '}
                        {formatCurrency(cancelOrder.depositAmount)}.
                      </span>
                    )}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Lý do hủy <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="Nhập lý do hủy đơn..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCancelOpen(false)}>
                Quay lại
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmCancel}
                disabled={!cancelReason.trim()}
              >
                Xác nhận hủy
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default OrdersPreorder;
