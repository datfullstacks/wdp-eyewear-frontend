'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { PolicyTable } from '@/components/organisms/manager';
import { Input } from '@/components/atoms/Input';
import { FileText, Shield, AlertCircle, AlertTriangle } from 'lucide-react';
import { policiesData, type Policy } from '@/data/policiesData';

type StatusFilter = 'all' | 'active' | 'inactive' | 'draft';
type CategoryFilter = 'all' | 'warranty' | 'return' | 'shipping' | 'purchase' | 'privacy' | 'terms';

export default function PoliciesPage() {
  const router = useRouter();
  const t = useTranslations('manager.policies');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [apiError, setApiError] = useState('');

  // Filtered policies
  const filteredPolicies = useMemo(() => {
    return policiesData.filter((policy) => {
      const matchesSearch =
        policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || policy.status === statusFilter;

      const matchesCategory =
        categoryFilter === 'all' || policy.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [searchQuery, statusFilter, categoryFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = policiesData.length;
    const active = policiesData.filter((p) => p.status === 'active').length;
    const needsUpdate = policiesData.filter((p) => {
      if (p.status !== 'active') return false;
      const updatedDate = new Date(p.updatedAt);
      const now = new Date();
      const monthsSinceUpdate = Math.floor(
        (now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      return monthsSinceUpdate >= 6; // Consider policies older than 6 months as needing update
    }).length;

    return [
      {
        title: t('stats.totalPolicies'),
        value: total.toString(),
        icon: FileText,
        trend: { value: 0, isPositive: true },
      },
      {
        title: t('stats.activePolicies'),
        value: active.toString(),
        icon: Shield,
        trend: { value: 0, isPositive: true },
      },
      {
        title: t('stats.needsUpdate'),
        value: needsUpdate.toString(),
        icon: AlertCircle,
        trend: { value: 0, isPositive: false },
      },
    ];
  }, [t]);

  const handleView = (policy: Policy) => {
    // TODO: Navigate to detail page
    console.log('View policy:', policy);
    router.push(`/manager/policies/${policy.id}`);
  };

  const handleDelete = async (policy: Policy) => {
    if (!confirm(t('deleteConfirm', { name: policy.title }))) return;
    try {
      // TODO: Call delete API
      console.log('Delete policy:', policy);
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
        addButtonLabel={t('createPolicy')}
        onAdd={() => router.push('/manager/policies/create')}
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">{t('filters.allCategories')}</option>
              <option value="warranty">{t('filters.warranty')}</option>
              <option value="return">{t('filters.return')}</option>
              <option value="shipping">{t('filters.shipping')}</option>
              <option value="purchase">{t('filters.purchase')}</option>
              <option value="privacy">{t('filters.privacy')}</option>
              <option value="terms">{t('filters.terms')}</option>
            </select>
          </div>
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">{t('filters.allStatus')}</option>
              <option value="active">{t('filters.active')}</option>
              <option value="inactive">{t('filters.inactive')}</option>
              <option value="draft">{t('filters.draft')}</option>
            </select>
          </div>
        </section>

        {/* Results count */}
        <div className="text-sm text-gray-600">
          {t('showingResults', { count: filteredPolicies.length })}
        </div>

        {/* Policies Table */}
        <section className="rounded-lg border border-gray-200 bg-white overflow-x-auto">
          <PolicyTable
            policies={filteredPolicies}
            onView={handleView}
            onDelete={handleDelete}
            translations={{
              title: t('table.title'),
              category: t('table.category'),
              lastUpdated: t('table.lastUpdated'),
              status: t('table.status'),
              actions: t('table.actions'),
              noData: t('table.noData'),
              warranty: t('table.warranty'),
              return: t('table.return'),
              shipping: t('table.shipping'),
              purchase: t('table.purchase'),
              privacy: t('table.privacy'),
              terms: t('table.terms'),
              active: t('table.active'),
              inactive: t('table.inactive'),
              draft: t('table.draft'),
              viewDetails: t('table.viewDetails'),
              deletePolicy: t('table.deletePolicy'),
            }}
          />
        </section>
      </div>
    </>
  );
}
