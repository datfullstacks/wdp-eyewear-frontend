'use client';

import { Button } from '@/components/atoms';
import { Avatar } from '@/components/atoms/Avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit3, Calendar, MessageSquare, FileText, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type UserRole = 'manager' | 'staff' | 'customer';

export interface UserData {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  // Manager specific
  department?: string;
  permissions?: string[];
  managesStaff?: number;
  // Staff specific
  position?: string;
  manager?: string;
  performance?: string;
  tasksCompleted?: number;
  // Customer specific
  tier?: string;
  totalSpent?: string;
  lastOrderDate?: string;
  joinDate?: string;
  notes?: string;
}

interface UserTableProps {
  users: UserData[];
  role: UserRole;
  onEdit?: (user: UserData) => void;
  onDelete?: (user: UserData) => void;
  onAssign?: (user: UserData) => void;
  onRequest?: (user: UserData) => void;
  onViewOrders?: (user: UserData) => void;
}

export function UserTable({
  users,
  role,
  onEdit,
  onDelete,
  onAssign,
  onRequest,
  onViewOrders,
}: UserTableProps) {
  if (role === 'manager') {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Manager</TableHead>
            <TableHead>Phòng ban</TableHead>
            <TableHead>Quyền hạn</TableHead>
            <TableHead>Quản lý nhân sự</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} size="sm" />
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-gray-600">{user.department}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {user.permissions?.map((perm) => (
                    <span
                      key={perm}
                      className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-gray-600">
                {user.managesStaff} nhân viên
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-xs font-medium',
                    user.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  )}
                >
                  {user.status}
                </span>
              </TableCell>
              <TableCell>
                {onEdit && (
                  <Button size="sm" variant="outline" onClick={() => onEdit(user)}>
                    <Edit3 className="mr-1 h-3 w-3" />
                    Sửa
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (role === 'staff') {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nhân viên</TableHead>
            <TableHead>Vị trí</TableHead>
            <TableHead>Được quản lý bởi</TableHead>
            <TableHead>Hiệu suất</TableHead>
            <TableHead>Nhiệm vụ hoàn thành</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id} className="hover:bg-gray-50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar name={user.name} size="sm" />
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-gray-600">{user.position}</TableCell>
              <TableCell className="text-gray-600">{user.manager}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-xs font-medium',
                    user.performance === 'Xuất sắc'
                      ? 'bg-green-100 text-green-700'
                      : user.performance === 'Tốt'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                  )}
                >
                  {user.performance}
                </span>
              </TableCell>
              <TableCell className="text-gray-600">{user.tasksCompleted}</TableCell>
              <TableCell>
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-xs font-medium',
                    user.status === 'Active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  )}
                >
                  {user.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {onEdit && (
                    <Button size="sm" variant="outline" onClick={() => onEdit(user)}>
                      <Edit3 className="mr-1 h-3 w-3 text-gray-700" />
                      <span className="text-gray-700">Sửa</span>
                    </Button>
                  )}
                  {onAssign && (
                    <Button size="sm" variant="outline" onClick={() => onAssign(user)}>
                      <Calendar className="mr-1 h-3 w-3 text-gray-700" />
                      <span className="text-gray-700">Phân công</span>
                    </Button>
                  )}
                  {onRequest && (
                    <Button size="sm" variant="outline" onClick={() => onRequest(user)}>
                      <MessageSquare className="mr-1 h-3 w-3 text-gray-700" />
                      <span className="text-gray-700">Yêu cầu</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  // Customer table
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Khách hàng</TableHead>
          <TableHead>Hạng thành viên</TableHead>
          <TableHead>Tổng chi tiêu</TableHead>
          <TableHead>Đơn hàng gần nhất</TableHead>
          <TableHead>Ngày tham gia</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id} className="hover:bg-gray-50">
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar name={user.name} size="sm" />
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="text-xs text-gray-400">{user.phone}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <span
                className={cn(
                  'rounded-full px-2 py-1 text-xs font-medium',
                  user.tier === 'Platinum'
                    ? 'bg-purple-100 text-purple-700'
                    : user.tier === 'Gold'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                )}
              >
                {user.tier}
              </span>
            </TableCell>
            <TableCell className="font-medium text-gray-900">
              {user.totalSpent}
            </TableCell>
            <TableCell className="text-gray-600">{user.lastOrderDate}</TableCell>
            <TableCell className="text-gray-600">{user.joinDate}</TableCell>
            <TableCell>
              <span
                className={cn(
                  'rounded-full px-2 py-1 text-xs font-medium',
                  user.status === 'Active'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                )}
              >
                {user.status}
              </span>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                {onEdit && (
                  <Button size="sm" variant="outline" onClick={() => onEdit(user)}>
                    <Edit3 className="mr-1 h-3 w-3 text-gray-700" />
                    <span className="text-gray-700">Sửa</span>
                  </Button>
                )}
                {onViewOrders && (
                  <Button size="sm" variant="outline" onClick={() => onViewOrders(user)}>
                    <FileText className="mr-1 h-3 w-3 text-gray-700" />
                    <span className="text-gray-700">Xem đơn hàng</span>
                  </Button>
                )}
                {onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(user)}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Xóa
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
