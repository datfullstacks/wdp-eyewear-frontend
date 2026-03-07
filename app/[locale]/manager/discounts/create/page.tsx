'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/organisms/Header';
import { DiscountForm, type DiscountFormData } from '@/components/organisms/manager';
import { AlertTriangle, ArrowLeft, Percent } from 'lucide-react';

const EMPTY_FORM: DiscountFormData = {
  code: '',
  name: '',
  description: '',
  type: 'percentage',
  value: '',
  minPurchase: '',
  maxDiscount: '',
  startDate: '',
  endDate: '',
  usageLimit: '0',
  applicableCategories: ['all'],
  status: 'active',
};

export default function CreateDiscountPage() {
  const router = useRouter();
  const t = useTranslations('manager.discounts');
  const [formData, setFormData] = useState<DiscountFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async () => {
    if (!formData.code || !formData.name || !formData.value || !formData.startDate || !formData.endDate) {
      setApiError('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      // TODO: Call API to create discount
      console.log('Creating discount:', formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/manager/discounts');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Tạo khuyến mãi thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title="Tạo khuyến mãi mới"
        subtitle="Thêm chương trình khuyến mãi và giảm giá"
      />

      <div className="space-y-6 p-6">
        {/* Back Navigation */}
        <Link
          href="/manager/discounts"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </Link>

        {/* Error Message */}
        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Quick Tips */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-900">
            <Percent className="h-5 w-5" />
            Hướng dẫn tạo khuyến mãi
          </h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• <strong>Mã khuyến mãi</strong>: Nên ngắn gọn, dễ nhớ (VD: SUMMER2024)</li>
            <li>• <strong>Loại giảm giá</strong>: Chọn % cho giảm theo tỷ lệ, hoặc đ cho giảm cố định</li>
            <li>• <strong>Giới hạn sử dụng</strong>: Để 0 nếu không giới hạn số lượt sử dụng</li>
            <li>• <strong>Danh mục</strong>: Chọn "Tất cả" để áp dụng cho toàn bộ sản phẩm</li>
          </ul>
        </div>

        {/* Form */}
        <DiscountForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/manager/discounts')}
          isSubmitting={isSubmitting}
          submitLabel="Tạo khuyến mãi"
        />
      </div>
    </>
  );
}
