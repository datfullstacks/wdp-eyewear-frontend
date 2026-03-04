'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { UserTable, type UserData, type UserRole } from '@/components/organisms/manager';
import { Shield, Briefcase, Users } from 'lucide-react';

// Mock data
const managers: UserData[] = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@company.com',
    phone: '0901234567',
    department: 'Quản lý Bán hàng',
    permissions: ['Quản lý sản phẩm', 'Quản lý giá', 'Báo cáo'],
    managesStaff: 8,
    status: 'Active',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@company.com',
    phone: '0902345678',
    department: 'Quản lý Kho',
    permissions: ['Quản lý kho', 'Nhập hàng'],
    managesStaff: 5,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Lê Minh C',
    email: 'leminhc@company.com',
    phone: '0903456789',
    department: 'Quản lý Marketing',
    permissions: ['Quản lý khuyến mãi', 'Báo cáo'],
    managesStaff: 3,
    status: 'Active',
  },
];

const staffMembers: UserData[] = [
  {
    id: 4,
    name: 'Phạm Thị D',
    email: 'phamthid@company.com',
    phone: '0904567890',
    position: 'Nhân viên bán hàng',
    manager: 'Nguyễn Văn A',
    performance: 'Xuất sắc',
    tasksCompleted: 245,
    status: 'Active',
  },
  {
    id: 5,
    name: 'Hoàng Văn E',
    email: 'hoangvane@company.com',
    phone: '0905678901',
    position: 'Nhân viên kho',
    manager: 'Trần Thị B',
    performance: 'Tốt',
    tasksCompleted: 198,
    status: 'Active',
  },
];

const customers: UserData[] = [
  {
    id: 6,
    name: 'Đỗ Minh F',
    email: 'dominhf@gmail.com',
    phone: '0906789012',
    tier: 'Platinum',
    totalSpent: '85,000,000 VND',
    lastOrderDate: '2024-02-15',
    joinDate: '2022-01-10',
    status: 'Active',
  },
  {
    id: 7,
    name: 'Vũ Thị G',
    email: 'vuthig@gmail.com',
    phone: '0907890123',
    tier: 'Gold',
    totalSpent: '45,000,000 VND',
    lastOrderDate: '2024-02-10',
    joinDate: '2022-05-20',
    status: 'Active',
  },
];

const managerStats = [
  {
    title: 'Tổng Manager',
    value: managers.length.toString(),
    icon: Shield,
    trend: { value: 0, isPositive: true },
  },
  {
    title: 'Manager hoạt động',
    value: managers.filter((m) => m.status === 'Active').length.toString(),
    icon: Shield,
    trend: { value: 0, isPositive: true },
  },
];

const staffStats = [
  {
    title: 'Tổng Staff',
    value: staffMembers.length.toString(),
    icon: Briefcase,
    trend: { value: 0, isPositive: true },
  },
  {
    title: 'Staff hoạt động',
    value: staffMembers.filter((s) => s.status === 'Active').length.toString(),
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
  {
    title: 'Khách hàng VIP',
    value: customers.filter((c) => c.tier === 'Platinum').length.toString(),
    icon: Users,
    trend: { value: 0, isPositive: true },
  },
];

export default function UsersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'managers' | 'staff' | 'customers'>('managers');

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

  const currentRole: UserRole =
    activeTab === 'managers' ? 'manager' : activeTab === 'staff' ? 'staff' : 'customer';

  const getAddButtonLabel = () => {
    if (activeTab === 'managers') return 'Thêm Manager mới';
    if (activeTab === 'staff') return 'Thêm Staff mới';
    return null;
  };

  const handleView = (user: UserData) => {
    router.push(`/manager/users/${user.id}`);
  };

  const handleEdit = (user: UserData) => {
    router.push(`/manager/users/${user.id}/edit`);
  };

  return (
    <>
      <Header
        title="Quản lý Nhân sự"
        subtitle="Quản lý Manager, Staff và Customer - Phân quyền và chăm sóc khách hàng"
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

        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {currentStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </section>

        {/* Users Table */}
        <section className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
          <UserTable
            users={currentData}
            role={currentRole}
            onEdit={(user) => {
              handleView(user);
              handleEdit(user);
            }}
          />
        </section>
      </div>
    </>
  );
}
