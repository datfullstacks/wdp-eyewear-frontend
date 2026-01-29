'use client';

import { useTranslations } from 'next-intl';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
} from '@/components/atoms';
import { DataTable, Column } from '@/components/molecules';
import { mockPromotions, Promotion } from '@/lib/mock-data';

export default function ManagerPricingPage() {
  const t = useTranslations('manager.pricing');

  const promotionColumns: Column<Promotion>[] = [
    {
      key: 'name',
      label: t('columns.name'),
      render: (promo) => (
        <div>
          <p className="font-medium text-gray-900">{promo.name}</p>
          <p className="text-sm text-gray-500">Code: {promo.code}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: t('columns.type'),
      render: (promo) => {
        const typeLabels = {
          percentage: 'Percentage Off',
          fixed_amount: 'Fixed Amount',
          free_shipping: 'Free Shipping',
        };
        return <span className="capitalize">{typeLabels[promo.type]}</span>;
      },
    },
    {
      key: 'value',
      label: t('columns.discount'),
      render: (promo) => {
        if (promo.type === 'percentage') {
          return (
            <span className="font-semibold text-green-600">
              {promo.value}% OFF
            </span>
          );
        } else if (promo.type === 'fixed_amount') {
          return (
            <span className="font-semibold text-green-600">
              ${promo.value} OFF
            </span>
          );
        }
        return <span className="text-green-600">Free Shipping</span>;
      },
    },
    {
      key: 'period',
      label: t('columns.period'),
      render: (promo) => (
        <div className="text-sm">
          <p>{promo.startDate}</p>
          <p className="text-gray-500">to {promo.endDate}</p>
        </div>
      ),
    },
    {
      key: 'usage',
      label: t('columns.usage'),
      render: (promo) => (
        <div className="text-sm">
          <p className="font-medium">
            {promo.usageCount} / {promo.maxUsage || '∞'}
          </p>
        </div>
      ),
    },
    {
      key: 'active',
      label: t('columns.status'),
      render: (promo) => (
        <Badge variant={promo.active ? 'success' : 'warning'}>
          {promo.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header with Decorative Elements */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-gradient-to-br from-amber-200 to-yellow-200 opacity-30 blur-3xl" />
        <div className="absolute -top-4 -right-4 h-32 w-32 rounded-full bg-gradient-to-br from-yellow-200 to-orange-200 opacity-30 blur-3xl" />

        <div className="relative flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 p-3 shadow-lg shadow-amber-500/30">
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-gray-900 via-amber-900 to-yellow-900 bg-clip-text text-4xl font-bold text-transparent">
                {t('title')}
              </h1>
              <p className="mt-2 flex items-center gap-2 text-gray-600">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                {t('subtitle')}
              </p>
            </div>
          </div>
          <Button variant="primary" className="shadow-xl shadow-amber-500/30">
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
            {t('createPromotion')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="group relative overflow-hidden border-green-200/50 bg-gradient-to-br from-green-50 via-white to-emerald-50 transition-all duration-300 hover:shadow-xl">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-gradient-to-br from-green-200/30 to-transparent" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-sm font-bold text-green-700 uppercase">
              {t('stats.activePromotions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <p className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-3xl font-bold text-transparent">
              {mockPromotions.filter((p) => p.active).length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <CardTitle className="text-sm text-blue-700">
              {t('stats.totalUsage')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-900">
              {mockPromotions.reduce((sum, p) => sum + p.usageCount, 0)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader>
            <CardTitle className="text-sm text-purple-700">
              {t('stats.avgDiscount')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-900">
              {(
                mockPromotions
                  .filter((p) => p.type === 'percentage')
                  .reduce((sum, p) => sum + p.value, 0) /
                mockPromotions.filter((p) => p.type === 'percentage').length
              ).toFixed(1)}
              %
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('promotionsList')}</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={promotionColumns}
            data={mockPromotions}
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
    </div>
  );
}
