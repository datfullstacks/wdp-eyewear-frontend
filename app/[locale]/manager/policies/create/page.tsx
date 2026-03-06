'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/organisms/Header';
import { PolicyForm, type PolicyFormData } from '@/components/organisms/manager';
import { AlertTriangle, ArrowLeft, Shield } from 'lucide-react';

const EMPTY_FORM: PolicyFormData = {
  title: '',
  category: 'warranty',
  summary: '',
  content: '',
  effectiveDate: '',
  expiryDate: '',
  status: 'draft',
  version: '1.0',
};

export default function CreatePolicyPage() {
  const router = useRouter();
  const t = useTranslations('manager.policies');
  const [formData, setFormData] = useState<PolicyFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async () => {
    if (!formData.title || !formData.summary || !formData.content || !formData.effectiveDate) {
      setApiError('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      // TODO: Call API to create policy
      console.log('Creating policy:', formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/manager/policies');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Tạo chính sách thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title="Tạo chính sách mới"
        subtitle="Thêm chính sách bảo hành, đổi trả và dịch vụ"
      />

      <div className="space-y-6 p-6">
        {/* Back Navigation */}
        <Link
          href="/manager/policies"
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
            <Shield className="h-5 w-5" />
            Hướng dẫn viết chính sách
          </h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• <strong>Tiêu đề</strong>: Ngắn gọn, rõ ràng về nội dung chính sách</li>
            <li>• <strong>Tóm tắt</strong>: Mô tả ngắn gọn điểm chính của chính sách (1-2 câu)</li>
            <li>• <strong>Nội dung</strong>: Sử dụng Markdown để định dạng (##, ###, *, -)</li>
            <li>• <strong>Phiên bản</strong>: Bắt đầu từ 1.0, tăng 0.1 cho thay đổi nhỏ, tăng 1.0 cho thay đổi lớn</li>
            <li>• <strong>Trạng thái</strong>: Tạo "Bản nháp" để review trước khi "Đang hoạt động"</li>
          </ul>
        </div>

        {/* Form */}
        <PolicyForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/manager/policies')}
          isSubmitting={isSubmitting}
          submitLabel="Tạo chính sách"
        />
      </div>
    </>
  );
}
