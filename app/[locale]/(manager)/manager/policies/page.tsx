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
          {t('createPolicy')}
        </Button>
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
