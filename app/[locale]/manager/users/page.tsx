'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { getSession } from 'next-auth/react';
import {
  AlertTriangle,
  Briefcase,
  Loader2,
  Settings2,
  Shield,
  Users,
} from 'lucide-react';

import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { UserTable, type UserTabRole } from '@/components/organisms/manager';
import { userApi, type User, toFrontendRole } from '@/api';
import { getUserManagementBasePath, isAdminAreaPath } from '@/lib/userManagement';

type ManagementTab = 'admins' | 'managers' | 'staff' | 'operations' | 'customers';

type TabConfig = {
  tab: ManagementTab;
  role: string;
  tableRole: UserTabRole;
  count: number;
  users: User[];
  icon: typeof Shield;
  tabLabel: string;
  statLabel: string;
  addLabel: string | null;
  activeClassName: string;
  inactiveClassName: string;
  iconClassName: string;
};

export default function UsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('manager.users');
  const [viewerRole, setViewerRole] = useState('');
  const [activeTab, setActiveTab] = useState<ManagementTab>(
    isAdminAreaPath(pathname) ? 'admins' : 'managers'
  );
  const [admins, setAdmins] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [staffMembers, setStaffMembers] = useState<User[]>([]);
  const [operationsMembers, setOperationsMembers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const userBasePath = getUserManagementBasePath(pathname);
  const canManageAdmins = isAdminAreaPath(pathname) || viewerRole === 'admin';

  useEffect(() => {
    void getSession().then((session) => {
      setViewerRole(toFrontendRole(String(session?.user?.role || '')));
    });
  }, []);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const [adminRes, mgrRes, staffRes, opsRes, custRes] = await Promise.all([
        canManageAdmins
          ? userApi.getAll({ role: 'admin', limit: 100 })
          : Promise.resolve({ users: [], total: 0, page: 1, pageSize: 100 }),
        userApi.getAll({ role: 'manager', limit: 100 }),
        userApi.getAll({ role: 'staff', limit: 100 }),
        userApi.getAll({ role: 'operation', limit: 100 }),
        userApi.getAll({ role: 'customer', limit: 100 }),
      ]);

      setAdmins(adminRes.users);
      setManagers(mgrRes.users);
      setStaffMembers(staffRes.users);
      setOperationsMembers(opsRes.users);
      setCustomers(custRes.users);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : t('loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, [canManageAdmins, t]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    if (!canManageAdmins && activeTab === 'admins') {
      setActiveTab('managers');
    }
  }, [activeTab, canManageAdmins]);

  const tabConfigs = useMemo<Record<ManagementTab, TabConfig>>(
    () => ({
      admins: {
        tab: 'admins',
        role: 'admin',
        tableRole: 'admin',
        count: admins.length,
        users: admins,
        icon: Shield,
        tabLabel: locale === 'vi' ? 'Admin' : 'Admins',
        statLabel: locale === 'vi' ? 'Tong admin' : 'Total Admins',
        addLabel: locale === 'vi' ? 'Them admin moi' : 'Add New Admin',
        activeClassName: 'border-red-500 text-red-600',
        inactiveClassName:
          'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
        iconClassName: activeTab === 'admins' ? 'text-red-600' : 'text-gray-500',
      },
      managers: {
        tab: 'managers',
        role: 'manager',
        tableRole: 'manager',
        count: managers.length,
        users: managers,
        icon: Shield,
        tabLabel: locale === 'vi' ? 'Manager' : 'Managers',
        statLabel: t('stats.totalManagers'),
        addLabel: t('addManager'),
        activeClassName: 'border-amber-500 text-amber-600',
        inactiveClassName:
          'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
        iconClassName: activeTab === 'managers' ? 'text-amber-600' : 'text-gray-500',
      },
      staff: {
        tab: 'staff',
        role: 'staff',
        tableRole: 'staff',
        count: staffMembers.length,
        users: staffMembers,
        icon: Briefcase,
        tabLabel: locale === 'vi' ? 'Staff' : 'Staff',
        statLabel: locale === 'vi' ? 'Tong staff' : 'Total Staff',
        addLabel: t('addStaff'),
        activeClassName: 'border-indigo-500 text-indigo-600',
        inactiveClassName:
          'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
        iconClassName: activeTab === 'staff' ? 'text-indigo-600' : 'text-gray-500',
      },
      operations: {
        tab: 'operations',
        role: 'operation',
        tableRole: 'operation',
        count: operationsMembers.length,
        users: operationsMembers,
        icon: Settings2,
        tabLabel: locale === 'vi' ? 'Operation' : 'Operations',
        statLabel: locale === 'vi' ? 'Tong operation' : 'Total Operations',
        addLabel: locale === 'vi' ? 'Them operation moi' : 'Add New Operation',
        activeClassName: 'border-blue-500 text-blue-600',
        inactiveClassName:
          'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
        iconClassName: activeTab === 'operations' ? 'text-blue-600' : 'text-gray-500',
      },
      customers: {
        tab: 'customers',
        role: 'customer',
        tableRole: 'customer',
        count: customers.length,
        users: customers,
        icon: Users,
        tabLabel: locale === 'vi' ? 'Customer' : 'Customers',
        statLabel: t('stats.totalCustomers'),
        addLabel: null,
        activeClassName: 'border-green-500 text-green-600',
        inactiveClassName:
          'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
        iconClassName: activeTab === 'customers' ? 'text-green-600' : 'text-gray-500',
      },
    }),
    [activeTab, admins, customers, locale, managers, operationsMembers, staffMembers, t]
  );

  const currentTab = tabConfigs[activeTab];
  const visibleTabs = (canManageAdmins
    ? ['admins', 'managers', 'staff', 'operations', 'customers']
    : ['managers', 'staff', 'operations', 'customers']) as ManagementTab[];
  const resolvedCurrentTab = currentTab || tabConfigs[visibleTabs[0]];

  const handleView = (user: User) => {
    router.push(`${userBasePath}/${user.id}`);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(t('confirmDelete', { name: user.name }))) return;
    try {
      await userApi.remove(user.id);
      await loadUsers();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : t('deleteFailed'));
    }
  };

  return (
    <>
      <Header
        title={t('title')}
        subtitle={
          locale === 'vi'
            ? 'Phan chia nguoi dung theo role dung workspace hien tai'
            : 'Split users by role inside the current workspace'
        }
        showAddButton={Boolean(resolvedCurrentTab?.addLabel)}
        addButtonLabel={resolvedCurrentTab?.addLabel || ''}
        onAdd={() =>
          router.push(`${userBasePath}/create?role=${resolvedCurrentTab?.role || 'staff'}`)
        }
      />

      <div className="space-y-8 p-6">
        <section className="border-b border-gray-200">
          <nav className="-mb-px flex flex-wrap gap-x-8 gap-y-3">
            {visibleTabs.map((tabKey) => {
              const tab = tabConfigs[tabKey];
              const Icon = tab.icon;
              return (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`flex items-center border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === tabKey ? tab.activeClassName : tab.inactiveClassName
                  }`}
                >
                  <Icon className={`mr-2 h-4 w-4 ${tab.iconClassName}`} />
                  {tab.tabLabel} ({tab.count})
                </button>
              );
            })}
          </nav>
        </section>

        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StatCard
            title={resolvedCurrentTab.statLabel}
            value={resolvedCurrentTab.count.toString()}
            icon={resolvedCurrentTab.icon}
            trend={{ value: 0, isPositive: true }}
          />
        </section>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        {!isLoading && (
          <section className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <UserTable
              users={resolvedCurrentTab.users}
              role={resolvedCurrentTab.tableRole}
              onView={handleView}
              onDelete={activeTab !== 'customers' ? handleDelete : undefined}
              translations={{
                user: t('table.user'),
                role: t('table.role'),
                phone: t('table.phone'),
                loginVia: t('table.loginVia'),
                createdAt: t('table.createdAt'),
                actions: t('table.actions'),
                noData: t('table.noData'),
                viewDetails: t('table.viewDetails'),
                deleteUser: t('table.deleteUser'),
              }}
            />
          </section>
        )}
      </div>
    </>
  );
}
