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

import analyticsApi, {
  type RefundReconciliation,
  type RefundReconciliationFilters,
  type RefundReconciliationRow,
} from '@/api/analytics';
import { Button } from '@/components/atoms';
import { Header } from '@/components/organisms/Header';
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

function formatMatchStatus(status: RefundReconciliationRow['matchStatus']) {
  switch (status) {
    case 'matched':
      return { label: 'Matched', className: 'bg-emerald-50 text-emerald-700' };
    case 'awaiting_payout':
      return { label: 'Awaiting payout', className: 'bg-amber-50 text-amber-700' };
    case 'mismatch':
      return { label: 'Mismatch', className: 'bg-red-50 text-red-700' };
    case 'closed':
      return { label: 'Closed', className: 'bg-slate-100 text-slate-700' };
    default:
      return { label: 'Pending', className: 'bg-blue-50 text-blue-700' };
  }
}

type ProofFilter = 'all' | 'with' | 'without';

export default function AdminReconciliationPage() {
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
    { label: 'Requested total', value: formatCurrency(report?.summary.requestedTotal || 0) },
    { label: 'Approved total', value: formatCurrency(report?.summary.approvedTotal || 0) },
    { label: 'Settled total', value: formatCurrency(report?.summary.settledTotal || 0) },
    { label: 'Outstanding', value: formatCurrency(report?.summary.outstandingTotal || 0) },
    { label: 'Mismatches', value: String(report?.summary.mismatchedCases || 0) },
    { label: 'Awaiting payout', value: String(report?.summary.awaitingPayoutCases || 0) },
  ];

  const totalPages = report?.pagination.totalPages || 1;

  return (
    <>
      <Header
        title="Finance Reconciliation"
        subtitle="Verify paid amounts, approved refunds, payout refs, and invoice state"
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
              <span className="font-medium text-gray-700">Search</span>
              <div className="flex items-center rounded-md border border-gray-300 px-3">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Order / customer / tx ref"
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
              <span className="font-medium text-gray-700">Match status</span>
              <select
                value={matchStatus}
                onChange={(event) => setMatchStatus(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
              >
                <option value="all">All</option>
                <option value="matched">Matched</option>
                <option value="awaiting_payout">Awaiting payout</option>
                <option value="mismatch">Mismatch</option>
                <option value="pending">Pending</option>
                <option value="closed">Closed</option>
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="font-medium text-gray-700">Payout proof</span>
              <select
                value={proofFilter}
                onChange={(event) => setProofFilter(event.target.value as ProofFilter)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
              >
                <option value="all">All</option>
                <option value="with">Has proof</option>
                <option value="without">Missing proof</option>
              </select>
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
                className="gap-2"
                onClick={() => void handleExport()}
                disabled={exporting}
              >
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Export CSV
              </Button>
            </div>

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
                Reset filters
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

            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Refund rows</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Page {report?.pagination.page || 1} / {totalPages}, total{' '}
                    {report?.pagination.total || 0} filtered cases
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
                    Prev
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    disabled={page >= totalPages}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="pb-3 pr-4">Order</th>
                      <th className="pb-3 pr-4">Refund</th>
                      <th className="pb-3 pr-4">Paid</th>
                      <th className="pb-3 pr-4">Approved</th>
                      <th className="pb-3 pr-4">Settled</th>
                      <th className="pb-3 pr-4">Invoice</th>
                      <th className="pb-3 pr-4">Tx ref</th>
                      <th className="pb-3 pr-4">Processed</th>
                      <th className="pb-3">Match</th>
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
                                Outstanding {formatCurrency(row.discrepancyAmount)}
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
                                Proof
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
