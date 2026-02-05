'use client';
import { useState } from 'react';
import { DashboardLayout } from '@/components/templates/DashboardLayout';

import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Package,
  Search,
  Filter,
  Plus,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  PackageCheck,
  FileText,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/atoms';
import { Header } from '@/components/organisms/Header';

interface PreorderItem {
  id: string;
  sku: string;
  productName: string;
  variant: string;
  orderedQty: number;
  receivedQty: number;
  pendingQty: number;
}

interface PreorderBatch {
  id: string;
  batchCode: string;
  supplier: string;
  orderDate: string;
  expectedDate: string;
  status: 'pending' | 'in_transit' | 'partial' | 'completed' | 'delayed';
  totalItems: number;
  receivedItems: number;
  items: PreorderItem[];
  notes?: string;
}

const mockBatches: PreorderBatch[] = [
  {
    id: '1',
    batchCode: 'PO-2024-001',
    supplier: 'Luxottica Vietnam',
    orderDate: '2024-01-15',
    expectedDate: '2024-02-01',
    status: 'in_transit',
    totalItems: 50,
    receivedItems: 0,
    items: [
      {
        id: '1-1',
        sku: 'RB-AVI-001',
        productName: 'Ray-Ban Aviator Classic',
        variant: 'Gold/Green - 58mm',
        orderedQty: 20,
        receivedQty: 0,
        pendingQty: 20,
      },
      {
        id: '1-2',
        sku: 'RB-WAY-002',
        productName: 'Ray-Ban Wayfarer',
        variant: 'Black/G-15 - 52mm',
        orderedQty: 15,
        receivedQty: 0,
        pendingQty: 15,
      },
      {
        id: '1-3',
        sku: 'OO-HOL-003',
        productName: 'Oakley Holbrook',
        variant: 'Matte Black - 55mm',
        orderedQty: 15,
        receivedQty: 0,
        pendingQty: 15,
      },
    ],
  },
  {
    id: '2',
    batchCode: 'PO-2024-002',
    supplier: 'EssilorLuxottica',
    orderDate: '2024-01-20',
    expectedDate: '2024-02-10',
    status: 'pending',
    totalItems: 30,
    receivedItems: 0,
    items: [
      {
        id: '2-1',
        sku: 'TF-CAT-001',
        productName: 'Tom Ford Cat Eye',
        variant: 'Havana - 54mm',
        orderedQty: 10,
        receivedQty: 0,
        pendingQty: 10,
      },
      {
        id: '2-2',
        sku: 'PR-LIN-002',
        productName: 'Prada Linea Rossa',
        variant: 'Blue/Silver - 56mm',
        orderedQty: 20,
        receivedQty: 0,
        pendingQty: 20,
      },
    ],
  },
  {
    id: '3',
    batchCode: 'PO-2024-003',
    supplier: 'Zeiss Vietnam',
    orderDate: '2024-01-10',
    expectedDate: '2024-01-25',
    status: 'partial',
    totalItems: 100,
    receivedItems: 60,
    items: [
      {
        id: '3-1',
        sku: 'ZS-PRO-001',
        productName: 'Zeiss Progressive Plus',
        variant: '1.67 Index',
        orderedQty: 50,
        receivedQty: 40,
        pendingQty: 10,
      },
      {
        id: '3-2',
        sku: 'ZS-SV-002',
        productName: 'Zeiss Single Vision',
        variant: '1.60 Index',
        orderedQty: 50,
        receivedQty: 20,
        pendingQty: 30,
      },
    ],
  },
  {
    id: '4',
    batchCode: 'PO-2024-004',
    supplier: 'Hoya Lens Vietnam',
    orderDate: '2024-01-05',
    expectedDate: '2024-01-20',
    status: 'delayed',
    totalItems: 40,
    receivedItems: 0,
    items: [
      {
        id: '4-1',
        sku: 'HY-BLU-001',
        productName: 'Hoya Blue Control',
        variant: '1.60 Index',
        orderedQty: 40,
        receivedQty: 0,
        pendingQty: 40,
      },
    ],
  },
  {
    id: '5',
    batchCode: 'PO-2023-050',
    supplier: 'Luxottica Vietnam',
    orderDate: '2023-12-20',
    expectedDate: '2024-01-10',
    status: 'completed',
    totalItems: 25,
    receivedItems: 25,
    items: [
      {
        id: '5-1',
        sku: 'GC-SQ-001',
        productName: 'Gucci Square Frame',
        variant: 'Black/Gold - 54mm',
        orderedQty: 25,
        receivedQty: 25,
        pendingQty: 0,
      },
    ],
  },
];

