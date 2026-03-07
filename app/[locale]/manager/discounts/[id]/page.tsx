'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/organisms/Header';
import { DiscountForm, type DiscountFormData } from '@/components/organisms/manager';
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
import { discountsData, type Discount } from '@/data/discountsData';
import { AlertTriangle, ArrowLeft, Edit, Loader2, Percent, Trash2, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DiscountDetailPage() {
  const router = useRouter();
  const params = useParams();
  const discountId = params.id as string;
  const t = useTranslations('manager.discounts');

  const [discount, setDiscount] = useState<Discount | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState<DiscountFormData>({
    code: '',
    name: '',
    description: '',
    type: 'percentage',
    value: '',
    minPurchase: '',
    maxDiscount: '',
    startDate: '',
    endDate: '',
    usageLimit: '',
    applicableCategories: [],
    status: 'active',
  });

  const loadDiscount = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError('');
      // TODO: Replace with API call
      const data = discountsData.find((d) => d.id === discountId);
      if (!data) throw new Error('Discount not found');
      setDiscount(data);
      populateForm(data);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to load discount');
    } finally {
      setIsLoading(false);
    }
  }, [discountId]);

  const populateForm = (data: Discount) => {
    setFormData({
      code: data.code,
      name: data.name,
      description: data.description,
      type: data.type,
      value: String(data.value),
      minPurchase: String(data.minPurchase || ''),
      maxDiscount: String(data.maxDiscount || ''),
      startDate: data.startDate,
      endDate: data.endDate,
      usageLimit: String(data.usageLimit),
      applicableCategories: data.applicableCategories,
      status: data.status === 'expired' ? 'inactive' : data.status,
    });
  };

  useEffect(() => {
    if (discountId) {
      void loadDiscount();
    }
  }, [discountId, loadDiscount]);

  const handleStartEdit = () => {
    if (discount) {
      populateForm(discount);
    }
    setIsEditing(true);
    setApiError('');
  };

  const handleCancelEdit = () => {
    if (discount) {
      populateForm(discount);
    }
    setIsEditing(false);
    setApiError('');
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setApiError('');
    try {
      // TODO: Call API to update discount
      console.log('Updating discount:', discountId, formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Update local state
      const updated: Discount = {
        ...discount!,
        ...formData,
        value: parseFloat(formData.value),
        minPurchase: parseFloat(formData.minPurchase) || undefined,
        maxDiscount: parseFloat(formData.maxDiscount) || undefined,
        usageLimit: parseInt(formData.usageLimit, 10),
        updatedAt: new Date().toISOString(),
      };
      setDiscount(updated);
      setIsEditing(false);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    setApiError('');
    try {
      // TODO: Call API to delete discount
      console.log('Deleting discount:', discountId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/manager/discounts');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to delete');
    } finally {
      setIsSubmitting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-700',
      inactive: 'bg-gray-100 text-gray-700',
      expired: 'bg-red-100 text-red-700',
      scheduled: 'bg-blue-100 text-blue-700',
    };
    const labels = {
      active: 'Đang hoạt động',
      inactive: 'Tạm dừng',
      expired: 'Đã hết hạn',
      scheduled: 'Đã lên lịch',
    };
    return (
      <span className={cn('rounded-full px-3 py-1 text-sm font-medium', colors[status as keyof typeof colors])}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <>
        <Header title={t('title')} subtitle="Chi tiết khuyến mãi" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  if (!discount) {
    return (
      <>
        <Header title={t('title')} subtitle="Chi tiết khuyến mãi" />
        <div className="p-6">
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>Không tìm thấy khuyến mãi</span>
          </div>
          <Link
            href="/manager/discounts"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={isEditing ? 'Chỉnh sửa khuyến mãi' : 'Chi tiết khuyến mãi'}
        subtitle={discount.name}
      />

      <div className="space-y-6 p-6">
        {/* Back Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/manager/discounts"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>

          {!isEditing && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleStartEdit}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Xóa
              </Button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* View Mode */}
        {!isEditing && (
          <div className="space-y-6">
            {/* Basic Info Card */}
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin khuyến mãi</h3>
                {getStatusBadge(discount.status)}
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Mã khuyến mãi</label>
                  <p className="mt-1 font-mono text-lg font-semibold text-amber-600">{discount.code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Tên khuyến mãi</label>
                  <p className="mt-1 text-lg font-medium text-gray-900">{discount.name}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500">Mô tả</label>
                  <p className="mt-1 text-gray-700">{discount.description}</p>
                </div>
              </div>
            </Card>

            {/* Discount Value Card */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Giá trị giảm giá</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Loại giảm giá</label>
                  <p className="mt-1 text-gray-900">
                    {discount.type === 'percentage' ? 'Phần trăm (%)' : 'Giá cố định (đ)'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Giá trị</label>
                  <p className="mt-1 text-xl font-semibold text-gray-900">
                    {discount.type === 'percentage'
                      ? `${discount.value}%`
                      : `${discount.value.toLocaleString()}đ`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Giá trị đơn tối thiểu</label>
                  <p className="mt-1 text-gray-900">
                    {discount.minPurchase ? `${discount.minPurchase.toLocaleString()}đ` : '—'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Giảm tối đa</label>
                  <p className="mt-1 text-gray-900">
                    {discount.maxDiscount ? `${discount.maxDiscount.toLocaleString()}đ` : '—'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Time & Usage Card */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Thời gian & Sử dụng</h3>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Ngày bắt đầu</label>
                  <p className="mt-1 text-gray-900">{formatDate(discount.startDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Ngày kết thúc</label>
                  <p className="mt-1 text-gray-900">{formatDate(discount.endDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Số lượt sử dụng</label>
                  <p className="mt-1 text-gray-900">
                    {discount.usageCount} / {discount.usageLimit === 0 ? 'Không giới hạn' : discount.usageLimit.toLocaleString()}
                  </p>
                  {discount.usageLimit > 0 && (
                    <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{
                          width: `${Math.min((discount.usageCount / discount.usageLimit) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Categories Card */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Danh mục áp dụng</h3>
              <div className="flex flex-wrap gap-2">
                {discount.applicableCategories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700"
                  >
                    {cat === 'all' ? 'Tất cả' : cat === 'frame' ? 'Gọng kính' : cat === 'lens' ? 'Tròng kính' : cat === 'accessory' ? 'Phụ kiện' : cat}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Edit Mode */}
        {isEditing && (
          <DiscountForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSave}
            onCancel={handleCancelEdit}
            isSubmitting={isSubmitting}
            submitLabel="Lưu thay đổi"
          />
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa khuyến mãi</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa khuyến mãi <strong>{discount?.name}</strong>? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? 'Đang xóa...' : 'Xóa'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
