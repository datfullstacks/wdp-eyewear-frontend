'use client';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
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
import { StatusBadge } from '@/components/atoms/StatusBadge';
import {
  Search,
  AlertTriangle,
  Clock,
  AlertOctagon,
  Phone,
  MessageSquare,
  CheckCircle,
  ArrowUpRight,
  Timer,
  ShieldAlert,
  FileWarning,
  MoreHorizontal,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/atoms';
import { Header } from '@/components/organisms/Header';

type DelayType =
  | 'sla_breach'
  | 'pending_too_long'
  | 'stuck_processing'
  | 'delivery_delay'
  | 'lab_delay';
type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

interface DelayedOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  orderDate: string;
  delayType: DelayType;
  severity: SeverityLevel;
  delayDuration: string;
  slaDeadline: string;
  currentStatus: string;
  assignedTo: string;
  lastAction: string;
  notes: string;
}

const mockDelayedOrders: DelayedOrder[] = [
  {
    id: 'ORD-001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    orderDate: '28/01/2026',
    delayType: 'sla_breach',
    severity: 'critical',
    delayDuration: '2 ngày',
    slaDeadline: '30/01/2026 14:00',
    currentStatus: 'Đang gia công',
    assignedTo: 'Nhân viên A',
    lastAction: 'Cập nhật tiến độ 2 ngày trước',
    notes: 'Thiếu tròng đặc biệt, đang chờ nhập',
  },
  {
    id: 'ORD-002',
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    orderDate: '29/01/2026',
    delayType: 'pending_too_long',
    severity: 'high',
    delayDuration: '36 giờ',
    slaDeadline: '31/01/2026 10:00',
    currentStatus: 'Chờ xử lý',
    assignedTo: 'Chưa gán',
    lastAction: 'Tạo đơn 36 giờ trước',
    notes: '',
  },
  {
    id: 'ORD-003',
    customerName: 'Lê Văn C',
    customerPhone: '0923456789',
    orderDate: '27/01/2026',
    delayType: 'delivery_delay',
    severity: 'high',
    delayDuration: '1 ngày',
    slaDeadline: '01/02/2026 18:00',
    currentStatus: 'Đang giao hàng',
    assignedTo: 'GHTK',
    lastAction: 'Giao thất bại lần 1',
    notes: 'Khách không nghe máy',
  },
  {
    id: 'ORD-004',
    customerName: 'Phạm Thị D',
    customerPhone: '0934567890',
    orderDate: '30/01/2026',
    delayType: 'lab_delay',
    severity: 'medium',
    delayDuration: '4 giờ',
    slaDeadline: '02/02/2026 12:00',
    currentStatus: 'Đang gia công',
    assignedTo: 'Lab A',
    lastAction: 'Bắt đầu gia công 8 giờ trước',
    notes: 'Tròng phức tạp, cần thêm thời gian',
  },
  {
    id: 'ORD-005',
    customerName: 'Hoàng Văn E',
    customerPhone: '0945678901',
    orderDate: '26/01/2026',
    delayType: 'stuck_processing',
    severity: 'critical',
    delayDuration: '3 ngày',
    slaDeadline: '29/01/2026 16:00',
    currentStatus: 'Chờ duyệt Rx',
    assignedTo: 'Nhân viên B',
    lastAction: 'Gửi yêu cầu Rx 3 ngày trước',
    notes: 'Khách chưa cung cấp thông số mắt',
  },
  {
    id: 'ORD-006',
    customerName: 'Vũ Thị F',
    customerPhone: '0956789012',
    orderDate: '31/01/2026',
    delayType: 'pending_too_long',
    severity: 'low',
    delayDuration: '12 giờ',
    slaDeadline: '02/02/2026 20:00',
    currentStatus: 'Chờ xử lý',
    assignedTo: 'Chưa gán',
    lastAction: 'Tạo đơn 12 giờ trước',
    notes: '',
  },
];

const delayTypeLabels: Record<DelayType, string> = {
  sla_breach: 'Vi phạm SLA',
  pending_too_long: 'Chờ quá lâu',
  stuck_processing: 'Kẹt xử lý',
  delivery_delay: 'Giao hàng trễ',
  lab_delay: 'Gia công trễ',
};

const severityConfig: Record<
  SeverityLevel,
  { label: string; className: string; icon: typeof AlertTriangle }
> = {
  critical: {
    label: 'Nghiêm trọng',
    className: 'bg-destructive text-destructive-foreground',
    icon: AlertOctagon,
  },
  high: {
    label: 'Cao',
    className: 'bg-warning text-warning-foreground',
    icon: AlertTriangle,
  },
  medium: {
    label: 'Trung bình',
    className: 'bg-primary text-primary-foreground',
    icon: Clock,
  },
  low: {
    label: 'Thấp',
    className: 'bg-muted text-muted-foreground',
    icon: Timer,
  },
};

