'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { getSession } from 'next-auth/react';
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Loader2,
  Settings2,
  Shield,
} from 'lucide-react';

import { Header } from '@/components/organisms/Header';
import { UserForm, type UserFormData } from '@/components/organisms/manager';
import { Card } from '@/components/ui/card';
import { storeApi, userApi, toFrontendRole, type StoreRecord } from '@/api';
import { normalizeRole } from '@/lib/roles';
import { getUserManagementBasePath, isAdminAreaPath } from '@/lib/userManagement';

type EditRole = 'admin' | 'manager' | 'staff' | 'operation' | 'customer';

type RoleCard = {
  role: Exclude<EditRole, 'customer'>;
  title: string;
  description: string;
  icon: typeof Shield;
  activeClassName: string;
};

const ROLE_CARDS: RoleCard[] = [
  {
    role: 'staff',
    title: 'Sales',
    description: 'Store sales, order intake, follow-up and customer care.',
    icon: Briefcase,
    activeClassName: 'border-indigo-500 bg-indigo-50 shadow-sm',
  },
  {
    role: 'operation',
    title: 'Operation',
    description: 'Fulfillment, inventory, shipping and prescription execution.',
    icon: Settings2,
    activeClassName: 'border-blue-500 bg-blue-50 shadow-sm',
  },
  {
    role: 'manager',
    title: 'Manager',
    description: 'Pricing, policies, approvals, KPI and business oversight.',
    icon: Shield,
    activeClassName: 'border-amber-500 bg-amber-50 shadow-sm',
  },
  {
    role: 'admin',
    title: 'System Admin',
    description: 'Auth, permissions, security, integrations and platform control.',
    icon: Shield,
    activeClassName: 'border-red-500 bg-red-50 shadow-sm',
  },
];

function resolveEditableRole(rawRole: string): EditRole {
  const normalized = normalizeRole(rawRole);
  if (
    normalized === 'customer' ||
    normalized === 'staff' ||
    normalized === 'operation' ||
    normalized === 'manager' ||
    normalized === 'admin'
  ) {
    return normalized;
  }
  return 'customer';
}

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const userId = params.id as string;
  const [viewerRole, setViewerRole] = useState('');
  const [storeOptions, setStoreOptions] = useState<StoreRecord[]>([]);

  const [role, setRole] = useState<EditRole>('customer');
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    permissions: [],
    password: '',
    storeScopeMode: 'all',
    primaryStoreId: '',
    storeIds: [],
    storeScopeNote: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const userBasePath = getUserManagementBasePath(pathname);
  const canManageAdmins = isAdminAreaPath(pathname) || viewerRole === 'admin';
  const availableRoleCards = useMemo(
    () =>
      canManageAdmins
        ? ROLE_CARDS
        : ROLE_CARDS.filter((item) => item.role !== 'admin'),
    [canManageAdmins]
  );
  const isLockedAdminRole = role === 'admin' && !canManageAdmins;

  useEffect(() => {
    let mounted = true;

    const loadContext = async () => {
      const session = await getSession();
      if (!mounted) return;

      setViewerRole(normalizeRole(session?.user?.role));

      try {
        const [storesRes, viewerUser] = await Promise.all([
          storeApi.getAll({ limit: 200, status: 'all' }),
          session?.user?.id ? userApi.getById(session.user.id) : Promise.resolve(null),
        ]);

        const actorStoreIds =
          viewerUser?.storeAccess?.mode === 'selected'
            ? viewerUser.storeAccess.storeIds
            : null;
        const filteredStores = actorStoreIds
          ? storesRes.stores.filter((store) => actorStoreIds.includes(store.id))
          : storesRes.stores;

        if (!mounted) return;
        setStoreOptions(filteredStores);
      } catch {
        if (!mounted) return;
        setStoreOptions([]);
      }
    };

    void loadContext();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        setApiError('');
        const user = await userApi.getById(userId);
        setRole(resolveEditableRole(toFrontendRole(user.role)));
        setFormData({
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          department: user.department || '',
          position: user.position || '',
          permissions: user.permissions || [],
          password: '',
          storeScopeMode: user.storeAccess?.mode || 'all',
          primaryStoreId: user.storeAccess?.primaryStoreId || '',
          storeIds: user.storeAccess?.storeIds || [],
          storeScopeNote: user.storeAccess?.note || '',
        });
      } catch (error) {
        setApiError(
          error instanceof Error ? error.message : 'Failed to load user'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      void loadUser();
    }
  }, [userId]);

  const selectedRoleMeta = useMemo(
    () => ROLE_CARDS.find((item) => item.role === role) || null,
    [role]
  );

  const handleSubmit = async () => {
    if (isLockedAdminRole) {
      setApiError('Only System Admin can edit admin accounts');
      return;
    }

    if (!formData.name || !formData.email) {
      setApiError('Vui long dien day du cac truong bat buoc');
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      await userApi.update(userId, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        role,
        department: formData.department || undefined,
        position: formData.position || undefined,
        permissions: formData.permissions || [],
        storeAccess:
          role === 'admin' || role === 'customer'
            ? { mode: 'all', storeIds: [] }
            : {
                mode: formData.storeScopeMode || 'all',
                primaryStoreId: formData.primaryStoreId || undefined,
                storeIds: formData.storeIds || [],
                note: formData.storeScopeNote || undefined,
              },
      });
      router.push(userBasePath);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Cap nhat that bai');
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
        title="Chinh sua nguoi dung"
        subtitle={`Cap nhat thong tin: ${formData.name}`}
      />

      <div className="space-y-6 p-6">
        <Link
          href={userBasePath}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lai Quan ly nguoi dung
        </Link>

        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        {isLockedAdminRole && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Tai khoan admin chi duoc chinh sua trong khu /admin.
          </div>
        )}

        {role !== 'customer' && !isLockedAdminRole && (
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Vai tro</h3>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {availableRoleCards.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => setRole(item.role)}
                    className={`rounded-lg border-2 p-6 text-left transition-all ${
                      role === item.role
                        ? item.activeClassName
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="mb-2 h-8 w-8 text-gray-900" />
                    <h4 className="mb-1 font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            {selectedRoleMeta
              ? `Thong tin ${selectedRoleMeta.title}`
              : 'Thong tin nguoi dung'}
          </h3>
          <UserForm
            role={role}
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => router.push(userBasePath)}
            isSubmitting={isSubmitting}
            storeOptions={storeOptions}
          />
        </Card>
      </div>
    </>
  );
}
