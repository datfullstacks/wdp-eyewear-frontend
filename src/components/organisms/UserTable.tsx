'use client';

import React from 'react';
import { DataTable, Column } from '../molecules';
import { Badge, Button } from '../atoms';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'staff' | 'operations' | 'manager' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  lastLogin: string;
  createdAt: string;
}

interface UserTableProps {
  users: User[];
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  onView?: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
  onView,
}) => {
  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-sm font-semibold text-white">
            {user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => {
        const variantMap = {
          admin: 'danger',
          manager: 'info',
          staff: 'success',
          operations: 'secondary',
        } as const;

        const labelMap = {
          admin: 'Admin',
          manager: 'Manager',
          staff: 'Staff',
          operations: 'Operations',
        };

        return (
          <Badge variant={variantMap[user.role]}>{labelMap[user.role]}</Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (user) => {
        const variantMap = {
          active: 'success',
          inactive: 'warning',
          suspended: 'danger',
        } as const;

        const labelMap = {
          active: 'Active',
          inactive: 'Inactive',
          suspended: 'Suspended',
        };

        return (
          <Badge variant={variantMap[user.status]}>
            {labelMap[user.status]}
          </Badge>
        );
      },
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (user) => (
        <span className="text-sm text-gray-600">{user.lastLogin}</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      render: (user) => (
        <span className="text-sm text-gray-600">{user.createdAt}</span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={users}
      onRowClick={onView}
      actions={(user) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit?.(user)}>
            Edit
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete?.(user)}>
            Delete
          </Button>
        </div>
      )}
    />
  );
};
