'use client';
import { useState } from 'react';
import { SearchBar } from '@/components/molecules/SearchBar';
import { StatCard } from '@/components/molecules/StatCard';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Input } from '@/components/atoms';
import { Header } from '@/components/organisms/Header';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  variant: string;
  stock: number;
  reserved: number;
  available: number;
  minStock: number;
  maxStock: number;
  location: string;
  lastUpdated: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'overstock';
}

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    sku: 'RB-AVI-001',
    name: 'Ray-Ban Aviator Classic',
    brand: 'Ray-Ban',
    category: 'Gọng kính',
    variant: 'Vàng / Size 58',
    stock: 25,
    reserved: 3,
    available: 22,
    minStock: 10,
    maxStock: 50,
    location: 'Kệ A1-02',
    lastUpdated: '2024-01-15 09:30',
    status: 'in_stock',
  },
  {
    id: '2',
    sku: 'GC-OPT-002',
    name: 'Gucci Optical Frame',
    brand: 'Gucci',
    category: 'Gọng kính',
    variant: 'Đen / Size 52',
    stock: 5,
    reserved: 2,
    available: 3,
    minStock: 10,
    maxStock: 30,
    location: 'Kệ B2-05',
    lastUpdated: '2024-01-14 14:20',
    status: 'low_stock',
  },
  {
    id: '3',
    sku: 'OO-HLFJ-003',
    name: 'Oakley Half Jacket 2.0',
    brand: 'Oakley',
    category: 'Kính thể thao',
    variant: 'Đen mờ / Prizm',
    stock: 0,
    reserved: 0,
    available: 0,
    minStock: 5,
    maxStock: 20,
    location: 'Kệ C1-03',
    lastUpdated: '2024-01-10 11:00',
    status: 'out_of_stock',
  },
  {
    id: '4',
    sku: 'ES-PROG-001',
    name: 'Essilor Progressive Lens',
    brand: 'Essilor',
    category: 'Tròng kính',
    variant: '1.67 / Crizal',
    stock: 45,
    reserved: 5,
    available: 40,
    minStock: 20,
    maxStock: 40,
    location: 'Kho tròng',
    lastUpdated: '2024-01-15 08:00',
    status: 'overstock',
  },
  {
    id: '5',
    sku: 'PR-SUN-004',
    name: 'Prada Sunglasses',
    brand: 'Prada',
    category: 'Kính râm',
    variant: 'Havana / Brown',
    stock: 8,
    reserved: 1,
    available: 7,
    minStock: 5,
    maxStock: 15,
    location: 'Kệ D1-01',
    lastUpdated: '2024-01-13 16:45',
    status: 'in_stock',
  },
  {
    id: '6',
    sku: 'ZS-BLU-002',
    name: 'Zeiss Blue Protect Lens',
    brand: 'Zeiss',
    category: 'Tròng kính',
    variant: '1.60 / BlueGuard',
    stock: 3,
    reserved: 3,
    available: 0,
    minStock: 15,
    maxStock: 40,
    location: 'Kho tròng',
    lastUpdated: '2024-01-12 10:30',
    status: 'low_stock',
  },
];

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedItem] = useState<InventoryItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [editStock, setEditStock] = useState('');

  const filteredInventory = mockInventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory =
      categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: mockInventory.length,
    inStock: mockInventory.filter((i) => i.status === 'in_stock').length,
    lowStock: mockInventory.filter((i) => i.status === 'low_stock').length,
    outOfStock: mockInventory.filter((i) => i.status === 'out_of_stock').length,
  };

  const getStatusBadge = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return <StatusBadge status="success">Còn hàng</StatusBadge>;
      case 'low_stock':
        return <StatusBadge status="warning">Sắp hết</StatusBadge>;
      case 'out_of_stock':
        return <StatusBadge status="error">Hết hàng</StatusBadge>;
      case 'overstock':
        return <StatusBadge status="info">Tồn nhiều</StatusBadge>;
    }
  };

  //    const handleUpdateStock = () => {
  //      toast({
  //        title: "Cập nhật thành công",
  //        description: `Đã cập nhật tồn kho cho ${selectedItem?.name}`,
  //      });
  //      setIsEditOpen(false);
  //    };

  return (
    <>
      <Header
        title="Tồn kho & Tình trạng hàng"
        subtitle="Quản lý và theo dõi tình trạng tồn kho sản phẩm"
        showAddButton
        addButtonLabel="Thêm sản phẩm"
        titleClassName="text-black"
        subtitleClassName="text-black"
      />
      <div className="space-y-6 p-6">
        {/* Header */}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tổng sản phẩm"
            value={stats.total.toString()}
            icon={Package}
            trend={{ value: 12, isPositive: true }}
            iconColor="text-success"
          />
          <StatCard
            title="Còn hàng"
            value={stats.inStock.toString()}
            icon={CheckCircle}
            iconColor="text-success"
          />
          <StatCard
            title="Sắp hết hàng"
            value={stats.lowStock.toString()}
            icon={AlertTriangle}
            iconColor="text-warning"
          />
          <StatCard
            title="Hết hàng"
            value={stats.outOfStock.toString()}
            icon={XCircle}
            iconColor="text-destructive"
          />
        </div>

        {/* Filters */}
        <div className="glass-card rounded-xl p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <SearchBar
                placeholder="Tìm theo tên, SKU, thương hiệu..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[160px] text-black data-[placeholder]:text-black">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-medium text-black">
                    Tất cả trạng thái
                  </SelectItem>
                  <SelectItem value="in_stock">Còn hàng</SelectItem>
                  <SelectItem value="low_stock">Sắp hết</SelectItem>
                  <SelectItem value="out_of_stock">Hết hàng</SelectItem>
                  <SelectItem value="overstock">Tồn nhiều</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px] text-black data-[placeholder]:text-black">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value="all"
                    className="text-foreground font-medium"
                  >
                    Tất cả danh mục
                  </SelectItem>
                  <SelectItem value="Gọng kính">Gọng kính</SelectItem>
                  <SelectItem value="Tròng kính">Tròng kính</SelectItem>
                  <SelectItem value="Kính râm">Kính râm</SelectItem>
                  <SelectItem value="Kính thể thao">Kính thể thao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="glass-card overflow-hidden rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[120px]">SKU</TableHead>
                <TableHead>Sản phẩm</TableHead>
                <TableHead>Biến thể</TableHead>
                <TableHead className="text-center">Tồn kho</TableHead>
                <TableHead className="text-center">Đã giữ</TableHead>
                <TableHead className="text-center">Có thể bán</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30">
                  <TableCell className="text-foreground font-mono text-sm font-semibold">
                    {item.sku}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-foreground font-medium">{item.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {item.brand} • {item.category}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {item.variant}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-foreground font-semibold">
                        {item.stock}
                      </span>
                      {item.stock > item.minStock ? (
                        <TrendingUp className="text-success h-4 w-4" />
                      ) : (
                        <TrendingDown className="text-destructive h-4 w-4" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-center">
                    {item.reserved}
                  </TableCell>
                  <TableCell className="text-primary text-center font-semibold">
                    {item.available}
                  </TableCell>
                  <TableCell className="text-foreground text-sm font-medium">
                    {item.location}
                  </TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Detail Modal */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Chi tiết tồn kho</DialogTitle>
              <DialogDescription>{selectedItem?.sku}</DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Sản phẩm</p>
                    <p className="font-medium">{selectedItem.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Thương hiệu</p>
                    <p className="font-medium">{selectedItem.brand}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Danh mục</p>
                    <p className="font-medium">{selectedItem.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Biến thể</p>
                    <p className="font-medium">{selectedItem.variant}</p>
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="mb-3 font-semibold">Thông tin tồn kho</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="glass-card rounded-lg p-3 text-center">
                      <p className="text-foreground text-2xl font-bold">
                        {selectedItem.stock}
                      </p>
                      <p className="text-muted-foreground text-xs">Tồn kho</p>
                    </div>
                    <div className="glass-card rounded-lg p-3 text-center">
                      <p className="text-warning text-2xl font-bold">
                        {selectedItem.reserved}
                      </p>
                      <p className="text-muted-foreground text-xs">Đã giữ</p>
                    </div>
                    <div className="glass-card rounded-lg p-3 text-center">
                      <p className="text-primary text-2xl font-bold">
                        {selectedItem.available}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Có thể bán
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Tồn tối thiểu
                    </p>
                    <p className="font-medium">{selectedItem.minStock}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Tồn tối đa</p>
                    <p className="font-medium">{selectedItem.maxStock}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Vị trí kho</p>
                    <p className="font-medium">{selectedItem.location}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Cập nhật lần cuối
                    </p>
                    <p className="font-medium">{selectedItem.lastUpdated}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Stock Modal */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cập nhật tồn kho</DialogTitle>
              <DialogDescription>
                {selectedItem?.name} ({selectedItem?.sku})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">
                    Tồn kho hiện tại
                  </label>
                  <p className="text-2xl font-bold">{selectedItem?.stock}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Số lượng mới</label>
                  <Input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Lý do điều chỉnh</label>
                <Select defaultValue="adjust">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adjust">Điều chỉnh kiểm kê</SelectItem>
                    <SelectItem value="import">Nhập hàng</SelectItem>
                    <SelectItem value="return">Hàng trả về</SelectItem>
                    <SelectItem value="damage">Hàng hư hỏng</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleUpdateStock}>Cập nhật</Button>
            </DialogFooter> */}
          </DialogContent>
        </Dialog>

        {/* History Modal */}
        <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Lịch sử xuất nhập kho</DialogTitle>
              <DialogDescription>
                {selectedItem?.name} ({selectedItem?.sku})
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[400px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead className="text-center">Số lượng</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead>Người thực hiện</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-sm">15/01/2024 09:30</TableCell>
                    <TableCell>
                      <StatusBadge status="success">Nhập kho</StatusBadge>
                    </TableCell>
                    <TableCell className="text-success text-center font-medium">
                      +10
                    </TableCell>
                    <TableCell className="text-sm">
                      Nhập hàng đợt 01/2024
                    </TableCell>
                    <TableCell className="text-sm">Nguyễn Văn A</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm">14/01/2024 14:20</TableCell>
                    <TableCell>
                      <StatusBadge status="error">Xuất kho</StatusBadge>
                    </TableCell>
                    <TableCell className="text-destructive text-center font-medium">
                      -2
                    </TableCell>
                    <TableCell className="text-sm">
                      Đơn hàng #ORD-2024-0142
                    </TableCell>
                    <TableCell className="text-sm">Trần Thị B</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm">13/01/2024 11:00</TableCell>
                    <TableCell>
                      <StatusBadge status="warning">Điều chỉnh</StatusBadge>
                    </TableCell>
                    <TableCell className="text-warning text-center font-medium">
                      -1
                    </TableCell>
                    <TableCell className="text-sm">Kiểm kê cuối tuần</TableCell>
                    <TableCell className="text-sm">Lê Văn C</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm">10/01/2024 08:00</TableCell>
                    <TableCell>
                      <StatusBadge status="success">Nhập kho</StatusBadge>
                    </TableCell>
                    <TableCell className="text-success text-center font-medium">
                      +20
                    </TableCell>
                    <TableCell className="text-sm">
                      Nhập hàng Pre-order
                    </TableCell>
                    <TableCell className="text-sm">Nguyễn Văn A</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Inventory;
