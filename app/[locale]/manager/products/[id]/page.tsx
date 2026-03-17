'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/organisms/Header';
import {
  ProductForm,
  type ProductFormState,
} from '@/components/organisms/manager';
import { Button } from '@/components/atoms';
import { Card } from '@/components/ui/card';
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
  productApi,
  uploadApi,
  type Product,
  type ProductMediaAsset,
} from '@/api';
import {
  buildUpsertPayload,
  getRoleUrl,
  getGalleryUrls,
  normalizeCategoryValue,
} from '@/lib/productHelpers';
import {
  AlertTriangle,
  ArrowLeft,
  Edit,
  Loader2,
  Package,
  Trash2,
  X,
  Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const t = useTranslations('manager.products');
  const tDetail = useTranslations('manager.products.detail');

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState<ProductFormState>({
    name: '',
    brand: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    heroImageUrl: '',
    thumbnailUrl: '',
    galleryUrls: [],
  });

  const loadProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError('');
      const data = await productApi.getById(productId);
      setProduct(data);
      populateForm(data);
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : 'Failed to load product'
      );
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  const populateForm = (data: Product) => {
    setFormData({
      name: data.name,
      brand: data.brand,
      price: String(data.price),
      stock: String(data.stock),
      category: normalizeCategoryValue(data.category),
      description: data.description || '',
      heroImageUrl: getRoleUrl(data, 'hero') || data.imageUrl,
      thumbnailUrl: getRoleUrl(data, 'thumbnail'),
      galleryUrls: getGalleryUrls(data),
    });
  };

  useEffect(() => {
    if (productId) {
      void loadProduct();
    }
  }, [productId, loadProduct]);

  const handleStartEdit = () => {
    if (product) {
      populateForm(product);
    }
    setIsEditing(true);
    setApiError('');
  };

  const handleCancelEdit = () => {
    if (product) {
      populateForm(product);
    }
    setIsEditing(false);
    setApiError('');
  };

  const handleUploadSingle = useCallback(
    async (file: File, role: ProductMediaAsset['role']) => {
      setUploadingKey(role);
      setApiError('');
      try {
        const result = await uploadApi.uploadFile(file);
        if (role === 'hero') {
          setFormData((prev) => ({ ...prev, heroImageUrl: result.url }));
        } else if (role === 'thumbnail') {
          setFormData((prev) => ({ ...prev, thumbnailUrl: result.url }));
        }
      } catch (error) {
        setApiError(
          `Upload ${role} failed: ${error instanceof Error ? error.message : 'Unknown'}`
        );
      } finally {
        setUploadingKey('');
      }
    },
    []
  );

  const handleUploadGallery = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingKey('gallery');
    setApiError('');
    try {
      const uploadPromises = Array.from(files).map((file) =>
        uploadApi.uploadFile(file)
      );
      const results = await Promise.all(uploadPromises);
      const uploadedUrls = results.map((result) => result.url);
      setFormData((prev) => ({
        ...prev,
        galleryUrls: [...prev.galleryUrls, ...uploadedUrls],
      }));
    } catch (error) {
      setApiError(
        `Upload gallery failed: ${error instanceof Error ? error.message : 'Unknown'}`
      );
    } finally {
      setUploadingKey('');
    }
  }, []);

  const handleRemoveGallery = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      galleryUrls: prev.galleryUrls.filter((_, i) => i !== index),
    }));
  }, []);

  const handleSave = async () => {
    if (
      !formData.name.trim() ||
      !formData.price ||
      !formData.stock ||
      !formData.category
    ) {
      setApiError(tDetail('fillRequired'));
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      const payload = buildUpsertPayload(formData);
      await productApi.update(productId, payload);
      await loadProduct();
      setIsEditing(false);
    } catch (error) {
      setApiError(
        error instanceof Error ? error.message : tDetail('updateFailed')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!product) return;
    try {
      const newStatus: 'active' | 'inactive' =
        product.status === 'active' ? 'inactive' : 'active';
      await productApi.updateStatus(productId, newStatus);
      await loadProduct();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Update failed');
    }
  };

  const handleDelete = async () => {
    try {
      await productApi.remove(productId);
      router.push('/manager/products');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-4 text-xl font-semibold">{tDetail('notFound')}</h2>
          <Button
            onClick={() => router.push('/manager/products')}
            className="mt-4"
          >
            {tDetail('backToList')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title={tDetail('title')}
        subtitle={`${tDetail('info')}: ${product.name}`}
      />

      <div className="space-y-6 p-6">
        {/* Top Actions Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/manager/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-600"
          >
            <ArrowLeft className="h-4 w-4" />
            {tDetail('backToList')}
          </Link>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleStatus}
                  className="text-sm"
                >
                  {product.status === 'active'
                    ? tDetail('deactivate')
                    : tDetail('activate')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="border-red-200 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  {tDetail('delete')}
                </Button>
                <Button
                  size="sm"
                  onClick={handleStartEdit}
                  className="bg-amber-400 text-slate-900 hover:bg-amber-500"
                >
                  <Edit className="mr-1 h-4 w-4" />
                  {tDetail('edit')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  <X className="mr-1 h-4 w-4" />
                  {tDetail('cancel')}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="bg-amber-400 text-slate-900 hover:bg-amber-500"
                >
                  <Save className="mr-1 h-4 w-4" />
                  {isSubmitting ? tDetail('saving') : tDetail('save')}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Content */}
        {isEditing ? (
          /* Edit Mode - Show form */
          <Card className="p-6">
            <ProductForm
              formData={formData}
              isSubmitting={isSubmitting}
              uploadingKey={uploadingKey}
              onChange={setFormData}
              onUploadSingle={handleUploadSingle}
              onUploadGallery={handleUploadGallery}
              onRemoveGallery={handleRemoveGallery}
            />
          </Card>
        ) : (
          /* View Mode */
          <div className="grid gap-6 md:grid-cols-2">
            {/* Product Images */}
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Package className="h-5 w-5" />
                {tDetail('productImages')}
              </h3>
              <div className="space-y-4">
                <img
                  src={product.imageUrl || FALLBACK_IMAGE}
                  alt={product.name}
                  className="h-64 w-full rounded-md object-cover"
                />
                {product.mediaAssets && product.mediaAssets.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.mediaAssets
                      .filter((asset) => asset.role === 'gallery')
                      .map((asset, index) => (
                        <img
                          key={index}
                          src={asset.url}
                          alt={`${product.name} - ${index + 1}`}
                          className="h-20 w-20 rounded-md object-cover"
                        />
                      ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Product Details */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold">
                {tDetail('detailInfo')}
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    {tDetail('productName')}
                  </dt>
                  <dd className="mt-1 text-base text-gray-900">
                    {product.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    {tDetail('brand')}
                  </dt>
                  <dd className="mt-1 text-base text-gray-900">
                    {product.brand}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    {tDetail('category')}
                  </dt>
                  <dd className="mt-1 text-base text-gray-900">
                    {product.category}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    {tDetail('price')}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {product.price.toLocaleString()} VND
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    {tDetail('stock')}
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-sm font-medium',
                        product.stock < 10
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      )}
                    >
                      {product.stock} {tDetail('items')}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    {tDetail('status')}
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-sm font-medium',
                        product.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      )}
                    >
                      {product.status === 'active'
                        ? t('table.active')
                        : t('table.inactive')}
                    </span>
                  </dd>
                </div>
                {product.description && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      {tDetail('description')}
                    </dt>
                    <dd className="mt-1 text-base text-gray-900">
                      {product.description}
                    </dd>
                  </div>
                )}
              </dl>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirm.description', { name: product.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteConfirm.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              {t('deleteConfirm.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
