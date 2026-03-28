'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, AlertTriangle, FileText, Loader2, Shield } from 'lucide-react';

import { Header } from '@/components/organisms/Header';
import { RuntimeFeatureBlockedPage } from '@/components/pages/RuntimeFeatureBlockedPage';
import { StatCard } from '@/components/molecules/StatCard';
import { PolicyTable } from '@/components/organisms/manager';
import { Input } from '@/components/atoms/Input';
import { useRuntimeSystemConfig } from '@/hooks/useRuntimeSystemConfig';
import policyApi, { type PolicyRecord } from '@/api/policies';

type StatusFilter = 'all' | 'active' | 'inactive' | 'draft';
type CategoryFilter =
  | 'all'
  | 'warranty'
  | 'return'
  | 'refund'
  | 'shipping'
  | 'purchase'
  | 'privacy'
  | 'terms';

export default function PoliciesPage() {
  const router = useRouter();
  const {
    config: runtimeConfig,
    loading: loadingRuntimeConfig,
    error: runtimeConfigError,
  } = useRuntimeSystemConfig();
  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  useEffect(() => {
    if (loadingRuntimeConfig) {
      return undefined;
    }
    if (
      runtimeConfigError ||
      runtimeConfig?.maintenanceMode ||
      runtimeConfig?.featureFlags?.managerPolicyEditorEnabled === false
    ) {
      setLoading(false);
      return undefined;
    }

    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setApiError('');
        const result = await policyApi.getAll({ page: 1, limit: 100 });
        if (active) {
          setPolicies(result.policies);
        }
      } catch (error) {
        if (active) {
          setApiError(error instanceof Error ? error.message : 'Failed to load policies.');
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
  }, [
    loadingRuntimeConfig,
    runtimeConfig,
    runtimeConfigError,
  ]);

  if (loadingRuntimeConfig) {
    return (
      <>
        <Header title="Policy Management" subtitle="Loading runtime policy access..." />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  if (runtimeConfigError) {
    return (
      <RuntimeFeatureBlockedPage
        title="Policy Management"
        subtitle="Unable to load runtime system config"
        heading="Cannot verify policy editor availability"
        message={runtimeConfigError}
        primaryHref="/manager"
        primaryLabel="Back to manager"
      />
    );
  }

  if (runtimeConfig?.maintenanceMode) {
    return (
      <RuntimeFeatureBlockedPage
        title="Policy Management"
        subtitle="System maintenance is active"
        heading="Policy editing is temporarily unavailable"
        message="Admin has enabled maintenance mode, so manager policy actions are paused until the system is reopened."
        primaryHref="/manager"
        primaryLabel="Back to manager"
      />
    );
  }

  if (runtimeConfig?.featureFlags?.managerPolicyEditorEnabled === false) {
    return (
      <RuntimeFeatureBlockedPage
        title="Policy Management"
        subtitle="Manager policy editor is disabled"
        heading="Policy editing is currently locked"
        message="Admin has turned off manager access for policy governance. You can still ask an admin to update the rule set."
        primaryHref="/manager"
        primaryLabel="Back to manager"
      />
    );
  }

  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      const matchesSearch =
        policy.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        policy.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || policy.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || policy.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [policies, searchQuery, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const activePolicies = policies.filter((policy) => policy.status === 'active').length;
    const needsReview = policies.filter((policy) => {
      if (policy.status !== 'active') return false;
      const monthsOld =
        (Date.now() - new Date(policy.updatedAt || Date.now()).getTime()) /
        (1000 * 60 * 60 * 24 * 30);
      return monthsOld >= 6;
    }).length;

    return [
      { title: 'Total policies', value: policies.length, icon: FileText },
      { title: 'Active policies', value: activePolicies, icon: Shield },
      { title: 'Needs review', value: needsReview, icon: AlertCircle },
    ];
  }, [policies]);

  const handleDelete = async (policy: PolicyRecord) => {
    if (!window.confirm(`Delete policy "${policy.title}"?`)) return;

    try {
      await policyApi.remove(policy.id);
      setPolicies((current) => current.filter((item) => item.id !== policy.id));
      setApiError('');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to delete policy.');
    }
  };

  return (
    <>
      <Header
        title="Policy Management"
        subtitle="Control business rules for refund, return, warranty, shipping, purchase, and privacy"
        showAddButton
        addButtonLabel="Create policy"
        onAdd={() => router.push('/manager/policies/create')}
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
                  placeholder="Search by title, summary, or content"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                >
                  <option value="all">All categories</option>
                  <option value="warranty">Warranty</option>
                  <option value="return">Return</option>
                  <option value="refund">Refund</option>
                  <option value="shipping">Shipping</option>
                  <option value="purchase">Purchase</option>
                  <option value="privacy">Privacy</option>
                  <option value="terms">Terms</option>
                </select>
              </div>
              <div className="w-full sm:w-48">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </section>

            <div className="text-sm text-gray-600">
              Showing {filteredPolicies.length} policy item(s)
            </div>

            <section className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <PolicyTable
                policies={filteredPolicies}
                onView={(policy) => router.push(`/manager/policies/${policy.id}`)}
                onDelete={handleDelete}
                translations={{
                  title: 'Policy',
                  category: 'Category',
                  lastUpdated: 'Last updated',
                  status: 'Status',
                  actions: 'Actions',
                  noData: 'No policies found',
                  warranty: 'Warranty',
                  return: 'Return',
                  refund: 'Refund',
                  shipping: 'Shipping',
                  purchase: 'Purchase',
                  privacy: 'Privacy',
                  terms: 'Terms',
                  active: 'Active',
                  inactive: 'Inactive',
                  draft: 'Draft',
                  viewDetails: 'View',
                  deletePolicy: 'Delete',
                }}
              />
            </section>
          </>
        )}
      </div>
    </>
  );
}
