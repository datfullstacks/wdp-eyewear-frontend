'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { UserTable } from '@/components/organisms/UserTable';
import { SearchBar } from '@/components/molecules';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/atoms';
import { mockUsers } from '@/lib/mock-data';

export default function ManagerUsersPage() {
  const t = useTranslations('manager.users');
  const [filteredUsers, setFilteredUsers] = React.useState(mockUsers);

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredUsers(mockUsers);
      return;
    }
    const filtered = mockUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const roleStats = {
    staff: mockUsers.filter((u) => u.role === 'staff').length,
    operations: mockUsers.filter((u) => u.role === 'operations').length,
    manager: mockUsers.filter((u) => u.role === 'manager').length,
    admin: mockUsers.filter((u) => u.role === 'admin').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-gray-600">{t('subtitle')}</p>
        </div>
        <Button variant="primary">
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          {t('addUser')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700">
              {t('stats.staff')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-900">
              {roleStats.staff}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700">
              {t('stats.operations')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-900">
              {roleStats.operations}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-700">
              {t('stats.managers')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-900">
              {roleStats.manager}
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-red-700">
              {t('stats.admins')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-900">{roleStats.admin}</p>
          </CardContent>
        </Card>
      </div>

      <SearchBar placeholder={t('searchPlaceholder')} onChange={handleSearch} />

      <UserTable
        users={filteredUsers}
        onEdit={(user) => console.log('Edit:', user)}
        onDelete={(user) => console.log('Delete:', user)}
        onView={(user) => console.log('View:', user)}
      />
    </div>
  );
}
