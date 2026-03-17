'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { UserTable, type UserTabRole } from '@/components/organisms/manager';
import { userApi, type User } from '@/api';
import { Shield, Briefcase, Users, AlertTriangle, Loader2 } from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const t = useTranslations('manager.users');
  const [activeTab, setActiveTab] = useState<
    'managers' | 'sales' | 'customers'
  >('managers');
  const [managers, setManagers] = useState<User[]>([]);
  const [salesMembers, setSalesMembers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const [mgrRes, salesRes, custRes] = await Promise.all([
        userApi.getAll({ role: 'manager', limit: 100 }),
        userApi.getAll({ role: 'sales', limit: 100 }),
        userApi.getAll({ role: 'customer', limit: 100 }),
      ]);
      setManagers(mgrRes.users);
      setSalesMembers(salesRes.users);
      setCustomers(custRes.users);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : t('loadFailed'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const managerStats = [
    {
      title: t('stats.totalManagers'),
      value: managers.length.toString(),
      icon: Shield,
      trend: { value: 0, isPositive: true },
    },
  ];

  const salesStats = [
    {
      title: t('stats.totalStaff'),
      value: salesMembers.length.toString(),
      icon: Briefcase,
      trend: { value: 0, isPositive: true },
    },
  ];

  const customerStats = [
    {
      title: t('stats.totalCustomers'),
      value: customers.length.toString(),
      icon: Users,
      trend: { value: 0, isPositive: true },
    },
  ];

  const currentStats =
    activeTab === 'managers'
      ? managerStats
      : activeTab === 'sales'
        ? salesStats
        : customerStats;

  const currentData =
    activeTab === 'managers'
      ? managers
      : activeTab === 'sales'
        ? salesMembers
        : customers;

  const currentRole: UserTabRole =
    activeTab === 'managers'
      ? 'manager'
      : activeTab === 'sales'
        ? 'sales'
        : 'customer';

  const getAddButtonLabel = () => {
    if (activeTab === 'managers') return t('addManager');
    if (activeTab === 'sales') return t('addStaff');
    return null;
  };

  const handleView = (user: User) => {
    router.push(`/manager/users/${user.id}`);
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
        subtitle={t('subtitle')}
        showAddButton={activeTab !== 'customers'}
        addButtonLabel={getAddButtonLabel() || ''}
        onAdd={() => router.push('/manager/users/create')}
      />

      <div className="space-y-8 p-6">
        {/* Tab Navigation */}
        <section className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('managers')}
              className={`flex items-center border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'managers'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Shield
                className={`mr-2 h-4 w-4 ${
                  activeTab === 'managers' ? 'text-amber-600' : 'text-gray-500'
                }`}
              />
              {t('tabs.managers')} ({managers.length})
            </button>
            <button
              onClick={() => setActiveTab('sales')}
              className={`flex items-center border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'sales'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Briefcase
                className={`mr-2 h-4 w-4 ${
                  activeTab === 'sales' ? 'text-blue-600' : 'text-gray-500'
                }`}
              />
              {t('tabs.staff')} ({salesMembers.length})
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'customers'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Users
                className={`mr-2 h-4 w-4 ${
                  activeTab === 'customers' ? 'text-green-600' : 'text-gray-500'
                }`}
              />
              {t('tabs.customers')} ({customers.length})
            </button>
          </nav>
        </section>

        {/* Error Message */}
        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {currentStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </section>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* Users Table */}
        {!isLoading && (
          <section className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <UserTable
              users={currentData}
              role={currentRole}
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
