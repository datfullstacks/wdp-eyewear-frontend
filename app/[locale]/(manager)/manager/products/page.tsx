'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { Button } from '@/components/atoms';
import { Input } from '@/components/atoms/Input';
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
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Package,
  Power,
  PowerOff,
  ShoppingCart,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  productApi,
  uploadApi,
  type Product,
  type ProductMediaAsset,
  type ProductUpsertInput,
} from '@/api';

type TabType = 'all' | 'active' | 'low-stock' | 'inactive';

interface ProductFormState {
  name: string;
  brand: string;
  price: string;
  stock: string;
  category: string;
  description: string;
  heroImageUrl: string;
  thumbnailUrl: string;
  galleryUrls: string[];
}

const CATEGORY_OPTIONS = [
  { value: 'sunglasses', label: 'Kinh mat' },
  { value: 'frame', label: 'Gong kinh' },
  { value: 'lens', label: 'Trong kinh' },
  { value: 'accessory', label: 'Phu kien' },
  { value: 'other', label: 'Khac' },
];

const CATEGORY_LABEL_MAP = new Map(CATEGORY_OPTIONS.map((c) => [c.value, c.label]));
const ITEMS_PER_PAGE = 10;
const LOW_STOCK_THRESHOLD = 10;
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400';

const EMPTY_FORM: ProductFormState = {
  name: '',
  brand: '',
  price: '',
  stock: '',
  category: 'sunglasses',
  description: '',
  heroImageUrl: '',
  thumbnailUrl: '',
  galleryUrls: [],
};

function getRoleUrl(product: Product, role: ProductMediaAsset['role']) {
  return product.mediaAssets.find((asset) => asset.role === role)?.url || '';
}

function getGalleryUrls(product: Product) {
  return product.mediaAssets
    .filter((asset) => asset.role === 'gallery')
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((asset) => asset.url);
}

function normalizeCategoryValue(category: string) {
  if (!category) return 'other';
  if (CATEGORY_LABEL_MAP.has(category)) return category;

  const lower = category.toLowerCase();
  if (lower.includes('sunglass') || lower.includes('kinh') || lower.includes('mat')) {
    return 'sunglasses';
  }
  if (lower.includes('frame') || lower.includes('gong')) return 'frame';
  if (lower.includes('lens') || lower.includes('trong')) return 'lens';
  if (lower.includes('accessory') || lower.includes('phu')) return 'accessory';
  return 'other';
}

function getCategoryLabel(category: string) {
  return CATEGORY_LABEL_MAP.get(normalizeCategoryValue(category)) || category || 'Khac';
}

function buildMediaAssets(form: ProductFormState): ProductMediaAsset[] {
  const assets: ProductMediaAsset[] = [];

  if (form.heroImageUrl) {
    assets.push({
      assetType: '2d',
      role: 'hero',
      url: form.heroImageUrl,
      order: 0,
    });
  }

  if (form.thumbnailUrl) {
    assets.push({
      assetType: '2d',
      role: 'thumbnail',
      url: form.thumbnailUrl,
      order: assets.length,
    });
  }

  form.galleryUrls.forEach((url) => {
    assets.push({
      assetType: '2d',
      role: 'gallery',
      url,
      order: assets.length,
    });
  });

  return assets;
}

function buildUpsertPayload(form: ProductFormState): ProductUpsertInput {
  return {
    name: form.name.trim(),
    brand: form.brand.trim(),
    category: normalizeCategoryValue(form.category),
    description: form.description.trim(),
    price: Number(form.price || 0),
    stock: Number(form.stock || 0),
    imageUrl: form.heroImageUrl || form.thumbnailUrl,
    mediaAssets: buildMediaAssets(form),
  };
}

