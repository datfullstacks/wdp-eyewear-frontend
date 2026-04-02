'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Calendar, Loader2, Percent, Tag } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { DiscountTable } from '@/components/organisms/manager';
import { Input } from '@/components/atoms/Input';
import promotionApi, { type PromotionRecord } from '@/api/promotions';

type StatusFilter = 'all' | 'active' | 'expired' | 'scheduled' | 'inactive';
type TypeFilter = 'all' | 'percentage' | 'fixed';

export default function DiscountsPage() {
  const router = useRouter();
  const t = useTranslations('manager.discounts');
  const tCommon = useTranslations('common');
  const [discounts, setDiscounts] = useState<PromotionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setApiError('');
        const result = await promotionApi.getAll({ page: 1, limit: 100 });
        if (active) {
          setDiscounts(result.discounts);
        }
      } catch (error) {
        if (active) {
          const msg = error instanceof Error ? error.message : t('deleteFailed');
      setApiError(msg);
      toast.error(msg);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [t]);

  const filteredDiscounts = useMemo(() => {
    return discounts.filter((discount) => {
      const matchesSearch =
        discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discount.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        discount.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || discount.status === statusFilter;
      const matchesType = typeFilter === 'all' || discount.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [discounts, searchQuery, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const activePromotions = discounts.filter((discount) => discount.status === 'active').length;
    const expiringSoon = discounts.filter((discount) => {
      if (discount.status !== 'active') return false;
      const diff = new Date(discount.endDate).getTime() - new Date().getTime();
      const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return daysLeft > 0 && daysLeft <= 7;
    }).length;

    return [
      { title: t('stats.activePromotions'), value: activePromotions, icon: Percent },
      { title: t('stats.expiringSoon'), value: expiringSoon, icon: Calendar },
      { title: t('stats.totalCoupons'), value: discounts.length, icon: Tag },
    ];
  }, [discounts, t]);

  const handleDelete = async (discount: PromotionRecord) => {
    if (!window.confirm(t('deleteConfirm', { name: discount.name }))) return;

    try {
      await promotionApi.remove(discount.id);
      setDiscounts((current) => current.filter((item) => item.id !== discount.id));
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
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </section>

            {apiError ? (
              <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span>{apiError}</span>
              </div>
            ) : null}

            <section className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
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
                  onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                >
                  <option value="all">{t('filters.allTypes')}</option>
                  <option value="percentage">{t('filters.percentage')}</option>
                  <option value="fixed">{t('filters.fixed')}</option>
                </select>
              </div>
            </section>

            <div className="text-sm text-gray-600">
              {t('showingResults', { count: filteredDiscounts.length })}
            </div>

            <section className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <DiscountTable
                discounts={filteredDiscounts}
                onView={(discount) => router.push(`/manager/discounts/${discount.id}`)}
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
          </>
        )}
      </div>
    </>
  );
}
