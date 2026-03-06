'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/organisms/Header';
import { ProductFormFull } from '@/components/organisms/manager';
import { ProductDetailModalContent } from '@/components/pages/ProductDetailModalContent';
import { Button } from '@/components/atoms';
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
import { productApi } from '@/api';
import type { ProductDetail } from '@/api/products';
import { buildFullUpsertPayload, getRoleUrl, getGalleryUrls } from '@/lib/productHelpers';
import type { ProductUpsertFormValues } from '@/lib/validation/product.schema';
import { AlertTriangle, ArrowLeft, Edit, Loader2, Trash2, X } from 'lucide-react';

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError('');
      const data = await productApi.getById(productId);
      setProduct(data);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Không thể tải sản phẩm');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    if (productId) void loadProduct();
  }, [productId, loadProduct]);

  const handleToggleStatus = async () => {
    if (!product) return;
    try {
      const newStatus: 'active' | 'inactive' = product.status === 'active' ? 'inactive' : 'active';
      await productApi.updateStatus(productId, newStatus);
      await loadProduct();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Cập nhật trạng thái thất bại');
    }
  };

  const handleDelete = async () => {
    try {
      await productApi.remove(productId);
      router.push('/manager/products');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Xoá thất bại');
    }
  };

  const handleEditSubmit = async (values: ProductUpsertFormValues, action: 'draft' | 'active') => {
    setIsSubmitting(true);
    setApiError('');
    try {
      const payload = buildFullUpsertPayload(
        { ...values, status: action === 'active' ? 'active' : values.status },
        'update'
      );
      await productApi.update(productId, payload);
      await loadProduct();
      setIsEditing(false);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Cập nhật thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Convert ProductDetail to form defaults */
  const getEditDefaults = (): Partial<ProductUpsertFormValues> | undefined => {
    if (!product) return undefined;
    const specs = (product.specs || {}) as Record<string, Record<string, unknown>>;
    return {
      type: (product.type as ProductUpsertFormValues['type']) || 'other',
      name: product.name,
      slug: product.slug || '',
      description: product.description || '',
      brand: product.brand,
      status: (product.status as ProductUpsertFormValues['status']) || 'draft',
      basePrice: product.pricing?.basePrice ?? product.price ?? 0,
      salePrice: product.pricing?.salePrice ?? undefined,
      inventoryTrack: product.inventory?.track ?? true,
      inventoryThreshold: product.inventory?.threshold,
      heroImageUrl: getRoleUrl(product, 'hero') || product.imageUrl || '',
      thumbnailUrl: getRoleUrl(product, 'thumbnail') || '',
      galleryUrls: getGalleryUrls(product),
      variants:
        product.variants && product.variants.length > 0
          ? product.variants.map((v) => ({
              sku: v.sku || '',
              color: v.options?.color || '',
              size: v.options?.size || '',
              price: v.price,
              stock: v.stock ?? 0,
            }))
          : [{ sku: '', color: '', size: '', stock: 0 }],
      preOrderEnabled: product.preOrder?.enabled ?? false,
      preOrderAllowCod: product.preOrder?.allowCod ?? true,
      modelCode: product.seo?.modelCode || '',
      collections: (product.seo?.collections || []).join(', '),
      keywords: (product.seo?.keywords || []).join(', '),
      countryOfOrigin: product.seo?.countryOfOrigin || '',
      returnWindowDays: product.fulfillment?.returnWindowDays,
      warrantyMonths: product.fulfillment?.warrantyMonths,
      compatibilityNotes: product.compatibility?.notes || '',
      tryOnEnabled: product.media?.tryOn?.enabled ?? false,
      specsCommon: {
        shape: (specs.common?.shape as string) || '',
        gender: (specs.common?.gender as string) || '',
        weightGram: (specs.common?.weightGram as number) || undefined,
      },
      specsDimensions: {
        frameWidthMm: (specs.dimensions?.frameWidthMm as number) || undefined,
        bridgeMm: (specs.dimensions?.bridgeMm as number) || undefined,
        templeLengthMm: (specs.dimensions?.templeLengthMm as number) || undefined,
        lensWidthMm: (specs.dimensions?.lensWidthMm as number) || undefined,
        lensHeightMm: (specs.dimensions?.lensHeightMm as number) || undefined,
        fit: (specs.dimensions?.fit as string) || '',
      },
      specsFrame: {
        material: (specs.frame?.material as string) || '',
        hingeType: (specs.frame?.hingeType as string) || '',
        rimType: (specs.frame?.rimType as string) || '',
        nosePads: (specs.frame?.nosePads as boolean) ?? false,
        rxReady: (specs.frame?.rxReady as boolean) ?? false,
        polarized: (specs.frame?.polarized as boolean) ?? false,
        uvProtection: (specs.frame?.uvProtection as string) || '',
      },
      specsLens: {
        lensType: (specs.lens?.lensType as string) || '',
        material: (specs.lens?.material as string) || '',
        index: (specs.lens?.index as string) || '',
        prescriptionRange: (specs.lens?.prescriptionRange as string) || '',
        blueLightFilter: (specs.lens?.blueLightFilter as boolean) ?? false,
        coatings: (specs.lens?.coatings as string) || '',
      },
      specsAccessory: {
        accessoryType: (specs.accessory?.accessoryType as string) || '',
        material: (specs.accessory?.material as string) || '',
        compatibleWith: (specs.accessory?.compatibleWith as string) || '',
      },
    };
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

      <div className="space-y-6 p-6">
        {/* Top Actions Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/manager/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors"
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
                  {product.status === 'active' ? tDetail('deactivate') : tDetail('activate')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-sm text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="mr-1 h-4 w-4" />
                  {tDetail('delete')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="bg-amber-400 text-slate-900 hover:bg-amber-500"
                >
                  <Edit className="mr-1 h-4 w-4" />
                  {tDetail('edit')}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(false)}
                disabled={isSubmitting}
              >
                <X className="mr-1 h-4 w-4" />
                {tDetail('cancel')}
              </Button>
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
          <ProductFormFull
            mode="edit"
            defaultValues={getEditDefaults()}
            isSubmitting={isSubmitting}
            onSubmit={handleEditSubmit}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <ProductDetailModalContent product={product} />
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
