'use client';
import { useState } from 'react';

import { Header } from '@/components/organisms/Header';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/atoms/StatusBadge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  CreditCard,
  Banknote,
  Clock,
  AlertCircle,
  MoreHorizontal,
  DollarSign,
  TrendingDown,
  FileText,
  Phone,
} from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/atoms';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type RefundStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected';
type RefundMethod = 'bank_transfer' | 'card' | 'cash' | 'wallet';

interface RefundRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  reason: string;
  method: RefundMethod;
  status: RefundStatus;
  createdAt: string;
  processedAt?: string;
  bankInfo?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  notes?: string;
}

const mockRefunds: RefundRequest[] = [
  {
    id: 'RF001',
    orderId: 'ORD-2024-001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    amount: 2500000,
    reason: 'Sản phẩm lỗi, không thể sử dụng',
    method: 'bank_transfer',
    status: 'pending',
    createdAt: '2024-01-15 09:30',
    bankInfo: {
      bankName: 'Vietcombank',
      accountNumber: '1234567890',
      accountHolder: 'NGUYEN VAN A',
    },
  },
  {
    id: 'RF002',
    orderId: 'ORD-2024-002',
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    amount: 1800000,
    reason: 'Đổi ý không muốn mua',
    method: 'card',
    status: 'reviewing',
    createdAt: '2024-01-14 14:20',
  },
  {
    id: 'RF003',
    orderId: 'ORD-2024-003',
    customerName: 'Lê Văn C',
    customerPhone: '0923456789',
    amount: 3200000,
    reason: 'Giao sai sản phẩm',
    method: 'bank_transfer',
    status: 'approved',
    createdAt: '2024-01-13 11:45',
    bankInfo: {
      bankName: 'Techcombank',
      accountNumber: '9876543210',
      accountHolder: 'LE VAN C',
    },
  },
  {
    id: 'RF004',
    orderId: 'ORD-2024-004',
    customerName: 'Phạm Thị D',
    customerPhone: '0934567890',
    amount: 950000,
    reason: 'Sản phẩm không đúng mô tả',
    method: 'wallet',
    status: 'processing',
    createdAt: '2024-01-12 16:00',
  },
  {
    id: 'RF005',
    orderId: 'ORD-2024-005',
    customerName: 'Hoàng Văn E',
    customerPhone: '0945678901',
    amount: 4500000,
    reason: 'Hủy đơn trước khi giao',
    method: 'bank_transfer',
    status: 'completed',
    createdAt: '2024-01-10 08:15',
    processedAt: '2024-01-11 10:30',
    bankInfo: {
      bankName: 'BIDV',
      accountNumber: '5555666677',
      accountHolder: 'HOANG VAN E',
    },
  },
  {
    id: 'RF006',
    orderId: 'ORD-2024-006',
    customerName: 'Vũ Thị F',
    customerPhone: '0956789012',
    amount: 1200000,
    reason: 'Yêu cầu hoàn tiền không hợp lệ',
    method: 'cash',
    status: 'rejected',
    createdAt: '2024-01-09 13:40',
    notes: 'Sản phẩm đã qua sử dụng, không đủ điều kiện hoàn tiền',
  },
];

const statusConfig: Record<
  RefundStatus,
  { label: string; type: 'success' | 'warning' | 'error' | 'info' | 'default' }
> = {
  pending: { label: 'Chờ xử lý', type: 'warning' },
  reviewing: { label: 'Đang xem xét', type: 'info' },
  approved: { label: 'Đã duyệt', type: 'success' },
  processing: { label: 'Đang hoàn tiền', type: 'info' },
  completed: { label: 'Hoàn thành', type: 'success' },
  rejected: { label: 'Từ chối', type: 'error' },
};

const methodConfig: Record<
  RefundMethod,
  { label: string; icon: typeof CreditCard }
