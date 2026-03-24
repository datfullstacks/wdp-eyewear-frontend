'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Loader2, Search } from 'lucide-react';

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

function formatOwner(owner: string) {
  switch (owner) {
    case 'sales':
      return 'Sale/Staff';
    case 'manager':
      return 'Manager';
    case 'operations':
      return 'Operations';
    case 'customer':
      return 'Customer';
    default:
      return 'Closed';
  }
}

function formatStatus(status: string) {
  switch (status) {
    case 'waiting_customer_info':
      return 'Cho KH bo sung';
    case 'escalated_to_manager':
      return 'Cho manager';
    case 'return_pending':
      return 'Cho hang hoan';
    case 'return_received':
      return 'Da nhan hang';
    default:
      return status || '--';
  }
}

function formatNextAction(code: string) {
  switch (code) {
    case 'customer_submit_info':
      return 'Khach bo sung thong tin';
    case 'manager_approve':
      return 'Manager quyet dinh';
    case 'confirm_return_received':
      return 'Operation nhan / QC hang';
    case 'start_processing':
      return 'Bat dau payout';
    case 'complete':
      return 'Xac nhan da chuyen tien';
    case 'start_review':
      return 'Staff review';
    default:
      return '--';
  }
}

function CaseTable({
  title,
  rows,
  emptyText,
  onOverride,
}: {
  title: string;
  rows: RefundOpsCase[];
  emptyText: string;
  onOverride?: (row: RefundOpsCase) => void;
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
                <th className="pb-3 pr-4">Order</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Refund</th>
                <th className="pb-3 pr-4">Owner</th>
                <th className="pb-3 pr-4">Next step</th>
                <th className="pb-3 pr-4">Amount</th>
                <th className="pb-3 pr-4">Updated</th>
                {onOverride ? <th className="pb-3">Action</th> : null}
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
                    <div>{formatStatus(row.refundStatus)}</div>
                    <div className="text-xs text-gray-500">{row.ageHours}h</div>
                  </td>
                  <td className="py-3 pr-4">{formatOwner(row.currentOwnerRole)}</td>
                  <td className="py-3 pr-4">{formatNextAction(row.nextActionCode)}</td>
                  <td className="py-3 pr-4">{formatCurrency(row.approvedAmount || row.requestedAmount)}</td>
                  <td className="py-3 pr-4">{formatDateTime(row.updatedAt)}</td>
                  {onOverride ? (
                    <td className="py-3">
                      <Button type="button" variant="outline" onClick={() => onOverride(row)}>
                        Override
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
  const [overrideAction, setOverrideAction] = useState<'reassign_sales' | 'reassign_manager' | 'reassign_operations' | 'reset_reviewing' | 'retry_customer_notification'>('reassign_sales');
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
    { label: 'Total cases', value: overview?.summary.totalCases || 0 },
    { label: 'Active cases', value: overview?.summary.activeCases || 0 },
    { label: 'Waiting customer', value: overview?.summary.waitingCustomer || 0 },
    { label: 'Escalated', value: overview?.summary.escalated || 0 },
    { label: 'Payout pending', value: overview?.summary.payoutPending || 0 },
    { label: 'Flagged', value: overview?.summary.flaggedCases || 0 },
  ];

  return (
    <>
      <Header
        title="Refund Monitoring"
        subtitle="Manager workspace for exception handling, payout backlog, and owner distribution"
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
                  <span className="font-medium text-gray-700">Search</span>
                  <div className="flex items-center rounded-md border border-gray-300 px-3">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Order / customer / reason"
                      className="h-10 w-full border-0 bg-transparent px-2 text-sm outline-none"
                    />
                  </div>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Refund status</span>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="requested">Requested</option>
                    <option value="reviewing">Reviewing</option>
                    <option value="waiting_customer_info">Waiting customer</option>
                    <option value="escalated_to_manager">Escalated</option>
                    <option value="approved">Approved</option>
                    <option value="return_pending">Return pending</option>
                    <option value="return_received">Return received</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">Owner</span>
                  <select
                    value={ownerRole}
                    onChange={(event) => setOwnerRole(event.target.value)}
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  >
                    <option value="all">All</option>
                    <option value="sales">Sale/Staff</option>
                    <option value="manager">Manager</option>
                    <option value="operations">Operations</option>
                    <option value="customer">Customer</option>
                    <option value="none">Closed</option>
                  </select>
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">From</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                  />
                </label>

                <label className="space-y-2 text-sm">
                  <span className="font-medium text-gray-700">To</span>
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
                    Attention only
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
                    Reset
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

            <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
              <CaseTable
                title="Flagged cases"
                rows={overview?.flaggedCases || []}
                emptyText="No refund case is currently flagged."
                onOverride={setSelectedCase}
              />

              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">By status</h3>
                  <div className="mt-4 space-y-3">
                    {(overview?.byStatus || []).map((bucket) => (
                      <div key={bucket.status} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{formatStatus(bucket.status)}</span>
                        <span className="font-medium text-gray-900">{bucket.count}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900">By owner</h3>
                  <div className="mt-4 space-y-3">
                    {(overview?.byOwner || []).map((bucket) => (
                      <div key={bucket.owner} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{formatOwner(bucket.owner)}</span>
                        <span className="font-medium text-gray-900">{bucket.count}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
              <CaseTable
                title="Recently completed"
                rows={overview?.recentCompleted || []}
                emptyText="No completed refund in the current preview."
                onOverride={setSelectedCase}
              />

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">Reconciliation</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Open the reconciliation workspace to verify payout references,
                  invoice state, and outstanding approved amounts.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/manager/reconciliation"
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    Open reconciliation
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/manager/audit"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Open audit trail
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
              Refund business override
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedCase
                ? `Apply guarded override for ${selectedCase.orderCode}. Every action is written to refund history.`
                : 'Select a refund case first.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-foreground/80">Override action</Label>
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
                <option value="reassign_sales">Reassign to sales</option>
                <option value="reassign_manager">Reassign to manager</option>
                <option value="reassign_operations">Reassign to operations</option>
                <option value="reset_reviewing">Reset to reviewing</option>
                <option value="retry_customer_notification">Retry customer notification</option>
              </select>
            </div>

            <div>
              <Label className="text-foreground/80">Reason</Label>
              <Textarea
                value={overrideReason}
                onChange={(event) => setOverrideReason(event.target.value)}
                placeholder="Explain why this override is necessary..."
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
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleOverrideSubmit()}
              disabled={overrideSubmitting || !overrideReason.trim()}
            >
              {overrideSubmitting ? 'Applying...' : 'Apply override'}
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
