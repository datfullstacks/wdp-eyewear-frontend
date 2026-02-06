'use client';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchBar } from '@/components/molecules/SearchBar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Download,
  Eye,
  MapPin,
  Phone,
  RotateCcw,
  TrendingUp,
  Banknote,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms';
import { Header } from '@/components/organisms/Header';

interface Shipment {
  id: string;
  trackingCode: string;
  orderId: string;
  carrier: string;
  customerName: string;
  customerPhone: string;
  address: string;
  status:
    | 'picking'
    | 'in_transit'
    | 'delivering'
    | 'delivered'
    | 'returned'
    | 'failed';
  codAmount: number;
  shippingFee: number;
  weight: number;
  createdAt: string;
  updatedAt: string;
  expectedDelivery: string;
  actualDelivery?: string;
  history: {
    time: string;
    status: string;
    location: string;
    note?: string;
  }[];
}

interface CODReconciliation {
  id: string;
  carrier: string;
  period: string;
  totalOrders: number;
  totalCOD: number;
  shippingFee: number;
  netAmount: number;
  status: 'pending' | 'confirmed' | 'paid' | 'disputed';
  createdAt: string;
  paidAt?: string;
}

const mockShipments: Shipment[] = [
  {
    id: '1',
    trackingCode: 'GHN123456789',
    orderId: 'ORD-2024-001',
    carrier: 'GHN',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    status: 'in_transit',
    codAmount: 1500000,
    shippingFee: 30000,
    weight: 0.5,
    createdAt: '2024-01-15 09:00',
    updatedAt: '2024-01-15 14:30',
    expectedDelivery: '2024-01-17',
    history: [
      { time: '2024-01-15 09:00', status: 'Đã tạo đơn', location: 'Kho HCM' },
      { time: '2024-01-15 10:30', status: 'Đã lấy hàng', location: 'Kho HCM' },
      {
        time: '2024-01-15 14:30',
        status: 'Đang vận chuyển',
        location: 'Trung tâm phân loại Q.Tân Bình',
      },
    ],
  },
  {
    id: '2',
    trackingCode: 'GHTK987654321',
    orderId: 'ORD-2024-002',
    carrier: 'GHTK',
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    address: '456 Lê Lợi, Q.3, TP.HCM',
    status: 'delivered',
    codAmount: 2800000,
    shippingFee: 25000,
    weight: 0.3,
    createdAt: '2024-01-14 08:00',
    updatedAt: '2024-01-15 11:00',
    expectedDelivery: '2024-01-16',
    actualDelivery: '2024-01-15 11:00',
    history: [
      { time: '2024-01-14 08:00', status: 'Đã tạo đơn', location: 'Kho HCM' },
      { time: '2024-01-14 09:00', status: 'Đã lấy hàng', location: 'Kho HCM' },
      {
        time: '2024-01-14 15:00',
        status: 'Đang vận chuyển',
        location: 'Trung tâm GHTK Q.12',
      },
      {
        time: '2024-01-15 08:00',
        status: 'Đang giao hàng',
        location: 'Q.3, TP.HCM',
      },
      {
        time: '2024-01-15 11:00',
        status: 'Đã giao thành công',
        location: '456 Lê Lợi, Q.3',
      },
    ],
  },
  {
    id: '3',
    trackingCode: 'VTP456789123',
    orderId: 'ORD-2024-003',
    carrier: 'Viettel Post',
    customerName: 'Lê Văn C',
    customerPhone: '0923456789',
    address: '789 Điện Biên Phủ, Q.Bình Thạnh, TP.HCM',
    status: 'delivering',
    codAmount: 3200000,
    shippingFee: 28000,
    weight: 0.4,
    createdAt: '2024-01-15 07:00',
    updatedAt: '2024-01-16 08:30',
    expectedDelivery: '2024-01-17',
    history: [
      { time: '2024-01-15 07:00', status: 'Đã tạo đơn', location: 'Kho HCM' },
      { time: '2024-01-15 08:30', status: 'Đã lấy hàng', location: 'Kho HCM' },
      {
        time: '2024-01-15 16:00',
        status: 'Đang vận chuyển',
        location: 'Trung tâm VTP Q.9',
      },
      {
        time: '2024-01-16 08:30',
        status: 'Đang giao hàng',
        location: 'Q.Bình Thạnh',
      },
    ],
  },
  {
    id: '4',
    trackingCode: 'GHN111222333',
    orderId: 'ORD-2024-004',
    carrier: 'GHN',
    customerName: 'Phạm Thị D',
    customerPhone: '0934567890',
    address: '321 Cách Mạng Tháng 8, Q.10, TP.HCM',
    status: 'failed',
    codAmount: 1800000,
    shippingFee: 32000,
    weight: 0.6,
    createdAt: '2024-01-13 10:00',
    updatedAt: '2024-01-15 17:00',
    expectedDelivery: '2024-01-15',
    history: [
      { time: '2024-01-13 10:00', status: 'Đã tạo đơn', location: 'Kho HCM' },
      { time: '2024-01-13 11:00', status: 'Đã lấy hàng', location: 'Kho HCM' },
      {
        time: '2024-01-14 09:00',
        status: 'Đang vận chuyển',
        location: 'Trung tâm GHN',
      },
      { time: '2024-01-15 08:00', status: 'Đang giao hàng', location: 'Q.10' },
      {
        time: '2024-01-15 12:00',
        status: 'Giao không thành công',
        location: 'Q.10',
        note: 'Khách không nghe máy',
      },
      {
        time: '2024-01-15 17:00',
        status: 'Giao lần 2 không thành công',
        location: 'Q.10',
        note: 'Khách hẹn ngày khác',
      },
    ],
  },
  {
    id: '5',
    trackingCode: 'GHTK444555666',
    orderId: 'ORD-2024-005',
    carrier: 'GHTK',
    customerName: 'Hoàng Văn E',
    customerPhone: '0945678901',
    address: '654 Trường Chinh, Q.Tân Bình, TP.HCM',
    status: 'returned',
    codAmount: 2100000,
    shippingFee: 35000,
    weight: 0.8,
    createdAt: '2024-01-10 09:00',
    updatedAt: '2024-01-14 16:00',
    expectedDelivery: '2024-01-12',
    history: [
      { time: '2024-01-10 09:00', status: 'Đã tạo đơn', location: 'Kho HCM' },
      { time: '2024-01-10 10:00', status: 'Đã lấy hàng', location: 'Kho HCM' },
      {
        time: '2024-01-11 14:00',
        status: 'Đang vận chuyển',
        location: 'Trung tâm GHTK',
      },
      {
        time: '2024-01-12 08:00',
        status: 'Đang giao hàng',
        location: 'Q.Tân Bình',
      },
      {
        time: '2024-01-12 15:00',
        status: 'Giao không thành công',
        location: 'Q.Tân Bình',
        note: 'Khách từ chối nhận',
      },
      {
        time: '2024-01-13 09:00',
        status: 'Đang hoàn hàng',
        location: 'Trung tâm GHTK',
      },
      { time: '2024-01-14 16:00', status: 'Đã hoàn hàng', location: 'Kho HCM' },
    ],
  },
  {
    id: '6',
    trackingCode: 'GHN777888999',
    orderId: 'ORD-2024-006',
    carrier: 'GHN',
    customerName: 'Vũ Thị F',
    customerPhone: '0956789012',
    address: '987 Nguyễn Văn Cừ, Q.5, TP.HCM',
    status: 'picking',
    codAmount: 950000,
    shippingFee: 22000,
    weight: 0.2,
    createdAt: '2024-01-16 08:00',
    updatedAt: '2024-01-16 08:00',
    expectedDelivery: '2024-01-18',
    history: [
      { time: '2024-01-16 08:00', status: 'Đã tạo đơn', location: 'Kho HCM' },
    ],
  },
];

