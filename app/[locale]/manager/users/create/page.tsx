'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { UserForm, type UserFormData, type UserRole } from '@/components/organisms/manager';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Shield, Briefcase } from 'lucide-react';

export default function CreateUserPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('manager');
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
      setApiError('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      // TODO: Implement API call
      console.log('Creating user:', { ...formData, role: selectedRole });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      router.push('/manager/users');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Create failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title="Thêm người dùng mới"
        subtitle="Tạo tài khoản Manager hoặc Staff"
      />

      <div className="space-y-6 p-6">
        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Role Selection */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Chọn vai trò</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => setSelectedRole('manager')}
              className={`rounded-lg border-2 p-6 text-left transition-all ${
                selectedRole === 'manager'
                  ? 'border-amber-500 bg-amber-50'
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
              onClick={() => setSelectedRole('staff')}
              className={`rounded-lg border-2 p-6 text-left transition-all ${
                selectedRole === 'staff'
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Briefcase className="mb-2 h-8 w-8 text-blue-600" />
              <h4 className="mb-1 font-semibold text-gray-900">Staff</h4>
              <p className="text-sm text-gray-600">
                Xử lý đơn hàng, kho, vận chuyển và chăm sóc khách hàng
              </p>
            </button>
          </div>
        </Card>

        {/* User Form */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Thông tin người dùng</h3>
          <UserForm
            role={selectedRole}
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isSubmitting={isSubmitting}
          />
        </Card>
      </div>
    </>
  );
}
