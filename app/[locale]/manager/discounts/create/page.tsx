'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Percent } from 'lucide-react';

import { Header } from '@/components/organisms/Header';
import { DiscountForm, type DiscountFormData } from '@/components/organisms/manager';
import promotionApi from '@/api/promotions';
import { useTranslations } from 'next-intl';

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
  const t = useTranslations('manager.discountForm');
  const [formData, setFormData] = useState<DiscountFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async () => {
    if (!formData.code || !formData.name || !formData.value || !formData.startDate || !formData.endDate) {
      setApiError('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError('');
      await promotionApi.create(formData as unknown as Record<string, unknown>);
      router.push('/manager/discounts');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to create promotion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title={t('createTitle')}
        subtitle={t('createSubtitle')}
      />

      <div className="space-y-6 p-6">
        <Link
          href="/manager/discounts"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('backToPromotions')}
        </Link>

        {apiError ? (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        ) : null}

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-900">
            <Percent className="h-5 w-5" />
            {t('notesTitle')}
          </h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>{t('note1')}</li>
            <li>{t('note2')}</li>
            <li>{t('note3')}</li>
          </ul>
        </div>

        <DiscountForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/manager/discounts')}
          isSubmitting={isSubmitting}
          submitLabel={t('createSubmitLabel')}
        />
      </div>
    </>
  );
}
