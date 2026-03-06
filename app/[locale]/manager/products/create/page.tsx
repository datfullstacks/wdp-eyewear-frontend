'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { ProductFormFull } from '@/components/organisms/manager';
import { productApi } from '@/api';
import { buildFullUpsertPayload } from '@/lib/productHelpers';
import type { ProductUpsertFormValues } from '@/lib/validation/product.schema';
import { AlertTriangle } from 'lucide-react';

export default function CreateProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (values: ProductUpsertFormValues, action: 'draft' | 'active') => {
    setIsSubmitting(true);
    setApiError('');
    try {
      const payload = buildFullUpsertPayload(
        { ...values, status: action === 'active' ? 'active' : 'draft' },
        'create'
      );
      await productApi.create(payload);
      router.push('/manager/products');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Tạo sản phẩm thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header title="Tạo sản phẩm mới" subtitle="Thêm sản phẩm mới vào hệ thống" />

      <div className="space-y-6 p-6">
        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        <ProductFormFull
          mode="create"
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </>
  );
}
