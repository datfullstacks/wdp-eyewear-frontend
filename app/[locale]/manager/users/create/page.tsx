'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getSession } from 'next-auth/react';
import {
  AlertTriangle,
  ArrowLeft,
  Briefcase,
  Settings2,
  Shield,
} from 'lucide-react';

import { Header } from '@/components/organisms/Header';
import { UserForm, type UserFormData } from '@/components/organisms/manager';
import { Card } from '@/components/ui/card';
import { storeApi, userApi, type StoreRecord } from '@/api';
import { normalizeRole } from '@/lib/roles';
import { getUserManagementBasePath, isAdminAreaPath } from '@/lib/userManagement';

type CreateRole = 'admin' | 'manager' | 'staff' | 'operation';

type RoleCard = {
  role: CreateRole;
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

function resolveInitialRole(rawRole: string | null, canManageAdmins: boolean): CreateRole {
  const normalized = normalizeRole(rawRole);
  if (
    normalized === 'staff' ||
    normalized === 'operation' ||
    normalized === 'manager'
  ) {
    return normalized;
  }

  if (canManageAdmins && normalized === 'admin') {
    return 'admin';
  }

  return 'staff';
}

export default function CreateUserPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedRole, setSelectedRole] = useState<CreateRole>('staff');
  const [viewerRole, setViewerRole] = useState('');
  const [storeOptions, setStoreOptions] = useState<StoreRecord[]>([]);
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const userBasePath = getUserManagementBasePath(pathname);
  const canManageAdmins = isAdminAreaPath(pathname) || viewerRole === 'admin';

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
        setFormData((currentValue) => ({
          ...currentValue,
          storeScopeMode:
            currentValue.storeScopeMode ||
            (actorStoreIds ? 'selected' : 'all'),
          primaryStoreId:
            currentValue.primaryStoreId ||
            viewerUser?.storeAccess?.primaryStoreId ||
            '',
          storeIds:
            currentValue.storeIds && currentValue.storeIds.length > 0
              ? currentValue.storeIds
              : actorStoreIds || [],
        }));
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
    setSelectedRole(resolveInitialRole(searchParams.get('role'), canManageAdmins));
  }, [canManageAdmins, searchParams]);

  const availableRoleCards = useMemo(
    () =>
      canManageAdmins
        ? ROLE_CARDS
        : ROLE_CARDS.filter((item) => item.role !== 'admin'),
    [canManageAdmins]
  );

  const selectedRoleMeta = useMemo(
    () =>
      ROLE_CARDS.find((item) => item.role === selectedRole) ||
      availableRoleCards[0] ||
      ROLE_CARDS[0],
    [availableRoleCards, selectedRole]
  );

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setApiError('Vui long dien day du cac truong bat buoc');
      return;
    }

    setIsSubmitting(true);
    setApiError('');

    try {
      await userApi.create({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        phone: formData.phone || undefined,
        department: formData.department || undefined,
        position: formData.position || undefined,
        permissions: formData.permissions || [],
        storeAccess:
          selectedRole === 'admin'
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
      setApiError(
        error instanceof Error ? error.message : 'Tao nguoi dung that bai'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title="Them nguoi dung moi"
        subtitle={`Tao tai khoan ${selectedRoleMeta.title}`}
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

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Chon vai tro</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {availableRoleCards.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => setSelectedRole(item.role)}
                  className={`rounded-lg border-2 p-6 text-left transition-all ${
                    selectedRole === item.role
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

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Thong tin nguoi dung
          </h3>
          <UserForm
            role={selectedRole}
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => router.push(userBasePath)}
            isSubmitting={isSubmitting}
            showPassword
            storeOptions={storeOptions}
          />
        </Card>
      </div>
    </>
  );
}
