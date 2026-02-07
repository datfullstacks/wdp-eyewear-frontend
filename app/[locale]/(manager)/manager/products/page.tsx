'use client';

import { useState, useMemo, useCallback } from 'react';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { Button } from '@/components/atoms';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  Eye,
  ShoppingCart,
  AlertTriangle,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Power,
  PowerOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/atoms/Input';

// Types
interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  status: 'active' | 'inactive';
  hasSold: boolean; // Hardcode - future: check from orders
}

type TabType = 'all' | 'active' | 'low-stock' | 'inactive';

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Ray-Ban Aviator Classic',
    brand: 'Ray-Ban',
    price: 4500000,
    stock: 15,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
    category: 'Kính mát',
    status: 'active',
    hasSold: true,
  },
  {
    id: '2',
    name: 'Oakley Holbrook',
    brand: 'Oakley',
    price: 3800000,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
    category: 'Kính mát',
    status: 'active',
    hasSold: true,
  },
  {
    id: '3',
    name: 'Gucci GG0061S',
    brand: 'Gucci',
    price: 8500000,
    stock: 3,
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400',
    category: 'Kính mát',
    status: 'active',
    hasSold: false,
  },
  {
    id: '4',
    name: 'Tom Ford FT5401',
    brand: 'Tom Ford',
    price: 7200000,
    stock: 0,
    image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=400',
    category: 'Gọng kính',
    status: 'inactive',
    hasSold: true,
  },
  {
    id: '5',
    name: 'Persol PO3019S',
    brand: 'Persol',
    price: 5100000,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=400',
    category: 'Kính mát',
    status: 'active',
    hasSold: false,
  },
  {
    id: '6',
    name: 'Cartier CT0012O',
    brand: 'Cartier',
    price: 12000000,
    stock: 2,
    image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=400',
    category: 'Gọng kính',
    status: 'active',
    hasSold: true,
  },
  {
    id: '7',
    name: 'Prada PR 01OS',
    brand: 'Prada',
    price: 6800000,
    stock: 5,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
    category: 'Kính mát',
    status: 'active',
    hasSold: true,
  },
  {
    id: '8',
    name: 'Versace VE4361',
    brand: 'Versace',
    price: 5500000,
    stock: 9,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400',
    category: 'Kính mát',
    status: 'active',
    hasSold: false,
  },
  {
    id: '9',
    name: 'Dolce & Gabbana DG4268',
    brand: 'D&G',
    price: 4200000,
    stock: 7,
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400',
    category: 'Kính mát',
    status: 'active',
    hasSold: true,
  },
  {
    id: '10',
    name: 'Burberry BE4216',
    brand: 'Burberry',
    price: 3900000,
    stock: 11,
    image: 'https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=400',
    category: 'Kính mát',
    status: 'active',
    hasSold: false,
  },
  {
    id: '11',
    name: 'Armani Exchange AX4048S',
    brand: 'Armani',
    price: 2800000,
    stock: 6,
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=400',
    category: 'Kính mát',
    status: 'active',
    hasSold: true,
  },
  {
    id: '12',
    name: 'Boss HG 0985/S',
    brand: 'Hugo Boss',
    price: 4100000,
    stock: 4,
    image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?w=400',
    category: 'Gọng kính',
    status: 'inactive',
    hasSold: true,
  },
];

const categories = ['Kính mát', 'Gọng kính', 'Tròng kính', 'Phụ kiện'];

const ITEMS_PER_PAGE = 10;
const LOW_STOCK_THRESHOLD = 10;

