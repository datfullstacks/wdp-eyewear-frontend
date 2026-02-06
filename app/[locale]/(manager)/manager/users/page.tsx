import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/atoms/Button';
import { Avatar } from '@/components/atoms/Avatar';
import { StatCard } from '@/components/molecules/StatCard';
import { Users, UserCheck, UserX, Shield, Calendar, Activity } from 'lucide-react';

const userStats = [
  {
    title: 'Tổng nhân viên',
    value: '28',
    icon: Users,
    trend: { value: 2, isPositive: true },
  },
  {
    title: 'Đang hoạt động',
    value: '26',
    icon: UserCheck,
    trend: { value: 1, isPositive: true },
  },
  {
    title: 'Tạm nghỉ',
    value: '2',
    icon: UserX,
    trend: { value: 1, isPositive: false },
  },
  {
    title: 'Admin/Manager',
    value: '5',
    icon: Shield,
    trend: { value: 0, isPositive: true },
  },
];

const users = [
  {
    id: 1,
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    role: 'Manager',
    department: 'Quản lý',
    status: 'Active',
    lastActive: '2024-02-06 09:30',
    joinDate: '2023-01-15',
  },
  {
    id: 2,
    name: 'Trần Thị B',
    email: 'tranthib@example.com',
    role: 'Staff',
    department: 'Bán hàng',
    status: 'Active',
    lastActive: '2024-02-06 08:45',
    joinDate: '2023-03-20',
  },
  {
    id: 3,
    name: 'Lê Minh C',
    email: 'leminhc@example.com',
    role: 'Staff',
    department: 'Kho',
    status: 'Active',
    lastActive: '2024-02-05 17:30',
    joinDate: '2023-05-10',
  },
  {
    id: 4,
    name: 'Phạm Thị D',
    email: 'phamthid@example.com',
    role: 'Admin',
    department: 'IT',
    status: 'Inactive',
    lastActive: '2024-02-03 16:20',
    joinDate: '2022-11-05',
  },
];

function UsersPage() {
  return (
    <>
      <Header 
        title="Quản lý Người dùng" 
        subtitle="Quản lý nhân viên và phân quyền hệ thống"
        showAddButton
        addButtonLabel="Thêm nhân viên mới"
      />

      <div className="space-y-8 p-6">
        {/* User Stats */}
        <section className="animate-fade-in">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {userStats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="animate-slide-in">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="bg-card border-border rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 text-accent rounded-full p-2">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Phân ca làm việc</h3>
                  <p className="text-muted-foreground text-sm">Sắp xếp lịch làm việc</p>
                </div>
              </div>
            </div>
            
            <div className="bg-card border-border rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 text-accent rounded-full p-2">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Phân quyền</h3>
                  <p className="text-muted-foreground text-sm">Quản lý quyền truy cập</p>
                </div>
              </div>
            </div>

            <div className="bg-card border-border rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 text-accent rounded-full p-2">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Theo dõi hoạt động</h3>
                  <p className="text-muted-foreground text-sm">Xem log hoạt động</p>
                </div>
              </div>
            </div>

            <div className="bg-card border-border rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className="bg-accent/20 text-accent rounded-full p-2">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Báo cáo hiệu suất</h3>
                  <p className="text-muted-foreground text-sm">Đánh giá nhân viên</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Users List */}
        <section className="animate-slide-in bg-card border-border rounded-lg border">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold">Danh sách nhân viên</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nhân viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Phòng ban
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hoạt động cuối
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-gray-500 text-sm">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'Admin' 
                          ? 'bg-purple-100 text-purple-800'
                          : user.role === 'Manager'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'Active' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastActive}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button size="sm" variant="outline">
                        Sửa
                      </Button>
                      <Button size="sm" variant="outline">
                        Phân quyền
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

export default UsersPage;