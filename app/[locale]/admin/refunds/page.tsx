'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Loader2, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

import analyticsApi, {
  type AdminRefundFilters,
  type AdminRefundOverview,
  type RefundOpsCase,
} from '@/api/analytics';
import { orderApi } from '@/api';
import { Button } from '@/components/atoms';
import { Header } from '@/components/organisms/Header';
import { SystemScopeBlockedPage } from '@/components/pages/SystemScopeBlockedPage';
import { Card } from '@/components/ui/card';
import {
  DistributionBars,
  DonutBreakdown,
  type ChartDatum,
} from '@/components/analytics/ChartPrimitives';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDateTime = (value?: string) => {
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

function CaseTable({
  title,
  rows,
  emptyText,
  onOverride,
  tableLabels,
  formatStatusFn,
  formatOwnerFn,
  formatNextActionFn,
}: {
  title: string;
  rows: RefundOpsCase[];
  emptyText: string;
  onOverride?: (row: RefundOpsCase) => void;
  tableLabels: {
    order: string;
    customer: string;
    refund: string;
    owner: string;
    nextStep: string;
    amount: string;
    updated: string;
    action: string;
    override: string;
  };
  formatStatusFn: (status: string) => string;
  formatOwnerFn: (owner: string) => string;
  formatNextActionFn: (code: string) => string;
}) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">{emptyText}</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-3 pr-4">{tableLabels.order}</th>
                <th className="pb-3 pr-4">{tableLabels.customer}</th>
                <th className="pb-3 pr-4">{tableLabels.refund}</th>
                <th className="pb-3 pr-4">{tableLabels.owner}</th>
                <th className="pb-3 pr-4">{tableLabels.nextStep}</th>
                <th className="pb-3 pr-4">{tableLabels.amount}</th>
                <th className="pb-3 pr-4">{tableLabels.updated}</th>
                {onOverride ? <th className="pb-3">{tableLabels.action}</th> : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.orderId} className="border-b border-gray-100 align-top text-gray-700">
                  <td className="py-3 pr-4">
                    <div className="font-medium text-gray-900">{row.orderCode}</div>
                    {row.attentionReason ? (
                      <div className="mt-1 text-xs text-red-600">{row.attentionReason}</div>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4">
                    <div>{row.customerName}</div>
                    <div className="text-xs text-gray-500">{row.customerPhone || '--'}</div>
                  </td>
                  <td className="py-3 pr-4">
                    <div>{formatStatusFn(row.refundStatus)}</div>
                    <div className="text-xs text-gray-500">{row.ageHours}h</div>
                  </td>
                  <td className="py-3 pr-4">{formatOwnerFn(row.currentOwnerRole)}</td>
                  <td className="py-3 pr-4">{formatNextActionFn(row.nextActionCode)}</td>
                  <td className="py-3 pr-4">{formatCurrency(row.approvedAmount || row.requestedAmount)}</td>
                  <td className="py-3 pr-4">{formatDateTime(row.updatedAt)}</td>
                  {onOverride ? (
                    <td className="py-3">
                      <Button type="button" variant="outline" onClick={() => onOverride(row)}>
                        {tableLabels.override}
                      </Button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

export function RefundMonitoringWorkspace() {
  const t = useTranslations('manager.monitoring');

  const formatStatus = (status: string) => {
    switch (status) {
      case 'waiting_customer_info': return t('status.waitingCustomerInfo');
      case 'escalated_to_manager': return t('status.escalatedToManager');
      case 'return_pending': return t('status.returnPending');
      case 'return_received': return t('status.returnReceived');
      default: return status || '--';
    }
  };

  const formatOwner = (owner: string) => {
    switch (owner) {
      case 'sales': return t('owner.sales');
      case 'manager': return t('owner.manager');
      case 'operations': return t('owner.operations');
      case 'customer': return t('owner.customer');
      default: return t('owner.closed');
    }
  };

  const formatNextAction = (code: string) => {
    switch (code) {
      case 'customer_submit_info': return t('nextAction.customerSubmitInfo');
      case 'manager_approve': return t('nextAction.managerApprove');
      case 'confirm_return_received': return t('nextAction.confirmReturnReceived');
      case 'start_processing': return t('nextAction.startProcessing');
      case 'complete': return t('nextAction.complete');
      case 'start_review': return t('nextAction.startReview');
      default: return '--';
    }
  };

  const buildBucketChartData = (
    buckets: Array<{ status?: string; owner?: string; count: number }>,
    kind: 'status' | 'owner',
  ): ChartDatum[] => {
    const palette =
      kind === 'status'
        ? ['#be123c', '#ea580c', '#2563eb', '#7c3aed', '#16a34a', '#475569']
        : ['#0f766e', '#d97706', '#2563eb', '#7c3aed', '#64748b'];

    return (Array.isArray(buckets) ? buckets : []).map((bucket, index) => ({
      label:
        kind === 'status'
          ? formatStatus(String(bucket.status || ''))
          : formatOwner(String(bucket.owner || '')),
      value: Number(bucket.count || 0),
      color: palette[index % palette.length],
    }));
  };

  const [overview, setOverview] = useState<AdminRefundOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [status, setStatus] = useState('all');
  const [ownerRole, setOwnerRole] = useState('all');
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedCase, setSelectedCase] = useState<RefundOpsCase | null>(null);
  const [overrideAction, setOverrideAction] = useState<
    'reassign_sales' | 'reassign_manager' | 'reassign_operations' | 'reset_reviewing' | 'retry_customer_notification'
  >('reassign_sales');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideSubmitting, setOverrideSubmitting] = useState(false);

  const filters = useMemo<AdminRefundFilters>(
    () => ({
      q: deferredSearch.trim() || undefined,
      status: status !== 'all' ? status : undefined,
      ownerRole: ownerRole !== 'all' ? ownerRole : undefined,
      attentionOnly: attentionOnly ? true : undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
    }),
    [attentionOnly, deferredSearch, fromDate, ownerRole, status, toDate]
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await analyticsApi.getAdminRefundOverview(8, filters);
        if (active) {
          setOverview(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load refund monitoring.');
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
  }, [filters]);

  const reloadOverview = async () => {
    setLoading(true);
    try {
      setError('');
      const data = await analyticsApi.getAdminRefundOverview(8, filters);
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load refund monitoring.');
    } finally {
      setLoading(false);
    }
  };

  const handleOverrideSubmit = async () => {
    if (!selectedCase || !overrideReason.trim()) {
      return;
    }

    try {
      setOverrideSubmitting(true);
      await orderApi.overrideRefund(selectedCase.orderId, {
        action: overrideAction,
        reason: overrideReason.trim(),
      });
      setSelectedCase(null);
      setOverrideReason('');
      setOverrideAction('reassign_sales');
      await reloadOverview();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply refund override.');
    } finally {
      setOverrideSubmitting(false);
    }
  };

  const stats = [
    { label: t('stats.totalCases'), value: overview?.summary.totalCases || 0 },
    { label: t('stats.activeCases'), value: overview?.summary.activeCases || 0 },
    { label: t('stats.waitingCustomer'), value: overview?.summary.waitingCustomer || 0 },
    { label: t('stats.escalated'), value: overview?.summary.escalated || 0 },
    { label: t('stats.payoutPending'), value: overview?.summary.payoutPending || 0 },
    { label: t('stats.flagged'), value: overview?.summary.flaggedCases || 0 },
  ];

  const statusChartData = buildBucketChartData(overview?.byStatus || [], 'status');
  const ownerChartData = buildBucketChartData(overview?.byOwner || [], 'owner');

  const pressureData: ChartDatum[] = [
    {
      label: t('pressure.flaggedCases'),
      value: overview?.summary.flaggedCases || 0,
      color: '#be123c',
      hint: t('pressure.flaggedHint'),
    },
    {
      label: t('pressure.payoutPending'),
      value: overview?.summary.payoutPending || 0,
      color: '#d97706',
      hint: t('pressure.payoutHint'),
    },
    {
      label: t('pressure.escalated'),
      value: overview?.summary.escalated || 0,
      color: '#ea580c',
      hint: t('pressure.escalatedHint'),
    },
    {
      label: t('pressure.waitingCustomer'),
      value: overview?.summary.waitingCustomer || 0,
      color: '#2563eb',
      hint: t('pressure.waitingHint'),
    },
    {
      label: t('pressure.completedThisMonth'),
      value: overview?.summary.completedThisMonth || 0,
      color: '#16a34a',
      hint: t('pressure.completedHint'),
    },
    {
      label: t('pressure.rejectedThisMonth'),
      value: overview?.summary.rejectedThisMonth || 0,
      color: '#64748b',
      hint: t('pressure.rejectedHint'),
    },
  ];

  const tableLabels = {
    order: t('table.order'),
    customer: t('table.customer'),
    refund: t('table.refund'),
    owner: t('table.owner'),
    nextStep: t('table.nextStep'),
    amount: t('table.amount'),
    updated: t('table.updated'),
    action: t('table.action'),
    override: t('table.override'),
  };

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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
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

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">{t('filters.owner')}</span>
                  <select
                    value={ownerRole}
                    onChange={(event) => setOwnerRole(event.target.value)}
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  >
                    <option value="all">{t('filters.all')}</option>
                    <option value="sales">{t('filters.ownerOpts.sales')}</option>
                    <option value="manager">{t('filters.ownerOpts.manager')}</option>
                    <option value="operations">{t('filters.ownerOpts.operations')}</option>
                    <option value="customer">{t('filters.ownerOpts.customer')}</option>
                    <option value="none">{t('filters.ownerOpts.none')}</option>
                  </select>
                </label>

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

                <div className="flex items-end gap-3">
                  <label className="flex flex-1 items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={attentionOnly}
                      onChange={(event) => setAttentionOnly(event.target.checked)}
                    />
                    {t('filters.attentionOnly')}
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSearch('');
                      setStatus('all');
                      setOwnerRole('all');
                      setAttentionOnly(false);
                      setFromDate('');
                      setToDate('');
                    }}
                  >
                    {t('filters.reset')}
                  </Button>
                </div>
              </div>
            </Card>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              {stats.map((stat) => (
                <Card key={stat.label} className="p-5">
                  <div className="text-sm text-gray-500">{stat.label}</div>
                  <div className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</div>
                </Card>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.1fr_1.1fr_1.4fr]">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('charts.statusMixTitle')}</h3>
                <p className="mt-1 text-sm text-gray-600">{t('charts.statusMixDesc')}</p>
                <div className="mt-6">
                  <DonutBreakdown
                    data={statusChartData}
                    centerLabel={t('charts.refundStates')}
                    emptyLabel={t('charts.noStatusData')}
                  />
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('charts.ownerDistTitle')}</h3>
                <p className="mt-1 text-sm text-gray-600">{t('charts.ownerDistDesc')}</p>
                <div className="mt-6">
                  <DonutBreakdown
                    data={ownerChartData}
                    centerLabel={t('charts.currentOwner')}
                    emptyLabel={t('charts.noOwnerData')}
                  />
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('charts.pressureTitle')}</h3>
                <p className="mt-1 text-sm text-gray-600">{t('charts.pressureDesc')}</p>
                <div className="mt-6">
                  <DistributionBars
                    data={pressureData}
                    emptyLabel={t('charts.noPressure')}
                  />
                </div>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
              <CaseTable
                title={t('sections.flaggedCasesTitle')}
                rows={overview?.flaggedCases || []}
                emptyText={t('sections.flaggedCasesEmpty')}
                onOverride={setSelectedCase}
                tableLabels={tableLabels}
                formatStatusFn={formatStatus}
                formatOwnerFn={formatOwner}
                formatNextActionFn={formatNextAction}
              />

              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('sections.byStatus')}</h3>
                  <div className="mt-4 space-y-3">
                    {(overview?.byStatus || []).map((bucket) => (
                      <div key={bucket.status} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{formatStatus(String(bucket.status || ''))}</span>
                        <span className="font-medium text-gray-900">{bucket.count}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">{t('sections.byOwner')}</h3>
                  <div className="mt-4 space-y-3">
                    {(overview?.byOwner || []).map((bucket) => (
                      <div key={bucket.owner} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{formatOwner(String(bucket.owner || ''))}</span>
                        <span className="font-medium text-gray-900">{bucket.count}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
              <CaseTable
                title={t('sections.recentCompletedTitle')}
                rows={overview?.recentCompleted || []}
                emptyText={t('sections.recentCompletedEmpty')}
                onOverride={setSelectedCase}
                tableLabels={tableLabels}
                formatStatusFn={formatStatus}
                formatOwnerFn={formatOwner}
                formatNextActionFn={formatNextAction}
              />

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('sections.reconciliationTitle')}</h3>
                <p className="mt-2 text-sm text-gray-600">{t('sections.reconciliationDesc')}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/manager/reconciliation"
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    {t('sections.openReconciliation')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/manager/audit"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    {t('sections.openAuditTrail')}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Card>
            </section>
          </>
        )}
      </div>

      <Dialog
        open={Boolean(selectedCase)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCase(null);
            setOverrideReason('');
            setOverrideAction('reassign_sales');
          }
        }}
      >
        <DialogContent className="w-[92vw] max-w-md p-4 sm:p-5">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900">
              {t('dialog.title')}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedCase
                ? `Apply guarded override for ${selectedCase.orderCode}. Every action is written to refund history.`
                : t('dialog.title')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-foreground/80">{t('dialog.overrideAction')}</Label>
              <select
                value={overrideAction}
                onChange={(event) =>
                  setOverrideAction(
                    event.target.value as
                      | 'reassign_sales'
                      | 'reassign_manager'
                      | 'reassign_operations'
                      | 'reset_reviewing'
                      | 'retry_customer_notification'
                  )
                }
                className="mt-1 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                <option value="reassign_sales">{t('dialog.actions.reassignSales')}</option>
                <option value="reassign_manager">{t('dialog.actions.reassignManager')}</option>
                <option value="reassign_operations">{t('dialog.actions.reassignOperations')}</option>
                <option value="reset_reviewing">{t('dialog.actions.resetReviewing')}</option>
                <option value="retry_customer_notification">{t('dialog.actions.retryNotification')}</option>
              </select>
            </div>

            <div>
              <Label className="text-foreground/80">{t('dialog.reason')}</Label>
              <Textarea
                value={overrideReason}
                onChange={(event) => setOverrideReason(event.target.value)}
                placeholder={t('dialog.reasonPlaceholder')}
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedCase(null);
                setOverrideReason('');
                setOverrideAction('reassign_sales');
              }}
              disabled={overrideSubmitting}
            >
              {t('dialog.cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => void handleOverrideSubmit()}
              disabled={overrideSubmitting || !overrideReason.trim()}
            >
              {overrideSubmitting ? t('dialog.applying') : t('dialog.apply')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function AdminRefundMonitoringPage() {
  return (
    <SystemScopeBlockedPage
      title="Refund Monitoring"
      subtitle="Compatibility route kept for legacy admin links"
      message="Refund monitoring, reconciliation, and audit are business workflows under manager ownership. Admin retains only system configuration and access governance in this web dashboard."
    />
  );
}