const mockCODReconciliations: CODReconciliation[] = [
  {
    id: '1',
    carrier: 'GHN',
    period: '01/01/2024 - 15/01/2024',
    totalOrders: 156,
    totalCOD: 245800000,
    shippingFee: 4680000,
    netAmount: 241120000,
    status: 'paid',
    createdAt: '2024-01-16',
    paidAt: '2024-01-18',
  },
  {
    id: '2',
    carrier: 'GHTK',
    period: '01/01/2024 - 15/01/2024',
    totalOrders: 89,
    totalCOD: 142500000,
    shippingFee: 2225000,
    netAmount: 140275000,
    status: 'confirmed',
    createdAt: '2024-01-16',
  },
  {
    id: '3',
    carrier: 'Viettel Post',
    period: '01/01/2024 - 15/01/2024',
    totalOrders: 45,
    totalCOD: 78600000,
    shippingFee: 1260000,
    netAmount: 77340000,
    status: 'pending',
    createdAt: '2024-01-16',
  },
  {
    id: '4',
    carrier: 'GHN',
    period: '16/01/2024 - 31/01/2024',
    totalOrders: 12,
    totalCOD: 18500000,
    shippingFee: 360000,
    netAmount: 18140000,
    status: 'disputed',
    createdAt: '2024-01-20',
  },
];

