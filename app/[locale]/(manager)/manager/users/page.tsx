'use client';

import { useState } from 'react';
import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/atoms/Button';
import { Avatar } from '@/components/atoms/Avatar';
import { StatCard } from '@/components/molecules/StatCard';
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  Calendar,
  Activity,
  Plus,
  Edit3,
  Trash2,
  UserCog,
  Clock,
  FileText,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Settings,
} from 'lucide-react';

// Stats cho Manager và Staff riêng biệt
const managerStats = [
  {
    title: 'Tổng Manager',
    value: '8',
    icon: Shield,
    trend: { value: 1, isPositive: true },
  },
  {
    title: 'Manager hoạt động',
    value: '7',
    icon: UserCheck,
    trend: { value: 1, isPositive: true },
  },
  {
    title: 'Quyền Admin',
    value: '3',
    icon: Settings,
    trend: { value: 0, isPositive: true },
  },
];

const staffStats = [
  {
    title: 'Tổng Staff',
    value: '24',
    icon: Users,
    trend: { value: 3, isPositive: true },
  },
  {
    title: 'Staff hoạt động',
    value: '22',
    icon: UserCheck,
    trend: { value: 2, isPositive: true },
  },
  {
    title: 'Đang nghỉ phép',
    value: '2',
    icon: UserX,
    trend: { value: 1, isPositive: false },
  },
  {
    title: 'Chờ phân công',
    value: '4',
    icon: Clock,
    trend: { value: 1, isPositive: true },
  },
];

const customerStats = [
  {
    title: 'Tổng Customer',
    value: '1,284',
    icon: Users,
    trend: { value: 15, isPositive: true },
  },
  {
    title: 'Hoạt động tháng này',
    value: '856',
    icon: UserCheck,
    trend: { value: 12, isPositive: true },
  },
  {
    title: 'VIP Customer',
    value: '127',
    icon: Shield,
    trend: { value: 8, isPositive: true },
  },
  {
    title: 'Chờ xử lý',
    value: '23',
    icon: AlertCircle,
    trend: { value: 3, isPositive: false },
  },
];

// Data cho Managers
const managers = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@company.com',
    phone: '0901234567',
    department: 'Quản lý Bán hàng',
    permissions: ['user_management', 'reports', 'inventory'],
    status: 'Active',
    lastActive: '2024-02-06 09:30',
    joinDate: '2023-01-15',
    managesStaff: 8,
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@company.com',
    phone: '0901234568',
    department: 'Quản lý Kho',
    permissions: ['inventory', 'staff_assignment'],
    status: 'Active',
    lastActive: '2024-02-06 08:15',
    joinDate: '2023-03-10',
    managesStaff: 6,
  },
  {
    id: 3,
    name: 'Lê Minh C',
    email: 'leminhc@company.com',
    phone: '0901234569',
    department: 'Quản lý Marketing',
    permissions: ['reports', 'promotions'],
    status: 'Active',
    lastActive: '2024-02-05 16:45',
    joinDate: '2023-05-20',
    managesStaff: 4,
  },
];

// Data cho Staff
const staffMembers = [
  {
    id: 1,
    name: 'Phạm Văn D',
    email: 'phamvand@company.com',
    phone: '0912345678',
    position: 'Nhân viên bán hàng',
    department: 'Bán hàng',
    manager: 'Nguyễn Văn A',
    status: 'Active',
    shift: 'Ca sáng (8:00-16:00)',
    lastActive: '2024-02-06 15:30',
    joinDate: '2023-06-15',
    performance: 'Excellent',
    currentTask: 'Xử lý đơn hàng online',
  },
  {
    id: 2,
    name: 'Hoàng Thị E',
    email: 'hoangthie@company.com',
    phone: '0912345679',
    position: 'Nhân viên kho',
    department: 'Kho',
    manager: 'Trần Thị B',
    status: 'Active',
    shift: 'Ca chiều (14:00-22:00)',
    lastActive: '2024-02-06 21:45',
    joinDate: '2023-08-01',
    performance: 'Good',
    currentTask: 'Kiểm kê tồn kho',
  },
  {
    id: 3,
    name: 'Võ Minh F',
    email: 'vominhf@company.com',
    phone: '0912345680',
    position: 'Nhân viên tư vấn',
    department: 'Bán hàng',
    manager: 'Nguyễn Văn A',
    status: 'On Leave',
    shift: 'Ca sáng (8:00-16:00)',
    lastActive: '2024-02-04 17:00',
    joinDate: '2023-09-10',
    performance: 'Good',
    currentTask: 'Nghỉ phép',
  },
  {
    id: 4,
    name: 'Ngô Thị G',
    email: 'ngothig@company.com',
    phone: '0912345681',
    position: 'Nhân viên marketing',
    department: 'Marketing',
    manager: 'Lê Minh C',
    status: 'Available',
    shift: 'Linh hoạt',
    lastActive: '2024-02-06 10:20',
    joinDate: '2023-11-05',
    performance: 'New',
    currentTask: 'Chờ phân công',
  },
];

