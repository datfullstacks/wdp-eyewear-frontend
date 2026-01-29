'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Textarea,
} from '@/components/atoms';
import { DataTable, Column } from '@/components/molecules';
import { mockPolicies, Policy } from '@/lib/mock-data';

export default function ManagerPoliciesPage() {
  const t = useTranslations('manager.policies');
  const [selectedPolicy, setSelectedPolicy] = React.useState<Policy | null>(
    null
  );

  const policyColumns: Column<Policy>[] = [
    {
      key: 'title',
      label: t('columns.title'),
      render: (policy) => (
        <div>
          <p className="font-medium text-gray-900">{policy.title}</p>
          <p className="text-sm text-gray-500">{policy.description}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: t('columns.category'),
      render: (policy) => {
        const variantMap = {
          purchase: 'info',
          return: 'warning',
          warranty: 'success',
          shipping: 'secondary',
        } as const;

        const labelMap = {
          purchase: 'Purchase',
          return: 'Return',
          warranty: 'Warranty',
          shipping: 'Shipping',
        };

        return (
          <Badge variant={variantMap[policy.category]}>
            {labelMap[policy.category]}
          </Badge>
        );
      },
    },
    {
      key: 'lastUpdated',
      label: t('columns.lastUpdated'),
      render: (policy) => (
        <span className="text-sm text-gray-600">{policy.lastUpdated}</span>
      ),
    },
    {
      key: 'active',
      label: t('columns.status'),
      render: (policy) => (
        <Badge variant={policy.active ? 'success' : 'warning'}>
          {policy.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  const categoryStats = {
    purchase: mockPolicies.filter((p) => p.category === 'purchase').length,
    return: mockPolicies.filter((p) => p.category === 'return').length,
    warranty: mockPolicies.filter((p) => p.category === 'warranty').length,
    shipping: mockPolicies.filter((p) => p.category === 'shipping').length,
  };

  return (
    <div className="space-y-8">
      {/* Page Header with Decorative Elements */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-30 blur-3xl" />
        <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-gradient-to-br from-pink-200 to-rose-200 opacity-30 blur-3xl" />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 shadow-lg shadow-purple-500/30">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-gray-900 via-purple-900 to-pink-900 bg-clip-text text-4xl font-bold text-transparent">
                {t('title')}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-gray-600">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-500" />
                {t('subtitle')}
              </p>
            </div>
          </div>
          <Button variant="primary" className="shadow-xl shadow-purple-500/30">
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
            {t('createPolicy')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-700">
              {t('stats.purchase')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-900">
              {categoryStats.purchase}
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-700">
              {t('stats.return')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-900">
              {categoryStats.return}
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-700">
              {t('stats.warranty')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-900">
              {categoryStats.warranty}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-700">
              {t('stats.shipping')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-900">
              {categoryStats.shipping}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t('policiesList')}</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={policyColumns}
              data={mockPolicies}
              onRowClick={(policy) => setSelectedPolicy(policy)}
              actions={() => (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                  <Button size="sm" variant="danger">
                    Delete
                  </Button>
                </div>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('policyDetails')}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPolicy ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedPolicy.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {selectedPolicy.description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={selectedPolicy.active ? 'success' : 'warning'}
                  >
                    {selectedPolicy.active ? 'Active' : 'Inactive'}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Last updated: {selectedPolicy.lastUpdated}
                  </span>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    {t('detailsLabel')}
                  </label>
                  <Textarea
                    value={selectedPolicy.details}
                    rows={10}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-gray-500">
                {t('selectPolicy')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
