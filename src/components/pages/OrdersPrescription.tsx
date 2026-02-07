'use client';
import { useState } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { StatusBadge } from '@/components/atoms/StatusBadge';
import {
  Search,
  Eye,
  FileText,
  Phone,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  Upload,
  Glasses,
  User,
  Calendar,
  MapPin,
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

interface PrescriptionData {
  sphereRight: string;
  cylinderRight: string;
  axisRight: string;
  sphereLeft: string;
  cylinderLeft: string;
  axisLeft: string;
  pd: string;
  addRight?: string;
  addLeft?: string;
  lensType: string;
  coating: string;
  notes?: string;
}

interface PrescriptionOrder {
  id: string;
  orderId: string;
  customer: string;
  phone: string;
  email: string;
  address: string;
  orderDate: string;
  products: {
    name: string;
    sku: string;
    frame: string;
    quantity: number;
  }[];
  prescriptionStatus: 'missing' | 'incomplete' | 'pending_review' | 'approved';
  prescription?: PrescriptionData;
  priority: 'normal' | 'high' | 'urgent';
  dueDate: string;
  notes?: string;
  source: 'customer_upload' | 'store_input' | 'pending';
}

const mockOrders: PrescriptionOrder[] = [
  {
    id: 'RX001',
    orderId: 'ORD-2024-001',
    customer: 'Nguyễn Văn An',
    phone: '0901234567',
    email: 'an.nguyen@email.com',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    orderDate: '2024-01-15',
    products: [
      {
        name: 'Gọng kính Titan Classic',
        sku: 'TIT-001',
        frame: 'Đen',
        quantity: 1,
      },
    ],
    prescriptionStatus: 'missing',
    priority: 'urgent',
    dueDate: '2024-01-18',
    source: 'pending',
  },
  {
    id: 'RX002',
    orderId: 'ORD-2024-002',
    customer: 'Trần Thị Bình',
    phone: '0912345678',
    email: 'binh.tran@email.com',
    address: '456 Lê Lợi, Q.3, TP.HCM',
    orderDate: '2024-01-14',
    products: [
      {
        name: 'Gọng kính Premium Gold',
        sku: 'PRE-002',
        frame: 'Vàng',
        quantity: 1,
      },
    ],
    prescriptionStatus: 'incomplete',
    prescription: {
      sphereRight: '-2.00',
      cylinderRight: '-0.50',
      axisRight: '180',
      sphereLeft: '-1.75',
      cylinderLeft: '',
      axisLeft: '',
      pd: '64',
      lensType: 'Đa tròng',
      coating: 'Chưa chọn',
    },
    priority: 'high',
    dueDate: '2024-01-19',
    source: 'customer_upload',
    notes: 'Khách gửi ảnh đơn thuốc nhưng thiếu thông số mắt trái',
  },
  {
    id: 'RX003',
    orderId: 'ORD-2024-003',
    customer: 'Lê Minh Châu',
    phone: '0923456789',
    email: 'chau.le@email.com',
    address: '789 Hai Bà Trưng, Q.1, TP.HCM',
    orderDate: '2024-01-13',
    products: [
      {
        name: 'Gọng kính Sport Flex',
        sku: 'SPO-003',
        frame: 'Xanh',
        quantity: 1,
      },
    ],
    prescriptionStatus: 'pending_review',
    prescription: {
      sphereRight: '-3.25',
      cylinderRight: '-1.00',
      axisRight: '90',
      sphereLeft: '-3.00',
      cylinderLeft: '-0.75',
      axisLeft: '85',
      pd: '62',
      addRight: '+2.00',
      addLeft: '+2.00',
      lensType: 'Đa tròng lũy tiến',
      coating: 'Blue Light + Anti-Glare',
    },
    priority: 'normal',
    dueDate: '2024-01-20',
    source: 'store_input',
  },
  {
    id: 'RX004',
    orderId: 'ORD-2024-004',
    customer: 'Phạm Đức Dũng',
    phone: '0934567890',
    email: 'dung.pham@email.com',
    address: '321 Võ Văn Tần, Q.3, TP.HCM',
    orderDate: '2024-01-12',
    products: [
      {
        name: 'Gọng kính Acetate Retro',
        sku: 'ACE-004',
        frame: 'Nâu',
        quantity: 1,
      },
      {
        name: 'Gọng kính Metal Slim',
        sku: 'MET-005',
        frame: 'Bạc',
        quantity: 1,
      },
    ],
    prescriptionStatus: 'approved',
    prescription: {
      sphereRight: '-1.50',
      cylinderRight: '-0.25',
      axisRight: '170',
      sphereLeft: '-1.25',
      cylinderLeft: '-0.50',
      axisLeft: '175',
      pd: '63',
      lensType: 'Đơn tròng',
      coating: 'Anti-Glare',
    },
    priority: 'normal',
    dueDate: '2024-01-21',
    source: 'customer_upload',
  },
  {
    id: 'RX005',
    orderId: 'ORD-2024-005',
    customer: 'Hoàng Thị Em',
    phone: '0945678901',
    email: 'em.hoang@email.com',
    address: '654 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',
    orderDate: '2024-01-11',
    products: [
      {
        name: 'Gọng kính Kids Color',
        sku: 'KID-006',
        frame: 'Hồng',
        quantity: 1,
      },
    ],
    prescriptionStatus: 'missing',
    priority: 'high',
    dueDate: '2024-01-17',
    source: 'pending',
    notes: 'Đơn hàng cho trẻ em, cần đo mắt tại cửa hàng',
  },
];

export default function OrdersPrescription() {
  const [orders, setOrders] = useState<PrescriptionOrder[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<PrescriptionOrder | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [inputPrescriptionOpen, setInputPrescriptionOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);

  const [prescriptionForm, setPrescriptionForm] = useState<PrescriptionData>({
    sphereRight: '',
    cylinderRight: '',
    axisRight: '',
    sphereLeft: '',
    cylinderLeft: '',
    axisLeft: '',
    pd: '',
    addRight: '',
    addLeft: '',
    lensType: '',
    coating: '',
    notes: '',
  });

  const [contactNote, setContactNote] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === 'all' || order.prescriptionStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    missing: orders.filter((o) => o.prescriptionStatus === 'missing').length,
    incomplete: orders.filter((o) => o.prescriptionStatus === 'incomplete')
      .length,
    pendingReview: orders.filter(
      (o) => o.prescriptionStatus === 'pending_review'
    ).length,
    approved: orders.filter((o) => o.prescriptionStatus === 'approved').length,
  };

  const getStatusBadge = (status: PrescriptionOrder['prescriptionStatus']) => {
    switch (status) {
      case 'missing':
        return <StatusBadge status="error">Thiếu Rx</StatusBadge>;
      case 'incomplete':
        return <StatusBadge status="warning">Chưa đầy đủ</StatusBadge>;
      case 'pending_review':
        return <StatusBadge status="info">Chờ duyệt</StatusBadge>;
      case 'approved':
        return <StatusBadge status="success">Đã duyệt</StatusBadge>;
    }
  };

  const getPriorityBadge = (priority: PrescriptionOrder['priority']) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive">Gấp</Badge>;
      case 'high':
        return (
          <Badge className="bg-warning text-warning-foreground">Cao</Badge>
        );
      default:
        return null;
    }
  };

  const handleOpenDetail = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleOpenInputPrescription = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    if (order.prescription) {
      setPrescriptionForm(order.prescription);
    } else {
      setPrescriptionForm({
        sphereRight: '',
        cylinderRight: '',
        axisRight: '',
        sphereLeft: '',
        cylinderLeft: '',
        axisLeft: '',
        pd: '',
        addRight: '',
        addLeft: '',
        lensType: '',
        coating: '',
        notes: '',
      });
    }
    setInputPrescriptionOpen(true);
  };

  const handleOpenContact = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    setContactNote('');
    setContactOpen(true);
  };

  const handleOpenApprove = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    setApproveOpen(true);
  };

  const handleSavePrescription = () => {
    if (!selectedOrder) return;
    setOrders(
      orders.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              prescription: prescriptionForm,
              prescriptionStatus: 'pending_review' as const,
              source: 'store_input' as const,
            }
          : o
      )
    );
    setInputPrescriptionOpen(false);
  };

  const handleApprovePrescription = () => {
    if (!selectedOrder) return;
    setOrders(
      orders.map((o) =>
        o.id === selectedOrder.id
          ? { ...o, prescriptionStatus: 'approved' as const }
          : o
      )
    );
    setApproveOpen(false);
  };

  const handleSendContact = () => {
    // In real app, this would send SMS/email
    setContactOpen(false);
  };

  return (
    <>
      <Header
        title="  Đơn Prescription"
        subtitle=" Quản lý đơn hàng cần thông số mắt để gia công tròng"
      />
      <div className="space-y-6 p-6 text-black">
        {/* Stats Cards */}
        <div className="grid gap-3 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium">Tổng đơn Rx</CardTitle>
              <Glasses className="text-muted-foreground h-3.5 w-3.5" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-lg font-semibold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium">Thiếu Rx</CardTitle>
              <AlertTriangle className="text-destructive h-3.5 w-3.5" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-destructive text-lg font-semibold">
                {stats.missing}
              </div>
            </CardContent>
          </Card>
          <Card className="border-warning/50 bg-warning/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium">Chưa đầy đủ</CardTitle>
              <Clock className="text-warning h-3.5 w-3.5" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-warning text-lg font-semibold">
                {stats.incomplete}
              </div>
            </CardContent>
          </Card>
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium">Chờ duyệt</CardTitle>
              <FileText className="text-primary h-3.5 w-3.5" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-primary text-lg font-semibold">
                {stats.pendingReview}
              </div>
            </CardContent>
          </Card>
          <Card className="border-success/50 bg-success/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
              <CardTitle className="text-xs font-medium">Đã duyệt</CardTitle>
              <CheckCircle2 className="text-success h-3.5 w-3.5" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-success text-lg font-semibold">
                {stats.approved}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Tìm theo mã đơn, tên khách, SĐT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Trạng thái Rx" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="missing">Thiếu Rx</SelectItem>
                  <SelectItem value="incomplete">Chưa đầy đủ</SelectItem>
                  <SelectItem value="pending_review">Chờ duyệt</SelectItem>
                  <SelectItem value="approved">Đã duyệt</SelectItem>
                </SelectContent>
              </Select>
        </div>

        {/* Orders Table */}
        <Card>
          <CardContent className="p-0">
            <Table className="table-fixed w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đơn</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Trạng thái Rx</TableHead>
                  <TableHead>Nguồn</TableHead>
                  <TableHead>Hạn xử lý</TableHead>
                  <TableHead className="w-[8%] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className={
                      order.priority === 'urgent'
                        ? 'bg-destructive/5'
                        : order.priority === 'high'
                          ? 'bg-warning/5'
                          : ''
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{order.orderId}</span>
                        {getPriorityBadge(order.priority)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer}</p>
                        <p className="text-muted-foreground text-sm">
                          {order.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {order.products.map((p, idx) => (
                          <div key={idx} className="text-sm">
                            <span>{p.name}</span>
                            <span className="text-muted-foreground">
                              {' '}
                              ({p.frame})
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.prescriptionStatus)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {order.source === 'customer_upload'
                          ? 'Khách gửi'
                          : order.source === 'store_input'
                            ? 'Nhập tại cửa hàng'
                            : 'Chờ nhập'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="text-muted-foreground h-3 w-3" />
                        <span className="text-sm">{order.dueDate}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="bg-transparent hover:bg-transparent"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleOpenDetail(order)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            {(order.prescriptionStatus === 'missing' ||
                              order.prescriptionStatus === 'incomplete') && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleOpenInputPrescription(order)
                                  }
                                >
                                  <FileText className="mr-2 h-4 w-4" />
                                  Nhập Rx
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleOpenContact(order)}
                                >
                                  <Phone className="mr-2 h-4 w-4" />
                                  Liên hệ khách hàng
                                </DropdownMenuItem>
                              </>
                            )}
                            {order.prescriptionStatus === 'pending_review' && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleOpenApprove(order)}
                                >
                                  <CheckCircle2 className="mr-2 h-4 w-4" />
                                  Duyệt
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
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="text-black max-w-xl max-h-[70vh] overflow-y-auto p-4 text-sm">
            <DialogHeader>
              <DialogTitle>
                Chi tiết đơn hàng {selectedOrder?.orderId}
              </DialogTitle>
              <DialogDescription>
                Thông tin đơn hàng và thông số mắt
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Khách hàng</Label>
                    <div className="flex items-center gap-2">
                      <User className="text-muted-foreground h-4 w-4" />
                      <span className="font-medium">
                        {selectedOrder.customer}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">
                      Số điện thoại
                    </Label>
                    <div className="flex items-center gap-2">
                      <Phone className="text-muted-foreground h-4 w-4" />
                      <span>{selectedOrder.phone}</span>
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-muted-foreground">Địa chỉ</Label>
                    <div className="flex items-center gap-2">
                      <MapPin className="text-muted-foreground h-4 w-4" />
                      <span>{selectedOrder.address}</span>
                    </div>
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Sản phẩm</Label>
                  <div className="space-y-2 rounded-lg border p-3">
                    {selectedOrder.products.map((p, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>
                          {p.name} - {p.frame}
                        </span>
                        <span className="text-muted-foreground">
                          SKU: {p.sku}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prescription Data */}
                {selectedOrder.prescription ? (
                  <div className="space-y-4">
                    <Label className="text-muted-foreground">
                      Thông số mắt (Rx)
                    </Label>
                    <div className="space-y-4 rounded-lg border p-4">
                      <div className="grid grid-cols-4 gap-4 text-center text-sm">
                        <div className="font-medium"></div>
                        <div className="font-medium">SPH</div>
                        <div className="font-medium">CYL</div>
                        <div className="font-medium">AXIS</div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="text-right font-medium">
                          Mắt phải (OD)
                        </div>
                        <div>
                          {selectedOrder.prescription.sphereRight || '-'}
                        </div>
                        <div>
                          {selectedOrder.prescription.cylinderRight || '-'}
                        </div>
                        <div>{selectedOrder.prescription.axisRight || '-'}</div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div className="text-right font-medium">
                          Mắt trái (OS)
                        </div>
                        <div>
                          {selectedOrder.prescription.sphereLeft || '-'}
                        </div>
                        <div>
                          {selectedOrder.prescription.cylinderLeft || '-'}
                        </div>
                        <div>{selectedOrder.prescription.axisLeft || '-'}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 border-t pt-2">
                        <div>
                          <span className="text-muted-foreground">PD: </span>
                          <span className="font-medium">
                            {selectedOrder.prescription.pd}mm
                          </span>
                        </div>
                        {selectedOrder.prescription.addRight && (
                          <div>
                            <span className="text-muted-foreground">ADD: </span>
                            <span className="font-medium">
                              {selectedOrder.prescription.addRight}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 border-t pt-2">
                        <div>
                          <span className="text-muted-foreground">
                            Loại tròng:{' '}
                          </span>
                          <span className="font-medium">
                            {selectedOrder.prescription.lensType}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Lớp phủ:{' '}
                          </span>
                          <span className="font-medium">
                            {selectedOrder.prescription.coating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <Glasses className="text-muted-foreground mx-auto h-8 w-8" />
                    <p className="text-muted-foreground mt-2">
                      Chưa có thông số mắt
                    </p>
                    <Button
                      className="mt-4"
                      onClick={() => {
                        setDetailOpen(false);
                        handleOpenInputPrescription(selectedOrder);
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Nhập thông số
                    </Button>
                  </div>
                )}

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Ghi chú</Label>
                    <p className="bg-muted/50 rounded-lg p-3 text-sm">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Input Prescription Modal */}
        <Dialog
          open={inputPrescriptionOpen}
          onOpenChange={setInputPrescriptionOpen}
        >
          <DialogContent className="text-black max-w-xl max-h-[70vh] overflow-y-auto p-4 text-sm">
            <DialogHeader>
              <DialogTitle>Nhập thông số mắt</DialogTitle>
              <DialogDescription>
                Đơn hàng: {selectedOrder?.orderId} - {selectedOrder?.customer}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Eye measurements table */}
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-2 text-center text-sm">
                  <div></div>
                  <div className="font-medium">SPH (Sphere)</div>
                  <div className="font-medium">CYL (Cylinder)</div>
                  <div className="font-medium">AXIS (Trục)</div>
                  <div className="font-medium">ADD</div>
                </div>
                <div className="grid grid-cols-5 items-center gap-2">
                  <Label className="text-right">Mắt phải (OD)</Label>
                  <Input
                    placeholder="-2.00"
                    value={prescriptionForm.sphereRight}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        sphereRight: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="-0.50"
                    value={prescriptionForm.cylinderRight}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        cylinderRight: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="180"
                    value={prescriptionForm.axisRight}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        axisRight: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="+2.00"
                    value={prescriptionForm.addRight}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        addRight: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-5 items-center gap-2">
                  <Label className="text-right">Mắt trái (OS)</Label>
                  <Input
                    placeholder="-1.75"
                    value={prescriptionForm.sphereLeft}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        sphereLeft: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="-0.25"
                    value={prescriptionForm.cylinderLeft}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        cylinderLeft: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="175"
                    value={prescriptionForm.axisLeft}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        axisLeft: e.target.value,
                      })
                    }
                  />
                  <Input
                    placeholder="+2.00"
                    value={prescriptionForm.addLeft}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        addLeft: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* PD */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>PD (Khoảng cách đồng tử)</Label>
                  <Input
                    placeholder="64"
                    value={prescriptionForm.pd}
                    onChange={(e) =>
                      setPrescriptionForm({
                        ...prescriptionForm,
                        pd: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Lens Type & Coating */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Loại tròng</Label>
                  <Select
                    value={prescriptionForm.lensType}
                    onValueChange={(v) =>
                      setPrescriptionForm({ ...prescriptionForm, lensType: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại tròng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Đơn tròng">Đơn tròng</SelectItem>
                      <SelectItem value="Đa tròng">
                        Đa tròng (Bifocal)
                      </SelectItem>
                      <SelectItem value="Đa tròng lũy tiến">
                        Đa tròng lũy tiến (Progressive)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Lớp phủ</Label>
                  <Select
                    value={prescriptionForm.coating}
                    onValueChange={(v) =>
                      setPrescriptionForm({ ...prescriptionForm, coating: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn lớp phủ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Anti-Glare">Anti-Glare</SelectItem>
                      <SelectItem value="Blue Light">Blue Light</SelectItem>
                      <SelectItem value="Blue Light + Anti-Glare">
                        Blue Light + Anti-Glare
                      </SelectItem>
                      <SelectItem value="Photochromic">
                        Photochromic (Đổi màu)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Ghi chú</Label>
                <Textarea
                  placeholder="Ghi chú thêm về thông số hoặc yêu cầu đặc biệt..."
                  value={prescriptionForm.notes}
                  onChange={(e) =>
                    setPrescriptionForm({
                      ...prescriptionForm,
                      notes: e.target.value,
                    })
                  }
                />
              </div>

              {/* Upload button */}
              <div className="flex items-center gap-4 rounded-lg border border-dashed p-4">
                <Upload className="text-muted-foreground h-8 w-8" />
                <div className="flex-1">
                  <p className="font-medium">Tải lên đơn thuốc</p>
                  <p className="text-muted-foreground text-sm">
                    Tải ảnh đơn thuốc từ bác sĩ (JPG, PNG, PDF)
                  </p>
                </div>
                <Button variant="outline">Chọn file</Button>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInputPrescriptionOpen(false)}
              >
                Hủy
              </Button>
              <Button onClick={handleSavePrescription}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Lưu thông số
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Contact Customer Modal */}
        <Dialog open={contactOpen} onOpenChange={setContactOpen}>
          <DialogContent className="text-black max-w-lg max-h-[70vh] overflow-y-auto p-4 text-sm">
            <DialogHeader>
              <DialogTitle>Liên hệ khách hàng</DialogTitle>
              <DialogDescription>
                Gửi thông báo yêu cầu bổ sung thông số mắt
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="bg-muted/50 space-y-2 rounded-lg p-4">
                  <p className="font-medium">{selectedOrder.customer}</p>
                  <p className="text-muted-foreground text-sm">
                    {selectedOrder.phone} • {selectedOrder.email}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Nội dung tin nhắn</Label>
                  <Textarea
                    value={contactNote}
                    onChange={(e) => setContactNote(e.target.value)}
                    placeholder="Xin chào, chúng tôi cần thông số mắt của bạn để gia công tròng kính..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Checkbox id="sms" defaultChecked />
                  <Label htmlFor="sms">Gửi SMS</Label>
                  <Checkbox id="email" defaultChecked />
                  <Label htmlFor="email">Gửi Email</Label>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setContactOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleSendContact}>
                <Send className="mr-2 h-4 w-4" />
                Gửi thông báo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approve Prescription Modal */}
        <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
          <DialogContent className="text-black max-w-md max-h-[70vh] overflow-y-auto p-4 text-sm">
            <DialogHeader>
              <DialogTitle>Duyệt thông số mắt</DialogTitle>
              <DialogDescription>
                Xác nhận thông số đúng để chuyển đơn sang gia công
              </DialogDescription>
            </DialogHeader>
            {selectedOrder?.prescription && (
              <div className="space-y-4">
                <div className="space-y-3 rounded-lg border p-4">
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div></div>
                    <div className="font-medium">SPH</div>
                    <div className="font-medium">CYL</div>
                    <div className="font-medium">AXIS</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div className="font-medium">OD</div>
                    <div>{selectedOrder.prescription.sphereRight}</div>
                    <div>{selectedOrder.prescription.cylinderRight}</div>
                    <div>{selectedOrder.prescription.axisRight}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center text-sm">
                    <div className="font-medium">OS</div>
                    <div>{selectedOrder.prescription.sphereLeft}</div>
                    <div>{selectedOrder.prescription.cylinderLeft}</div>
                    <div>{selectedOrder.prescription.axisLeft}</div>
                  </div>
                  <div className="border-t pt-2 text-sm">
                    <span className="text-muted-foreground">PD: </span>
                    {selectedOrder.prescription.pd}mm |{' '}
                    <span className="text-muted-foreground">Tròng: </span>
                    {selectedOrder.prescription.lensType} |{' '}
                    <span className="text-muted-foreground">Phủ: </span>
                    {selectedOrder.prescription.coating}
                  </div>
                </div>
                <div className="bg-warning/10 flex items-start gap-2 rounded-lg p-3">
                  <AlertTriangle className="text-warning mt-0.5 h-5 w-5" />
                  <p className="text-sm">
                    Vui lòng kiểm tra kỹ thông số trước khi duyệt. Sau khi
                    duyệt, đơn hàng sẽ được chuyển sang bộ phận gia công.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setApproveOpen(false)}>
                Kiểm tra lại
              </Button>
              <Button onClick={handleApprovePrescription}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Xác nhận duyệt
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
