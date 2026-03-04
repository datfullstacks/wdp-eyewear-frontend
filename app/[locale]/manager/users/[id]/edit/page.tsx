'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/organisms/Header';
import { UserForm, type UserFormData } from '@/components/organisms/manager';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Loader2, ArrowLeft, Shield, Briefcase } from 'lucide-react';
import { userApi, toFrontendRole } from '@/api';

type EditRole = 'manager' | 'staff' | 'customer';

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [role, setRole] = useState<EditRole>('manager');
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    permissions: [],
    password: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const user = await userApi.getById(userId);
        const frontendRole = toFrontendRole(user.role) as EditRole;
        setRole(frontendRole);
        setFormData({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          department: '',
          position: '',
          permissions: [],
          password: '',
        });
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Failed to load user');
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      void loadUser();
    }
  }, [userId]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      setApiError('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      // PUT /api/users/{id} with {name, email, role} as per API spec
      await userApi.update(userId, {
        name: formData.name,
        email: formData.email,
        role: role === 'staff' ? 'operations' : role,
      });
      router.push('/manager/users');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Cập nhật thất bại');
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

  return (
    <>
      <Header
        title="Chỉnh sửa người dùng"
        subtitle={`Cập nhật thông tin: ${formData.name}`}
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

        {/* Role Selection (editable) */}
        {role !== 'customer' && (
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Vai trò</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setRole('manager')}
                className={`rounded-lg border-2 p-6 text-left transition-all ${
                  role === 'manager'
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
                onClick={() => setRole('staff')}
                className={`rounded-lg border-2 p-6 text-left transition-all ${
                  role === 'staff'
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Briefcase className="mb-2 h-8 w-8 text-blue-600" />
                <h4 className="mb-1 font-semibold text-gray-900">Staff (Operations)</h4>
                <p className="text-sm text-gray-600">
                  Xử lý đơn hàng, kho, vận chuyển và chăm sóc khách hàng
                </p>
              </button>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Thông tin người dùng</h3>
          <UserForm
            role={role}
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/manager/users')}
            isSubmitting={isSubmitting}
          />
        </Card>
      </div>
    </>
  );
}
