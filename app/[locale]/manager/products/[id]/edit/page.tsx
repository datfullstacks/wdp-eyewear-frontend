'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { ProductFormFull } from '@/components/organisms/manager';
import { productApi } from '@/api';
import type { ProductDetail } from '@/api/products';
import { buildFullUpsertPayload, getRoleUrl, getGalleryUrls, normalizeCategoryValue } from '@/lib/productHelpers';
import type { ProductUpsertFormValues } from '@/lib/validation/product.schema';
import { AlertTriangle, Loader2 } from 'lucide-react';

/** Map ProductDetail from API to form default values */
function toFormDefaults(p: ProductDetail): Partial<ProductUpsertFormValues> {
  const specs = (p.specs || {}) as Record<string, Record<string, unknown>>;
  return {
    type: (p.type as ProductUpsertFormValues['type']) || 'other',
    name: p.name || '',
    slug: p.slug || '',
    description: p.description || '',
    brand: p.brand || '',
    status: (p.status as ProductUpsertFormValues['status']) || 'draft',
    basePrice: p.pricing?.basePrice ?? p.price ?? 0,
    salePrice: p.pricing?.salePrice ?? undefined,
    msrp: undefined,
    inventoryTrack: p.inventory?.track ?? true,
    inventoryThreshold: p.inventory?.threshold ?? 5,
    heroImageUrl: getRoleUrl(p, 'hero') || p.imageUrl || '',
    thumbnailUrl: getRoleUrl(p, 'thumbnail') || '',
    galleryUrls: getGalleryUrls(p),
    variants:
      p.variants && p.variants.length > 0
        ? p.variants.map((v) => ({
            sku: v.sku || '',
            color: v.options?.color || '',
            size: v.options?.size || '',
            price: v.price,
            stock: v.stock ?? 0,
          }))
        : [{ sku: '', color: '', size: '', stock: 0 }],
    preOrderEnabled: p.preOrder?.enabled ?? false,
    preOrderAllowCod: p.preOrder?.allowCod ?? true,
    modelCode: p.seo?.modelCode || '',
    collections: (p.seo?.collections || []).join(', '),
    keywords: (p.seo?.keywords || []).join(', '),
    countryOfOrigin: p.seo?.countryOfOrigin || '',
    returnWindowDays: p.fulfillment?.returnWindowDays,
    warrantyMonths: p.fulfillment?.warrantyMonths,
    compatibilityNotes: p.compatibility?.notes || '',
    tryOnEnabled: p.media?.tryOn?.enabled ?? false,
    // Specs
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
      prescriptionRange: (specs.lens?.prescriptionRange as string) || '',
      index: (specs.lens?.index as string) || '',
      material: (specs.lens?.material as string) || '',
      blueLightFilter: (specs.lens?.blueLightFilter as boolean) ?? false,
      coatings: (specs.lens?.coatings as string) || '',
    },
    specsContactLens: {
      powerRange: (specs.contactLens?.powerRange as string) || '',
      replacementCycle: (specs.contactLens?.replacementCycle as string) || '',
      baseCurveMm: (specs.contactLens?.baseCurveMm as string) || '',
      diameterMm: (specs.contactLens?.diameterMm as string) || '',
      waterContentPercent: (specs.contactLens?.waterContentPercent as number) || undefined,
    },
    specsAccessory: {
      accessoryType: (specs.accessory?.accessoryType as string) || '',
      material: (specs.accessory?.material as string) || '',
      compatibleWith: (specs.accessory?.compatibleWith as string) || '',
    },
  };
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!productId) return;
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await productApi.getById(productId);
        setProduct(data);
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Không thể tải sản phẩm');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [productId]);

  const handleSubmit = async (values: ProductUpsertFormValues, action: 'draft' | 'active') => {
    setIsSubmitting(true);
    setApiError('');
    try {
      const payload = buildFullUpsertPayload(
        { ...values, status: action === 'active' ? 'active' : values.status },
        'update'
      );
      await productApi.update(productId, payload);
      router.push('/manager/products');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Cập nhật sản phẩm thất bại');
    } finally {
      setIsSubmitting(false);
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
          <h2 className="mt-4 text-xl font-semibold">Không tìm thấy sản phẩm</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Chỉnh sửa sản phẩm"
        subtitle={`Cập nhật: ${product.name}`}
      />

      <div className="space-y-6 p-6">
        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        <ProductFormFull
          mode="edit"
          defaultValues={toFormDefaults(product)}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </>
  );
}
