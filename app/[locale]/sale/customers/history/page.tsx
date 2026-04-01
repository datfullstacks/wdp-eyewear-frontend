'use client';

import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
} from 'lucide-react';

import { Button } from '@/components/atoms';
import { Header } from '@/components/organisms/Header';
import { RefundDetailModal } from '@/components/organisms/refund';
import { Card } from '@/components/ui/card';
import {
  formatCurrency,
  statusConfig,
  type RefundRequest,
} from '@/types/refund';
import supportApi from '@/api/support';
import { useDetailRoute } from '@/hooks/useDetailRoute';

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

function formatNextAction(code: string) {
  switch (code) {
    case 'customer_submit_info':
      return 'Chờ khách bổ sung';
    case 'manager_approve':
      return 'Chờ manager';
    case 'confirm_return_received':
      return 'Chờ nhận/QC hàng';
    case 'start_processing':
      return 'Chờ bắt đầu payout';
    case 'complete':
      return 'Chờ xác nhận payout';
    case 'start_review':
      return 'Cho staff review';
    default:
      return '--';
  }
}

export default function CustomerHistoryPage() {
  const { detailId, openDetail, closeDetail } = useDetailRoute();
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(
    null
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await supportApi.getRefundCases({
          page,
          limit: 20,
          q: search.trim() || undefined,
        });

        if (active) {
          setRefunds(response.items);
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.total);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load refund support workspace.'
          );
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
  }, [page, search]);

  useEffect(() => {
    if (!detailId) {
      setSelectedRefund(null);
      return;
    }

    const matchedRefund = refunds.find((refund) => refund.id === detailId);
    if (matchedRefund) {
      setSelectedRefund(matchedRefund);
      return;
    }

    let active = true;

    void supportApi
      .getRefundCases({ page: 1, limit: 100, q: detailId })
      .then((response) => {
        if (!active) return;
        setSelectedRefund(
          response.items.find((refund) => refund.id === detailId) || null
        );
      })
      .catch((err) => {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : 'Failed to load refund detail.'
        );
        setSelectedRefund(null);
      });

    return () => {
      active = false;
    };
  }, [detailId, refunds]);

  return (
    <>
      <Header
        title="Customer History & Notes"
        subtitle="Support-facing refund timeline, current owner, and next action lookup"
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
            <Card className="p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Refund support workspace
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Page {page} / {totalPages}, total {totalItems} refund cases
                  </p>
                </div>

                <label className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 lg:max-w-sm">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Tìm theo order, khách hàng, số điện thoại, trạng thái"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </label>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center justify-end gap-2">
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
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                  disabled={page >= totalPages}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="pr-4 pb-3">Order</th>
                      <th className="pr-4 pb-3">Customer</th>
                      <th className="pr-4 pb-3">Refund</th>
                      <th className="pr-4 pb-3">Owner</th>
                      <th className="pr-4 pb-3">Next step</th>
                      <th className="pr-4 pb-3">Amount</th>
                      <th className="pr-4 pb-3">Updated</th>
                      <th className="pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refunds.map((refund) => (
                      <tr
                        key={refund.id}
                        className="border-b border-gray-100 text-gray-700"
                      >
                        <td className="py-3 pr-4">
                          <div className="font-medium text-gray-900">
                            {refund.orderId}
                          </div>
                          <div className="text-xs text-gray-500">
                            {refund.id}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <div>{refund.customerName}</div>
                          <div className="text-xs text-gray-500">
                            {refund.customerPhone}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="font-medium text-gray-900">
                            {statusConfig[refund.status].label}
                          </span>
                          <div className="text-xs text-gray-500">
                            {refund.reason}
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          {formatOwner(refund.currentOwnerRole)}
                        </td>
                        <td className="py-3 pr-4">
                          {formatNextAction(refund.nextActionCode)}
                        </td>
                        <td className="py-3 pr-4">
                          {formatCurrency(refund.amount)}
                        </td>
                        <td className="py-3 pr-4">
                          {refund.processedAt || refund.createdAt}
                        </td>
                        <td className="py-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => openDetail(refund.id)}
                          >
                            Chi tiet
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {refunds.length === 0 ? (
                <p className="mt-4 text-sm text-gray-500">
                  No refund case matches the current search.
                </p>
              ) : null}
            </Card>
          </>
        )}

        <RefundDetailModal
          refund={selectedRefund}
          open={Boolean(selectedRefund)}
          onOpenChange={(open) => {
            if (!open) {
              if (detailId) {
                closeDetail();
                return;
              }
              setSelectedRefund(null);
            }
          }}
        />
      </div>
    </>
  );
}