const getStatusConfig = (status: PreorderBatch['status']) => {
  switch (status) {
    case 'pending':
      return { label: 'Chờ xử lý', variant: 'secondary' as const, icon: Clock };
    case 'in_transit':
      return {
        label: 'Đang vận chuyển',
        variant: 'default' as const,
        icon: Truck,
      };
    case 'partial':
      return {
        label: 'Nhận một phần',
        variant: 'outline' as const,
        icon: PackageCheck,
      };
    case 'completed':
      return {
        label: 'Hoàn thành',
        variant: 'default' as const,
        icon: CheckCircle2,
      };
    case 'delayed':
      return {
        label: 'Trễ hàng',
        variant: 'destructive' as const,
        icon: AlertTriangle,
      };
    default:
      return { label: status, variant: 'secondary' as const, icon: Package };
  }
};

const PreorderImport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<PreorderBatch | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [receiveQuantities, setReceiveQuantities] = useState<
    Record<string, number>
  >({});
  const [receiveNotes, setReceiveNotes] = useState('');

  const suppliers = [...new Set(mockBatches.map((b) => b.supplier))];

  const filteredBatches = mockBatches.filter((batch) => {
    const matchesSearch =
      batch.batchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || batch.status === statusFilter;
    const matchesSupplier =
      supplierFilter === 'all' || batch.supplier === supplierFilter;
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const stats = {
    total: mockBatches.length,
    pending: mockBatches.filter((b) => b.status === 'pending').length,
    inTransit: mockBatches.filter((b) => b.status === 'in_transit').length,
    delayed: mockBatches.filter((b) => b.status === 'delayed').length,
  };

  const handleOpenDetail = (batch: PreorderBatch) => {
    setSelectedBatch(batch);
    setIsDetailOpen(true);
  };

  const handleOpenReceive = (batch: PreorderBatch) => {
    setSelectedBatch(batch);
    const initialQuantities: Record<string, number> = {};
    batch.items.forEach((item) => {
      initialQuantities[item.id] = 0;
    });
    setReceiveQuantities(initialQuantities);
    setReceiveNotes('');
    setIsReceiveOpen(true);
  };

  //    const handleConfirmReceive = () => {
  //      const totalReceived = Object.values(receiveQuantities).reduce((a, b) => a + b, 0);
  //      if (totalReceived === 0) {
  //        toast({
  //          title: "Lỗi",
  //          description: "Vui lòng nhập số lượng nhận cho ít nhất một sản phẩm",
  //          variant: "destructive",
  //        });
  //        return;
  //      }
  //      toast({
  //        title: "Nhập kho thành công",
  //        description: `Đã nhập ${totalReceived} sản phẩm từ đợt ${selectedBatch?.batchCode}`,
  //      });
  //      setIsReceiveOpen(false);
  //    };

  //    const handleCreateBatch = () => {
  //      toast({
  //        title: "Tạo đợt hàng thành công",
  //        description: "Đợt hàng Pre-order mới đã được tạo",
  //      });
  //      setIsCreateOpen(false);
  //    };

  return (
    <>
      {/* Header */}

      <Header
        title="Nhập hàng Pre-order"
        subtitle="Quản lý và cập nhật hàng Pre-order về kho"
        showAddButton
        addButtonLabel="Tạo đợt hàng mới"
        titleClassName="text-black"
        subtitleClassName="text-black"
      />

      <div className="space-y-6 p-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="bg-primary/10 rounded-lg p-3">
                <Package className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Tổng đợt hàng</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="bg-secondary/50 rounded-lg p-3">
                <Clock className="text-muted-foreground h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Chờ xử lý</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="bg-primary/10 rounded-lg p-3">
                <Truck className="text-primary h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Đang vận chuyển</p>
                <p className="text-2xl font-bold">{stats.inTransit}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="bg-destructive/10 rounded-lg p-3">
                <AlertTriangle className="text-destructive h-5 w-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Trễ hàng</p>
                <p className="text-2xl font-bold">{stats.delayed}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Tìm theo mã đợt, nhà cung cấp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                    <SelectItem value="in_transit">Đang vận chuyển</SelectItem>
                    <SelectItem value="partial">Nhận một phần</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="delayed">Trễ hàng</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={supplierFilter}
                  onValueChange={setSupplierFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Nhà cung cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả NCC</SelectItem>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Batch List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Danh sách đợt hàng Pre-order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã đợt</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Ngày đặt</TableHead>
                  <TableHead>Ngày dự kiến</TableHead>
                  <TableHead>Tiến độ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="w-[56px] text-right">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((batch) => {
                  const statusConfig = getStatusConfig(batch.status);
                  const StatusIcon = statusConfig.icon;
                  const progress = Math.round(
                    (batch.receivedItems / batch.totalItems) * 100
                  );

                  return (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">
                        {batch.batchCode}
                      </TableCell>
                      <TableCell>{batch.supplier}</TableCell>
                      <TableCell>
                        {new Date(batch.orderDate).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        {new Date(batch.expectedDate).toLocaleDateString(
                          'vi-VN'
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="bg-secondary h-2 w-24 rounded-full">
                            <div
                              className="bg-primary h-2 rounded-full"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <span className="text-muted-foreground text-sm">
                            {batch.receivedItems}/{batch.totalItems}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig.variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-black">
                            <DropdownMenuItem
                              onClick={() => handleOpenDetail(batch)}
                              className="text-black"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            {batch.status !== 'completed' && (
                              <DropdownMenuItem
                                onClick={() => handleOpenReceive(batch)}
                                className="text-black"
                              >
                                <PackageCheck className="mr-2 h-4 w-4" />
                                Xác nhận nhập kho
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem>
                              <FileText className="mr-2 h-4 w-4" />
                              Xem chứng từ
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
        <DialogContent className="text-black max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Chi tiết đợt hàng {selectedBatch?.batchCode}
            </DialogTitle>
            <DialogDescription>
              Nhà cung cấp: {selectedBatch?.supplier}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-muted/50 grid grid-cols-2 gap-4 rounded-lg p-4">
              <div>
                <p className="text-muted-foreground text-sm">Ngày đặt hàng</p>
                <p className="font-medium">
                  {selectedBatch &&
                    new Date(selectedBatch.orderDate).toLocaleDateString(
                      'vi-VN'
                    )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Ngày dự kiến về</p>
                <p className="font-medium">
                  {selectedBatch &&
                    new Date(selectedBatch.expectedDate).toLocaleDateString(
                      'vi-VN'
                    )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Tổng sản phẩm</p>
                <p className="font-medium">{selectedBatch?.totalItems}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Đã nhận</p>
                <p className="font-medium">{selectedBatch?.receivedItems}</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Biến thể</TableHead>
                  <TableHead className="text-center">Đặt</TableHead>
                  <TableHead className="text-center">Đã nhận</TableHead>
                  <TableHead className="text-center">Còn lại</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedBatch?.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-sm">
                      {item.sku}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.productName}
                    </TableCell>
                    <TableCell>{item.variant}</TableCell>
                    <TableCell className="text-center">
                      {item.orderedQty}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.receivedQty}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={item.pendingQty > 0 ? 'secondary' : 'default'}
                      >
                        {item.pendingQty}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Đóng
            </Button>
            {selectedBatch?.status !== 'completed' && (
              <Button
                onClick={() => {
                  setIsDetailOpen(false);
                  handleOpenReceive(selectedBatch!);
                }}
              >
                <PackageCheck className="mr-2 h-4 w-4" />
                Xác nhận nhập kho
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive Stock Modal */}
      <Dialog open={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
        <DialogContent className="text-black max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Xác nhận nhập kho - {selectedBatch?.batchCode}
            </DialogTitle>
            <DialogDescription>
              Nhập số lượng thực nhận cho từng sản phẩm
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead>Biến thể</TableHead>
                  <TableHead className="text-center">Còn chờ</TableHead>
                  <TableHead className="w-32">Số lượng nhận</TableHead>
                  <TableHead className="w-12">Đủ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedBatch?.items
                  .filter((item) => item.pendingQty > 0)
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.productName}
                      </TableCell>
                      <TableCell>{item.variant}</TableCell>
                      <TableCell className="text-center">
                        {item.pendingQty}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={item.pendingQty}
                          value={receiveQuantities[item.id] || 0}
                          onChange={(e) =>
                            setReceiveQuantities({
                              ...receiveQuantities,
                              [item.id]: Math.min(
                                Number(e.target.value),
                                item.pendingQty
                              ),
                            })
                          }
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={
                            receiveQuantities[item.id] === item.pendingQty
                          }
                          onCheckedChange={(checked) =>
                            setReceiveQuantities({
                              ...receiveQuantities,
                              [item.id]: checked ? item.pendingQty : 0,
                            })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            <div className="space-y-2">
              <Label>Ghi chú nhập kho</Label>
              <Textarea
                placeholder="Nhập ghi chú về tình trạng hàng hóa, chứng từ..."
                value={receiveNotes}
                onChange={(e) => setReceiveNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReceiveOpen(false)}>
              Hủy
            </Button>
            <Button>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Xác nhận nhập kho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Batch Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tạo đợt hàng Pre-order mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin đợt hàng đặt trước từ nhà cung cấp
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mã đợt hàng</Label>
                <Input placeholder="VD: PO-2024-005" />
              </div>
              <div className="space-y-2">
                <Label>Nhà cung cấp</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn NCC" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier} value={supplier}>
                        {supplier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ngày đặt hàng</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Ngày dự kiến về</Label>
                <Input type="date" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Ghi chú</Label>
              <Textarea placeholder="Thông tin bổ sung về đợt hàng..." />
            </div>
            <div className="rounded-lg border border-dashed p-8 text-center">
              <Package className="text-muted-foreground mx-auto h-8 w-8 opacity-50" />
              <p className="text-muted-foreground mt-2 text-sm">
                Sau khi tạo, bạn có thể thêm sản phẩm vào đợt hàng
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tạo đợt hàng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PreorderImport;
