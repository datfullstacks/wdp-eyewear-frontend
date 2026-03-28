'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/organisms/Header';
import { ProductForm, type ProductFormState } from '@/components/organisms/manager';
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
import { productApi, uploadApi, type ProductDetail, type ProductMediaAsset } from '@/api';
import { buildProductFormState, buildUpsertPayload, EMPTY_PRODUCT_FORM } from '@/lib/productHelpers';
import { AlertTriangle, ArrowLeft, Edit, Loader2, Package, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const t = useTranslations('manager.products');
  const tDetail = useTranslations('manager.products.detail');

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ProductFormState>(EMPTY_PRODUCT_FORM);

  const populateForm = (data: ProductDetail) => {
    setFormData(buildProductFormState(data));
  };

  const loadProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError('');
      const data = await productApi.getById(productId);
      setProduct(data);
      populateForm(data);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) void loadProduct();
  }, [productId, loadProduct]);

  const handleStartEdit = () => {
    if (product) populateForm(product);
    setIsEditing(true);
    setApiError('');
  };

  const handleCancelEdit = () => {
    if (product) populateForm(product);
    setIsEditing(false);
    setApiError('');
  };

  const handleUploadSingle = useCallback(
    async (file: File, role: ProductMediaAsset['role']) => {
      setUploadingKey(role);
      setApiError('');
      try {
        const result = await uploadApi.uploadFile(file);
        if (role === 'hero') setFormData((prev) => ({ ...prev, heroImageUrl: result.url }));
        else if (role === 'thumbnail') setFormData((prev) => ({ ...prev, thumbnailUrl: result.url }));
      } catch (error) {
        setApiError(`Upload ${role} failed: ${error instanceof Error ? error.message : 'Unknown'}`);
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
      const results = await Promise.all(Array.from(files).map((f) => uploadApi.uploadFile(f)));
      setFormData((prev) => ({
        ...prev,
        galleryUrls: [...prev.galleryUrls, ...results.map((r) => r.url)],
      }));
    } catch (error) {
      setApiError(`Upload gallery failed: ${error instanceof Error ? error.message : 'Unknown'}`);
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

  const handleUploadVariantAsset = useCallback(
    async (file: File, variantId: string, field: 'imageUrl' | 'posterUrl' | 'glbUrl') => {
      const suffix = field === 'imageUrl' ? 'image' : field === 'posterUrl' ? 'poster' : 'glb';
      const key = `variant-${variantId || 'unknown'}-${suffix}`;
      setUploadingKey(key);
      setApiError('');
      try {
        const result = await uploadApi.uploadFile(file, { folder: 'products/variants' });
        setFormData((prev) => ({
          ...prev,
          variants: prev.variants.map((v) =>
            v.id === variantId ? { ...v, [field]: result.url } : v
          ),
        }));
      } catch (error) {
        setApiError(`Upload variant ${field} failed: ${error instanceof Error ? error.message : 'Unknown'}`);
      } finally {
        setUploadingKey('');
      }
    },
    []
  );

  const handleSave = async () => {
    const hasAnyPrice = Boolean(formData.price || formData.variants.some((v) => v.price));
    const hasAnyStock = Boolean(formData.stock || formData.variants.some((v) => v.stock));
    if (!formData.name.trim() || !formData.category || !hasAnyPrice || !hasAnyStock) {
      setApiError(tDetail('fillRequired'));
      return;
    }
    setIsSubmitting(true);
    setApiError('');
    try {
      const payload = buildUpsertPayload(formData, { existingProduct: product });
      await productApi.update(productId, payload);
      await loadProduct();
      setIsEditing(false);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : tDetail('updateFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!product) return;
    try {
      const newStatus: 'active' | 'inactive' = product.status === 'active' ? 'inactive' : 'active';
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
          <Button onClick={() => router.push('/manager/products')} className="mt-4">
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

      <div className="space-y-5 p-6">
        {/* ── Top navigation bar ── */}
        <div className="flex items-center justify-between">
          <Link
            href="/manager/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-600"
          >
            <ArrowLeft className="h-4 w-4" />
            {tDetail('backToList')}
          </Link>

          {/* Only show status/delete/edit in VIEW mode — Hủy/Lưu are at the bottom of the form in EDIT mode */}
          {!isEditing && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleStatus}
                className="text-sm"
              >
                {product.status === 'active' ? tDetail('deactivate') : tDetail('activate')}
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
            </div>
          )}
        </div>

        {/* Error banner */}
        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* ── EDIT mode ── */}
        {isEditing ? (
          <Card className="p-6">
            <ProductForm
              formData={formData}
              isSubmitting={isSubmitting}
              uploadingKey={uploadingKey}
              onChange={setFormData}
              onUploadSingle={handleUploadSingle}
              onUploadGallery={handleUploadGallery}
              onUploadVariantAsset={handleUploadVariantAsset}
              onRemoveGallery={handleRemoveGallery}
              onCancel={handleCancelEdit}
              onSubmit={handleSave}
              submitLabel={isSubmitting ? tDetail('saving') : tDetail('save')}
            />
          </Card>
        ) : (
          /* ── VIEW mode ── */
          <div className="grid gap-5 md:grid-cols-2">
            {/* Product Images */}
            <Card className="overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Package className="h-4 w-4" />
                  {tDetail('productImages')}
                </h3>
              </div>
              <div className="space-y-3 p-5">
                <img
                  src={product.imageUrl || FALLBACK_IMAGE}
                  alt={product.name}
                  className="h-56 w-full rounded-lg object-cover"
                />
                {product.mediaAssets && product.mediaAssets.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {product.mediaAssets
                      .filter((a) => a.role === 'gallery')
                      .slice(0, 10)
                      .map((asset, i) => (
                        <img
                          key={i}
                          src={asset.url}
                          alt={`${product.name} - ${i + 1}`}
                          className="h-14 w-full rounded-md object-cover"
                        />
                      ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Product Details */}
            <Card className="overflow-hidden">
              <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                <h3 className="text-sm font-semibold text-gray-700">{tDetail('detailInfo')}</h3>
              </div>
              <dl className="divide-y divide-gray-100">
                {[
                  { label: tDetail('productName'), value: product.name },
                  { label: tDetail('brand'), value: product.brand },
                  { label: tDetail('category'), value: product.category },
                  {
                    label: tDetail('price'),
                    value: (
                      <span className="text-base font-semibold text-gray-900">
                        {product.price.toLocaleString()} VND
                      </span>
                    ),
                  },
                  {
                    label: tDetail('stock'),
                    value: (
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          product.stock < 10
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        )}
                      >
                        {product.stock} {tDetail('items')}
                      </span>
                    ),
                  },
                  {
                    label: tDetail('status'),
                    value: (
                      <span
                        className={cn(
                          'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                          product.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        )}
                      >
                        {product.status === 'active' ? t('table.active') : t('table.inactive')}
                      </span>
                    ),
                  },
                  ...(product.description
                    ? [{ label: tDetail('description'), value: product.description }]
                    : []),
                ].map(({ label, value }) => (
                  <div key={String(label)} className="flex items-start gap-4 px-5 py-3">
                    <dt className="w-32 shrink-0 pt-0.5 text-xs font-medium text-gray-500">
                      {label}
                    </dt>
                    <dd className="text-sm text-gray-900">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirm.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirm.description', { name: product.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('deleteConfirm.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t('deleteConfirm.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