const statusConfig = {
  picking: { label: 'Chờ lấy', color: 'warning' as const, icon: Clock },
  in_transit: { label: 'Đang vận chuyển', color: 'info' as const, icon: Truck },
  delivering: { label: 'Đang giao', color: 'info' as const, icon: Package },
  delivered: {
    label: 'Đã giao',
    color: 'success' as const,
    icon: CheckCircle2,
  },
  returned: { label: 'Hoàn hàng', color: 'error' as const, icon: RotateCcw },
  failed: { label: 'Giao thất bại', color: 'error' as const, icon: XCircle },
};

const codStatusConfig = {
  pending: { label: 'Chờ đối soát', color: 'warning' as const },
  confirmed: { label: 'Đã xác nhận', color: 'info' as const },
  paid: { label: 'Đã thanh toán', color: 'success' as const },
  disputed: { label: 'Có tranh chấp', color: 'error' as const },
};

const ShippingTracking = () => {
  const [activeTab, setActiveTab] = useState('tracking');
  const [searchQuery, setSearchQuery] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [codDetailModalOpen, setCodDetailModalOpen] = useState(false);
  const [selectedCOD, setSelectedCOD] = useState<CODReconciliation | null>(
    null
  );
  const [selectedShipments] = useState<string[]>([]);

  const filteredShipments = mockShipments.filter((shipment) => {
    const matchesSearch =
      shipment.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customerPhone.includes(searchQuery);
    const matchesCarrier =
      carrierFilter === 'all' || shipment.carrier === carrierFilter;
    const matchesStatus =
      statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesCarrier && matchesStatus;
  });

  const stats = {
    picking: mockShipments.filter((s) => s.status === 'picking').length,
    inTransit: mockShipments.filter(
      (s) => s.status === 'in_transit' || s.status === 'delivering'
    ).length,
    delivered: mockShipments.filter((s) => s.status === 'delivered').length,
    failed: mockShipments.filter(
      (s) => s.status === 'failed' || s.status === 'returned'
    ).length,
    pendingCOD: mockCODReconciliations
      .filter((c) => c.status === 'pending' || c.status === 'confirmed')
      .reduce((sum, c) => sum + c.netAmount, 0),
  };

  //   const toggleShipmentSelection = (id: string) => {
  //     setSelectedShipments((prev) =>
  //       prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  //     );
  //   };

  //   const toggleAllShipments = () => {
  //     if (selectedShipments.length === filteredShipments.length) {
  //       setSelectedShipments([]);
  //     } else {
  //       setSelectedShipments(filteredShipments.map((s) => s.id));
  //     }
  //   };

  const openDetailModal = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setDetailModalOpen(true);
  };

  const openCODDetail = (cod: CODReconciliation) => {
    setSelectedCOD(cod);
    setCodDetailModalOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <>
      <Header
        title="Quản lý Tracking vận chuyển"
        subtitle="Theo dõi trạng thái vận đơn và đối soát COD"
        titleClassName="text-black"
        subtitleClassName="text-black"
      />
      <div className="space-y-6 p-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-warning/10 rounded-lg p-2">
                  <Clock className="text-warning h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Chờ lấy</p>
                  <p className="text-foreground text-xl font-normal">
                    {stats.picking}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Truck className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Đang giao</p>
                  <p className="text-foreground text-xl font-normal">
                    {stats.inTransit}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-success/10 rounded-lg p-2">
                  <CheckCircle2 className="text-success h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Đã giao</p>
                  <p className="text-foreground text-xl font-normal">
                    {stats.delivered}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-destructive/10 rounded-lg p-2">
                  <AlertTriangle className="text-destructive h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Thất bại/Hoàn</p>
                  <p className="text-foreground text-xl font-normal">
                    {stats.failed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-accent/10 rounded-lg p-2">
                  <Banknote className="text-accent-foreground h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">COD chờ TT</p>
                  <p className="text-foreground text-lg font-normal">
                    {formatCurrency(stats.pendingCOD)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="tracking">
              <Truck className="mr-2 h-4 w-4" />
              Tracking vận đơn
            </TabsTrigger>
            <TabsTrigger value="reconciliation">
              <CreditCard className="mr-2 h-4 w-4" />
              Đối soát COD
            </TabsTrigger>
          </TabsList>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <SearchBar
                    placeholder="Tìm mã vận đơn, đơn hàng, khách hàng..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className="flex-1"
                  />
                  <Select
                    value={carrierFilter}
                    onValueChange={setCarrierFilter}
                  >
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Hãng vận chuyển" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả hãng</SelectItem>
                      <SelectItem value="GHN">GHN</SelectItem>
                      <SelectItem value="GHTK">GHTK</SelectItem>
                      <SelectItem value="Viettel Post">Viettel Post</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả trạng thái</SelectItem>
                      <SelectItem value="picking">Chờ lấy</SelectItem>
                      <SelectItem value="in_transit">
                        Đang vận chuyển
                      </SelectItem>
                      <SelectItem value="delivering">Đang giao</SelectItem>
                      <SelectItem value="delivered">Đã giao</SelectItem>
                      <SelectItem value="failed">Giao thất bại</SelectItem>
                      <SelectItem value="returned">Hoàn hàng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã vận đơn</TableHead>
                      <TableHead>Đơn hàng</TableHead>
                      <TableHead>Hãng VC</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">COD</TableHead>
                      <TableHead>Cập nhật</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredShipments.map((shipment) => {
                      const StatusIcon = statusConfig[shipment.status].icon;
                      return (
                        <TableRow key={shipment.id}>
                          <TableCell>
                            <span className="text-foreground font-mono text-sm font-normal">
                              {shipment.trackingCode}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground text-sm">
                              {shipment.orderId}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{shipment.carrier}</Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-foreground font-normal">
                                {shipment.customerName}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                {shipment.customerPhone}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusIcon
                                className={`h-4 w-4 ${
                                  statusConfig[shipment.status].color ===
                                  'success'
                                    ? 'text-success'
                                    : statusConfig[shipment.status].color ===
                                        'warning'
                                      ? 'text-warning'
                                      : statusConfig[shipment.status].color ===
                                          'error'
                                        ? 'text-destructive'
                                        : 'text-primary'
                                }`}
                              />
                              <StatusBadge
                                status={statusConfig[shipment.status].color}
                              >
                                {statusConfig[shipment.status].label}
                              </StatusBadge>
                            </div>
                          </TableCell>
                          <TableCell className="text-foreground text-right font-normal">
                            {formatCurrency(shipment.codAmount)}
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground text-sm">
                              {shipment.updatedAt}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetailModal(shipment)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Bulk Actions */}
            {selectedShipments.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">
                      Đã chọn {selectedShipments.length} vận đơn
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Cập nhật trạng thái
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Xuất danh sách
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* COD Reconciliation Tab */}
          <TabsContent value="reconciliation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Đối soát COD theo kỳ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hãng vận chuyển</TableHead>
                      <TableHead>Kỳ đối soát</TableHead>
                      <TableHead className="text-center">Số đơn</TableHead>
                      <TableHead className="text-right">Tổng COD</TableHead>
                      <TableHead className="text-right">Phí ship</TableHead>
                      <TableHead className="text-right">Thực nhận</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCODReconciliations.map((cod) => (
                      <TableRow key={cod.id}>
                        <TableCell>
                          <Badge variant="outline">{cod.carrier}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-foreground text-sm">
                            {cod.period}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="text-foreground font-normal">
                            {cod.totalOrders}
                          </span>
                        </TableCell>
                        <TableCell className="text-foreground text-right font-normal">
                          {formatCurrency(cod.totalCOD)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right">
                          -{formatCurrency(cod.shippingFee)}
                        </TableCell>
                        <TableCell className="text-success text-right font-normal">
                          {formatCurrency(cod.netAmount)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={codStatusConfig[cod.status].color}
                          >
                            {codStatusConfig[cod.status].label}
                          </StatusBadge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openCODDetail(cod)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-success/10 rounded-lg p-3">
                      <CheckCircle2 className="text-success h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Đã thanh toán
                      </p>
                      <p className="text-success text-xl font-normal">
                        {formatCurrency(
                          mockCODReconciliations
                            .filter((c) => c.status === 'paid')
                            .reduce((sum, c) => sum + c.netAmount, 0)
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-warning/10 rounded-lg p-3">
                      <Clock className="text-warning h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Chờ thanh toán
                      </p>
                      <p className="text-warning text-xl font-normal">
                        {formatCurrency(
                          mockCODReconciliations
                            .filter(
                              (c) =>
                                c.status === 'pending' ||
                                c.status === 'confirmed'
                            )
                            .reduce((sum, c) => sum + c.netAmount, 0)
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-destructive/10 rounded-lg p-3">
                      <AlertCircle className="text-destructive h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Có tranh chấp
                      </p>
                      <p className="text-destructive text-xl font-normal">
                        {formatCurrency(
                          mockCODReconciliations
                            .filter((c) => c.status === 'disputed')
                            .reduce((sum, c) => sum + c.netAmount, 0)
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Shipment Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Chi tiết vận đơn
            </DialogTitle>
          </DialogHeader>
          {selectedShipment && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Mã vận đơn</p>
                  <p className="text-foreground font-mono font-normal">
                    {selectedShipment.trackingCode}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Mã đơn hàng</p>
                  <p className="text-foreground font-normal">
                    {selectedShipment.orderId}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">
                    Hãng vận chuyển
                  </p>
                  <Badge variant="outline">{selectedShipment.carrier}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Trạng thái</p>
                  <StatusBadge
                    status={statusConfig[selectedShipment.status].color}
                  >
                    {statusConfig[selectedShipment.status].label}
                  </StatusBadge>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-foreground mb-3 font-normal">
                  Thông tin người nhận
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-foreground font-normal">
                      {selectedShipment.customerName}
                    </span>
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    {selectedShipment.customerPhone}
                  </div>
                  <div className="text-muted-foreground flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4" />
                    {selectedShipment.address}
                  </div>
                </div>
              </div>

              {/* Shipment Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">
                    Tiền thu hộ (COD)
                  </p>
                  <p className="text-foreground text-lg font-normal">
                    {formatCurrency(selectedShipment.codAmount)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">
                    Phí vận chuyển
                  </p>
                  <p className="text-foreground font-normal">
                    {formatCurrency(selectedShipment.shippingFee)}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Khối lượng</p>
                  <p className="text-foreground font-normal">
                    {selectedShipment.weight} kg
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Dự kiến giao</p>
                  <p className="text-foreground font-normal">
                    {selectedShipment.expectedDelivery}
                  </p>
                </div>
              </div>

              {/* Tracking History */}
              <div>
                <h4 className="text-foreground mb-3 font-normal">
                  Lịch sử vận đơn
                </h4>
                <div className="relative space-y-4 pl-6">
                  <div className="bg-border absolute top-2 bottom-2 left-[9px] w-0.5" />
                  {selectedShipment.history.map((item, index) => (
                    <div key={index} className="relative">
                      <div
                        className={`absolute left-[-18px] h-4 w-4 rounded-full border-2 ${
                          index === selectedShipment.history.length - 1
                            ? 'bg-primary border-primary'
                            : 'bg-background border-border'
                        }`}
                      />
                      <div className="pb-2">
                        <p className="text-foreground text-sm font-normal">
                          {item.status}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {item.time} • {item.location}
                        </p>
                        {item.note && (
                          <p className="text-warning mt-1 text-xs">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              Đóng
            </Button>
            <Button>
              <RefreshCw className="mr-2 h-4 w-4" />
              Cập nhật trạng thái
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sync Modal */}
      <Dialog open={syncModalOpen} onOpenChange={setSyncModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đồng bộ trạng thái vận đơn</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Đồng bộ trạng thái mới nhất từ các hãng vận chuyển cho tất cả vận
              đơn đang xử lý.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Checkbox id="sync-ghn" defaultChecked />
                  <label htmlFor="sync-ghn" className="text-sm font-normal">
                    GHN
                  </label>
                </div>
                <span className="text-muted-foreground text-sm">
                  15 vận đơn
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Checkbox id="sync-ghtk" defaultChecked />
                  <label htmlFor="sync-ghtk" className="text-sm font-normal">
                    GHTK
                  </label>
                </div>
                <span className="text-muted-foreground text-sm">8 vận đơn</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Checkbox id="sync-vtp" defaultChecked />
                  <label htmlFor="sync-vtp" className="text-sm font-normal">
                    Viettel Post
                  </label>
                </div>
                <span className="text-muted-foreground text-sm">5 vận đơn</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSyncModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => setSyncModalOpen(false)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Bắt đầu đồng bộ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* COD Detail Modal */}
      <Dialog open={codDetailModalOpen} onOpenChange={setCodDetailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết đối soát COD</DialogTitle>
          </DialogHeader>
          {selectedCOD && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">
                    Hãng vận chuyển
                  </p>
                  <Badge variant="outline">{selectedCOD.carrier}</Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Kỳ đối soát</p>
                  <p className="text-foreground font-normal">
                    {selectedCOD.period}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Trạng thái</p>
                  <StatusBadge
                    status={codStatusConfig[selectedCOD.status].color}
                  >
                    {codStatusConfig[selectedCOD.status].label}
                  </StatusBadge>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Số đơn hàng</p>
                  <p className="text-foreground font-normal">
                    {selectedCOD.totalOrders} đơn
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 space-y-2 rounded-lg p-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tổng COD thu hộ</span>
                  <span className="text-foreground font-normal">
                    {formatCurrency(selectedCOD.totalCOD)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí vận chuyển</span>
                  <span className="text-destructive">
                    -{formatCurrency(selectedCOD.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-foreground font-normal">Thực nhận</span>
                  <span className="text-success text-lg font-normal">
                    {formatCurrency(selectedCOD.netAmount)}
                  </span>
                </div>
              </div>

              {selectedCOD.paidAt && (
                <div className="text-muted-foreground text-sm">
                  Đã thanh toán ngày: {selectedCOD.paidAt}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCodDetailModalOpen(false)}
            >
              Đóng
            </Button>
            {selectedCOD?.status === 'pending' && (
              <Button>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Xác nhận đối soát
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShippingTracking;
