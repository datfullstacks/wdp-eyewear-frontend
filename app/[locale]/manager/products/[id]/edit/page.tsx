'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import {
  ProductForm,
  type ProductFormState,
} from '@/components/organisms/manager';
import { Card } from '@/components/ui/card';
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
import { AlertTriangle, Loader2 } from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const data = await productApi.getById(productId);
        setProduct(data);
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
      } catch (error) {
        setApiError(
          error instanceof Error ? error.message : 'Failed to load product'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      void loadProduct();
    }
  }, [productId]);

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

  const handleSubmit = async () => {
    if (
      !formData.name.trim() ||
      !formData.price ||
      !formData.stock ||
      !formData.category
    ) {
      setApiError('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      const payload = buildUpsertPayload(formData);
      await productApi.update(productId, payload);
      router.push('/manager/products');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Update failed');
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
          <h2 className="mt-4 text-xl font-semibold">Product not found</h2>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Chỉnh sửa sản phẩm"
        subtitle={`Cập nhật thông tin: ${product.name}`}
      />

      <div className="space-y-6 p-6">
        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        <Card className="p-6">
          <ProductForm
            formData={formData}
            isSubmitting={isSubmitting}
            uploadingKey={uploadingKey}
            onChange={setFormData}
            onUploadSingle={handleUploadSingle}
            onUploadGallery={handleUploadGallery}
            onRemoveGallery={handleRemoveGallery}
            onCancel={() => router.back()}
            onSubmit={handleSubmit}
            submitLabel="Cập nhật"
          />
        </Card>
      </div>
    </>
  );
}
