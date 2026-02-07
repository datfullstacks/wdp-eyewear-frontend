'use client';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/organisms/Header';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle,
  XCircle,
  Phone,
  RefreshCw,
  AlertTriangle,
  Clock,
  FileText,
  Camera,
  Truck,
  Filter,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/atoms';

type RequestType = 'exchange' | 'return' | 'warranty';
type RequestStatus =
  | 'pending'
  | 'reviewing'
  | 'approved'
  | 'processing'
  | 'completed'
  | 'rejected';

interface ReturnRequest {
  id: string;
  orderId: string;
  customer: string;
  phone: string;
  type: RequestType;
  status: RequestStatus;
  reason: string;
  products: {
    name: string;
    sku: string;
    quantity: number;
    price: number;
  }[];
  createdAt: string;
  totalValue: number;
  images: string[];
  notes: string;
  assignee?: string;
}

const mockRequests: ReturnRequest[] = [
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

const typeLabels: Record<RequestType, string> = {
  exchange: 'Đổi hàng',
  return: 'Trả hàng',
  warranty: 'Bảo hành',
};

const typeColors: Record<
  RequestType,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  exchange: 'secondary',
  return: 'destructive',
  warranty: 'outline',
};

const statusLabels: Record<RequestStatus, string> = {
  pending: 'Chờ xử lý',
  reviewing: 'Đang xem xét',
  approved: 'Đã duyệt',
  processing: 'Đang xử lý',
  completed: 'Hoàn thành',
  rejected: 'Từ chối',
};

const statusTypes: Record<
  RequestStatus,
  'warning' | 'info' | 'success' | 'error' | 'default'
> = {
  pending: 'warning',
  reviewing: 'info',
  approved: 'success',
  processing: 'info',
  completed: 'success',
  rejected: 'error',
};

