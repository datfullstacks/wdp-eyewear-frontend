'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Edit, Loader2, Trash2 } from 'lucide-react';

import { Button } from '@/components/atoms';
import { Header } from '@/components/organisms/Header';
import { Card } from '@/components/ui/card';
import { DiscountForm, type DiscountFormData } from '@/components/organisms/manager';
import promotionApi, { type PromotionRecord } from '@/api/promotions';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

function toFormData(discount: PromotionRecord): DiscountFormData {
  return {
    code: discount.code,
    name: discount.name,
    description: discount.description,
    type: discount.type,
    value: String(discount.value),
    minPurchase: String(discount.minPurchase || ''),
    maxDiscount: String(discount.maxDiscount || ''),
    startDate: discount.startDate?.slice(0, 10) || '',
    endDate: discount.endDate?.slice(0, 10) || '',
    usageLimit: String(discount.usageLimit),
    applicableCategories: discount.applicableCategories,
    status: discount.status === 'expired' ? 'inactive' : discount.status,
  };
}

export default function DiscountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const discountId = params.id as string;

  const [discount, setDiscount] = useState<PromotionRecord | null>(null);
  const [formData, setFormData] = useState<DiscountFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  const loadDiscount = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await promotionApi.getById(discountId);
      setDiscount(data);
      setFormData(toFormData(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load promotion.');
    } finally {
      setLoading(false);
    }
  }, [discountId]);

  useEffect(() => {
    void loadDiscount();
  }, [loadDiscount]);

  const handleSave = async () => {
    if (!formData) return;

    try {
      setSaving(true);
      setError('');
      const updated = await promotionApi.update(
        discountId,
        formData as unknown as Record<string, unknown>,
      );
      setDiscount(updated);
      setFormData(toFormData(updated));
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save promotion.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!discount || !window.confirm(`Delete promotion "${discount.name}"?`)) return;

    try {
      setSaving(true);
      setError('');
      await promotionApi.remove(discount.id);
      router.push('/manager/discounts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete promotion.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Promotion Detail" subtitle="Loading promotion..." />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  if (!discount || !formData) {
    return (
      <>
        <Header title="Promotion Detail" subtitle="Promotion not found" />
        <div className="p-6">
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{error || 'Promotion not found.'}</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={editing ? 'Edit Promotion' : 'Promotion Detail'}
        subtitle={discount.name}
      />

      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Link
            href="/manager/discounts"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to promotions
          </Link>

          {!editing ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setEditing(true)} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={saving}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : null}

        {editing ? (
          <DiscountForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSave}
            onCancel={() => {
              setFormData(toFormData(discount));
              setEditing(false);
            }}
            isSubmitting={saving}
            submitLabel="Save promotion"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Campaign</h3>
              <div className="mt-4 space-y-4 text-sm text-gray-700">
                <div>
                  <div className="text-gray-500">Code</div>
                  <div className="font-mono font-semibold text-amber-600">{discount.code}</div>
                </div>
                <div>
                  <div className="text-gray-500">Description</div>
                  <div>{discount.description || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Status</div>
                  <div>{discount.status}</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Commercial terms</h3>
              <div className="mt-4 grid gap-4 text-sm text-gray-700 md:grid-cols-2">
                <div>
                  <div className="text-gray-500">Type</div>
                  <div>{discount.type}</div>
                </div>
                <div>
                  <div className="text-gray-500">Value</div>
                  <div>
                    {discount.type === 'percentage'
                      ? `${discount.value}%`
                      : formatCurrency(discount.value)}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Min purchase</div>
                  <div>{formatCurrency(discount.minPurchase || 0)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Max discount</div>
                  <div>{formatCurrency(discount.maxDiscount || 0)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Usage</div>
                  <div>
                    {discount.usageCount} / {discount.usageLimit === 0 ? 'Unlimited' : discount.usageLimit}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">Period</div>
                  <div>
                    {discount.startDate?.slice(0, 10)} - {discount.endDate?.slice(0, 10)}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
