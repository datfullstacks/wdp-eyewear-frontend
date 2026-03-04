'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/atoms';
import { Avatar } from '@/components/atoms/Avatar';
import { Card } from '@/components/ui/card';
import { userApi, type User } from '@/api';
import { AlertTriangle, Loader2, User as UserIcon, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

function roleBadge(role: string) {
  const map: Record<string, { label: string; cls: string }> = {
    admin: { label: 'Admin', cls: 'bg-red-100 text-red-700' },
    manager: { label: 'Manager', cls: 'bg-amber-100 text-amber-700' },
    operations: { label: 'Operations (Staff)', cls: 'bg-blue-100 text-blue-700' },
    sales: { label: 'Sales', cls: 'bg-indigo-100 text-indigo-700' },
    customer: { label: 'Customer', cls: 'bg-green-100 text-green-700' },
  };
  const info = map[role] || { label: role, cls: 'bg-gray-100 text-gray-700' };
  return (
    <span className={cn('rounded-full px-3 py-1 text-sm font-medium', info.cls)}>
      {info.label}
    </span>
  );
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        const data = await userApi.getById(userId);
        setUser(data);
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-4 text-xl font-semibold">User not found</h2>
          {apiError && <p className="mt-2 text-sm text-red-600">{apiError}</p>}
          <Button onClick={() => router.back()} className="mt-4">
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Chi tiết người dùng"
        subtitle={`Thông tin: ${user.name}`}
        showAddButton
        addButtonLabel="Chỉnh sửa"
        onAdd={() => router.push(`/manager/users/${userId}/edit`)}
      />

      <div className="space-y-6 p-6">
        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* User Profile */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <UserIcon className="h-5 w-5" />
              Thông tin cá nhân
            </h3>
            <div className="mb-6 flex items-center gap-4">
              <Avatar name={user.name} size="lg" />
              <div>
                <h4 className="text-xl font-semibold text-gray-900">{user.name}</h4>
                <p className="text-sm text-gray-500">{user.email}</p>
                {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
              </div>
            </div>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Vai trò</dt>
                <dd className="mt-1">{roleBadge(user.role)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Đăng nhập qua</dt>
                <dd className="mt-1 text-base text-gray-900">{user.provider || 'local'}</dd>
              </div>
            </dl>
          </Card>

          {/* Details */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Shield className="h-5 w-5" />
              Thông tin tài khoản
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="mt-1 font-mono text-sm text-gray-900">{user.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Ngày tạo</dt>
                <dd className="mt-1 text-base text-gray-900">{formatDate(user.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Cập nhật lần cuối</dt>
                <dd className="mt-1 text-base text-gray-900">{formatDate(user.updatedAt)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
