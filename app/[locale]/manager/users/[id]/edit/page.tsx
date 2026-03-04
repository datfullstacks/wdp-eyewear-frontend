'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { UserForm, type UserFormData } from '@/components/organisms/manager';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Loader2 } from 'lucide-react';
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
      await userApi.update(userId, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
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
        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Thông tin người dùng</h3>
          <UserForm
            role={role}
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