> = {
  bank_transfer: { label: 'Chuyển khoản', icon: Banknote },
  card: { label: 'Thẻ tín dụng', icon: CreditCard },
  cash: { label: 'Tiền mặt', icon: DollarSign },
  wallet: { label: 'Ví điện tử', icon: CreditCard },
};

const Refunds = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processNote, setProcessNote] = useState('');

  const filteredRefunds = mockRefunds.filter((refund) => {
    const matchesSearch =
      refund.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customerPhone.includes(searchTerm);
    const matchesStatus =
      statusFilter === 'all' || refund.status === statusFilter;
    const matchesMethod =
      methodFilter === 'all' || refund.method === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const stats = {
    pending: mockRefunds.filter((r) => r.status === 'pending').length,
    reviewing: mockRefunds.filter((r) => r.status === 'reviewing').length,
    processing: mockRefunds.filter(
      (r) => r.status === 'processing' || r.status === 'approved'
    ).length,
    completed: mockRefunds.filter((r) => r.status === 'completed').length,
    totalAmount: mockRefunds
      .filter(
        (r) =>
          r.status === 'pending' ||
          r.status === 'reviewing' ||
          r.status === 'approved' ||
          r.status === 'processing'
      )
      .reduce((sum, r) => sum + r.amount, 0),
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const openDetail = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setIsDetailOpen(true);
  };

  const openApprove = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setIsApproveOpen(true);
  };

  const openReject = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setRejectReason('');
    setIsRejectOpen(true);
  };

  const openProcess = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setProcessNote('');
    setIsProcessOpen(true);
  };

  const openContact = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setIsContactOpen(true);
  };

  return (
    <>
      <Header
        title="Quản lý Hoàn tiền"
        subtitle="Xử lý các yêu cầu hoàn tiền từ khách hàng"
        titleClassName="text-black"
        subtitleClassName="text-black"
      />

      <div className="space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-warning/10 rounded-lg p-2">
                  <Clock className="text-warning h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Chờ xử lý</p>
                  <p className="text-foreground text-2xl font-bold">
                    {stats.pending}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Eye className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Đang xem xét</p>
                  <p className="text-foreground text-2xl font-bold">
                    {stats.reviewing}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-success/10 rounded-lg p-2">
                  <CreditCard className="text-success h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Đang hoàn tiền
                  </p>
                  <p className="text-foreground text-2xl font-bold">
                    {stats.processing}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-success/10 rounded-lg p-2">
                  <CheckCircle className="text-success h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Hoàn thành</p>
                  <p className="text-foreground text-2xl font-bold">
                    {stats.completed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-destructive/10 rounded-lg p-2">
                  <TrendingDown className="text-destructive h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Tổng cần hoàn</p>
                  <p className="text-foreground text-lg font-bold">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Tìm theo mã hoàn tiền, mã đơn, tên KH, SĐT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gradient-gold h-9 w-9 p-0 text-black shadow-sm hover:opacity-90"
                title="Lọc"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px] p-2">
              <div className="space-y-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="reviewing">Đang xem xét</SelectItem>
                    <SelectItem value="approved">Đã duyệt</SelectItem>
                    <SelectItem value="processing">Đang hoàn tiền</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="rejected">Từ chối</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Tất cả PT" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả PT</SelectItem>
                    <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                    <SelectItem value="card">Thẻ tín dụng</SelectItem>
                    <SelectItem value="cash">Tiền mặt</SelectItem>
                    <SelectItem value="wallet">Ví điện tử</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Refunds Table */}
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã hoàn tiền</TableHead>
                  <TableHead>Mã đơn hàng</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRefunds.map((refund) => {
                  const MethodIcon = methodConfig[refund.method].icon;
                  return (
                    <TableRow key={refund.id}>
                      <TableCell className="font-normal">{refund.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{refund.orderId}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-normal">{refund.customerName}</p>
                          <p className="text-muted-foreground text-sm">
                            {refund.customerPhone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-destructive font-semibold">
                        {formatCurrency(refund.amount)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MethodIcon className="text-muted-foreground h-4 w-4" />
                          <span>{methodConfig[refund.method].label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={statusConfig[refund.status].type}>
                          {statusConfig[refund.status].label}
                        </StatusBadge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {refund.createdAt}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 bg-transparent p-0 hover:bg-transparent"
                                title="Thao tÃ¡c"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openDetail(refund)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              {(refund.status === 'pending' ||
                                refund.status === 'reviewing') && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => openApprove(refund)}
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Duyệt yêu cầu
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openReject(refund)}
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Từ chối
                                  </DropdownMenuItem>
                                </>
                              )}
                              {refund.status === 'approved' && (
                                <DropdownMenuItem
                                  onClick={() => openProcess(refund)}
                                >
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Xử lý hoàn tiền
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => openContact(refund)}
                              >
                                <Phone className="mr-2 h-4 w-4" />
                                Liên hệ khách hàng
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-h-[70vh] max-w-xl overflow-y-auto text-black">
          <DialogHeader>
            <DialogTitle>
              Chi tiết yêu cầu hoàn tiền {selectedRefund?.id}
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về yêu cầu hoàn tiền
            </DialogDescription>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Mã đơn hàng</Label>
                  <p className="font-normal">{selectedRefund.orderId}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <div className="mt-1">
                    <StatusBadge
                      status={statusConfig[selectedRefund.status].type}
                    >
                      {statusConfig[selectedRefund.status].label}
                    </StatusBadge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Khách hàng</Label>
                  <p className="font-normal">{selectedRefund.customerName}</p>
                  <p className="text-muted-foreground text-sm">
                    {selectedRefund.customerPhone}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Số tiền hoàn</Label>
                  <p className="text-destructive text-lg font-bold">
                    {formatCurrency(selectedRefund.amount)}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Lý do hoàn tiền</Label>
                <p className="bg-muted mt-1 rounded-lg p-3">
                  {selectedRefund.reason}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">
                    Phương thức hoàn tiền
                  </Label>
                  <p className="font-normal">
                    {methodConfig[selectedRefund.method].label}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Ngày tạo yêu cầu
                  </Label>
                  <p className="font-normal">{selectedRefund.createdAt}</p>
                </div>
              </div>

              {selectedRefund.bankInfo && (
                <div className="bg-muted/50 rounded-lg p-4">
                  <Label className="text-muted-foreground">
                    Thông tin tài khoản ngân hàng
                  </Label>
                  <div className="mt-2 space-y-1">
                    <p>
                      <span className="text-muted-foreground">Ngân hàng:</span>{' '}
                      {selectedRefund.bankInfo.bankName}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Số TK:</span>{' '}
                      {selectedRefund.bankInfo.accountNumber}
                    </p>
                    <p>
                      <span className="text-muted-foreground">Chủ TK:</span>{' '}
                      {selectedRefund.bankInfo.accountHolder}
                    </p>
                  </div>
                </div>
              )}

              {selectedRefund.notes && (
                <div>
                  <Label className="text-muted-foreground">Ghi chú</Label>
                  <p className="bg-muted mt-1 rounded-lg p-3">
                    {selectedRefund.notes}
                  </p>
                </div>
              )}

              {selectedRefund.processedAt && (
                <div>
                  <Label className="text-muted-foreground">Ngày xử lý</Label>
                  <p className="font-normal">{selectedRefund.processedAt}</p>
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

      {/* Approve Modal */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle>Duyệt yêu cầu hoàn tiền</DialogTitle>
            <DialogDescription>
              Xác nhận duyệt yêu cầu hoàn tiền {selectedRefund?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-4">
              <div className="bg-success/10 border-success/20 rounded-lg border p-4">
                <div className="text-success mb-2 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-normal">Xác nhận duyệt hoàn tiền</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  Số tiền:{' '}
                  <span className="text-foreground font-bold">
                    {formatCurrency(selectedRefund.amount)}
                  </span>
                </p>
                <p className="text-muted-foreground text-sm">
                  Phương thức: {methodConfig[selectedRefund.method].label}
                </p>
              </div>
              <div>
                <Label>Ghi chú (tùy chọn)</Label>
                <Textarea
                  placeholder="Nhập ghi chú nếu có..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveOpen(false)}>
              Hủy
            </Button>
            <Button
              className="bg-success hover:bg-success/90"
              onClick={() => setIsApproveOpen(false)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Duyệt yêu cầu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle>Từ chối yêu cầu hoàn tiền</DialogTitle>
            <DialogDescription>
              Từ chối yêu cầu hoàn tiền {selectedRefund?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-4">
              <div className="text-destructive mb-2 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-normal">Xác nhận từ chối hoàn tiền</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Số tiền:{' '}
                {selectedRefund && formatCurrency(selectedRefund.amount)}
              </p>
            </div>
            <div>
              <Label>Lý do từ chối *</Label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn lý do từ chối" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expired">
                    Quá thời hạn hoàn tiền
                  </SelectItem>
                  <SelectItem value="used">Sản phẩm đã qua sử dụng</SelectItem>
                  <SelectItem value="damaged">
                    Sản phẩm bị hư hỏng do khách hàng
                  </SelectItem>
                  <SelectItem value="invalid">Yêu cầu không hợp lệ</SelectItem>
                  <SelectItem value="other">Lý do khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Chi tiết lý do</Label>
              <Textarea
                placeholder="Nhập chi tiết lý do từ chối..."
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsRejectOpen(false)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Modal */}
      <Dialog open={isProcessOpen} onOpenChange={setIsProcessOpen}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle>Thực hiện hoàn tiền</DialogTitle>
            <DialogDescription>
              Xử lý hoàn tiền cho yêu cầu {selectedRefund?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-4">
              <div className="bg-primary/10 border-primary/20 rounded-lg border p-4">
                <p className="mb-2 font-normal">Thông tin hoàn tiền</p>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="text-muted-foreground">Số tiền:</span>{' '}
                    <span className="font-bold">
                      {formatCurrency(selectedRefund.amount)}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Phương thức:</span>{' '}
                    {methodConfig[selectedRefund.method].label}
                  </p>
                  {selectedRefund.bankInfo && (
                    <>
                      <p>
                        <span className="text-muted-foreground">
                          Ngân hàng:
                        </span>{' '}
                        {selectedRefund.bankInfo.bankName}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Số TK:</span>{' '}
                        {selectedRefund.bankInfo.accountNumber}
                      </p>
                      <p>
                        <span className="text-muted-foreground">Chủ TK:</span>{' '}
                        {selectedRefund.bankInfo.accountHolder}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div>
                <Label>Mã giao dịch hoàn tiền</Label>
                <Input placeholder="Nhập mã giao dịch..." className="mt-1" />
              </div>
              <div>
                <Label>Ghi chú xử lý</Label>
                <Textarea
                  placeholder="Nhập ghi chú về quá trình hoàn tiền..."
                  value={processNote}
                  onChange={(e) => setProcessNote(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProcessOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => setIsProcessOpen(false)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Xác nhận đã hoàn tiền
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
              Liên hệ với khách hàng về yêu cầu hoàn tiền {selectedRefund?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedRefund && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="font-normal">{selectedRefund.customerName}</p>
                <p className="text-muted-foreground">
                  {selectedRefund.customerPhone}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-20 flex-col">
                  <Phone className="mb-2 h-5 w-5" />
                  Gọi điện
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <FileText className="mb-2 h-5 w-5" />
                  Gửi Zalo
                </Button>
              </div>
              <div>
                <Label>Ghi chú liên hệ</Label>
                <Textarea
                  placeholder="Nhập nội dung trao đổi với khách hàng..."
                  className="mt-1"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactOpen(false)}>
              Đóng
            </Button>
            <Button onClick={() => setIsContactOpen(false)}>Lưu ghi chú</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Refunds;
