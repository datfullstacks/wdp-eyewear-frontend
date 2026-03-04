'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { ProductForm, type ProductFormState } from '@/components/organisms/manager';
import { Card } from '@/components/ui/card';
import { productApi, uploadApi, type ProductMediaAsset } from '@/api';
import { buildUpsertPayload } from '@/lib/productHelpers';
import { AlertTriangle } from 'lucide-react';

const EMPTY_FORM: ProductFormState = {
  name: '',
  brand: '',
  price: '',
  stock: '',
  category: '',
  description: '',
  heroImageUrl: '',
  thumbnailUrl: '',
  galleryUrls: [],
};

export default function CreateProductPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingKey, setUploadingKey] = useState('');
  const [apiError, setApiError] = useState('');

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

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.price || !formData.stock || !formData.category) {
      setApiError('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    setApiError('');
    
    try {
      const payload = buildUpsertPayload(formData);
      await productApi.create(payload);
      router.push('/manager/products');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Create failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title="Tạo sản phẩm mới"
        subtitle="Thêm sản phẩm mới vào hệ thống"
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
            submitLabel="Tạo sản phẩm"
          />
        </Card>
      </div>
    </>
  );
}
