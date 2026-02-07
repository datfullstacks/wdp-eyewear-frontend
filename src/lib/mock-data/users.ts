import { User } from '@/components/organisms/UserTable';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@wdp.com',
    role: 'manager',
    status: 'active',
    lastLogin: '2026-01-29 10:30 AM',
    createdAt: '2025-06-15',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@wdp.com',
    role: 'staff',
    status: 'active',
    lastLogin: '2026-01-29 09:15 AM',
    createdAt: '2025-08-20',
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@wdp.com',
    role: 'operations',
    status: 'active',
    lastLogin: '2026-01-28 04:45 PM',
    createdAt: '2025-07-10',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@wdp.com',
    role: 'staff',
    status: 'active',
    lastLogin: '2026-01-29 08:00 AM',
    createdAt: '2025-09-05',
  },
  {
    id: '5',
    name: 'Robert Wilson',
    email: 'robert.w@wdp.com',
    role: 'operations',
    status: 'inactive',
    lastLogin: '2026-01-15 02:30 PM',
    createdAt: '2025-05-22',
  },
  {
    id: '6',
    name: 'Admin Super',
    email: 'admin@wdp.com',
    role: 'admin',
    status: 'active',
    lastLogin: '2026-01-29 11:00 AM',
    createdAt: '2025-01-01',
  },
  {
    id: '7',
    name: 'Jessica Brown',
    email: 'jessica.b@wdp.com',
    role: 'staff',
    status: 'suspended',
    lastLogin: '2026-01-10 03:20 PM',
    createdAt: '2025-10-12',
  },
];

export interface StaffPermission {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export const mockRolePermissions: Record<string, StaffPermission[]> = {
  staff: [
    {
      module: 'orders',
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    {
      module: 'customers',
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    {
      module: 'prescriptions',
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    {
      module: 'returns',
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
  ],
  operations: [
    {
      module: 'orders',
      canView: true,
      canCreate: false,
      canEdit: true,
      canDelete: false,
    },
    {
      module: 'inventory',
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
    {
      module: 'shipping',
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: false,
    },
  ],
  manager: [
    {
      module: 'products',
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    {
      module: 'pricing',
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    {
      module: 'users',
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    {
      module: 'policies',
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
    },
    {
      module: 'reports',
      canView: true,
      canCreate: false,
      canEdit: false,
      canDelete: false,
    },
  ],
};