// Data cho Customers
const customers = [
  {
    id: 1,
    name: 'Lê Văn H',
    email: 'levanh@gmail.com',
    phone: '0987654321',
    address: '123 Nguyễn Huệ, Q1, TP.HCM',
    memberType: 'VIP',
    totalOrders: 15,
    totalSpent: 45500000,
    lastOrderDate: '2024-02-05',
    joinDate: '2022-03-15',
    status: 'Active',
    notes: 'Khách hàng thường xuyên, thích mua kính mát cao cấp',
  },
  {
    id: 2,
    name: 'Phạm Thị I',
    email: 'phamthii@yahoo.com',
    phone: '0987654322',
    address: '456 Lê Lợi, Q3, TP.HCM',
    memberType: 'Regular',
    totalOrders: 8,
    totalSpent: 12300000,
    lastOrderDate: '2024-02-03',
    joinDate: '2023-01-20',
    status: 'Active',
    notes: 'Cần hỗ trợ chọn kính phù hợp với mặt tròn',
  },
  {
    id: 3,
    name: 'Trương Minh J',
    email: 'truongminhj@hotmail.com',
    phone: '0987654323',
    address: '789 Võ Văn Tần, Q3, TP.HCM',
    memberType: 'Bronze',
    totalOrders: 3,
    totalSpent: 5200000,
    lastOrderDate: '2024-01-28',
    joinDate: '2023-11-10',
    status: 'Pending',
    notes: 'Đang chờ xử lý đơn đổi trả, cần follow up',
  },
  {
    id: 4,
    name: 'Võ Thị K',
    email: 'vothik@gmail.com',
    phone: '0987654324',
    address: '321 Điện Biên Phủ, Q1, TP.HCM',
    memberType: 'VIP',
    totalOrders: 22,
    totalSpent: 78900000,
    lastOrderDate: '2024-02-06',
    joinDate: '2022-06-08',
    status: 'Active',
    notes: 'Khách hàng bạc kim, luôn mua sản phẩm mới nhất',
  },
];

