'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { UserTable, type UserTabRole } from '@/components/organisms/manager';
import { userApi, type User } from '@/api';
import { Shield, Briefcase, Users, AlertTriangle, Loader2 } from 'lucide-react';

export default function UsersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'managers' | 'staff' | 'customers'>('managers');
  const [managers, setManagers] = useState<User[]>([]);
  const [staffMembers, setStaffMembers] = useState<User[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const [mgrRes, staffRes, custRes] = await Promise.all([
        userApi.getAll({ role: 'manager', limit: 100 }),
        userApi.getAll({ role: 'staff', limit: 100 }), // mapped to "operations" in API layer
        userApi.getAll({ role: 'customer', limit: 100 }),
      ]);
      setManagers(mgrRes.users);
      setStaffMembers(staffRes.users);
      setCustomers(custRes.users);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const managerStats = [
    {
      title: 'Tổng Manager',
      value: managers.length.toString(),
      icon: Shield,
      trend: { value: 0, isPositive: true },
    },
  ];

  const staffStats = [
    {
      title: 'Tổng Staff (Operations)',
      value: staffMembers.length.toString(),
      icon: Briefcase,
      trend: { value: 0, isPositive: true },
    },
  ];

  const customerStats = [
    {
      title: 'Tổng khách hàng',
      value: customers.length.toString(),
      icon: Users,
      trend: { value: 0, isPositive: true },
    },
  ];

  const currentStats =
    activeTab === 'managers'
      ? managerStats
      : activeTab === 'staff'
        ? staffStats
        : customerStats;

  const currentData =
    activeTab === 'managers'
      ? managers
      : activeTab === 'staff'
        ? staffMembers
        : customers;

  const currentRole: UserTabRole =
    activeTab === 'managers' ? 'manager' : activeTab === 'staff' ? 'staff' : 'customer';

  const getAddButtonLabel = () => {
    if (activeTab === 'managers') return 'Thêm Manager mới';
    if (activeTab === 'staff') return 'Thêm Staff mới';
    return null;
  };

  const handleView = (user: User) => {
    router.push(`/manager/users/${user.id}`);
  };

  const handleEdit = (user: User) => {
    router.push(`/manager/users/${user.id}/edit`);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Bạn có chắc muốn xóa ${user.name}?`)) return;
    try {
      await userApi.remove(user.id);
      await loadUsers();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  return (
    <>
      <Header
        title="Quản lý Nhân sự"
        subtitle="Quản lý Manager, Staff và Customer"
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
              Quản lý Manager ({managers.length})
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'staff'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Briefcase
                className={`mr-2 h-4 w-4 ${
                  activeTab === 'staff' ? 'text-blue-600' : 'text-gray-500'
                }`}
              />
              Quản lý Staff ({staffMembers.length})
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
              Chăm sóc Customer ({customers.length})
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
          <section className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
            <UserTable
              users={currentData}
              role={currentRole}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={activeTab !== 'customers' ? handleDelete : undefined}
            />
          </section>
        )}
      </div>
    </>
  );
}
