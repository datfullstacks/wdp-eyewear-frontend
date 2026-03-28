'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { orderApi, type OrderRecord, type RefundBreakdown } from '@/api';
import policyApi, { type PolicyRecord } from '@/api/policies';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Pagination } from '@/components/molecules/Pagination';
import { Header } from '@/components/organisms/Header';
import {
  RefundApproveModal,
  RefundContactModal,
  RefundDetailModal,
  RefundEscalateModal,
  RefundInspectionModal,
  RefundProcessModal,
  RefundRejectModal,
  RefundStatsGrid,
  RefundTable,
} from '@/components/organisms/refund';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  RefundRequest,
  formatCurrency,
  getRefundStats,
  refundMethodFilterOptions,
  operationStatusFilterOptions,
  saleStatusFilterOptions,
  sortRefundsByCreatedAt,
  toRefundRequest,
} from '@/types/refund';
import { useDetailRoute } from '@/hooks/useDetailRoute';

const ITEMS_PER_PAGE = 10;

const SALE_FETCH_STATUSES = [
  'requested',
  'reviewing',
  'waiting_customer_info',
  'escalated_to_manager',
  'approved',
  'return_pending',
  'return_received',
  'processing',
  'completed',
  'rejected',
] as const;

const OPERATION_FETCH_STATUSES = [
  'return_pending',
] as const;

type RefundPageScope = 'sale' | 'manager' | 'operation';
type SaleQueueView = 'needs_action' | 'waiting_customer' | 'tracking';

interface RefundsProps {
  scope?: RefundPageScope;
}

function mergeOrders(orderGroups: OrderRecord[][]) {
  const map = new Map<string, OrderRecord>();

  for (const orders of orderGroups) {
    for (const order of orders) {
      map.set(order.id, order);
    }
  }

  return Array.from(map.values());
}

function toErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response?: unknown }).response === 'object'
  ) {
    const response = (
      error as {
        response?: { data?: { message?: string } };
      }
    ).response;
    const message = response?.data?.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

async function fetchRefunds(scope: RefundPageScope) {
  if (scope === 'manager') {
    const response = await orderApi.getAll({
      page: 1,
      limit: 100,
      refundStatus: 'escalated_to_manager',
    });

    return sortRefundsByCreatedAt(
      response.orders
        .map(toRefundRequest)
        .filter((refund): refund is RefundRequest => Boolean(refund))
    );
  }

  const statuses =
    scope === 'operation' ? OPERATION_FETCH_STATUSES : SALE_FETCH_STATUSES;

  const responses = await Promise.all(
    statuses.map((status) =>
      orderApi.getAll({
        page: 1,
        limit: 100,
        refundStatus: status,
      })
    )
  );

  return sortRefundsByCreatedAt(
    mergeOrders(responses.map((response) => response.orders))
      .map(toRefundRequest)
      .filter((refund): refund is RefundRequest => Boolean(refund))
  );
}

function getApprovalBreakdown(refund: RefundRequest): Partial<RefundBreakdown> {
  const breakdown = refund.approvedBreakdown.total
    ? refund.approvedBreakdown
    : refund.requestedBreakdown;

  if (breakdown.total > 0) {
    return breakdown;
  }

  return {
    itemAmount: refund.amount,
    shippingFeeAmount: 0,
    returnShippingFeeAmount: 0,
  };
}

const Refunds = ({ scope = 'sale' }: RefundsProps) => {
  const { detailId, openDetail, closeDetail } = useDetailRoute();
  const t = useTranslations('manager.refunds');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [saleQueueView, setSaleQueueView] =
    useState<SaleQueueView>('needs_action');
  const [currentPage, setCurrentPage] = useState(1);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [activeRefundPolicy, setActiveRefundPolicy] = useState<PolicyRecord | null>(
    null
  );
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRefundPolicyLoading, setIsRefundPolicyLoading] = useState(
    scope === 'manager'
  );
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [refundPolicyError, setRefundPolicyError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const [isSendBackOpen, setIsSendBackOpen] = useState(false);
  const [isRequestInfoOpen, setIsRequestInfoOpen] = useState(false);
  const [isInspectionOpen, setIsInspectionOpen] = useState(false);
  const [inspectionMode, setInspectionMode] = useState<'pass' | 'fail'>('pass');
  const [isProcessOpen, setIsProcessOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const nextRefunds = await fetchRefunds(scope);
        if (!mounted) return;
        setRefunds(nextRefunds);
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(
          toErrorMessage(error, 'Không thể tải danh sách hoàn tiền lúc này.')
        );
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      mounted = false;
    };
  }, [scope]);

  useEffect(() => {
    if (scope !== 'manager') {
      setActiveRefundPolicy(null);
      setIsRefundPolicyLoading(false);
      setRefundPolicyError('');
      return;
    }

    let mounted = true;

    const loadRefundPolicy = async () => {
      try {
        setIsRefundPolicyLoading(true);
        setRefundPolicyError('');
        const result = await policyApi.getAll({
          page: 1,
          limit: 5,
          category: 'refund',
          status: 'active',
        });
        if (!mounted) return;
        setActiveRefundPolicy(result.policies[0] || null);
      } catch (error) {
        if (!mounted) return;
        setActiveRefundPolicy(null);
        setRefundPolicyError(
          toErrorMessage(error, 'Không thể tải chính sách hoàn tiền.')
        );
      } finally {
        if (mounted) {
          setIsRefundPolicyLoading(false);
        }
      }
    };

    void loadRefundPolicy();

    return () => {
      mounted = false;
    };
  }, [scope]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, methodFilter, saleQueueView]);

  const refreshRefunds = async () => {
    try {
      setIsRefreshing(true);
      setErrorMessage('');
      const nextRefunds = await fetchRefunds(scope);
      setRefunds(nextRefunds);
    } catch (error) {
      setErrorMessage(
        toErrorMessage(error, 'Không thể tải lại danh sách hoàn tiền.')
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredRefunds = useMemo(() => {
    return refunds.filter((refund) => {
      const searchValue = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !searchValue ||
        refund.id.toLowerCase().includes(searchValue) ||
        refund.orderId.toLowerCase().includes(searchValue) ||
        refund.customerName.toLowerCase().includes(searchValue) ||
        refund.customerPhone.includes(searchValue);

      const matchesStatus =
        scope === 'manager'
          ? true
          : statusFilter === 'all' || refund.status === statusFilter;

      const matchesQueue =
        scope !== 'sale'
          ? true
          : saleQueueView === 'needs_action'
            ? refund.status === 'requested' || refund.status === 'reviewing'
            : saleQueueView === 'waiting_customer'
              ? refund.status === 'waiting_customer_info'
              : !['requested', 'reviewing', 'waiting_customer_info'].includes(
                  refund.status
                );

      const matchesMethod =
        methodFilter === 'all' || refund.method === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod && matchesQueue;
    });
  }, [refunds, scope, searchTerm, statusFilter, methodFilter, saleQueueView]);

  const stats = useMemo(() => getRefundStats(refunds), [refunds]);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredRefunds.length / ITEMS_PER_PAGE)
  );
  const paginatedRefunds = useMemo(
    () =>
      filteredRefunds.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [filteredRefunds, currentPage]
  );

  useEffect(() => {
    if (!detailId) {
      setIsDetailOpen(false);
      return;
    }

    const matchedRefund = refunds.find((refund) => refund.id === detailId);
    if (matchedRefund) {
      setSelectedRefund(matchedRefund);
      setIsDetailOpen(true);
      return;
    }

    if (!isLoading) {
      setSelectedRefund(null);
      setIsDetailOpen(false);
    }
  }, [detailId, isLoading, refunds]);

  const resetActionModals = () => {
    setIsApproveOpen(false);
    setIsRejectOpen(false);
    setIsEscalateOpen(false);
    setIsSendBackOpen(false);
    setIsRequestInfoOpen(false);
    setIsInspectionOpen(false);
    setIsProcessOpen(false);
  };

  const openModal = (
    refund: RefundRequest,
    setter: (value: boolean) => void
  ) => {
    setSelectedRefund(refund);
    setSuccessMessage('');
    setter(true);
  };

  const openInspectionModal = (
    refund: RefundRequest,
    mode: 'pass' | 'fail'
  ) => {
    setSelectedRefund(refund);
    setSuccessMessage('');
    setInspectionMode(mode);
    setIsInspectionOpen(true);
  };

  const executeRefundAction = async (
    refund: RefundRequest | null,
    payload: Parameters<typeof orderApi.updateRefund>[1],
    successText: string
  ) => {
    if (!refund) return;

    try {
      setIsSubmittingAction(true);
      setErrorMessage('');
      await orderApi.updateRefund(refund.orderInternalId, payload);
      await refreshRefunds();
      resetActionModals();
      setSelectedRefund(null);
      setSuccessMessage(successText);
    } catch (error) {
      setErrorMessage(
        toErrorMessage(error, 'Không thể cập nhật quy trình hoàn tiền.')
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const executeApproveAction = async (note: string) => {
    if (!selectedRefund) return;

    try {
      setIsSubmittingAction(true);
      setErrorMessage('');
      setSuccessMessage('');

      await orderApi.updateRefund(selectedRefund.orderInternalId, {
        action: scope === 'manager' ? 'manager_approve' : 'approve',
        decisionNote: note,
        responsibility: selectedRefund.responsibility || 'customer',
        requiresReturn: selectedRefund.requiresReturn,
        approvedBreakdown: getApprovalBreakdown(selectedRefund),
      });

      if (selectedRefund.requiresReturn) {
        await orderApi.updateRefund(selectedRefund.orderInternalId, {
          action: 'mark_return_pending',
          note: 'Chuyển sang hàng chờ xác nhận hàng hoàn cho operations.',
        });
      }

      await refreshRefunds();
      resetActionModals();
      setSelectedRefund(null);
      setSuccessMessage(
        selectedRefund.requiresReturn
          ? 'Refund đã được phê duyệt và chuyển sang hàng chờ nhận hàng hoàn.'
          : scope === 'manager'
            ? 'Manager đã phê duyệt refund exception.'
            : 'Refund đã được sale phê duyệt.'
      );
    } catch (error) {
      setErrorMessage(toErrorMessage(error, 'Không thể phê duyệt refund.'));
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const title =
    scope === 'manager'
      ? t('title_manager')
      : scope === 'operation'
        ? t('title_operation')
        : t('title_sale');
  const subtitle =
    scope === 'manager'
      ? t('subtitle_manager')
      : scope === 'operation'
        ? t('subtitle_operation')
        : t('subtitle_sale');
  const afterSalesHref =
    scope === 'manager'
      ? '/manager/cases/support'
      : scope === 'operation'
        ? '/operation/cases/warranties'
        : '/sale/cases/returns';
  const afterSalesLabel =
    scope === 'operation' ? t('warrantyLabel') : t('afterSalesLabel');
  const statusFilterOptions =
    scope === 'operation'
      ? operationStatusFilterOptions
      : saleStatusFilterOptions;
  const pageTitle =
    scope === 'operation' ? t('title_operation') : title;
  const pageSubtitle =
    scope === 'operation'
      ? t('subtitle_operation')
      : subtitle;

  return (
    <>
      <Header title={pageTitle} subtitle={pageSubtitle} />

      <div className="space-y-6 p-6">
        {scope === 'manager' && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-amber-900">
                  Chính sách hoàn tiền cho manager
                </div>
                {isRefundPolicyLoading ? (
                  <p className="text-sm text-amber-800">
                    Đang tải chính sách hoàn tiền đang áp dụng...
                  </p>
                ) : activeRefundPolicy ? (
                  <>
                    <p className="text-sm font-medium text-amber-900">
                      {activeRefundPolicy.title} • Version{' '}
                      {activeRefundPolicy.version}
                    </p>
                    <p className="text-sm text-amber-800">
                      {activeRefundPolicy.summary}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-amber-800">
                    Chưa có policy hoàn tiền active. Manager nên ban hành policy
                    để làm chuẩn cho các case refund bị đẩy lên phê duyệt.
                  </p>
                )}
                {refundPolicyError && (
                  <p className="text-sm text-red-700">{refundPolicyError}</p>
                )}
              </div>

              <Link
                href={
                  activeRefundPolicy
                    ? `/manager/policies/${activeRefundPolicy.id}`
                    : '/manager/policies/create'
                }
                className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 transition-colors hover:border-amber-400 hover:bg-amber-100"
              >
                {activeRefundPolicy
                  ? 'Mở policy hoàn tiền'
                  : 'Tạo policy hoàn tiền'}
              </Link>
            </div>
          </div>
        )}

        <RefundStatsGrid stats={stats} scope={scope} />

        {successMessage && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
          <div className="w-full sm:max-w-[280px]">
            <SearchBar
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={afterSalesHref}
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              {afterSalesLabel}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={t('filterStatus')}
                  className="text-foreground/80 hover:text-foreground"
                >
                  <Filter />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {scope !== 'manager' && (
                  <>
                    <DropdownMenuLabel>{t('filterStatus')}</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      {statusFilterOptions.map((option) => (
                        <DropdownMenuRadioItem
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuLabel>{t('filterMethod')}</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={methodFilter}
                  onValueChange={setMethodFilter}
                >
                  {refundMethodFilterOptions.map((option) => (
                    <DropdownMenuRadioItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {scope === 'manager' && (
              <Button
                variant="outline"
                onClick={() => void refreshRefunds()}
                disabled={isLoading || isRefreshing || isSubmittingAction}
              >
                {isRefreshing ? t('refreshing') : t('refresh')}
              </Button>
            )}
          </div>
        </div>

        {scope === 'sale' && (
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'needs_action', label: 'Cần xử lý' },
              { value: 'waiting_customer', label: 'Chờ khách bổ sung' },
              { value: 'tracking', label: 'Đang theo dõi' },
            ].map((option) => {
              const active = saleQueueView === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setSaleQueueView(option.value as SaleQueueView)
                  }
                  className={
                    active
                      ? 'rounded-full bg-red-600 px-4 py-2 text-sm font-medium text-white'
                      : 'rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 hover:border-slate-300'
                  }
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}

        {!isLoading && filteredRefunds.length > 0 && (
          <div className="text-muted-foreground text-sm">
            Đang hiển thị {filteredRefunds.length} refund, tổng cần xử lý{' '}
            <span className="text-foreground font-medium">
              {formatCurrency(stats.totalAmount)}
            </span>
            .
          </div>
        )}

        {isLoading ? (
          <div className="text-muted-foreground rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm">
            {t('loading')}
          </div>
        ) : (
          <RefundTable
            refunds={paginatedRefunds}
            scope={scope}
            onDetail={(refund) => openDetail(refund.id)}
            onApprove={(refund) => openModal(refund, setIsApproveOpen)}
            onReject={(refund) => openModal(refund, setIsRejectOpen)}
            onEscalate={(refund) => openModal(refund, setIsEscalateOpen)}
            onRequestInfo={(refund) => openModal(refund, setIsRequestInfoOpen)}
            onResumeReview={(refund) =>
              void executeRefundAction(
                refund,
                { action: 'start_review', note: 'Staff tiếp tục xử lý' },
                'Refund đã được đưa lại về trạng thái đang xem xét.'
              )
            }
            onSendBack={(refund) => openModal(refund, setIsSendBackOpen)}
            onConfirmReturnReceived={(refund) =>
              openInspectionModal(refund, 'pass')
            }
            onInspectionFailed={(refund) => openInspectionModal(refund, 'fail')}
            onStartProcessing={(refund) =>
              void executeRefundAction(
                refund,
                {
                  action: 'start_processing',
                  note: 'Operations bắt đầu xử lý payout.',
                },
                'Refund đã chuyển sang trạng thái đang hoàn tiền.'
              )
            }
            onComplete={(refund) => openModal(refund, setIsProcessOpen)}
            actionsDisabled={isSubmittingAction}
          />
        )}

        {!isLoading && filteredRefunds.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredRefunds.length}
            />
          </div>
        )}
      </div>

      <RefundDetailModal
        refund={selectedRefund}
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (open) return;
          if (detailId) {
            closeDetail();
            return;
          }
          setSelectedRefund(null);
        }}
      />

      <RefundApproveModal
        refund={selectedRefund}
        open={isApproveOpen}
        onOpenChange={setIsApproveOpen}
        isSubmitting={isSubmittingAction}
        scope={scope === 'manager' ? 'manager' : 'sale'}
        onSubmit={({ note }) => executeApproveAction(note)}
      />

      <RefundRejectModal
        refund={selectedRefund}
        open={isRejectOpen}
        onOpenChange={setIsRejectOpen}
        isSubmitting={isSubmittingAction}
        scope={scope === 'manager' ? 'manager' : 'sale'}
        onSubmit={({ rejectReason, note }) =>
          executeRefundAction(
            selectedRefund,
            {
              action: scope === 'manager' ? 'manager_reject' : 'reject',
              rejectReason,
              decisionNote: note,
            },
            scope === 'manager'
              ? 'Manager đã từ chối refund exception.'
              : 'Refund đã bị từ chối.'
          )
        }
      />

      <RefundEscalateModal
        refund={selectedRefund}
        open={isEscalateOpen}
        onOpenChange={setIsEscalateOpen}
        isSubmitting={isSubmittingAction}
        onSubmit={({ note }) =>
          executeRefundAction(
            selectedRefund,
            {
              action: 'escalate',
              escalateReason: note,
              decisionNote: note,
            },
            'Refund đã được chuyển lên manager.'
          )
        }
      />

      <RefundEscalateModal
        refund={selectedRefund}
        open={isSendBackOpen}
        onOpenChange={setIsSendBackOpen}
        isSubmitting={isSubmittingAction}
        mode="send_back"
        onSubmit={({ note }) =>
          executeRefundAction(
            selectedRefund,
            {
              action: 'send_back_to_staff',
              decisionNote: note,
            },
            'Case đã được trả lại sale để xác minh thêm.'
          )
        }
      />

      <RefundContactModal
        refund={selectedRefund}
        open={isRequestInfoOpen}
        onOpenChange={setIsRequestInfoOpen}
        isSubmitting={isSubmittingAction}
        onSubmit={({ note }) =>
          executeRefundAction(
            selectedRefund,
            {
              action: 'request_customer_info',
              decisionNote: note,
              contactChannels: ['phone'],
              contactNote: note,
            },
            'Refund đã chuyển sang chờ khách bổ sung thông tin.'
          )
        }
      />

      <RefundProcessModal
        refund={selectedRefund}
        open={isProcessOpen}
        onOpenChange={setIsProcessOpen}
        isSubmitting={isSubmittingAction}
        onSubmit={({ transactionRef, payoutProofUrl, note }) =>
          executeRefundAction(
            selectedRefund,
            {
              action: 'complete',
              transactionRef,
              payoutProofUrl,
              note,
            },
            'Refund đã được đánh dấu hoàn tất payout.'
          )
        }
      />

      <RefundInspectionModal
        refund={selectedRefund}
        open={isInspectionOpen}
        onOpenChange={setIsInspectionOpen}
        isSubmitting={isSubmittingAction}
        mode={inspectionMode}
        onSubmit={({ note, returnCarrier, returnShipmentCode }) =>
          executeRefundAction(
            selectedRefund,
            {
              action:
                inspectionMode === 'pass'
                  ? 'confirm_return_received'
                  : 'inspection_failed',
              inspectionNote: note,
              returnCarrier,
              returnShipmentCode,
              note,
            },
            inspectionMode === 'pass'
              ? 'Đã xác nhận nhận hàng hoàn và QC pass.'
              : 'Case đã được trả lại reviewing do QC fail.'
          )
        }
      />
    </>
  );
};

export default Refunds;
