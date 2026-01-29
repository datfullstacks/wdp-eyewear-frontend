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
          {t('createPromotion')}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader>
            <CardTitle className="text-sm text-green-700">
              {t('stats.activePromotions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-900">
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