const severityTextClass: Record<SeverityLevel, string> = {
  critical: 'text-destructive',
  high: 'text-warning',
  medium: 'text-primary',
  low: 'text-muted-foreground',
};

export default function OrdersDelayed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [detailOrder, setDetailOrder] = useState<DelayedOrder | null>(null);
  const [escalateOrder, setEscalateOrder] = useState<DelayedOrder | null>(null);
  const [contactOrder, setContactOrder] = useState<DelayedOrder | null>(null);
  const [resolveOrder, setResolveOrder] = useState<DelayedOrder | null>(null);

  const [escalateNote, setEscalateNote] = useState('');
  const [contactMethod, setContactMethod] = useState<string>('phone');
  const [contactNote, setContactNote] = useState('');
  const [resolveNote, setResolveNote] = useState('');
  const [resolveAction, setResolveAction] = useState<string>('');

  const filteredOrders = mockDelayedOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    const matchesSeverity =
      severityFilter === 'all' || order.severity === severityFilter;
    const matchesType = typeFilter === 'all' || order.delayType === typeFilter;
    return matchesSearch && matchesSeverity && matchesType;
  });

  const stats = {
    critical: mockDelayedOrders.filter((o) => o.severity === 'critical').length,
    high: mockDelayedOrders.filter((o) => o.severity === 'high').length,
    medium: mockDelayedOrders.filter((o) => o.severity === 'medium').length,
    slaBreached: mockDelayedOrders.filter((o) => o.delayType === 'sla_breach')
      .length,
  };

  const handleEscalate = () => {
    console.log('Escalating order:', escalateOrder?.id, 'Note:', escalateNote);
    setEscalateOrder(null);
    setEscalateNote('');
  };

  const handleContact = () => {
    console.log(
      'Contacting customer:',
      contactOrder?.id,
      'Method:',
      contactMethod,
      'Note:',
      contactNote
    );
    setContactOrder(null);
    setContactMethod('phone');
    setContactNote('');
  };

  const handleResolve = () => {
    console.log(
      'Resolving order:',
      resolveOrder?.id,
      'Action:',
      resolveAction,
      'Note:',
      resolveNote
    );
    setResolveOrder(null);
    setResolveAction('');
    setResolveNote('');
  };

  return (
    <>
      <Header
        title=" Đơn trễ / Cảnh báo"
        subtitle="  Quản lý và xử lý các đơn hàng vi phạm SLA hoặc cần can thiệp"
      />
      <div className="space-y-5 p-6 text-sm text-black">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardHeader className="pb-0.5">
              <CardTitle className="text-muted-foreground flex items-center gap-2 text-[11px] font-normal">
                <AlertOctagon className="text-destructive h-3 w-3" />
                Nghiêm trọng
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-2.5">
              <div className="text-destructive text-lg font-normal">
                {stats.critical}
              </div>
              <p className="text-muted-foreground mt-0.5 text-[10px]">
                Cần xử lý ngay
              </p>
            </CardContent>
          </Card>

          <Card className="border-warning/30 bg-warning/5">
            <CardHeader className="pb-0.5">
              <CardTitle className="text-muted-foreground flex items-center gap-2 text-[11px] font-normal">
                <AlertTriangle className="text-warning h-3 w-3" />
                Mức độ cao
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-2.5">
              <div className="text-warning text-lg font-normal">
                {stats.high}
              </div>
              <p className="text-muted-foreground mt-0.5 text-[10px]">
                Ưu tiên xử lý
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/30 bg-primary/5">
            <CardHeader className="pb-0.5">
              <CardTitle className="text-muted-foreground flex items-center gap-2 text-[11px] font-normal">
                <Clock className="text-primary h-3 w-3" />
                Trung bình
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-2.5">
              <div className="text-primary text-lg font-normal">
                {stats.medium}
              </div>
              <p className="text-muted-foreground mt-0.5 text-[10px]">
                Theo dõi
              </p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader className="pb-0.5">
              <CardTitle className="text-muted-foreground flex items-center gap-2 text-[11px] font-normal">
                <FileWarning className="h-3 w-3" />
                Vi phạm SLA
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-2.5">
              <div className="text-foreground text-lg font-normal">
                {stats.slaBreached}
              </div>
              <p className="text-muted-foreground mt-0.5 text-[10px]">
                Tổng vi phạm
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Tìm theo mã đơn, tên KH, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Mức độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả mức độ</SelectItem>
                  <SelectItem value="critical">Nghiêm trọng</SelectItem>
                  <SelectItem value="high">Cao</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="low">Thấp</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Loại cảnh báo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="sla_breach">Vi phạm SLA</SelectItem>
                  <SelectItem value="pending_too_long">Chờ quá lâu</SelectItem>
                  <SelectItem value="stuck_processing">Kẹt xử lý</SelectItem>
                  <SelectItem value="delivery_delay">Giao hàng trễ</SelectItem>
                  <SelectItem value="lab_delay">Gia công trễ</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Order List */}
        <Card>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-border border-b">
                    <th className="text-muted-foreground p-2 text-left text-xs font-normal">
                      Mã đơn
                    </th>
                    <th className="text-muted-foreground p-2 text-left text-xs font-normal">
                      Khách hàng
                    </th>
                    <th className="text-muted-foreground p-2 text-left text-xs font-normal">
                      Loại cảnh báo
                    </th>
                    <th className="text-muted-foreground p-2 text-left text-xs font-normal">
                      Mức độ
                    </th>
                    <th className="text-muted-foreground p-2 text-left text-xs font-normal">
                      Thời gian trễ
                    </th>
                    <th className="text-muted-foreground p-2 text-left text-xs font-normal">
                      Trạng thái
                    </th>
                    <th className="text-muted-foreground p-2 text-left text-xs font-normal">
                      Người xử lý
                    </th>
                    <th className="text-muted-foreground p-2 text-right text-xs font-normal">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const SeverityIcon = severityConfig[order.severity].icon;
                    return (
                      <tr
                        key={order.id}
                        className="border-border hover:bg-muted/50 border-b transition-colors"
                      >
                        <td className="p-2">
                          <button
                            onClick={() => setDetailOrder(order)}
                            className="font-normal hover:underline"
                          >
                            {order.id}
                          </button>
                        </td>
                        <td className="p-2">
                          <div>
                            <p className="text-foreground font-normal">
                              {order.customerName}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {order.customerPhone}
                            </p>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="text-[11px]">
                            {delayTypeLabels[order.delayType]}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge
                            className={`rounded-none border-0 bg-transparent px-0 py-0 text-[11px] ${severityTextClass[order.severity]}`}
                          >
                            <SeverityIcon className="mr-1 h-3 w-3" />
                            {severityConfig[order.severity].label}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex items-center gap-1 font-normal">
                            <Clock className="h-3 w-3" />
                            {order.delayDuration}
                          </div>
                        </td>
                        <td className="p-2">
                          <StatusBadge status="warning" className="text-[11px]">
                            {order.currentStatus}
                          </StatusBadge>
                        </td>
                        <td className="p-2">
                          <span
                            className={
                              order.assignedTo === 'Chưa gán'
                                ? 'text-muted-foreground italic'
                                : ''
                            }
                          >
                            {order.assignedTo}
                          </span>
                        </td>
                        <td className="p-2">
                          <div className="flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 bg-transparent p-0 hover:bg-transparent"
                                  title="Thao tác"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => setContactOrder(order)}
                                >
                                  <Phone className="mr-2 h-4 w-4" />
                                  Liên hệ khách
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => setEscalateOrder(order)}
                                >
                                  <ArrowUpRight className="mr-2 h-4 w-4" />
                                  Leo thang
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setResolveOrder(order)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Xử lý
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <div className="text-muted-foreground py-12 text-center">
                  <ShieldAlert className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>Không có đơn hàng cảnh báo nào</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!detailOrder} onOpenChange={() => setDetailOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="text-warning h-5 w-5" />
              Chi tiết cảnh báo - {detailOrder?.id}
            </DialogTitle>
          </DialogHeader>
          {detailOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-muted-foreground text-sm font-normal">
                      Khách hàng
                    </label>
                    <p className="text-foreground font-normal">
                      {detailOrder.customerName}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {detailOrder.customerPhone}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-normal">
                      Ngày đặt
                    </label>
                    <p className="text-foreground">{detailOrder.orderDate}</p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-normal">
                      Loại cảnh báo
                    </label>
                    <div className="mt-1">
                      <Badge variant="outline">
                        {delayTypeLabels[detailOrder.delayType]}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-muted-foreground text-sm font-normal">
                      Mức độ
                    </label>
                    <div className="mt-1">
                      <Badge
                        className={
                          severityConfig[detailOrder.severity].className
                        }
                      >
                        {severityConfig[detailOrder.severity].label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-normal">
                      Thời gian trễ
                    </label>
                    <p className="text-destructive text-lg font-normal">
                      {detailOrder.delayDuration}
                    </p>
                  </div>
                  <div>
                    <label className="text-muted-foreground text-sm font-normal">
                      Deadline SLA
                    </label>
                    <p className="text-foreground">{detailOrder.slaDeadline}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div>
                  <label className="text-muted-foreground text-sm font-normal">
                    Trạng thái hiện tại
                  </label>
                  <p className="text-foreground">{detailOrder.currentStatus}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-normal">
                    Người xử lý
                  </label>
                  <p className="text-foreground">{detailOrder.assignedTo}</p>
                </div>
                <div>
                  <label className="text-muted-foreground text-sm font-normal">
                    Hành động cuối
                  </label>
                  <p className="text-foreground">{detailOrder.lastAction}</p>
                </div>
                {detailOrder.notes && (
                  <div>
                    <label className="text-muted-foreground text-sm font-normal">
                      Ghi chú
                    </label>
                    <p className="text-foreground bg-muted rounded-md p-3">
                      {detailOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOrder(null)}>
              Đóng
            </Button>
            <Button
              onClick={() => {
                setResolveOrder(detailOrder);
                setDetailOrder(null);
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Xử lý ngay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalate Modal */}
      <Dialog
        open={!!escalateOrder}
        onOpenChange={() => setEscalateOrder(null)}
      >
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRight className="text-warning h-5 w-5" />
              Leo thang - {escalateOrder?.id}
            </DialogTitle>
            <DialogDescription>
              Leo thang đơn hàng lên cấp quản lý để xử lý khẩn cấp
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-warning/10 border-warning/20 rounded-lg border p-4">
              <p className="text-warning text-sm">
                <strong>Lưu ý:</strong> Leo thang sẽ gửi thông báo đến quản lý
                và ghi nhận vào lịch sử đơn hàng.
              </p>
            </div>
            <div>
              <label className="text-foreground text-sm font-normal">
                Lý do leo thang *
              </label>
              <Textarea
                placeholder="Mô tả lý do cần leo thang đơn hàng này..."
                value={escalateNote}
                onChange={(e) => setEscalateNote(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEscalateOrder(null)}>
              Hủy
            </Button>
            <Button onClick={handleEscalate} disabled={!escalateNote.trim()}>
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Xác nhận leo thang
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Modal */}
      <Dialog open={!!contactOrder} onOpenChange={() => setContactOrder(null)}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="text-primary h-5 w-5" />
              Liên hệ khách hàng - {contactOrder?.id}
            </DialogTitle>
          </DialogHeader>
          {contactOrder && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <p className="font-normal">{contactOrder.customerName}</p>
                <p className="text-muted-foreground text-sm">
                  {contactOrder.customerPhone}
                </p>
              </div>
              <div>
                <label className="text-foreground text-sm font-normal">
                  Hình thức liên hệ
                </label>
                <Select value={contactMethod} onValueChange={setContactMethod}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Gọi điện
                      </div>
                    </SelectItem>
                    <SelectItem value="sms">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        SMS/Zalo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-foreground text-sm font-normal">
                  Nội dung/Ghi chú
                </label>
                <Textarea
                  placeholder="Ghi chú nội dung cuộc gọi hoặc tin nhắn..."
                  value={contactNote}
                  onChange={(e) => setContactNote(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactOrder(null)}>
              Hủy
            </Button>
            <Button onClick={handleContact}>
              <Phone className="mr-2 h-4 w-4" />
              Ghi nhận liên hệ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Modal */}
      <Dialog open={!!resolveOrder} onOpenChange={() => setResolveOrder(null)}>
        <DialogContent className="text-black">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="text-success h-5 w-5" />
              Xử lý cảnh báo - {resolveOrder?.id}
            </DialogTitle>
            <DialogDescription>
              Chọn hành động để xử lý và đóng cảnh báo này
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-foreground text-sm font-normal">
                Hành động xử lý *
              </label>
              <Select value={resolveAction} onValueChange={setResolveAction}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Chọn hành động..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expedite">Đẩy nhanh tiến độ</SelectItem>
                  <SelectItem value="reassign">Gán lại người xử lý</SelectItem>
                  <SelectItem value="contact_resolved">
                    Đã liên hệ - Khách đồng ý chờ
                  </SelectItem>
                  <SelectItem value="issue_resolved">
                    Đã khắc phục vấn đề
                  </SelectItem>
                  <SelectItem value="cancel_order">
                    Hủy đơn theo yêu cầu khách
                  </SelectItem>
                  <SelectItem value="false_alarm">Cảnh báo nhầm</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-foreground text-sm font-normal">
                Ghi chú xử lý
              </label>
              <Textarea
                placeholder="Mô tả chi tiết cách xử lý..."
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveOrder(null)}>
              Hủy
            </Button>
            <Button
              onClick={handleResolve}
              disabled={!resolveAction}
              className="bg-success hover:bg-success/90"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Hoàn tất xử lý
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
