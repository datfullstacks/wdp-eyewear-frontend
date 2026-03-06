'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/organisms/Header';
import { PolicyForm, type PolicyFormData } from '@/components/organisms/manager';
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
import { policiesData, type Policy } from '@/data/policiesData';
import { AlertTriangle, ArrowLeft, Edit, Loader2, Shield, FileText, Truck, ShoppingCart, Lock, ScrollText, Trash2, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

const getCategoryIcon = (category: string) => {
  const icons = {
    warranty: Shield,
    return: FileText,
    shipping: Truck,
    purchase: ShoppingCart,
    privacy: Lock,
    terms: ScrollText,
  };
  return icons[category as keyof typeof icons] || FileText;
};

const getCategoryLabel = (category: string) => {
  const labels = {
    warranty: 'Bảo hành',
    return: 'Đổi trả',
    shipping: 'Vận chuyển',
    purchase: 'Mua hàng',
    privacy: 'Bảo mật',
    terms: 'Điều khoản',
  };
  return labels[category as keyof typeof labels] || category;
};

const getCategoryColor = (category: string) => {
  const colors = {
    warranty: 'text-blue-600 bg-blue-50',
    return: 'text-green-600 bg-green-50',
    shipping: 'text-purple-600 bg-purple-50',
    purchase: 'text-amber-600 bg-amber-50',
    privacy: 'text-red-600 bg-red-50',
    terms: 'text-gray-600 bg-gray-50',
  };
  return colors[category as keyof typeof colors] || colors.terms;
};

export default function PolicyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const policyId = params.id as string;
  const t = useTranslations('manager.policies');

  const [policy, setPolicy] = useState<Policy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState<PolicyFormData>({
    title: '',
    category: 'warranty',
    summary: '',
    content: '',
    effectiveDate: '',
    expiryDate: '',
    status: 'active',
    version: '1.0',
  });

  const loadPolicy = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError('');
      // TODO: Replace with API call
      const data = policiesData.find((p) => p.id === policyId);
      if (!data) throw new Error('Policy not found');
      setPolicy(data);
      populateForm(data);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to load policy');
    } finally {
      setIsLoading(false);
    }
  }, [policyId]);

  const populateForm = (data: Policy) => {
    setFormData({
      title: data.title,
      category: data.category,
      summary: data.summary,
      content: data.content,
      effectiveDate: data.effectiveDate,
      expiryDate: data.expiryDate || '',
      status: data.status,
      version: data.version,
    });
  };

  useEffect(() => {
    if (policyId) {
      void loadPolicy();
    }
  }, [policyId, loadPolicy]);

  const handleStartEdit = () => {
    if (policy) {
      populateForm(policy);
    }
    setIsEditing(true);
    setApiError('');
  };

  const handleCancelEdit = () => {
    if (policy) {
      populateForm(policy);
    }
    setIsEditing(false);
    setApiError('');
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setApiError('');
    try {
      // TODO: Call API to update policy
      console.log('Updating policy:', policyId, formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // Update local state
      const updated: Policy = {
        ...policy!,
        ...formData,
        updatedAt: new Date().toISOString(),
      };
      setPolicy(updated);
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
      // TODO: Call API to delete policy
      console.log('Deleting policy:', policyId);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/manager/policies');
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
      draft: 'bg-yellow-100 text-yellow-700',
    };
    const labels = {
      active: 'Đang hoạt động',
      inactive: 'Tạm dừng',
      draft: 'Bản nháp',
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
        <Header title={t('title')} subtitle="Chi tiết chính sách" />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  if (!policy) {
    return (
      <>
        <Header title={t('title')} subtitle="Chi tiết chính sách" />
        <div className="p-6">
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>Không tìm thấy chính sách</span>
          </div>
          <Link
            href="/manager/policies"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Link>
        </div>
      </>
    );
  }

  const CategoryIcon = getCategoryIcon(policy.category);

  return (
    <>
      <Header
        title={isEditing ? 'Chỉnh sửa chính sách' : 'Chi tiết chính sách'}
        subtitle={policy.title}
      />

      <div className="space-y-6 p-6">
        {/* Back Navigation & Actions */}
        <div className="flex items-center justify-between">
          <Link
            href="/manager/policies"
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
                <h3 className="text-lg font-semibold text-gray-900">Thông tin chính sách</h3>
                <div className="flex items-center gap-2">
                  <div className={cn('inline-flex items-center gap-2 rounded-full px-3 py-1', getCategoryColor(policy.category))}>
                    <CategoryIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{getCategoryLabel(policy.category)}</span>
                  </div>
                  {getStatusBadge(policy.status)}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Tiêu đề</label>
                  <p className="mt-1 text-lg font-medium text-gray-900">{policy.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Tóm tắt</label>
                  <p className="mt-1 text-gray-700">{policy.summary}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phiên bản</label>
                    <p className="mt-1 font-mono text-gray-900">{policy.version}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Ngày hiệu lực</label>
                    <p className="mt-1 text-gray-900">{formatDate(policy.effectiveDate)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Ngày hết hạn</label>
                    <p className="mt-1 text-gray-900">{policy.expiryDate ? formatDate(policy.expiryDate) : 'Không có'}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Content Card */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Nội dung chính sách</h3>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-gray-700">{policy.content}</pre>
              </div>
            </Card>

            {/* Metadata Card */}
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">Thông tin quản lý</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Người tạo</label>
                  <p className="mt-1 text-gray-900">{policy.createdBy}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Ngày tạo</label>
                  <p className="mt-1 text-gray-900">{formatDate(policy.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Cập nhật lần cuối</label>
                  <p className="mt-1 text-gray-900">{formatDate(policy.updatedAt)}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Edit Mode */}
        {isEditing && (
          <PolicyForm
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
            <AlertDialogTitle>Xác nhận xóa chính sách</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa chính sách <strong>{policy?.title}</strong>? Hành động này không thể hoàn tác.
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
