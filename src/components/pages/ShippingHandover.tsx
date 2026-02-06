'use client';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Package,
  Truck,
  Search,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ClipboardList,
  User,
  Hash,
  PackageCheck,
  Download,
  Eye,
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

type HandoverStatus = 'pending' | 'ready' | 'handed_over' | 'confirmed';
type CarrierType = 'GHN' | 'GHTK' | 'Viettel Post' | 'J&T' | 'Ninja Van';

interface ShipmentForHandover {
  id: string;
  trackingNumber: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  carrier: CarrierType;
  weight: number;
  status: HandoverStatus;
  createdAt: string;
  packageCount: number;
}

interface HandoverBatch {
  id: string;
  carrier: CarrierType;
  shipmentCount: number;
  totalPackages: number;
  totalWeight: number;
  createdAt: string;
  handoverTime: string | null;
  status: HandoverStatus;
  staffName: string;
  carrierStaffName: string | null;
  notes: string;
}

const mockShipments: ShipmentForHandover[] = [
  {
    id: 'SHP-001',
    trackingNumber: 'GHN123456789',
    orderId: 'ORD-001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    address: '123 Nguyễn Huệ, Q1, TP.HCM',
    carrier: 'GHN',
    weight: 0.5,
    status: 'ready',
    createdAt: '06/02/2026 09:30',
    packageCount: 1,
  },
  {
    id: 'SHP-002',
    trackingNumber: 'GHN123456790',
    orderId: 'ORD-002',
    customerName: 'Trần Thị B',
    customerPhone: '0912345678',
    address: '456 Lê Lợi, Q3, TP.HCM',
    carrier: 'GHN',
    weight: 0.8,
    status: 'ready',
    createdAt: '06/02/2026 10:15',
    packageCount: 2,
  },
  {
    id: 'SHP-003',
    trackingNumber: 'GHTK987654321',
    orderId: 'ORD-003',
    customerName: 'Lê Văn C',
    customerPhone: '0923456789',
    address: '789 Trần Hưng Đạo, Q5, TP.HCM',
    carrier: 'GHTK',
    weight: 1.2,
    status: 'ready',
    createdAt: '06/02/2026 11:00',
    packageCount: 1,
  },
  {
    id: 'SHP-004',
    trackingNumber: 'VTP456789123',
    orderId: 'ORD-004',
    customerName: 'Phạm Thị D',
    customerPhone: '0934567890',
    address: '321 Hai Bà Trưng, Q1, TP.HCM',
    carrier: 'Viettel Post',
    weight: 0.6,
    status: 'ready',
    createdAt: '06/02/2026 11:30',
    packageCount: 1,
  },
  {
    id: 'SHP-005',
    trackingNumber: 'GHN123456791',
    orderId: 'ORD-005',
    customerName: 'Hoàng Văn E',
    customerPhone: '0945678901',
    address: '654 Võ Văn Tần, Q3, TP.HCM',
    carrier: 'GHN',
    weight: 0.4,
    status: 'pending',
    createdAt: '06/02/2026 12:00',
    packageCount: 1,
  },
];

const mockBatches: HandoverBatch[] = [
  {
    id: 'HO-001',
    carrier: 'GHN',
    shipmentCount: 15,
    totalPackages: 18,
    totalWeight: 12.5,
    createdAt: '05/02/2026 16:00',
    handoverTime: '05/02/2026 17:30',
    status: 'confirmed',
    staffName: 'Nguyễn Văn X',
    carrierStaffName: 'Trần Văn Y',
    notes: 'Bàn giao đầy đủ, không có vấn đề',
  },
  {
    id: 'HO-002',
    carrier: 'GHTK',
    shipmentCount: 8,
    totalPackages: 10,
    totalWeight: 6.8,
    createdAt: '05/02/2026 16:30',
    handoverTime: '05/02/2026 18:00',
    status: 'confirmed',
    staffName: 'Nguyễn Văn X',
    carrierStaffName: 'Lê Văn Z',
    notes: '',
  },
  {
    id: 'HO-003',
    carrier: 'GHN',
    shipmentCount: 5,
    totalPackages: 7,
    totalWeight: 4.2,
    createdAt: '06/02/2026 08:00',
    handoverTime: null,
    status: 'ready',
    staffName: 'Trần Thị M',
    carrierStaffName: null,
    notes: '',
  },
];

