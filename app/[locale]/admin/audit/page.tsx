'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import analyticsApi, { type RefundAuditFilters, type RefundAuditTrail } from '@/api/analytics';
import { Button } from '@/components/atoms';
import {
  DistributionBars,
  DonutBreakdown,
  TrendComparisonChart,
  type ChartDatum,
} from '@/components/analytics/ChartPrimitives';
import { Header } from '@/components/organisms/Header';
import { SystemScopeBlockedPage } from '@/components/pages/SystemScopeBlockedPage';
import { Card } from '@/components/ui/card';

const formatDateTime = (value?: string | null) => {
  if (!value) return '--';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

function formatToken(value: string) {
  if (!value) return '--';
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

function formatEventDate(value?: string | null) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return new Intl.DateTimeFormat('vi-VN', {
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function RefundAuditWorkspace() {
  const t = useTranslations('manager.audit');

  const [audit, setAudit] = useState<RefundAuditTrail | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [status, setStatus] = useState('all');
  const [ownerRole, setOwnerRole] = useState('all');
  const [actorRole, setActorRole] = useState('all');
  const [action, setAction] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filters = useMemo<RefundAuditFilters>(
    () => ({
      q: deferredSearch.trim() || undefined,
      status: status !== 'all' ? status : undefined,
      ownerRole: ownerRole !== 'all' ? ownerRole : undefined,
      actorRole: actorRole !== 'all' ? actorRole : undefined,
      action: action !== 'all' ? action : undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
    }),
    [action, actorRole, deferredSearch, fromDate, ownerRole, status, toDate]
  );

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await analyticsApi.getRefundAudit(page, 20, filters);
        if (active) {
          setAudit(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load refund audit trail.');
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
  }, [filters, page]);

  const totalPages = audit?.pagination.totalPages || 1;
  const actionChartData: ChartDatum[] = (audit?.byAction || []).slice(0, 8).map((bucket, index) => ({
    label: formatToken(bucket.action),
    value: bucket.count,
    color: ['#2563eb', '#0f766e', '#ea580c', '#7c3aed', '#be123c', '#16a34a'][index % 6],
  }));
  const actorChartData: ChartDatum[] = (audit?.byActorRole || []).map((bucket, index) => ({
    label: formatToken(bucket.role),
    value: bucket.count,
    color: ['#0f766e', '#d97706', '#2563eb', '#7c3aed', '#64748b'][index % 5],
  }));
  const eventsByDate = (audit?.rows || []).reduce<Record<string, number>>((accumulator, row) => {
    const key = formatEventDate(row.createdAt);
    accumulator[key] = Number(accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
  const eventTrendLabels = Object.keys(eventsByDate).sort((left, right) => {
    const [leftMonth, leftDay] = left.split('/').map(Number);
    const [rightMonth, rightDay] = right.split('/').map(Number);
    const leftKey = leftMonth * 100 + leftDay;
    const rightKey = rightMonth * 100 + rightDay;
    return leftKey - rightKey;
  });
  const eventTrendValues = eventTrendLabels.map((label) => eventsByDate[label] || 0);

  return (
    <>
      <Header
        title={t('title')}
        subtitle={t('subtitle')}
      />

      <div className="space-y-6 p-6">
        {error ? (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : null}

        <Card className="p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
            <label className="space-y-2 text-sm">
              <span className="font-medium text-gray-700">{t('filters.search')}</span>
              <div className="flex items-center rounded-md border border-gray-300 px-3">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t('filters.searchPlaceholder')}
                  className="h-10 w-full border-0 bg-transparent px-2 text-sm outline-none"
                />
              </div>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-gray-700">{t('filters.action')}</span>
              <select
                value={action}
                onChange={(event) => setAction(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
              >
                <option value="all">{t('filters.all')}</option>
                <option value="create_request">{t('filters.actionOpts.createRequest')}</option>
                <option value="start_review">{t('filters.actionOpts.startReview')}</option>
                <option value="request_customer_info">{t('filters.actionOpts.requestCustomerInfo')}</option>
                <option value="customer_submit_info">{t('filters.actionOpts.customerSubmitInfo')}</option>
                <option value="approve">{t('filters.actionOpts.approve')}</option>
                <option value="reject">{t('filters.actionOpts.reject')}</option>
                <option value="escalate">{t('filters.actionOpts.escalate')}</option>
                <option value="manager_approve">{t('filters.actionOpts.managerApprove')}</option>
                <option value="manager_reject">{t('filters.actionOpts.managerReject')}</option>
                <option value="send_back_to_staff">{t('filters.actionOpts.sendBackToStaff')}</option>
                <option value="mark_return_pending">{t('filters.actionOpts.markReturnPending')}</option>
                <option value="confirm_return_received">{t('filters.actionOpts.confirmReturnReceived')}</option>
                <option value="inspection_failed">{t('filters.actionOpts.inspectionFailed')}</option>
                <option value="start_processing">{t('filters.actionOpts.startProcessing')}</option>
                <option value="complete">{t('filters.actionOpts.complete')}</option>
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-gray-700">{t('filters.actorRole')}</span>
              <select
                value={actorRole}
                onChange={(event) => setActorRole(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
              >
                <option value="all">{t('filters.all')}</option>
                <option value="sales">{t('filters.roleOpts.sales')}</option>
                <option value="manager">{t('filters.roleOpts.manager')}</option>
                <option value="operations">{t('filters.roleOpts.operations')}</option>
                <option value="customer">{t('filters.roleOpts.customer')}</option>
                <option value="admin">{t('filters.roleOpts.admin')}</option>
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-gray-700">{t('filters.currentOwner')}</span>
              <select
                value={ownerRole}
                onChange={(event) => setOwnerRole(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
              >
                <option value="all">{t('filters.all')}</option>
                <option value="sales">{t('filters.roleOpts.sales')}</option>
                <option value="manager">{t('filters.roleOpts.manager')}</option>
                <option value="operations">{t('filters.roleOpts.operations')}</option>
                <option value="customer">{t('filters.roleOpts.customer')}</option>
                <option value="none">{t('filters.roleOpts.none')}</option>
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-gray-700">{t('filters.status')}</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
              >
                <option value="all">{t('filters.all')}</option>
                <option value="requested">{t('filters.statusOpts.requested')}</option>
                <option value="reviewing">{t('filters.statusOpts.reviewing')}</option>
                <option value="waiting_customer_info">{t('filters.statusOpts.waitingCustomer')}</option>
                <option value="escalated_to_manager">{t('filters.statusOpts.escalated')}</option>
                <option value="approved">{t('filters.statusOpts.approved')}</option>
                <option value="return_pending">{t('filters.statusOpts.returnPending')}</option>
                <option value="return_received">{t('filters.statusOpts.returnReceived')}</option>
                <option value="processing">{t('filters.statusOpts.processing')}</option>
                <option value="completed">{t('filters.statusOpts.completed')}</option>
                <option value="rejected">{t('filters.statusOpts.rejected')}</option>
              </select>
            </label>

            <div className="flex items-end gap-3">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-gray-700">{t('filters.from')}</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                />
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-gray-700">{t('filters.to')}</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                />
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setStatus('all');
                  setOwnerRole('all');
                  setActorRole('all');
                  setAction('all');
                  setFromDate('');
                  setToDate('');
                }}
              >
                {t('filters.reset')}
              </Button>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card className="p-5">
                <div className="text-sm text-gray-500">{t('stats.totalEvents')}</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">
                  {audit?.summary.totalEvents || 0}
                </div>
              </Card>
              <Card className="p-5">
                <div className="text-sm text-gray-500">{t('stats.uniqueOrders')}</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">
                  {audit?.summary.uniqueOrders || 0}
                </div>
              </Card>
              <Card className="p-5">
                <div className="text-sm text-gray-500">{t('stats.topAction')}</div>
                <div className="mt-2 text-lg font-semibold text-gray-900">
                  {formatToken(audit?.byAction?.[0]?.action || '')}
                </div>
              </Card>
              <Card className="p-5">
                <div className="text-sm text-gray-500">{t('stats.topActorRole')}</div>
                <div className="mt-2 text-lg font-semibold text-gray-900">
                  {formatToken(audit?.byActorRole?.[0]?.role || '')}
                </div>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.5fr_1.1fr_1.1fr]">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('charts.eventDensity')}</h3>
                <p className="mt-1 text-sm text-gray-600">{t('charts.eventDensityDesc')}</p>
                <div className="mt-6">
                  <TrendComparisonChart
                    labels={eventTrendLabels}
                    series={[
                      {
                        label: t('charts.events'),
                        color: '#2563eb',
                        values: eventTrendValues,
                        fill: true,
                      },
                    ]}
                  />
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('charts.actionMix')}</h3>
                <p className="mt-1 text-sm text-gray-600">{t('charts.actionMixDesc')}</p>
                <div className="mt-6">
                  <DistributionBars
                    data={actionChartData}
                    emptyLabel={t('charts.noActionBuckets')}
                  />
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('charts.actorMix')}</h3>
                <p className="mt-1 text-sm text-gray-600">{t('charts.actorMixDesc')}</p>
                <div className="mt-6">
                  <DonutBreakdown
                    data={actorChartData}
                    centerLabel={t('charts.actorRole')}
                    emptyLabel={t('charts.noActorBuckets')}
                  />
                </div>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{t('table.title')}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {t('table.pageInfo', {
                        page: audit?.pagination.page || 1,
                        total: totalPages,
                        count: audit?.pagination.total || 0,
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                      disabled={page <= 1}
                      className="gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      {t('table.prev')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                      disabled={page >= totalPages}
                      className="gap-2"
                    >
                      {t('table.next')}
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-500">
                        <th className="pb-3 pr-4">{t('table.headers.when')}</th>
                        <th className="pb-3 pr-4">{t('table.headers.order')}</th>
                        <th className="pb-3 pr-4">{t('table.headers.action')}</th>
                        <th className="pb-3 pr-4">{t('table.headers.actor')}</th>
                        <th className="pb-3 pr-4">{t('table.headers.transition')}</th>
                        <th className="pb-3">{t('table.headers.note')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(audit?.rows || []).map((row) => (
                        <tr key={row.id} className="border-b border-gray-100 align-top text-gray-700">
                          <td className="py-3 pr-4">{formatDateTime(row.createdAt)}</td>
                          <td className="py-3 pr-4">
                            <div className="font-medium text-gray-900">{row.orderCode}</div>
                            <div className="text-xs text-gray-500">{row.customerName}</div>
                          </td>
                          <td className="py-3 pr-4">
                            <div>{formatToken(row.action)}</div>
                            <div className="text-xs text-gray-500">
                              {t('table.ownerLabel')} {formatToken(row.currentOwnerRole)}
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <div>{row.actorName || '--'}</div>
                            <div className="text-xs text-gray-500">{formatToken(row.actorRole)}</div>
                          </td>
                          <td className="py-3 pr-4">
                            <div>
                              {formatToken(row.fromStatus)} {'→'} {formatToken(row.toStatus)}
                            </div>
                            {row.transactionRef ? (
                              <div className="text-xs text-gray-500">Tx {row.transactionRef}</div>
                            ) : null}
                          </td>
                          <td className="py-3">
                            <div>{row.note || '--'}</div>
                            {row.attentionReason ? (
                              <div className="mt-1 text-xs text-red-600">{row.attentionReason}</div>
                            ) : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('sidebar.byAction')}</h3>
                  <div className="mt-4 space-y-3">
                    {(audit?.byAction || []).slice(0, 8).map((bucket) => (
                      <div key={bucket.action} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{formatToken(bucket.action)}</span>
                        <span className="font-medium text-gray-900">{bucket.count}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('sidebar.byActorRole')}</h3>
                  <div className="mt-4 space-y-3">
                    {(audit?.byActorRole || []).map((bucket) => (
                      <div key={bucket.role} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{formatToken(bucket.role)}</span>
                        <span className="font-medium text-gray-900">{bucket.count}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </section>
          </>
        )}
      </div>
    </>
  );
}

export default function AdminRefundAuditPage() {
  return (
    <SystemScopeBlockedPage
      title="Refund Audit Trail"
      subtitle="Compatibility route kept for legacy admin links"
      message="Refund audit belongs to manager-owned business governance. Admin should use system audit, access review, and platform controls instead of business refund history."
    />
  );
}