const Returns = () => {
  const [requests] = useState<ReturnRequest[]>(mockRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [detailModal, setDetailModal] = useState<ReturnRequest | null>(null);
  const [approveModal, setApproveModal] = useState<ReturnRequest | null>(null);
  const [rejectModal, setRejectModal] = useState<ReturnRequest | null>(null);
  const [processModal, setProcessModal] = useState<ReturnRequest | null>(null);
  const [contactModal, setContactModal] = useState<ReturnRequest | null>(null);

  const [rejectReason, setRejectReason] = useState('');
  const [processAction, setProcessAction] = useState('');
  const [processNotes, setProcessNotes] = useState('');

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.phone.includes(searchTerm);
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    const matchesStatus =
      statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    pending: requests.filter((r) => r.status === 'pending').length,
    reviewing: requests.filter((r) => r.status === 'reviewing').length,
    processing: requests.filter(
      (r) => r.status === 'approved' || r.status === 'processing'
    ).length,
    completed: requests.filter((r) => r.status === 'completed').length,
  };

  //   const typeStats = {
  //     exchange: requests.filter((r) => r.type === 'exchange').length,
  //     return: requests.filter((r) => r.type === 'return').length,
  //     warranty: requests.filter((r) => r.type === 'warranty').length,
  //   };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  const handleApprove = () => {
    console.log('Approving request:', approveModal?.id);
    setApproveModal(null);
  };

  const handleReject = () => {
    console.log('Rejecting request:', rejectModal?.id, 'Reason:', rejectReason);
    setRejectModal(null);
    setRejectReason('');
  };

  const handleProcess = () => {
    console.log(
      'Processing request:',
      processModal?.id,
      'Action:',
      processAction,
      'Notes:',
      processNotes
    );
    setProcessModal(null);
    setProcessAction('');
    setProcessNotes('');
  };

  return (
    <>
      <Header
        title="Yêu cầu Đổi/Trả/Bảo hành"
        subtitle="Quản lý và xử lý các yêu cầu đổi hàng, trả hàng và bảo hành từ khách hàng"
        titleClassName="text-black"
        subtitleClassName="text-black"
      />

      <div className="space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-2 md:grid-cols-4">
          <Card className="border-l-warning border-l-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-normal">Chờ xử lý</CardTitle>
              <Clock className="text-warning h-3.5 w-3.5" />
            </CardHeader>
            <CardContent className="pt-0 pb-2.5">
              <div className="text-lg font-normal">{stats.pending}</div>
              <p className="text-muted-foreground text-[11px]">
                Yêu cầu mới cần xem xét
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-primary border-l-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-normal">
                Đang xem xét
              </CardTitle>
              <FileText className="text-primary h-3.5 w-3.5" />
            </CardHeader>
            <CardContent className="pt-0 pb-2.5">
              <div className="text-lg font-normal">{stats.reviewing}</div>
              <p className="text-muted-foreground text-[11px]">
                Đang kiểm tra điều kiện
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-info border-l-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-normal">Đang xử lý</CardTitle>
              <RefreshCw className="text-info h-3.5 w-3.5" />
            </CardHeader>
            <CardContent className="pt-0 pb-2.5">
              <div className="text-lg font-normal">{stats.processing}</div>
              <p className="text-muted-foreground text-[11px]">
                Đã duyệt, đang thực hiện
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-success border-l-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-normal">Hoàn thành</CardTitle>
              <CheckCircle className="text-success h-3.5 w-3.5" />
            </CardHeader>
            <CardContent className="pt-0 pb-2.5">
              <div className="text-lg font-normal">{stats.completed}</div>
              <p className="text-muted-foreground text-[11px]">Đã xử lý xong</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
            <Input
              placeholder="Tìm theo mã yêu cầu, mã đơn, tên hoặc SĐT..."
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
            <DropdownMenuContent align="end" className="min-w-[220px]">
              <div className="text-muted-foreground px-2 py-1 text-xs">
                Loại yêu cầu
              </div>
              <DropdownMenuItem onClick={() => setTypeFilter('all')}>
                Tất cả loại
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('exchange')}>
                Đổi hàng
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('return')}>
                Trả hàng
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTypeFilter('warranty')}>
                Bảo hành
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="text-muted-foreground px-2 py-1 text-xs">
                Trạng thái
              </div>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                Tất cả trạng thái
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                Chờ xử lý
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('reviewing')}>
                Đang xem xét
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('approved')}>
                Đã duyệt
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('processing')}>
                Đang xử lý
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                Hoàn thành
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('rejected')}>
                Từ chối
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã yêu cầu</TableHead>
                  <TableHead>Mã đơn hàng</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Lý do</TableHead>
                  <TableHead>Giá trị</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow
                    key={request.id}
                    className={
                      request.status === 'pending'
                        ? 'bg-warning/5'
                        : request.status === 'rejected'
                          ? 'bg-destructive/5'
                          : ''
                    }
                  >
                    <TableCell className="font-normal">{request.id}</TableCell>
                    <TableCell className="text-primary">
                      {request.orderId}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-normal">{request.customer}</div>
                        <div className="text-muted-foreground text-sm">
                          {request.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status="default"
                        className={`rounded-none border-0 bg-transparent px-0 py-0 text-xs ${
                          request.type === 'exchange'
                            ? 'text-warning'
                            : request.type === 'return'
                              ? 'text-destructive'
                              : 'text-primary'
                        }`}
                      >
                        {typeLabels[request.type]}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <div
                        className="max-w-[200px] truncate"
                        title={request.reason}
                      >
                        {request.reason}
                      </div>
                    </TableCell>
                    <TableCell className="font-normal">
                      {formatCurrency(request.totalValue)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        status={statusTypes[request.status]}
                        className="rounded-none border-0 bg-transparent px-0 py-0 text-xs"
                      >
                        {statusLabels[request.status]}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {request.createdAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 bg-transparent p-0 hover:bg-transparent"
                          >
                            <MoreHorizontal className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setDetailModal(request)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          {(request.status === 'pending' ||
                            request.status === 'reviewing') && (
                            <>
                              <DropdownMenuItem
                                onClick={() => setApproveModal(request)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Duyệt yêu cầu
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setRejectModal(request)}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Từ chối
                              </DropdownMenuItem>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <DropdownMenuItem
                              onClick={() => setProcessModal(request)}
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Xử lý yêu cầu
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => setContactModal(request)}
                          >
                            <Phone className="mr-2 h-4 w-4" />
                            Liên hệ khách
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredRequests.length === 0 && (
              <div className="text-muted-foreground py-10 text-center">
                Không tìm thấy yêu cầu nào phù hợp
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!detailModal} onOpenChange={() => setDetailModal(null)}>
        <DialogContent className="max-h-[70vh] max-w-xl overflow-y-auto text-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Chi tiết yêu cầu {detailModal?.id}
              <Badge variant={typeColors[detailModal?.type || 'exchange']}>
                {typeLabels[detailModal?.type || 'exchange']}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {detailModal && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Mã đơn hàng</Label>
                  <p className="text-primary font-normal">
                    {detailModal.orderId}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Trạng thái</Label>
                  <div className="mt-1">
                    <StatusBadge status={statusTypes[detailModal.status]}>
                      {statusLabels[detailModal.status]}
                    </StatusBadge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Khách hàng</Label>
                  <p className="font-normal">{detailModal.customer}</p>
                  <p className="text-muted-foreground text-sm">
                    {detailModal.phone}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ngày tạo</Label>
                  <p className="font-normal">{detailModal.createdAt}</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Lý do</Label>
                <p className="font-normal">{detailModal.reason}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Sản phẩm</Label>
                <div className="mt-2 space-y-2">
                  {detailModal.products.map((product, index) => (
                    <div
                      key={index}
                      className="bg-muted flex items-center justify-between rounded-lg p-3"
                    >
                      <div>
                        <p className="font-normal">{product.name}</p>
                        <p className="text-muted-foreground text-sm">
                          SKU: {product.sku} | SL: {product.quantity}
                        </p>
                      </div>
                      <p className="font-normal">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between border-t pt-3">
                  <span className="font-normal">Tổng giá trị:</span>
                  <span className="text-lg font-normal">
                    {formatCurrency(detailModal.totalValue)}
                  </span>
                </div>
              </div>

              {detailModal.images.length > 0 && (
                <div>
                  <Label className="text-muted-foreground flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    Hình ảnh đính kèm ({detailModal.images.length})
                  </Label>
                  {/* <div className="mt-2 flex gap-2">
                    {detailModal.images.map((img, index) => (
                      <div
                        key={index}
                        className="bg-muted flex h-20 w-20 items-center justify-center rounded-lg"
                      >
                        <Camera className="text-muted-foreground h-8 w-8" />
                      </div>
                    ))}
                  </div> */}
                </div>
              )}

              {detailModal.notes && (
                <div>
                  <Label className="text-muted-foreground">Ghi chú</Label>
                  <p className="bg-muted mt-1 rounded-lg p-3">
                    {detailModal.notes}
                  </p>
                </div>
              )}

              {detailModal.assignee && (
                <div>
                  <Label className="text-muted-foreground">Người xử lý</Label>
                  <p className="font-normal">{detailModal.assignee}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModal(null)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Modal */}
      <Dialog open={!!approveModal} onOpenChange={() => setApproveModal(null)}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="text-success h-5 w-5" />
              Duyệt yêu cầu
            </DialogTitle>
            <DialogDescription>
              Xác nhận duyệt yêu cầu{' '}
              {approveModal?.type === 'exchange'
                ? 'đổi hàng'
                : approveModal?.type === 'return'
                  ? 'trả hàng'
                  : 'bảo hành'}
              ?
            </DialogDescription>
          </DialogHeader>
          {approveModal && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Mã yêu cầu:</span>
                    <span className="ml-2 font-normal">{approveModal.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Khách hàng:</span>
                    <span className="ml-2 font-normal">
                      {approveModal.customer}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Giá trị:</span>
                    <span className="ml-2 font-normal">
                      {formatCurrency(approveModal.totalValue)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Lý do:</span>
                    <span className="ml-2 font-normal">
                      {approveModal.reason}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-success/10 border-success/20 rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-success mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-success font-normal">
                      Yêu cầu đủ điều kiện xử lý
                    </p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Sau khi duyệt, yêu cầu sẽ chuyển sang bước xử lý tiếp
                      theo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveModal(null)}>
              Hủy
            </Button>
            <Button
              onClick={handleApprove}
              className="bg-success hover:bg-success/90"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Xác nhận duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={!!rejectModal} onOpenChange={() => setRejectModal(null)}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="text-destructive h-5 w-5" />
              Từ chối yêu cầu
            </DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối yêu cầu {rejectModal?.id}
            </DialogDescription>
          </DialogHeader>
          {rejectModal && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Khách hàng:</span>
                    <span className="ml-2 font-normal">
                      {rejectModal.customer}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Loại:</span>
                    <span className="ml-2 font-normal">
                      {typeLabels[rejectModal.type]}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="rejectReason">Lý do từ chối *</Label>
                <Select value={rejectReason} onValueChange={setRejectReason}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Chọn lý do" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expired">
                      Quá thời hạn đổi/trả
                    </SelectItem>
                    <SelectItem value="damaged">
                      Sản phẩm bị hư hỏng do người dùng
                    </SelectItem>
                    <SelectItem value="used">
                      Sản phẩm đã qua sử dụng
                    </SelectItem>
                    <SelectItem value="no_receipt">
                      Không có hóa đơn/chứng từ
                    </SelectItem>
                    <SelectItem value="out_of_warranty">
                      Hết hạn bảo hành
                    </SelectItem>
                    <SelectItem value="other">Lý do khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-destructive mt-0.5 h-5 w-5" />
                  <div>
                    <p className="text-destructive font-normal">Lưu ý</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Khách hàng sẽ được thông báo về việc từ chối này qua
                      SMS/Email.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectModal(null)}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Process Modal */}
      <Dialog open={!!processModal} onOpenChange={() => setProcessModal(null)}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="text-primary h-5 w-5" />
              Xử lý yêu cầu
            </DialogTitle>
            <DialogDescription>
              Chọn hành động xử lý cho yêu cầu {processModal?.id}
            </DialogDescription>
          </DialogHeader>
          {processModal && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Loại:</span>
                    <span className="ml-2 font-normal">
                      {typeLabels[processModal.type]}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Sản phẩm:</span>
                    <span className="ml-2 font-normal">
                      {processModal.products[0]?.name}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label>Hành động xử lý *</Label>
                <Select value={processAction} onValueChange={setProcessAction}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Chọn hành động" />
                  </SelectTrigger>
                  <SelectContent>
                    {processModal.type === 'exchange' && (
                      <>
                        <SelectItem value="ship_new">
                          Gửi sản phẩm mới
                        </SelectItem>
                        <SelectItem value="waiting_return">
                          Chờ nhận hàng cũ
                        </SelectItem>
                        <SelectItem value="exchange_complete">
                          Hoàn tất đổi hàng
                        </SelectItem>
                      </>
                    )}
                    {processModal.type === 'return' && (
                      <>
                        <SelectItem value="waiting_return">
                          Chờ nhận hàng trả
                        </SelectItem>
                        <SelectItem value="received">
                          Đã nhận hàng trả
                        </SelectItem>
                        <SelectItem value="refund">Hoàn tiền</SelectItem>
                      </>
                    )}
                    {processModal.type === 'warranty' && (
                      <>
                        <SelectItem value="send_to_lab">
                          Gửi gia công/sửa chữa
                        </SelectItem>
                        <SelectItem value="replace">
                          Thay thế sản phẩm mới
                        </SelectItem>
                        <SelectItem value="warranty_complete">
                          Hoàn tất bảo hành
                        </SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="processNotes">Ghi chú xử lý</Label>
                <Textarea
                  id="processNotes"
                  value={processNotes}
                  onChange={(e) => setProcessNotes(e.target.value)}
                  placeholder="Nhập ghi chú về quá trình xử lý..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              {processAction === 'ship_new' || processAction === 'replace' ? (
                <div className="bg-primary/10 border-primary/20 rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <Truck className="text-primary mt-0.5 h-5 w-5" />
                    <div>
                      <p className="text-primary font-normal">
                        Tạo vận đơn mới
                      </p>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Hệ thống sẽ tự động tạo vận đơn giao hàng cho sản phẩm
                        thay thế.
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setProcessModal(null)}>
              Hủy
            </Button>
            <Button onClick={handleProcess} disabled={!processAction}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Xác nhận xử lý
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={!!contactModal} onOpenChange={() => setContactModal(null)}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="text-primary h-5 w-5" />
              Liên hệ khách hàng
            </DialogTitle>
            <DialogDescription>
              Thông tin liên hệ cho yêu cầu {contactModal?.id}
            </DialogDescription>
          </DialogHeader>
          {contactModal && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Khách hàng:</span>
                    <span className="font-normal">{contactModal.customer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      Số điện thoại:
                    </span>
                    <span className="text-primary font-normal">
                      {contactModal.phone}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-4">
                  <div className="flex flex-col items-center gap-2">
                    <Phone className="h-6 w-6" />
                    <span>Gọi điện</span>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4">
                  <div className="flex flex-col items-center gap-2">
                    <svg
                      className="h-6 w-6"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                    </svg>
                    <span>Zalo</span>
                  </div>
                </Button>
              </div>

              <div>
                <Label>Ghi chú cuộc gọi</Label>
                <Textarea
                  placeholder="Nhập nội dung trao đổi với khách hàng..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactModal(null)}>
              Đóng
            </Button>
            <Button>Lưu ghi chú</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Returns;