const carrierColors: Record<CarrierType, string> = {
  GHN: 'bg-orange-100 text-orange-700 border-orange-200',
  GHTK: 'bg-green-100 text-green-700 border-green-200',
  'Viettel Post': 'bg-red-100 text-red-700 border-red-200',
  'J&T': 'bg-rose-100 text-rose-700 border-rose-200',
  'Ninja Van': 'bg-red-100 text-red-800 border-red-200',
};

const ShippingHandover = () => {
  const [shipments] = useState<ShipmentForHandover[]>(mockShipments);
  const [batches] = useState<HandoverBatch[]>(mockBatches);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCarrier, setFilterCarrier] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  // Modals
  const [createBatchModal, setCreateBatchModal] = useState(false);
  const [handoverModal, setHandoverModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [printManifestModal, setPrintManifestModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<HandoverBatch | null>(
    null
  );

  // Form states
  const [carrierStaffName, setCarrierStaffName] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');

  const readyShipments = shipments.filter((s) => s.status === 'ready');
  const pendingShipments = shipments.filter((s) => s.status === 'pending');

  const filteredShipments = readyShipments.filter((shipment) => {
    const matchesSearch =
      shipment.trackingNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCarrier =
      filterCarrier === 'all' || shipment.carrier === filterCarrier;
    return matchesSearch && matchesCarrier;
  });

  const groupedByCarrier = filteredShipments.reduce(
    (acc, shipment) => {
      if (!acc[shipment.carrier]) {
        acc[shipment.carrier] = [];
      }
      acc[shipment.carrier].push(shipment);
      return acc;
    },
    {} as Record<CarrierType, ShipmentForHandover[]>
  );

  const toggleSelectShipment = (id: string) => {
    setSelectedShipments((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectAllByCarrier = (carrier: CarrierType) => {
    const carrierShipmentIds =
      groupedByCarrier[carrier]?.map((s) => s.id) || [];
    const allSelected = carrierShipmentIds.every((id) =>
      selectedShipments.includes(id)
    );

    if (allSelected) {
      setSelectedShipments((prev) =>
        prev.filter((id) => !carrierShipmentIds.includes(id))
      );
    } else {
      setSelectedShipments((prev) => [
        ...new Set([...prev, ...carrierShipmentIds]),
      ]);
    }
  };

  const selectedShipmentDetails = shipments.filter((s) =>
    selectedShipments.includes(s.id)
  );
  const selectedTotalWeight = selectedShipmentDetails.reduce(
    (sum, s) => sum + s.weight,
    0
  );
  const selectedTotalPackages = selectedShipmentDetails.reduce(
    (sum, s) => sum + s.packageCount,
    0
  );

  const getStatusBadge = (status: HandoverStatus) => {
    switch (status) {
      case 'pending':
        return <StatusBadge status="warning">Chờ đóng gói</StatusBadge>;
      case 'ready':
        return <StatusBadge status="info">Sẵn sàng</StatusBadge>;
      case 'handed_over':
        return <StatusBadge status="warning">Đã bàn giao</StatusBadge>;
      case 'confirmed':
        return <StatusBadge status="success">Đã xác nhận</StatusBadge>;
    }
  };

  const openBatchDetail = (batch: HandoverBatch) => {
    setSelectedBatch(batch);
    setDetailModal(true);
  };

  const openHandoverModal = (batch: HandoverBatch) => {
    setSelectedBatch(batch);
    setCarrierStaffName('');
    setHandoverNotes('');
    setHandoverModal(true);
  };

  const openPrintManifest = (batch: HandoverBatch) => {
    setSelectedBatch(batch);
    setPrintManifestModal(true);
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
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-warning/10 rounded-lg p-2">
                  <Clock className="text-warning h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Chờ đóng gói</p>
                  <p className="text-2xl font-bold">
                    {pendingShipments.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 rounded-lg p-2">
                  <Package className="text-primary h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Sẵn sàng bàn giao
                  </p>
                  <p className="text-2xl font-bold">{readyShipments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-success/10 rounded-lg p-2">
                  <PackageCheck className="text-success h-5 w-5" />
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Đã bàn giao hôm nay
                  </p>
                  <p className="text-2xl font-bold">
                    {batches.filter((b) => b.status === 'confirmed').length}
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
                  <p className="text-muted-foreground text-sm">Chờ xác nhận</p>
                  <p className="text-2xl font-bold">
                    {batches.filter((b) => b.status === 'ready').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-border flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'pending'
                ? 'text-primary border-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Chờ bàn giao ({readyShipments.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-primary border-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Lịch sử bàn giao
          </button>
        </div>

        {activeTab === 'pending' ? (
          <>
            {/* Search and Filter */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Tìm theo mã vận đơn, đơn hàng, khách hàng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCarrier} onValueChange={setFilterCarrier}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Nhà vận chuyển" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả NVC</SelectItem>
                  <SelectItem value="GHN">GHN</SelectItem>
                  <SelectItem value="GHTK">GHTK</SelectItem>
                  <SelectItem value="Viettel Post">Viettel Post</SelectItem>
                  <SelectItem value="J&T">J&T Express</SelectItem>
                  <SelectItem value="Ninja Van">Ninja Van</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selected Summary */}
            {selectedShipments.length > 0 && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-primary h-5 w-5" />
                        <span className="font-medium">
                          Đã chọn {selectedShipments.length} vận đơn
                        </span>
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {selectedTotalPackages} kiện •{' '}
                        {selectedTotalWeight.toFixed(1)} kg
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedShipments([])}
                      >
                        Bỏ chọn tất cả
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setCreateBatchModal(true)}
                      >
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Tạo phiếu bàn giao
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Grouped Shipments by Carrier */}
            <div className="space-y-6">
              {Object.entries(groupedByCarrier).map(
                ([carrier, carrierShipments]) => {
                  const allSelected = carrierShipments.every((s) =>
                    selectedShipments.includes(s.id)
                  );
                  const someSelected = carrierShipments.some((s) =>
                    selectedShipments.includes(s.id)
                  );

                  return (
                    <Card key={carrier}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={allSelected}
                              ref={(el) => {
                                if (el) {
                                  (
                                    el as HTMLButtonElement & {
                                      indeterminate: boolean;
                                    }
                                  ).indeterminate =
                                    someSelected && !allSelected;
                                }
                              }}
                              onCheckedChange={() =>
                                selectAllByCarrier(carrier as CarrierType)
                              }
                            />
                            <div className="flex items-center gap-2">
                              <Truck className="text-muted-foreground h-5 w-5" />
                              <CardTitle className="text-lg">
                                {carrier}
                              </CardTitle>
                              <span
                                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${carrierColors[carrier as CarrierType]}`}
                              >
                                {carrierShipments.length} vận đơn
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              selectAllByCarrier(carrier as CarrierType)
                            }
                          >
                            {allSelected ? 'Bỏ chọn' : 'Chọn tất cả'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-border border-b">
                                <th className="w-10 px-2 py-2 text-left"></th>
                                <th className="text-muted-foreground px-2 py-2 text-left text-sm font-medium">
                                  Mã vận đơn
                                </th>
                                <th className="text-muted-foreground px-2 py-2 text-left text-sm font-medium">
                                  Đơn hàng
                                </th>
                                <th className="text-muted-foreground px-2 py-2 text-left text-sm font-medium">
                                  Khách hàng
                                </th>
                                <th className="text-muted-foreground px-2 py-2 text-left text-sm font-medium">
                                  Địa chỉ
                                </th>
                                <th className="text-muted-foreground px-2 py-2 text-left text-sm font-medium">
                                  Kiện/KL
                                </th>
                                <th className="text-muted-foreground px-2 py-2 text-left text-sm font-medium">
                                  Trạng thái
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {carrierShipments.map((shipment) => (
                                <tr
                                  key={shipment.id}
                                  className="border-border/50 hover:bg-muted/50 border-b"
                                >
                                  <td className="px-2 py-3">
                                    <Checkbox
                                      checked={selectedShipments.includes(
                                        shipment.id
                                      )}
                                      onCheckedChange={() =>
                                        toggleSelectShipment(shipment.id)
                                      }
                                    />
                                  </td>
                                  <td className="px-2 py-3">
                                    <span className="font-mono text-sm">
                                      {shipment.trackingNumber}
                                    </span>
                                  </td>
                                  <td className="px-2 py-3">
                                    <span className="text-primary font-medium">
                                      {shipment.orderId}
                                    </span>
                                  </td>
                                  <td className="px-2 py-3">
                                    <div>
                                      <p className="font-medium">
                                        {shipment.customerName}
                                      </p>
                                      <p className="text-muted-foreground text-xs">
                                        {shipment.customerPhone}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-2 py-3">
                                    <p className="text-muted-foreground max-w-xs truncate text-sm">
                                      {shipment.address}
                                    </p>
                                  </td>
                                  <td className="px-2 py-3">
                                    <span className="text-sm">
                                      {shipment.packageCount} kiện •{' '}
                                      {shipment.weight} kg
                                    </span>
                                  </td>
                                  <td className="px-2 py-3">
                                    {getStatusBadge(shipment.status)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>

            {Object.keys(groupedByCarrier).length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Package className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <h3 className="mb-2 text-lg font-medium">
                    Không có vận đơn nào
                  </h3>
                  <p className="text-muted-foreground">
                    Chưa có vận đơn nào sẵn sàng để bàn giao
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          /* History Tab */
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử phiếu bàn giao</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-border border-b">
                      <th className="text-muted-foreground px-2 py-3 text-left text-sm font-medium">
                        Mã phiếu
                      </th>
                      <th className="text-muted-foreground px-2 py-3 text-left text-sm font-medium">
                        Nhà vận chuyển
                      </th>
                      <th className="text-muted-foreground px-2 py-3 text-left text-sm font-medium">
                        Số vận đơn
                      </th>
                      <th className="text-muted-foreground px-2 py-3 text-left text-sm font-medium">
                        Tổng kiện/KL
                      </th>
                      <th className="text-muted-foreground px-2 py-3 text-left text-sm font-medium">
                        Thời gian tạo
                      </th>
                      <th className="text-muted-foreground px-2 py-3 text-left text-sm font-medium">
                        Thời gian bàn giao
                      </th>
                      <th className="text-muted-foreground px-2 py-3 text-left text-sm font-medium">
                        Trạng thái
                      </th>
                      <th className="text-muted-foreground px-2 py-3 text-left text-sm font-medium">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((batch) => (
                      <tr
                        key={batch.id}
                        className="border-border/50 hover:bg-muted/50 border-b"
                      >
                        <td className="px-2 py-3">
                          <span className="font-mono font-medium">
                            {batch.id}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <span
                            className={`rounded border px-2 py-1 text-xs font-medium ${carrierColors[batch.carrier]}`}
                          >
                            {batch.carrier}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <span className="font-medium">
                            {batch.shipmentCount}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <span className="text-sm">
                            {batch.totalPackages} kiện • {batch.totalWeight} kg
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <span className="text-muted-foreground text-sm">
                            {batch.createdAt}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <span className="text-sm">
                            {batch.handoverTime || '-'}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          {getStatusBadge(batch.status)}
                        </td>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openBatchDetail(batch)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPrintManifest(batch)}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                            {batch.status === 'ready' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openHandoverModal(batch)}
                              >
                                <PackageCheck className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Batch Modal */}
      <Dialog open={createBatchModal} onOpenChange={setCreateBatchModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tạo phiếu bàn giao</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 space-y-3 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Số vận đơn:
                </span>
                <span className="font-medium">{selectedShipments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Tổng số kiện:
                </span>
                <span className="font-medium">{selectedTotalPackages}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Tổng khối lượng:
                </span>
                <span className="font-medium">
                  {selectedTotalWeight.toFixed(1)} kg
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nhà vận chuyển</label>
              <div className="flex flex-wrap gap-2">
                {[
                  ...new Set(selectedShipmentDetails.map((s) => s.carrier)),
                ].map((carrier) => (
                  <span
                    key={carrier}
                    className={`rounded-full border px-3 py-1 text-sm font-medium ${carrierColors[carrier]}`}
                  >
                    {carrier}:{' '}
                    {
                      selectedShipmentDetails.filter(
                        (s) => s.carrier === carrier
                      ).length
                    }{' '}
                    vận đơn
                  </span>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">
                Lưu ý: Mỗi nhà vận chuyển sẽ tạo 1 phiếu bàn giao riêng
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú</label>
              <Textarea
                placeholder="Ghi chú cho phiếu bàn giao (không bắt buộc)"
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateBatchModal(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={() => {
                setCreateBatchModal(false);
                setSelectedShipments([]);
              }}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Tạo phiếu bàn giao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Handover Confirmation Modal */}
      <Dialog open={handoverModal} onOpenChange={setHandoverModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Xác nhận bàn giao</DialogTitle>
          </DialogHeader>
          {selectedBatch && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 space-y-2 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Hash className="text-muted-foreground h-4 w-4" />
                  <span className="font-mono font-medium">
                    {selectedBatch.id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="text-muted-foreground h-4 w-4" />
                  <span>{selectedBatch.carrier}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="text-muted-foreground h-4 w-4" />
                  <span>
                    {selectedBatch.shipmentCount} vận đơn •{' '}
                    {selectedBatch.totalPackages} kiện •{' '}
                    {selectedBatch.totalWeight} kg
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Tên nhân viên NVC nhận hàng *
                </label>
                <Input
                  placeholder="Nhập tên nhân viên nhà vận chuyển"
                  value={carrierStaffName}
                  onChange={(e) => setCarrierStaffName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ghi chú bàn giao</label>
                <Textarea
                  placeholder="Ghi chú thêm (không bắt buộc)"
                  value={handoverNotes}
                  onChange={(e) => setHandoverNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setHandoverModal(false)}>
              Hủy
            </Button>
            <Button
              onClick={() => setHandoverModal(false)}
              disabled={!carrierStaffName}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Xác nhận bàn giao
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Detail Modal */}
      <Dialog open={detailModal} onOpenChange={setDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết phiếu bàn giao</DialogTitle>
          </DialogHeader>
          {selectedBatch && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Mã phiếu</p>
                  <p className="font-mono font-medium">{selectedBatch.id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Trạng thái</p>
                  {getStatusBadge(selectedBatch.status)}
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">
                    Nhà vận chuyển
                  </p>
                  <span
                    className={`inline-flex rounded border px-2 py-1 text-sm font-medium ${carrierColors[selectedBatch.carrier]}`}
                  >
                    {selectedBatch.carrier}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Số lượng</p>
                  <p className="font-medium">
                    {selectedBatch.shipmentCount} vận đơn •{' '}
                    {selectedBatch.totalPackages} kiện
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">
                    Tổng khối lượng
                  </p>
                  <p className="font-medium">{selectedBatch.totalWeight} kg</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-sm">Thời gian tạo</p>
                  <p>{selectedBatch.createdAt}</p>
                </div>
              </div>

              <div className="border-border border-t pt-4">
                <h4 className="mb-3 flex items-center gap-2 font-medium">
                  <User className="h-4 w-4" />
                  Thông tin bàn giao
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">
                      Nhân viên lập phiếu
                    </p>
                    <p className="font-medium">{selectedBatch.staffName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">
                      NV NVC nhận hàng
                    </p>
                    <p className="font-medium">
                      {selectedBatch.carrierStaffName || '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">
                      Thời gian bàn giao
                    </p>
                    <p>{selectedBatch.handoverTime || '-'}</p>
                  </div>
                  {selectedBatch.notes && (
                    <div className="col-span-2 space-y-1">
                      <p className="text-muted-foreground text-sm">Ghi chú</p>
                      <p>{selectedBatch.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModal(false)}>
              Đóng
            </Button>
            {selectedBatch && (
              <Button
                onClick={() => {
                  setDetailModal(false);
                  openPrintManifest(selectedBatch);
                }}
              >
                <Printer className="mr-2 h-4 w-4" />
                In phiếu bàn giao
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Print Manifest Modal */}
      <Dialog open={printManifestModal} onOpenChange={setPrintManifestModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>In phiếu bàn giao</DialogTitle>
          </DialogHeader>
          {selectedBatch && (
            <div className="space-y-4 py-4">
              <div className="bg-muted/50 space-y-2 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Mã phiếu:
                  </span>
                  <span className="font-mono font-medium">
                    {selectedBatch.id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Nhà vận chuyển:
                  </span>
                  <span className="font-medium">{selectedBatch.carrier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">
                    Số vận đơn:
                  </span>
                  <span className="font-medium">
                    {selectedBatch.shipmentCount}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Khổ giấy in</label>
                <Select defaultValue="a4">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a4">A4 (210 x 297 mm)</SelectItem>
                    <SelectItem value="a5">A5 (148 x 210 mm)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nội dung in</label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="include-list" defaultChecked />
                    <label htmlFor="include-list" className="text-sm">
                      Danh sách vận đơn chi tiết
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="include-summary" defaultChecked />
                    <label htmlFor="include-summary" className="text-sm">
                      Thông tin tổng hợp
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="include-signature" defaultChecked />
                    <label htmlFor="include-signature" className="text-sm">
                      Phần ký nhận
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPrintManifestModal(false)}
            >
              Hủy
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Tải PDF
            </Button>
            <Button onClick={() => setPrintManifestModal(false)}>
              <Printer className="mr-2 h-4 w-4" />
              In phiếu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ShippingHandover;
