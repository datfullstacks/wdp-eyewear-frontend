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
    <div className="space-y-8">
      {/* Page Header with Decorative Elements */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-200 to-cyan-200 opacity-30 blur-3xl" />
        <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-200 to-teal-200 opacity-30 blur-3xl" />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 p-3 shadow-lg shadow-blue-500/30">
              <svg
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-gray-900 via-blue-900 to-cyan-900 bg-clip-text text-4xl font-bold text-transparent">
                {t('title')}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-gray-600">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500" />
                {t('subtitle')}
              </p>
            </div>
          </div>
          <Button variant="primary" className="shadow-xl shadow-blue-500/30">
            <svg
              className="mr-2 h-5 w-5"
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
      </div>

      {/* Role Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <Card className="group relative overflow-hidden border-blue-200/50 bg-gradient-to-br from-blue-50 via-white to-cyan-50 transition-all duration-300 hover:shadow-xl">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-gradient-to-br from-blue-200/30 to-transparent" />
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="text-sm font-bold text-blue-700 uppercase">
              {t('stats.staff')}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-3xl font-bold text-transparent">
              {roleStats.staff}
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-green-200/50 bg-gradient-to-br from-green-50 via-white to-emerald-50 transition-all duration-300 hover:shadow-xl">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-gradient-to-br from-green-200/30 to-transparent" />
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="text-sm font-bold text-green-700 uppercase">
              {t('stats.operations')}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-3xl font-bold text-transparent">
              {roleStats.operations}
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-purple-200/50 bg-gradient-to-br from-purple-50 via-white to-pink-50 transition-all duration-300 hover:shadow-xl">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-gradient-to-br from-purple-200/30 to-transparent" />
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="text-sm font-bold text-purple-700 uppercase">
              {t('stats.managers')}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent">
              {roleStats.manager}
            </p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-rose-200/50 bg-gradient-to-br from-rose-50 via-white to-red-50 transition-all duration-300 hover:shadow-xl">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-gradient-to-br from-rose-200/30 to-transparent" />
          <CardHeader className="relative z-10 pb-2">
            <CardTitle className="text-sm font-bold text-rose-700 uppercase">
              {t('stats.admins')}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="bg-gradient-to-r from-rose-600 to-red-600 bg-clip-text text-3xl font-bold text-transparent">
              {roleStats.admin}
            </p>
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
