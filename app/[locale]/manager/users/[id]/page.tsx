'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/atoms';
import { Avatar } from '@/components/atoms/Avatar';
import { Card } from '@/components/ui/card';
import type { UserData } from '@/components/organisms/manager';
import { AlertTriangle, Edit, Loader2, User, Shield, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        // TODO: Implement API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Mock data
        setUser({
          id: Number(userId),
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@company.com',
          phone: '0901234567',
          status: 'Active',
          department: 'Quản lý Bán hàng',
          permissions: ['Quản lý sản phẩm', 'Quản lý giá', 'Báo cáo'],
          managesStaff: 8,
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
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
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
              <User className="h-5 w-5" />
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
                <dt className="text-sm font-medium text-gray-500">Trạng thái</dt>
                <dd className="mt-1">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-sm font-medium',
                      user.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {user.status}
                  </span>
                </dd>
              </div>
            </dl>
          </Card>

          {/* Role & Permissions */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Shield className="h-5 w-5" />
              Vai trò & Quyền hạn
            </h3>
            <dl className="space-y-3">
              {user.department && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phòng ban</dt>
                  <dd className="mt-1 text-base text-gray-900">{user.department}</dd>
                </div>
              )}
              {user.position && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Vị trí</dt>
                  <dd className="mt-1 text-base text-gray-900">{user.position}</dd>
                </div>
              )}
              {user.permissions && user.permissions.length > 0 && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Quyền hạn</dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {user.permissions.map((perm, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700"
                      >
                        {perm}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
              {user.managesStaff !== undefined && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Quản lý nhân sự</dt>
                  <dd className="mt-1 text-base text-gray-900">{user.managesStaff} nhân viên</dd>
                </div>
              )}
              {user.manager && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Được quản lý bởi</dt>
                  <dd className="mt-1 text-base text-gray-900">{user.manager}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
