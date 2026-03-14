'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/atoms';
import { Avatar } from '@/components/atoms/Avatar';
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
import { userApi, type User } from '@/api';
import { AlertTriangle, ArrowLeft, Edit, Loader2, User as UserIcon, Shield, Trash2, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getUserManagementBasePath, isAdminAreaPath } from '@/lib/userManagement';

function roleBadge(role: string) {
  const map: Record<string, { label: string; cls: string }> = {
    admin: { label: 'System Admin', cls: 'bg-red-100 text-red-700' },
    manager: { label: 'Manager', cls: 'bg-amber-100 text-amber-700' },
    operations: { label: 'Operations', cls: 'bg-blue-100 text-blue-700' },
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
  const pathname = usePathname();
  const userId = params.id as string;
  const t = useTranslations('manager.users');
  const tDetail = useTranslations('manager.users.detail');
  const userBasePath = getUserManagementBasePath(pathname);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const canManageAdmins = isAdminAreaPath(pathname);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      setApiError('');
      const data = await userApi.getById(userId);
      setUser(data);
      setEditName(data.name);
      setEditEmail(data.email);
      setEditPhone(data.phone || '');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : t('loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      void loadUser();
    }
  }, [userId, loadUser]);

  const handleStartEdit = () => {
    if (user?.role === 'admin' && !canManageAdmins) {
      setApiError('Only System Admin can edit admin accounts');
      return;
    }

    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditPhone(user.phone || '');
    }
    setIsEditing(true);
    setApiError('');
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditName(user.name);
      setEditEmail(user.email);
      setEditPhone(user.phone || '');
    }
    setIsEditing(false);
    setApiError('');
  };

  const handleSave = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      setApiError(tDetail('fillRequired'));
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      await userApi.update(userId, {
        name: editName,
        email: editEmail,
        phone: editPhone || undefined,
      });
      await loadUser();
      setIsEditing(false);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : tDetail('updateFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (user?.role === 'admin' && !canManageAdmins) {
      setApiError('Only System Admin can delete admin accounts');
      return;
    }

    try {
      await userApi.remove(userId);
      router.push(userBasePath);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : t('deleteFailed'));
    }
  };

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
          <h2 className="mt-4 text-xl font-semibold">{tDetail('notFound')}</h2>
          {apiError && <p className="mt-2 text-sm text-red-600">{apiError}</p>}
          <Button onClick={() => router.push(userBasePath)} className="mt-4">
            {tDetail('backToList')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title={tDetail('title')}
        subtitle={`${tDetail('info')}: ${user.name}`}
      />

      <div className="space-y-6 p-6">
        {/* Top Actions Bar */}
        <div className="flex items-center justify-between">
          <Link
            href={userBasePath}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-amber-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {tDetail('backToList')}
          </Link>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                {!(user.role === 'admin' && !canManageAdmins) && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-sm text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      {tDetail('delete')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleStartEdit}
                      className="bg-amber-400 text-slate-900 hover:bg-amber-500"
                    >
                      <Edit className="mr-1 h-4 w-4" />
                      {tDetail('edit')}
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  <X className="mr-1 h-4 w-4" />
                  {tDetail('cancel')}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="bg-amber-400 text-slate-900 hover:bg-amber-500"
                >
                  <Save className="mr-1 h-4 w-4" />
                  {isSubmitting ? tDetail('saving') : tDetail('save')}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* User Profile */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <UserIcon className="h-5 w-5" />
              {tDetail('personalInfo')}
            </h3>
            <div className="mb-6 flex items-center gap-4">
              <Avatar name={user.name} size="lg" />
              <div>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                      placeholder={tDetail('namePlaceholder')}
                      required
                    />
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                      placeholder={tDetail('emailPlaceholder')}
                      required
                    />
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                      placeholder={tDetail('phonePlaceholder')}
                    />
                  </div>
                ) : (
                  <>
                    <h4 className="text-xl font-semibold text-gray-900">{user.name}</h4>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {user.phone && <p className="text-sm text-gray-500">{user.phone}</p>}
                  </>
                )}
              </div>
            </div>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">{tDetail('role')}</dt>
                <dd className="mt-1">{roleBadge(user.role)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{tDetail('loginVia')}</dt>
                <dd className="mt-1 text-base text-gray-900">{user.provider || 'local'}</dd>
              </div>
            </dl>
          </Card>

          {/* Account Details */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Shield className="h-5 w-5" />
              {tDetail('accountInfo')}
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">ID</dt>
                <dd className="mt-1 font-mono text-sm text-gray-900">{user.id}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{tDetail('createdAt')}</dt>
                <dd className="mt-1 text-base text-gray-900">{formatDate(user.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">{tDetail('updatedAt')}</dt>
                <dd className="mt-1 text-base text-gray-900">{formatDate(user.updatedAt)}</dd>
              </div>
            </dl>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tDetail('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('confirmDelete', { name: user.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tDetail('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{tDetail('confirmDelete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