function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');
  const [apiError, setApiError] = useState('');

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormState>(EMPTY_FORM);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const response = await productApi.getAll({ page: 1, limit: 200 });
      setProducts(response.products);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to load products';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === 'active').length;
    const lowStock = products.filter(
      (p) => p.status === 'active' && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
    ).length;
    const inactive = products.filter((p) => p.status !== 'active').length;
    return { total, active, lowStock, inactive };
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          getCategoryLabel(p.category).toLowerCase().includes(q)
      );
    }

    switch (activeTab) {
      case 'active':
        result = result.filter((p) => p.status === 'active' && p.stock > LOW_STOCK_THRESHOLD);
        break;
      case 'low-stock':
        result = result.filter(
          (p) => p.status === 'active' && p.stock > 0 && p.stock <= LOW_STOCK_THRESHOLD
        );
        break;
      case 'inactive':
        result = result.filter((p) => p.status !== 'active');
        break;
      default:
        break;
    }

    return result;
  }, [products, activeTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const productStats = [
    {
      title: 'Tong san pham',
      value: String(stats.total),
      icon: Package,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Dang ban',
      value: String(stats.active),
      icon: Eye,
      trend: { value: 0, isPositive: true },
    },
    {
      title: 'Sap het hang',
      value: String(stats.lowStock),
      icon: AlertTriangle,
      trend: { value: 0, isPositive: false },
    },
    {
      title: 'Ngung ban',
      value: String(stats.inactive),
      icon: ShoppingCart,
      trend: { value: 0, isPositive: false },
    },
  ];

  const resetForm = () => {
    setFormData(EMPTY_FORM);
  };

  const handleOpenCreateDialog = useCallback(() => {
    setApiError('');
    resetForm();
    setIsCreateDialogOpen(true);
  }, []);

  const handleOpenEditDialog = useCallback((product: Product) => {
    setApiError('');
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      price: String(product.price),
      stock: String(product.stock),
      category: normalizeCategoryValue(product.category),
      description: product.description || '',
      heroImageUrl: getRoleUrl(product, 'hero') || product.imageUrl,
      thumbnailUrl: getRoleUrl(product, 'thumbnail'),
      galleryUrls: getGalleryUrls(product),
    });
    setIsEditDialogOpen(true);
  }, []);

  const handleOpenDeleteDialog = useCallback((product: Product) => {
    setApiError('');
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  }, []);

  const validateForm = () => {
    if (!formData.name.trim() || !formData.brand.trim()) {
      setApiError('Please enter product name and brand');
      return false;
    }
    if (Number(formData.price) <= 0) {
      setApiError('Price must be greater than 0');
      return false;
    }
    if (Number(formData.stock) < 0) {
      setApiError('Stock quantity is invalid');
      return false;
    }
    return true;
  };

  const getUploadFolder = (
    category: string,
    role: ProductMediaAsset['role']
  ) => `products/${normalizeCategoryValue(category)}/${role}`;

  const handleUploadSingle = async (
    file: File,
    role: 'hero' | 'thumbnail'
  ) => {
    setUploadingKey(role);
    setApiError('');
    try {
      const uploaded = await uploadApi.uploadFile(file, {
        folder: getUploadFolder(formData.category, role),
      });
      if (role === 'hero') {
        setFormData((prev) => ({ ...prev, heroImageUrl: uploaded.url }));
      } else {
        setFormData((prev) => ({ ...prev, thumbnailUrl: uploaded.url }));
      }
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to upload image';
      setApiError(message);
    } finally {
      setUploadingKey('');
    }
  };

  const handleUploadGallery = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingKey('gallery');
    setApiError('');
    try {
      const uploads = await Promise.all(
        Array.from(files).map((file) =>
          uploadApi.uploadFile(file, {
            folder: getUploadFolder(formData.category, 'gallery'),
          })
        )
      );

      setFormData((prev) => ({
        ...prev,
        galleryUrls: [...prev.galleryUrls, ...uploads.map((item) => item.url)],
      }));
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to upload gallery images';
      setApiError(message);
    } finally {
      setUploadingKey('');
    }
  };

  const handleCreateProduct = async () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    setApiError('');
    try {
      const created = await productApi.create(buildUpsertPayload(formData));
      setProducts((prev) => [created, ...prev]);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to create product';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct || !validateForm()) return;
    setIsSubmitting(true);
    setApiError('');
    try {
      const updated = await productApi.update(
        selectedProduct.id,
        buildUpsertPayload(formData)
      );
      setProducts((prev) => prev.map((p) => (p.id === selectedProduct.id ? updated : p)));
      setIsEditDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to update product';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);
    setApiError('');
    try {
      if (selectedProduct.hasSold) {
        const updated = await productApi.updateStatus(selectedProduct.id, 'inactive');
        setProducts((prev) =>
          prev.map((p) => (p.id === selectedProduct.id ? updated : p))
        );
      } else {
        await productApi.remove(selectedProduct.id);
        setProducts((prev) => prev.filter((p) => p.id !== selectedProduct.id));
      }
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to delete product';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    setIsSubmitting(true);
    setApiError('');
    try {
      const nextStatus = product.status === 'active' ? 'inactive' : 'active';
      const updated = await productApi.updateStatus(product.id, nextStatus);
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } }; message?: string })?.response
          ?.data?.message ||
        (error as { message?: string })?.message ||
        'Failed to update status';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);

  const getStockBadge = (stock: number, status: Product['status']) => {
    if (status !== 'active') {
      return (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
          Ngung ban
        </span>
      );
    }
    if (stock === 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-600">
          Het hang
        </span>
      );
    }
    if (stock <= LOW_STOCK_THRESHOLD) {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
          Sap het ({stock})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
        Con hang ({stock})
      </span>
    );
  };

  return (
    <>
      <Header
        title="Quan ly san pham"
        subtitle="CRUD production + upload anh Supabase theo loai"
        onAddProduct={handleOpenCreateDialog}
        onSearch={(query) => {
          setSearchQuery(query);
          setCurrentPage(1);
        }}
      />

      <div className="space-y-6 p-6">
        {apiError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiError}
          </div>
        )}

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {productStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </section>

        <section className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-4">
            <nav className="flex space-x-2 overflow-x-auto">
              {[
                { id: 'all' as const, label: 'Tat ca', count: stats.total },
                { id: 'active' as const, label: 'Dang ban', count: stats.active },
                { id: 'low-stock' as const, label: 'Sap het', count: stats.lowStock },
                { id: 'inactive' as const, label: 'Ngung ban', count: stats.inactive },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    'whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'border-amber-500 text-amber-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  )}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="w-16">Anh</TableHead>
                  <TableHead className="min-w-[200px]">Ten san pham</TableHead>
                  <TableHead className="w-28">Thuong hieu</TableHead>
                  <TableHead className="w-28">Danh muc</TableHead>
                  <TableHead className="w-32 text-right">Gia</TableHead>
                  <TableHead className="w-36">Trang thai</TableHead>
                  <TableHead className="w-32 text-center">Thao tac</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                      {isLoading ? 'Dang tai san pham...' : 'Khong co san pham nao'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50">
                      <TableCell>
                        <img
                          src={product.imageUrl || FALLBACK_IMAGE}
                          alt={product.name}
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">{product.name}</TableCell>
                      <TableCell className="text-gray-700">{product.brand}</TableCell>
                      <TableCell className="text-gray-700">
                        {getCategoryLabel(product.category)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-gray-900">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell>{getStockBadge(product.stock, product.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditDialog(product)}
                            disabled={isSubmitting}
                            className="h-8 w-8 p-0"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleToggleStatus(product)}
                            disabled={isSubmitting}
                            className="h-8 w-8 p-0"
                            title={product.status === 'active' ? 'Deactivate' : 'Activate'}
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
                            disabled={isSubmitting}
                            className="h-8 w-8 p-0"
                            title="Delete"
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3">
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of{' '}
                {filteredProducts.length}
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
                  {currentPage} / {totalPages}
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
        </section>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create product</DialogTitle>
            <DialogDescription>
              Upload images to Supabase and organize by role for UI rendering.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            formData={formData}
            isSubmitting={isSubmitting}
            uploadingKey={uploadingKey}
            onChange={setFormData}
            onUploadSingle={handleUploadSingle}
            onUploadGallery={handleUploadGallery}
            onRemoveGallery={(index) =>
              setFormData((prev) => ({
                ...prev,
                galleryUrls: prev.galleryUrls.filter((_, idx) => idx !== index),
              }))
            }
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleCreateProduct()}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto bg-white sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit product</DialogTitle>
            <DialogDescription>Update product details and media roles.</DialogDescription>
          </DialogHeader>
          <ProductForm
            formData={formData}
            isSubmitting={isSubmitting}
            uploadingKey={uploadingKey}
            onChange={setFormData}
            onUploadSingle={handleUploadSingle}
            onUploadGallery={handleUploadGallery}
            onRemoveGallery={(index) =>
              setFormData((prev) => ({
                ...prev,
                galleryUrls: prev.galleryUrls.filter((_, idx) => idx !== index),
              }))
            }
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => void handleUpdateProduct()}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProduct?.hasSold
                ? 'This product has sales history. It will be set inactive instead of hard delete.'
                : `Delete "${selectedProduct?.name}" permanently?`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteProduct()}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Processing...' : selectedProduct?.hasSold ? 'Deactivate' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ProductForm({
  formData,
  isSubmitting,
  uploadingKey,
  onChange,
  onUploadSingle,
  onUploadGallery,
  onRemoveGallery,
}: {
  formData: ProductFormState;
  isSubmitting: boolean;
  uploadingKey: string;
  onChange: Dispatch<SetStateAction<ProductFormState>>;
  onUploadSingle: (file: File, role: 'hero' | 'thumbnail') => Promise<void>;
  onUploadGallery: (files: FileList | null) => Promise<void>;
  onRemoveGallery: (index: number) => void;
}) {
  return (
    <div className="grid gap-4 py-2">
      <Input
        label="Product name"
        value={formData.name}
        onChange={(event) => onChange((prev) => ({ ...prev, name: event.target.value }))}
        placeholder="Enter product name"
      />

      <Input
        label="Brand"
        value={formData.brand}
        onChange={(event) => onChange((prev) => ({ ...prev, brand: event.target.value }))}
        placeholder="Enter brand"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price (VND)"
          type="number"
          value={formData.price}
          onChange={(event) => onChange((prev) => ({ ...prev, price: event.target.value }))}
          placeholder="0"
        />
        <Input
          label="Stock"
          type="number"
          value={formData.stock}
          onChange={(event) => onChange((prev) => ({ ...prev, stock: event.target.value }))}
          placeholder="0"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
        <Select
          value={formData.category}
          onValueChange={(value) => onChange((prev) => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Description</label>
        <textarea
          value={formData.description}
          onChange={(event) =>
            onChange((prev) => ({ ...prev, description: event.target.value }))
          }
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          placeholder="Optional product description"
        />
      </div>

      <div className="rounded-md border border-gray-200 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Upload className="h-4 w-4" />
          Hero image (role: hero)
        </div>
        {formData.heroImageUrl && (
          <img
            src={formData.heroImageUrl}
            alt="Hero preview"
            className="mb-2 h-20 w-20 rounded-md object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          disabled={isSubmitting || uploadingKey === 'hero'}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onUploadSingle(file, 'hero');
          }}
          className="block w-full text-sm text-gray-600"
        />
      </div>

      <div className="rounded-md border border-gray-200 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Upload className="h-4 w-4" />
          Thumbnail image (role: thumbnail)
        </div>
        {formData.thumbnailUrl && (
          <img
            src={formData.thumbnailUrl}
            alt="Thumbnail preview"
            className="mb-2 h-20 w-20 rounded-md object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          disabled={isSubmitting || uploadingKey === 'thumbnail'}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onUploadSingle(file, 'thumbnail');
          }}
          className="block w-full text-sm text-gray-600"
        />
      </div>

      <div className="rounded-md border border-gray-200 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Upload className="h-4 w-4" />
          Gallery images (role: gallery)
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={isSubmitting || uploadingKey === 'gallery'}
          onChange={(event) => void onUploadGallery(event.target.files)}
          className="mb-3 block w-full text-sm text-gray-600"
        />
        {formData.galleryUrls.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {formData.galleryUrls.map((url, index) => (
              <div key={`${url}-${index}`} className="relative">
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemoveGallery(index)}
                  className="absolute -top-2 -right-2 rounded-full bg-white text-red-600 shadow"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductsPage;