function UsersPage() {
  const [activeTab, setActiveTab] = useState<
    'managers' | 'staff' | 'customers'
  >('managers');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

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

  const getAddButtonLabel = () => {
    if (activeTab === 'managers') return 'Thêm Manager mới';
    if (activeTab === 'staff') return 'Thêm Staff mới';
    return null; // Không cho phép thêm Customer mới
  };

  return (
    <>
      <Header
        title="Quản lý Nhân sự"
        subtitle="Quản lý Manager, Staff và Customer - Phân quyền và chăm sóc khách hàng"
        showAddButton={activeTab !== 'customers'}
        addButtonLabel={getAddButtonLabel() || ''}
        onAdd={() => setShowAddModal(true)}
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
                className={`mr-2 h-5 w-5 ${
                  activeTab === 'managers' ? 'text-amber-600' : 'text-gray-500'
                }`}
              />
              Quản lý Manager ({managers.length})
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'staff'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <Users
                className={`mr-2 h-5 w-5 ${
                  activeTab === 'staff' ? 'text-amber-600' : 'text-gray-500'
                }`}
              />
              Quản lý Staff ({staffMembers.length})
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center border-b-2 px-1 py-2 text-sm font-medium whitespace-nowrap ${
                activeTab === 'customers'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              <UserCheck
                className={`mr-2 h-5 w-5 ${
                  activeTab === 'customers' ? 'text-amber-600' : 'text-gray-500'
                }`}
              />
              Quản lý Khách hàng ({customers.length})
            </button>
          </nav>
        </section>

        {/* Stats */}
        <section className="animate-fade-in">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {currentStats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="animate-slide-in">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {/* Manager Actions */}
            {activeTab === 'managers' && (
              <>
                <div className="bg-card border-border cursor-pointer rounded-lg border p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-amber-100 p-2 text-amber-600">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Quản lý quyền
                      </h3>
                      <p className="text-sm text-gray-500">
                        Cấp và thu hồi quyền
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-card border-border cursor-pointer rounded-lg border p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Theo dõi hiệu suất
                      </h3>
                      <p className="text-sm text-gray-500">
                        Báo cáo và đánh giá Manager
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Staff Actions */}
            {activeTab === 'staff' && (
              <>
                <div
                  onClick={() => setShowAssignModal(true)}
                  className="bg-card border-border cursor-pointer rounded-lg border p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Phân công Staff
                      </h3>
                      <p className="text-sm text-gray-500">
                        Giao việc và lập lịch
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  onClick={() => setShowRequestModal(true)}
                  className="bg-card border-border cursor-pointer rounded-lg border p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-orange-100 p-2 text-orange-600">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Yêu cầu Staff
                      </h3>
                      <p className="text-sm text-gray-500">
                        Gửi yêu cầu công việc
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Customer Actions */}
            {activeTab === 'customers' && (
              <>
                <div className="bg-card border-border cursor-pointer rounded-lg border p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Chăm sóc khách hàng
                      </h3>
                      <p className="text-sm text-gray-500">Hỗ trợ và tư vấn</p>
                    </div>
                  </div>
                </div>
                <div className="bg-card border-border cursor-pointer rounded-lg border p-6 transition-shadow hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 p-2 text-green-600">
                      <Activity className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Phân tích hành vi
                      </h3>
                      <p className="text-sm text-gray-500">Thống kê mua sắm</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* User List */}
        <section className="animate-slide-in bg-card border-border rounded-lg border">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {activeTab === 'managers'
                ? 'Danh sách Manager'
                : activeTab === 'staff'
                  ? 'Danh sách Staff'
                  : 'Danh sách Khách hàng'}
            </h2>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'managers' ? (
              <ManagerTable managers={managers} onEdit={setSelectedUser} />
            ) : activeTab === 'staff' ? (
              <StaffTable
                staffMembers={staffMembers}
                onEdit={setSelectedUser}
              />
            ) : (
              <CustomerTable customers={customers} onEdit={setSelectedUser} />
            )}
          </div>
        </section>
      </div>

      {/* Modals */}
      {showAddModal && activeTab !== 'customers' && (
        <AddUserModal
          type={activeTab as 'managers' | 'staff'}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showAssignModal && (
        <AssignWorkModal onClose={() => setShowAssignModal(false)} />
      )}

      {showRequestModal && (
        <RequestStaffModal onClose={() => setShowRequestModal(false)} />
      )}
    </>
  );
}

// Manager Table Component
const ManagerTable = ({
  managers,
  onEdit,
}: {
  managers: any[];
  onEdit: (user: any) => void;
}) => (
  <table className="w-full">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Manager
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Phòng ban
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Quyền hạn
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Quản lý Staff
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Trạng thái
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Hành động
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 bg-white">
      {managers.map((manager) => (
        <tr key={manager.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-3">
              <Avatar name={manager.name} size="sm" />
              <div>
                <div className="font-medium text-gray-900">{manager.name}</div>
                <div className="text-sm text-gray-500">{manager.email}</div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
            {manager.department}
          </td>
          <td className="px-6 py-4">
            <div className="flex flex-wrap gap-1">
              {manager.permissions.map((perm: string) => (
                <span
                  key={perm}
                  className="inline-flex items-center rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                >
                  {perm}
                </span>
              ))}
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
              {manager.managesStaff} nhân viên
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                manager.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {manager.status}
            </span>
          </td>
          <td className="space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap">
            <Button size="sm" variant="outline" onClick={() => onEdit(manager)}>
              <Edit3 className="mr-1 h-3 w-3 text-gray-700" />
              <span className="text-gray-700">Sửa</span>
            </Button>
            <Button size="sm" variant="outline">
              <UserCog className="mr-1 h-3 w-3 text-gray-700" />
              <span className="text-gray-700">Quyền</span>
            </Button>
            <Button size="sm" variant="destructive">
              <Trash2 className="mr-1 h-3 w-3 text-white" />
              <span className="text-white">Xóa</span>
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Staff Table Component
const StaffTable = ({
  staffMembers,
  onEdit,
}: {
  staffMembers: any[];
  onEdit: (user: any) => void;
}) => (
  <table className="w-full">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Nhân viên
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Vị trí
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Quản lý
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Ca làm việc
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Công việc hiện tại
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Trạng thái
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Hành động
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 bg-white">
      {staffMembers.map((staff) => (
        <tr key={staff.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-3">
              <Avatar name={staff.name} size="sm" />
              <div>
                <div className="font-medium text-gray-900">{staff.name}</div>
                <div className="text-sm text-gray-500">{staff.email}</div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div>
              <div className="text-sm font-medium">{staff.position}</div>
              <div className="text-xs text-gray-500">{staff.department}</div>
            </div>
          </td>
          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
            {staff.manager}
          </td>
          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
            {staff.shift}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-2">
              {staff.status === 'Available' ? (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              <span className="text-sm">{staff.currentTask}</span>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                staff.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : staff.status === 'On Leave'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-orange-100 text-orange-800'
              }`}
            >
              {staff.status}
            </span>
          </td>
          <td className="space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap">
            <Button size="sm" variant="outline" onClick={() => onEdit(staff)}>
              <Edit3 className="mr-1 h-3 w-3 text-gray-700" />
              <span className="text-gray-700">Sửa</span>
            </Button>
            <Button size="sm" variant="outline">
              <Calendar className="mr-1 h-3 w-3 text-gray-700" />
              <span className="text-gray-700">Phân công</span>
            </Button>
            <Button size="sm" variant="outline">
              <MessageSquare className="mr-1 h-3 w-3 text-gray-700" />
              <span className="text-gray-700">Yêu cầu</span>
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Customer Table Component
const CustomerTable = ({
  customers,
  onEdit,
}: {
  customers: any[];
  onEdit: (user: any) => void;
}) => (
  <table className="w-full">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Khách hàng
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Loại thành viên
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Tổng đơn hàng
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Tổng chi tiêu
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Đơn hàng cuối
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Trạng thái
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Hành động
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 bg-white">
      {customers.map((customer) => (
        <tr key={customer.id} className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-3">
              <Avatar name={customer.name} size="sm" />
              <div>
                <div className="font-medium text-gray-900">{customer.name}</div>
                <div className="text-sm text-gray-500">{customer.email}</div>
              </div>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                customer.memberType === 'VIP'
                  ? 'bg-purple-100 text-purple-800'
                  : customer.memberType === 'Regular'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              {customer.memberType}
            </span>
          </td>
          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
            {customer.totalOrders} đơn
          </td>
          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(customer.totalSpent)}
          </td>
          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
            {customer.lastOrderDate}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                customer.status === 'Active'
                  ? 'bg-green-100 text-green-800'
                  : customer.status === 'Pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {customer.status}
            </span>
          </td>
          <td className="space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(customer)}
            >
              <Edit3 className="mr-1 h-3 w-3 text-gray-700" />
              <span className="text-gray-700">Sửa</span>
            </Button>
            <Button size="sm" variant="outline">
              <FileText className="mr-1 h-3 w-3 text-gray-700" />
              <span className="text-gray-700">Xem đơn hàng</span>
            </Button>
            <Button size="sm" variant="destructive">
              <Trash2 className="mr-1 h-3 w-3" />
              Xóa
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Add User Modal
const AddUserModal = ({
  type,
  onClose,
}: {
  type: 'managers' | 'staff';
  onClose: () => void;
}) => (
  <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Thêm {type === 'managers' ? 'Manager' : 'Staff'} mới
        </h2>
        <Button variant="ghost" onClick={onClose} className="text-gray-900 hover:text-gray-700">
          ✕
        </Button>
      </div>

      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Họ và tên
            </label>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="Nhập họ và tên"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="email@company.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Số điện thoại
            </label>
            <input
              type="tel"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              placeholder="0901234567"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              {type === 'managers' ? 'Phòng ban quản lý' : 'Vị trí công việc'}
            </label>
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none">
              {type === 'managers' ? (
                <>
                  <option value="">Chọn phòng ban</option>
                  <option value="sales">Quản lý Bán hàng</option>
                  <option value="inventory">Quản lý Kho</option>
                  <option value="marketing">Quản lý Marketing</option>
                </>
              ) : (
                <>
                  <option value="">Chọn vị trí</option>
                  <option value="sales-staff">Nhân viên bán hàng</option>
                  <option value="warehouse-staff">Nhân viên kho</option>
                  <option value="consultant">Nhân viên tư vấn</option>
                  <option value="marketing-staff">Nhân viên marketing</option>
                </>
              )}
            </select>
          </div>
        </div>

        {type === 'managers' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Quyền hạn
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'user_management',
                'reports',
                'inventory',
                'staff_assignment',
                'promotions',
              ].map((perm) => (
                <label key={perm} className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm text-gray-700">{perm}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {type === 'staff' && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">
                Manager phụ trách
              </label>
              <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none">
                <option value="">Chọn Manager</option>
                <option value="1">Nguyễn Văn A</option>
                <option value="2">Trần Thị B</option>
                <option value="3">Lê Minh C</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-900">
                Ca làm việc
              </label>
              <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none">
                <option value="morning">Ca sáng (8:00-16:00)</option>
                <option value="evening">Ca chiều (14:00-22:00)</option>
                <option value="flexible">Linh hoạt</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit">
            <Plus className="mr-2 h-4 w-4" />
            Thêm {type === 'managers' ? 'Manager' : 'Staff'}
          </Button>
        </div>
      </form>
    </div>
  </div>
);

// Assign Work Modal
const AssignWorkModal = ({ onClose }: { onClose: () => void }) => (
  <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
    <div className="w-full max-w-lg rounded-lg bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Phân công công việc
        </h2>
        <Button variant="ghost" onClick={onClose} className="text-gray-900 hover:text-gray-700">
          ✕
        </Button>
      </div>

      <form className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Chọn Staff
          </label>
          <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none">
            <option value="">Chọn nhân viên</option>
            <option value="4">Ngô Thị G (Chờ phân công)</option>
            <option value="2">Hoàng Thị E (Sẵn sàng)</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Loại công việc
          </label>
          <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none">
            <option value="sales">Bán hàng</option>
            <option value="inventory">Quản lý kho</option>
            <option value="customer-service">Chăm sóc khách hàng</option>
            <option value="marketing">Marketing</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Mô tả công việc
          </label>
          <textarea
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            rows={3}
            placeholder="Nhập mô tả chi tiết công việc cần giao..."
          ></textarea>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-900">
              Hạn hoàn thành
            </label>
            <input
              type="date"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit">
            <Calendar className="mr-2 h-4 w-4" />
            Phân công
          </Button>
        </div>
      </form>
    </div>
  </div>
);

// Request Staff Modal
const RequestStaffModal = ({ onClose }: { onClose: () => void }) => (
  <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
    <div className="w-full max-w-lg rounded-lg bg-white p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Yêu cầu Staff</h2>
        <Button variant="ghost" onClick={onClose} className="text-gray-900 hover:text-gray-700">
          ✕
        </Button>
      </div>

      <form className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Chọn Staff
          </label>
          <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none">
            <option value="">Chọn nhân viên</option>
            <option value="1">Phạm Văn D</option>
            <option value="2">Hoàng Thị E</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Loại yêu cầu
          </label>
          <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none">
            <option value="urgent-task">Công việc khẩn cấp</option>
            <option value="overtime">Làm thêm giờ</option>
            <option value="support">Hỗ trợ công việc</option>
            <option value="training">Đào tạo</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Nội dung yêu cầu
          </label>
          <textarea
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            rows={4}
            placeholder="Nhập nội dung yêu cầu chi tiết..."
          ></textarea>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Mức độ ưu tiên
          </label>
          <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none">
            <option value="low">Thấp</option>
            <option value="normal">Bình thường</option>
            <option value="high">Cao</option>
            <option value="urgent">Khẩn cấp</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit">
            <MessageSquare className="mr-2 h-4 w-4" />
            Gửi yêu cầu
          </Button>
        </div>
      </form>
    </div>
  </div>
);

export default UsersPage;
