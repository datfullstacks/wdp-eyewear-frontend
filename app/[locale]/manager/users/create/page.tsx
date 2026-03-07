'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/organisms/Header';
import { UserForm, type UserFormData } from '@/components/organisms/manager';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Shield, Briefcase, ArrowLeft } from 'lucide-react';
import { userApi } from '@/api';

type CreateRole = 'manager' | 'sales';

export default function CreateUserPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<CreateRole>('manager');
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    permissions: [],
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setApiError('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      await userApi.create({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: selectedRole === 'sales' ? 'sales' : 'manager',
        phone: formData.phone || undefined,
      });
      router.push('/manager/users');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Tạo người dùng thất bại');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title="Thêm người dùng mới"
        subtitle="Tạo tài khoản Manager hoặc Sale"
      />

      <div className="space-y-6 p-6">
        {/* Back navigation */}
        <Link
          href="/manager/users"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại Quản lý người dùng
        </Link>

        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Role Selection */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Chọn vai trò</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setSelectedRole('manager')}
              className={`rounded-lg border-2 p-6 text-left transition-all ${
                selectedRole === 'manager'
                  ? 'border-amber-500 bg-amber-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Shield className="mb-2 h-8 w-8 text-amber-600" />
              <h4 className="mb-1 font-semibold text-gray-900">Manager</h4>
              <p className="text-sm text-gray-600">
                Quản lý sản phẩm, giá, chính sách và báo cáo
              </p>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('sales')}
              className={`rounded-lg border-2 p-6 text-left transition-all ${
                selectedRole === 'sales'
                  ? 'border-blue-500 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Briefcase className="mb-2 h-8 w-8 text-blue-600" />
              <h4 className="mb-1 font-semibold text-gray-900">Sale (Sales Team)</h4>
              <p className="text-sm text-gray-600">
                Bán hàng tại cửa hàng, xử lý đơn hàng và chăm sóc khách hàng
              </p>
            </button>
          </div>
        </Card>

        {/* User Form */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Thông tin người dùng</h3>
          <UserForm
            role={selectedRole}
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/manager/users')}
            isSubmitting={isSubmitting}
            showPassword
          />
        </Card>
      </div>
    </>
  );
}
