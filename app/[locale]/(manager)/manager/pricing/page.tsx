'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { Badge, Button } from '@/components/atoms';
import { DataTable, Column } from '@/components/molecules';
import { mockPromotions, Promotion } from '@/lib/mock-data';
import { DollarSign, CheckCircle, BarChart3, Percent } from 'lucide-react';

export default function ManagerPricingPage() {
  const t = useTranslations('manager.pricing');

  const activeCount = mockPromotions.filter((p) => p.active).length;
  const totalUsage = mockPromotions.reduce((sum, p) => sum + p.usageCount, 0);
  const avgDiscount =
    mockPromotions.filter((p) => p.type === 'percentage').length > 0
      ? (
          mockPromotions
            .filter((p) => p.type === 'percentage')
            .reduce((sum, p) => sum + p.value, 0) /
          mockPromotions.filter((p) => p.type === 'percentage').length
        ).toFixed(1)
      : '0';

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
    <>
      <Header
        title={t('title')}
        subtitle={t('subtitle')}
        showAddButton
        addButtonLabel={t('createPromotion')}
      />

      <div className="space-y-6 p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title={t('stats.activePromotions')}
            value={String(activeCount)}
            icon={CheckCircle}
            className="p-3"
            titleClassName="text-foreground/90 text-sm"
            valueClassName="text-2xl"
            showIcon={false}
            inline
          />
          <StatCard
            title={t('stats.totalUsage')}
            value={String(totalUsage)}
            icon={BarChart3}
            className="p-3"
            titleClassName="text-foreground/90 text-sm"
            valueClassName="text-2xl"
            showIcon={false}
            inline
          />
          <StatCard
            title={t('stats.avgDiscount')}
            value={`${avgDiscount}%`}
            icon={Percent}
            className="p-3"
            titleClassName="text-foreground/90 text-sm"
            valueClassName="text-2xl"
            showIcon={false}
            inline
          />
        </div>

        {/* Promotions Table */}
        <section className="bg-card border-border rounded-lg border">
          <div className="border-b border-gray-200 p-6">
            <h2 className="text-lg font-semibold">{t('promotionsList')}</h2>
          </div>
          <div className="p-4">
            <DataTable
              columns={promotionColumns}
              data={mockPromotions}
              actions={() => (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    Sửa
                  </Button>
                  <Button size="sm" variant="danger">
                    Xóa
                  </Button>
                </div>
              )}
            />
          </div>
        </section>
      </div>
    </>
  );
}
