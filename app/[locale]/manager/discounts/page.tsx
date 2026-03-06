'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { DiscountTable } from '@/components/organisms/manager';
import { Input } from '@/components/atoms/Input';
import { Percent, Calendar, Tag, AlertTriangle, Loader2 } from 'lucide-react';
import { discountsData, type Discount } from '@/data/discountsData';

type StatusFilter = 'all' | 'active' | 'expired' | 'scheduled' | 'inactive';
type TypeFilter = 'all' | 'percentage' | 'fixed';

export default function DiscountsPage() {
  const router = useRouter();
  const t = useTranslations('manager.discounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [apiError, setApiError] = useState('');

  // Filtered discounts
  const filteredDiscounts = useMemo(() => {
    return discountsData.filter((discount) => {
      const matchesSearch =
        discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discount.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || discount.status === statusFilter;

      const matchesType = typeFilter === 'all' || discount.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchQuery, statusFilter, typeFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const active = discountsData.filter((d) => d.status === 'active').length;
    const now = new Date();
    const expiringSoon = discountsData.filter((d) => {
      if (d.status !== 'active') return false;
      const endDate = new Date(d.endDate);
      const daysLeft = Math.ceil(
        (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysLeft <= 7 && daysLeft > 0;
    }).length;

    return [
      {
        title: t('stats.activePromotions'),
        value: active.toString(),
        icon: Percent,
        trend: { value: 0, isPositive: true },
      },
      {
        title: t('stats.expiringSoon'),
        value: expiringSoon.toString(),
        icon: Calendar,
        trend: { value: 0, isPositive: false },
      },
      {
        title: t('stats.totalCoupons'),
        value: discountsData.length.toString(),
        icon: Tag,
        trend: { value: 0, isPositive: true },
      },
    ];
  }, [t]);

  const handleView = (discount: Discount) => {
    // TODO: Navigate to detail page
    console.log('View discount:', discount);
    router.push(`/manager/discounts/${discount.id}`);
  };

  const handleDelete = async (discount: Discount) => {
    if (!confirm(t('deleteConfirm', { name: discount.name }))) return;
    try {
      // TODO: Call delete API
      console.log('Delete discount:', discount);
      setApiError('');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : t('deleteFailed'));
    }
  };

  return (
    <>
      <Header
        title={t('title')}
        subtitle={t('subtitle')}
        showAddButton
        addButtonLabel={t('addDiscount')}
        onAdd={() => router.push('/manager/discounts/create')}
      />

      <div className="space-y-6 p-6">
        {/* Stats */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </section>

        {/* Error Message */}
        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Filters */}
        <section className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1">
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">{t('filters.allStatus')}</option>
              <option value="active">{t('filters.active')}</option>
              <option value="scheduled">{t('filters.scheduled')}</option>
              <option value="expired">{t('filters.expired')}</option>
              <option value="inactive">{t('filters.inactive')}</option>
            </select>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">{t('filters.allTypes')}</option>
              <option value="percentage">{t('filters.percentage')}</option>
              <option value="fixed">{t('filters.fixed')}</option>
            </select>
          </div>
        </section>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          {t('showingResults', { count: filteredDiscounts.length })}
        </div>

        {/* Discounts Table */}
        <section className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
          <DiscountTable
            discounts={filteredDiscounts}
            onView={handleView}
            onDelete={handleDelete}
            translations={{
              code: t('table.code'),
              name: t('table.name'),
              type: t('table.type'),
              value: t('table.value'),
              period: t('table.period'),
              usage: t('table.usage'),
              status: t('table.status'),
              actions: t('table.actions'),
              noData: t('table.noData'),
              percentage: t('table.percentage'),
              fixed: t('table.fixed'),
              active: t('table.active'),
              inactive: t('table.inactive'),
              expired: t('table.expired'),
              scheduled: t('table.scheduled'),
              unlimited: t('table.unlimited'),
              viewDetails: t('table.viewDetails'),
              deleteDiscount: t('table.deleteDiscount'),
            }}
          />
        </section>
      </div>
    </>
  );
}