function ProductsPage() {
  // State
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: '',
    stock: '',
    image: '',
    category: '',
  });

  // Stats calculations
  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === 'active').length;
    const lowStock = products.filter(
      (p) => p.stock <= LOW_STOCK_THRESHOLD && p.stock > 0 && p.status === 'active'
    ).length;
    const inactive = products.filter((p) => p.status === 'inactive').length;
    return { total, active, lowStock, inactive };
  }, [products]);

  const productStats = [
    {
      title: 'Tổng sản phẩm',
      value: stats.total.toString(),
      icon: Package,
      trend: { value: 8, isPositive: true },
    },
    {
      title: 'Đang bán',
      value: stats.active.toString(),
      icon: Eye,
      trend: { value: 12, isPositive: true },
    },
    {
      title: 'Sắp hết hàng',
      value: stats.lowStock.toString(),
      icon: AlertTriangle,
      trend: { value: 3, isPositive: false },
    },
    {
      title: 'Ngừng bán',
      value: stats.inactive.toString(),
      icon: ShoppingCart,
      trend: { value: 5, isPositive: false },
    },
  ];

  // Filtered products based on tab
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by search
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by tab
    switch (activeTab) {
      case 'active':
        result = result.filter((p) => p.status === 'active' && p.stock > LOW_STOCK_THRESHOLD);
        break;
      case 'low-stock':
        result = result.filter(
          (p) => p.stock <= LOW_STOCK_THRESHOLD && p.stock > 0 && p.status === 'active'
        );
        break;
      case 'inactive':
        result = result.filter((p) => p.status === 'inactive');
        break;
      default:
        break;
    }

    return result;
  }, [products, activeTab, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handlers
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleOpenCreateDialog = useCallback(() => {
    setFormData({
      name: '',
      brand: '',
      price: '',
      stock: '',
      image: '',
      category: '',
    });
    setIsCreateDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      price: product.price.toString(),
      stock: product.stock.toString(),
      image: product.image,
      category: product.category,
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleOpenDeleteDialog = useCallback((product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleCreateProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      brand: formData.brand,
      price: Number(formData.price),
      stock: Number(formData.stock),
      image: formData.image || 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400',
      category: formData.category,
      status: 'active',
      hasSold: false,
    };
    setProducts([...products, newProduct]);
    setIsCreateDialogOpen(false);
  };

  const handleUpdateProduct = () => {
    if (!selectedProduct) return;
    setProducts(
      products.map((p) =>
        p.id === selectedProduct.id
          ? {
              ...p,
              name: formData.name,
              brand: formData.brand,
              price: Number(formData.price),
              stock: Number(formData.stock),
              image: formData.image,
              category: formData.category,
            }
          : p
      )
    );
    setIsEditDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;

    if (selectedProduct.hasSold) {
      // Product has been sold - only set to inactive
      setProducts(
        products.map((p) =>
          p.id === selectedProduct.id ? { ...p, status: 'inactive' } : p
        )
      );
    } else {
      // Product never sold - can delete
      setProducts(products.filter((p) => p.id !== selectedProduct.id));
    }
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  const handleToggleStatus = (product: Product) => {
    setProducts(
      products.map((p) =>
        p.id === product.id
          ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
          : p
      )
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStockBadge = (stock: number, status: string) => {
    if (status === 'inactive') {
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
          Ngừng bán
        </span>
      );
    }
    if (stock === 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
          Hết hàng
        </span>
      );
    }
    if (stock <= LOW_STOCK_THRESHOLD) {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-600">
          Sắp hết ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-600">
        Còn hàng ({stock})
      </span>
    );
  };

  const formatTabLabel = (label: string, count: number) => {
    // If the entire text is too long, truncate with ellipsis
    const fullText = `${label} (${count})`;
    if (fullText.length > 25) {
      return `${label.substring(0, 20)}... (${count})`;
    }
    return fullText;
  };

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'all', label: 'Tất cả sản phẩm', count: stats.total },
    { id: 'active', label: 'Đang bán', count: stats.active },
    { id: 'low-stock', label: 'Sắp hết hàng', count: stats.lowStock },
    { id: 'inactive', label: 'Ngừng bán', count: stats.inactive },
  ];

  return (
    <>
      <Header
        title="Quản lý Sản phẩm"
        subtitle="Quản lý danh mục và thông tin sản phẩm"
        onAddProduct={handleOpenCreateDialog}
        onSearch={handleSearch}
      />

      <div className="space-y-6 p-6">
        {/* Product Stats */}
        <section className="animate-fade-in">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {productStats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        </section>

        {/* Product Management */}
        <section className="animate-slide-in">
          <div className="rounded-lg border border-gray-200 bg-gray-50">
            {/* Tabs */}
            <div className="border-b border-gray-200 bg-white px-4">
              <nav className="flex space-x-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      'whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                      activeTab === tab.id
                        ? 'border-amber-500 text-amber-600'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    )}
                    title={`${tab.label} (${tab.count})`}
                  >
                    {formatTabLabel(tab.label, tab.count)}
                  </button>
                ))}
              </nav>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-16">Ảnh</TableHead>
                    <TableHead className="min-w-[200px]">Tên sản phẩm</TableHead>
                    <TableHead className="w-28">Thương hiệu</TableHead>
                    <TableHead className="w-32 text-right">Giá</TableHead>
                    <TableHead className="w-28">Danh mục</TableHead>
                    <TableHead className="w-32">Trạng thái</TableHead>
                    <TableHead className="w-32 text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProducts.length === 0 ? (
                    <TableRow className="hover:bg-gray-50">
                      <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                        Không có sản phẩm nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedProducts.map((product) => (
                      <TableRow key={product.id} className="hover:bg-gray-50">
                        <TableCell>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-10 w-10 rounded-md object-cover"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-gray-900">{product.name}</TableCell>
                        <TableCell className="text-gray-700">{product.brand}</TableCell>
                        <TableCell className="text-right font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </TableCell>
                        <TableCell className="text-gray-700">{product.category}</TableCell>
                        <TableCell>{getStockBadge(product.stock, product.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEditDialog(product)}
                              className="h-8 w-8 p-0"
                              title="Chỉnh sửa"
                            >
                              <Edit className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleStatus(product)}
                              className="h-8 w-8 p-0"
                              title={product.status === 'active' ? 'Ngừng bán' : 'Kích hoạt'}
                            >
                              {product.status === 'active' ? (
                                <PowerOff className="h-4 w-4 text-amber-600" />
                              ) : (
                                <Power className="h-4 w-4 text-emerald-600" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenDeleteDialog(product)}
                              className="h-8 w-8 p-0"
                              title={product.hasSold ? 'Ngừng bán' : 'Xóa'}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
                <p className="text-sm text-gray-600">
                  Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} trong{' '}
                  {filteredProducts.length} sản phẩm
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-600">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Create Product Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Thêm sản phẩm mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin sản phẩm mới
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              label="Tên sản phẩm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên sản phẩm"
            />
            <Input
              label="Thương hiệu"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Nhập thương hiệu"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Giá (VNĐ)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
              />
              <Input
                label="Số lượng"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Danh mục
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              label="URL hình ảnh"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleCreateProduct}>
              Thêm sản phẩm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa sản phẩm</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin sản phẩm
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              label="Tên sản phẩm"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nhập tên sản phẩm"
            />
            <Input
              label="Thương hiệu"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              placeholder="Nhập thương hiệu"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Giá (VNĐ)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0"
              />
              <Input
                label="Số lượng"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Danh mục
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input
              label="URL hình ảnh"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="primary" onClick={handleUpdateProduct}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedProduct?.hasSold ? 'Ngừng bán sản phẩm?' : 'Xóa sản phẩm?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProduct?.hasSold
                ? `Sản phẩm "${selectedProduct?.name}" đã được bán nên không thể xóa. Sản phẩm sẽ được chuyển sang trạng thái ngừng bán.`
                : `Bạn có chắc chắn muốn xóa sản phẩm "${selectedProduct?.name}"? Hành động này không thể hoàn tác.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700"
            >
              {selectedProduct?.hasSold ? 'Ngừng bán' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default ProductsPage;
