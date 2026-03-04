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
import { Edit3, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { User } from '@/api/users';

export type UserTabRole = 'manager' | 'staff' | 'customer';

interface UserTableProps {
  users: User[];
  role: UserTabRole;
  onView?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('vi-VN');
}

function roleBadge(role: string) {
  const map: Record<string, { label: string; cls: string }> = {
    admin: { label: 'Admin', cls: 'bg-red-100 text-red-700' },
    manager: { label: 'Manager', cls: 'bg-amber-100 text-amber-700' },
    operations: { label: 'Operations', cls: 'bg-blue-100 text-blue-700' },
    sales: { label: 'Sales', cls: 'bg-indigo-100 text-indigo-700' },
    customer: { label: 'Customer', cls: 'bg-green-100 text-green-700' },
  };
  const info = map[role] || { label: role, cls: 'bg-gray-100 text-gray-700' };
  return (
    <span className={cn('rounded-full px-2 py-1 text-xs font-medium', info.cls)}>
      {info.label}
    </span>
  );
}

export function UserTable({
  users,
  role,
  onView,
  onEdit,
  onDelete,
}: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        Không có dữ liệu người dùng
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Người dùng</TableHead>
          <TableHead>Vai trò</TableHead>
          <TableHead>Số điện thoại</TableHead>
          <TableHead>Đăng nhập qua</TableHead>
          <TableHead>Ngày tạo</TableHead>
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
            <TableCell>{roleBadge(user.role)}</TableCell>
            <TableCell className="text-gray-600">
              {user.phone || '—'}
            </TableCell>
            <TableCell className="text-gray-600">
              {user.provider || 'local'}
            </TableCell>
            <TableCell className="text-gray-600">
              {formatDate(user.createdAt)}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                {onView && (
                  <Button size="sm" variant="outline" onClick={() => onView(user)}>
                    <Eye className="mr-1 h-3 w-3 text-gray-700" />
                    <span className="text-gray-700">Xem</span>
                  </Button>
                )}
                {onEdit && (
                  <Button size="sm" variant="outline" onClick={() => onEdit(user)}>
                    <Edit3 className="mr-1 h-3 w-3 text-gray-700" />
                    <span className="text-gray-700">Sửa</span>
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
