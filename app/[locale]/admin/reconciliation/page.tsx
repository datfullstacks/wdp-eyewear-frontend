'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  Search,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import analyticsApi, {
  type RefundReconciliation,
  type RefundReconciliationFilters,
  type RefundReconciliationRow,
} from '@/api/analytics';
import { Button } from '@/components/atoms';
import {
  DistributionBars,
  DonutBreakdown,
  type ChartDatum,
} from '@/components/analytics/ChartPrimitives';
import { Header } from '@/components/organisms/Header';
import { SystemScopeBlockedPage } from '@/components/pages/SystemScopeBlockedPage';
import { Card } from '@/components/ui/card';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

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

type ProofFilter = 'all' | 'with' | 'without';

export function RefundReconciliationWorkspace() {
  const t = useTranslations('manager.reconciliation');
  const [report, setReport] = useState<RefundReconciliation | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [status, setStatus] = useState('all');
  const [ownerRole, setOwnerRole] = useState('all');
  const [matchStatus, setMatchStatus] = useState('all');
  const [proofFilter, setProofFilter] = useState<ProofFilter>('all');
  const [attentionOnly, setAttentionOnly] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const formatMatchStatus = (status: RefundReconciliationRow['matchStatus']) => {
    switch (status) {
      case 'matched':
        return { label: t('matchStatusLabels.matched'), className: 'bg-emerald-50 text-emerald-700' };
      case 'awaiting_payout':
        return { label: t('matchStatusLabels.awaitingPayout'), className: 'bg-amber-50 text-amber-700' };
      case 'mismatch':
        return { label: t('matchStatusLabels.mismatch'), className: 'bg-red-50 text-red-700' };
      case 'closed':
        return { label: t('matchStatusLabels.closed'), className: 'bg-slate-100 text-slate-700' };
      default:
        return { label: t('matchStatusLabels.pending'), className: 'bg-blue-50 text-blue-700' };
    }
  };

  const filters = useMemo<RefundReconciliationFilters>(
    () => ({
      q: deferredSearch.trim() || undefined,
      status: status !== 'all' ? status : undefined,
      ownerRole: ownerRole !== 'all' ? ownerRole : undefined,
      matchStatus: matchStatus !== 'all' ? matchStatus : undefined,
      hasProof:
        proofFilter === 'with' ? true : proofFilter === 'without' ? false : undefined,
      attentionOnly: attentionOnly ? true : undefined,
      from: fromDate || undefined,
      to: toDate || undefined,
    }),
    [attentionOnly, deferredSearch, fromDate, matchStatus, ownerRole, proofFilter, status, toDate]
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
        const data = await analyticsApi.getRefundReconciliation(page, 20, filters);
        if (active) {
          setReport(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load reconciliation report.');
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

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await analyticsApi.exportRefundReconciliation(filters);
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `refund-reconciliation-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export reconciliation CSV.');
    } finally {
      setExporting(false);
    }
  };

  const summaryCards = [
    { label: t('summary.requestedTotal'), value: formatCurrency(report?.summary.requestedTotal || 0) },
    { label: t('summary.approvedTotal'), value: formatCurrency(report?.summary.approvedTotal || 0) },
    { label: t('summary.settledTotal'), value: formatCurrency(report?.summary.settledTotal || 0) },
    { label: t('summary.outstanding'), value: formatCurrency(report?.summary.outstandingTotal || 0) },
    { label: t('summary.mismatches'), value: String(report?.summary.mismatchedCases || 0) },
    { label: t('summary.awaitingPayout'), value: String(report?.summary.awaitingPayoutCases || 0) },
  ];
  const rows = report?.rows || [];
  const matchStatusCounts = rows.reduce<Record<string, number>>((accumulator, row) => {
    const key = String(row.matchStatus || 'pending');
    accumulator[key] = Number(accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
  const matchStatusChartData: ChartDatum[] = Object.entries(matchStatusCounts).map(
    ([matchKey, count], index) => ({
      label: formatMatchStatus(matchKey as RefundReconciliationRow['matchStatus']).label,
      value: count,
      color: ['#16a34a', '#d97706', '#dc2626', '#2563eb', '#64748b'][index % 5],
      hint: t('proof.currentFilteredPage'),
    }),
  );
  const settlementFlowData: ChartDatum[] = [
    {
      label: t('flow.settled'),
      value: report?.summary.settledTotal || 0,
      color: '#16a34a',
      hint: t('flow.settledHint'),
    },
    {
      label: t('flow.approvedNotSettled'),
      value: report?.summary.outstandingTotal || 0,
      color: '#d97706',
      hint: t('flow.approvedNotSettledHint'),
    },
    {
      label: t('flow.notYetApproved'),
      value: Math.max(
        0,
        Number(report?.summary.requestedTotal || 0) - Number(report?.summary.approvedTotal || 0),
      ),
      color: '#64748b',
      hint: t('flow.notYetApprovedHint'),
    },
  ];
  const proofCoverageData: ChartDatum[] = [
    {
      label: t('proof.withPayoutProof'),
      value: rows.filter((row) => Boolean(row.payoutProofUrl)).length,
      color: '#2563eb',
      hint: t('proof.currentFilteredPage'),
    },
    {
      label: t('proof.missingPayoutProof'),
      value: rows.filter((row) => !row.payoutProofUrl).length,
      color: '#be123c',
      hint: t('proof.currentFilteredPage'),
    },
  ];
  const ownerMixCounts = rows.reduce<Record<string, number>>((accumulator, row) => {
    const key = String(row.currentOwnerRole || 'none');
    accumulator[key] = Number(accumulator[key] || 0) + 1;
    return accumulator;
  }, {});
  const ownerMixData: ChartDatum[] = Object.entries(ownerMixCounts).map(
    ([, count], index) => ({
      label: ['#0f766e', '#d97706', '#2563eb', '#7c3aed', '#64748b'][index % 5],
      value: count,
      color: ['#0f766e', '#d97706', '#2563eb', '#7c3aed', '#64748b'][index % 5],
      hint: t('proof.currentFilteredPage'),
    }),
  );

  const totalPages = report?.pagination.totalPages || 1;

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
              <span className="font-medium text-gray-700">{t('filters.matchStatus')}</span>
              <select
                value={matchStatus}
                onChange={(event) => setMatchStatus(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
              >
                <option value="all">{t('filters.all')}</option>
                <option value="matched">{t('filters.matchOpts.matched')}</option>
                <option value="awaiting_payout">{t('filters.matchOpts.awaitingPayout')}</option>
                <option value="mismatch">{t('filters.matchOpts.mismatch')}</option>
                <option value="pending">{t('filters.matchOpts.pending')}</option>
                <option value="closed">{t('filters.matchOpts.closed')}</option>
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-gray-700">{t('filters.payoutProof')}</span>
              <select
                value={proofFilter}
                onChange={(event) => setProofFilter(event.target.value as ProofFilter)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
              >
                <option value="all">{t('filters.all')}</option>
                <option value="with">{t('filters.hasProof')}</option>
                <option value="without">{t('filters.missingProof')}</option>
              </select>
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
                className="gap-2"
                onClick={() => void handleExport()}
                disabled={exporting}
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {t('filters.exportCsv')}
              </Button>
            </div>

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

            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setStatus('all');
                  setOwnerRole('all');
                  setMatchStatus('all');
                  setProofFilter('all');
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

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
              {summaryCards.map((card) => (
                <Card key={card.label} className="p-5">
                  <div className="text-sm text-gray-500">{card.label}</div>
                  <div className="mt-2 text-xl font-semibold text-gray-900">{card.value}</div>
                </Card>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.2fr_1.2fr_1.5fr]">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('charts.settlementFlow')}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {t('charts.settlementFlowDesc')}
                </p>
                <div className="mt-6">
                  <DonutBreakdown
                    data={settlementFlowData}
                    centerLabel={t('charts.requestedValue')}
                    valueFormatter={formatCurrency}
                    emptyLabel={t('charts.noMoneyFlow')}
                  />
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('charts.matchStatusMix')}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {t('charts.matchStatusMixDesc')}
                </p>
                <div className="mt-6">
                  <DonutBreakdown
                    data={matchStatusChartData}
                    centerLabel={t('charts.matchStatusLabel')}
                    emptyLabel={t('charts.noMatchStatus')}
                  />
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">{t('charts.readinessChecks')}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  {t('charts.readinessChecksDesc')}
                </p>
                <div className="mt-6 space-y-6">
                  <DistributionBars
                    data={proofCoverageData}
                    emptyLabel={t('charts.noPayoutProof')}
                  />
                  <DistributionBars
                    data={ownerMixData}
                    emptyLabel={t('charts.noOwnerDist')}
                  />
                </div>
              </Card>
            </section>

            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{t('table.title')}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {t('table.pageInfo', {
                      page: report?.pagination.page || 1,
                      total: totalPages,
                      count: report?.pagination.total || 0,
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
                      <th className="pb-3 pr-4">{t('table.headers.order')}</th>
                      <th className="pb-3 pr-4">{t('table.headers.refund')}</th>
                      <th className="pb-3 pr-4">{t('table.headers.paid')}</th>
                      <th className="pb-3 pr-4">{t('table.headers.approved')}</th>
                      <th className="pb-3 pr-4">{t('table.headers.settled')}</th>
                      <th className="pb-3 pr-4">{t('table.headers.invoice')}</th>
                      <th className="pb-3 pr-4">{t('table.headers.txRef')}</th>
                      <th className="pb-3 pr-4">{t('table.headers.processed')}</th>
                      <th className="pb-3">{t('table.headers.match')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(report?.rows || []).map((row) => {
                      const matchMeta = formatMatchStatus(row.matchStatus);
                      return (
                        <tr key={row.orderId} className="border-b border-gray-100 align-top text-gray-700">
                          <td className="py-3 pr-4">
                            <div className="font-medium text-gray-900">{row.orderCode}</div>
                            <div className="text-xs text-gray-500">{row.customerName}</div>
                            {row.attentionReason ? (
                              <div className="mt-1 text-xs text-red-600">{row.attentionReason}</div>
                            ) : null}
                          </td>
                          <td className="py-3 pr-4">
                            <div>{row.refundStatus}</div>
                            <div className="text-xs text-gray-500">{row.refundReason || '--'}</div>
                          </td>
                          <td className="py-3 pr-4">{formatCurrency(row.paidAmount)}</td>
                          <td className="py-3 pr-4">{formatCurrency(row.approvedAmount)}</td>
                          <td className="py-3 pr-4">
                            <div>{formatCurrency(row.settledAmount)}</div>
                            {row.discrepancyAmount > 0 ? (
                              <div className="text-xs text-amber-600">
                                {t('table.outstanding', { amount: formatCurrency(row.discrepancyAmount) })}
                              </div>
                            ) : null}
                          </td>
                          <td className="py-3 pr-4">
                            <div>{row.invoiceCode || '--'}</div>
                            <div className="text-xs text-gray-500">
                              {row.invoiceStatus || '--'} / due {formatCurrency(row.invoiceAmountDue)}
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <div>{row.transactionRef || '--'}</div>
                            {row.payoutProofUrl ? (
                              <a
                                href={row.payoutProofUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-600 underline"
                              >
                                {t('proof.proofLink')}
                              </a>
                            ) : null}
                          </td>
                          <td className="py-3 pr-4">{formatDateTime(row.processedAt)}</td>
                          <td className="py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${matchMeta.className}`}
                            >
                              {matchMeta.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  );
}

export default function AdminReconciliationPage() {
  return (
    <SystemScopeBlockedPage
      title="Refund Reconciliation"
      subtitle="Compatibility route kept for legacy admin links"
      message="Refund reconciliation is now owned by manager as part of business finance governance. Admin remains responsible for system configuration, store master data, and access controls."
    />
  );
}
