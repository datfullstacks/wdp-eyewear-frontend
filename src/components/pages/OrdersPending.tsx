'use client';

import { usePathname } from 'next/navigation';
import { CheckCircle, Filter } from 'lucide-react';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Header } from '@/components/organisms/Header';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Pagination } from '@/components/molecules/Pagination';
import {
  PendingStatsGrid,
  PendingOrderTable,
  PendingDetailModal,
  ProcessModal,
  RejectModal,
  SendBackModal,
} from '@/components/organisms/pending';
import { Button } from '@/components/atoms';
import { orderApi } from '@/api';
import { PendingOrder } from '@/types/pending';
import { toPendingOrder } from '@/lib/orderAdapters';
import { useStatusRealtimeReload } from '@/hooks/useStatusRealtime';
import { needsActionOrder } from '@/lib/orderWorkflow';
import {
  canManagerApprovePendingOrder,
  canManagerHandlePendingOrder,
  canSaleHandlePendingOrder,
  needsManagerReview,
  PENDING_ORDER_APPROVAL_MESSAGE,
  PENDING_ORDER_MANAGER_APPROVAL_MESSAGE,
} from '@/lib/pendingOrders';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ITEMS_PER_PAGE = 10;

function toLocalIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toIsoDateFromPendingCreatedAt(createdAt: string) {
  const match = /^(\d{2})-(\d{2})-(\d{4})/.exec(String(createdAt || '').trim());
  if (!match) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function extractApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
}

export default function OrdersPending() {
  const pathname = usePathname();
  const scope: 'sale' | 'manager' = pathname?.includes('/manager/')
    ? 'manager'
    : 'sale';

  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createdDateFilter, setCreatedDateFilter] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailModal, setDetailModal] = useState<PendingOrder | null>(null);
  const [processModal, setProcessModal] = useState<PendingOrder | null>(null);
  const [rejectModal, setRejectModal] = useState<PendingOrder | null>(null);
  const [sendBackModal, setSendBackModal] = useState<PendingOrder | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const loadPendingOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await orderApi.getAll({
        page: 1,
        limit: 200,
      });

      const mapped = result.orders.filter(needsActionOrder).map(toPendingOrder);
      const scoped =
        scope === 'manager'
          ? mapped.filter((order) => canManagerHandlePendingOrder(order))
          : mapped.filter((order) => !needsManagerReview(order));

      setOrders(scoped);
      setSelectedOrders((prev) =>
        prev.filter((id) => scoped.some((order) => order.id === id))
      );
    } catch {
      setErrorMessage('Khong tai duoc danh sach don can xu ly.');
    } finally {
      setIsLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    void loadPendingOrders();
  }, [loadPendingOrders]);

  useStatusRealtimeReload({
    domains: ['order'],
    reload: loadPendingOrders,
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);
    const matchesDate = createdDateFilter
      ? toIsoDateFromPendingCreatedAt(order.createdAt) === createdDateFilter
      : true;

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, createdDateFilter]);

  const visibleSelectedCount = selectedOrders.filter((id) =>
    paginatedOrders.some((order) => order.id === id)
  ).length;
  const selectedBlockedCount = filteredOrders.filter(
    (order) =>
      selectedOrders.includes(order.id) &&
      (scope === 'manager'
        ? !canManagerApprovePendingOrder(order)
        : !canSaleHandlePendingOrder(order))
  ).length;

  const handleSelectAll = (checked: boolean) => {
    setSelectedOrders(checked ? paginatedOrders.map((order) => order.id) : []);
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    setSelectedOrders((prev) =>
      checked ? [...prev, orderId] : prev.filter((id) => id !== orderId)
    );
  };

  const handleProcessOrder = async () => {
    if (!processModal?.orderDbId) {
      setProcessModal(null);
      return;
    }

    if (
      (scope === 'manager' && !canManagerApprovePendingOrder(processModal)) ||
      (scope !== 'manager' && !canSaleHandlePendingOrder(processModal))
    ) {
      setErrorMessage(
        scope === 'manager'
          ? PENDING_ORDER_MANAGER_APPROVAL_MESSAGE
          : PENDING_ORDER_APPROVAL_MESSAGE
      );
      setProcessModal(null);
      return;
    }

    try {
      setIsSubmittingAction(true);
      setErrorMessage(null);
      await orderApi.updateStatus(processModal.orderDbId, 'confirmed');
      await loadPendingOrders();
      setProcessModal(null);
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(error, 'Khong the duyet don hang nay.')
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleEscalateOrder = async (order: PendingOrder) => {
    if (!order?.orderDbId) return;

    try {
      setIsSubmittingAction(true);
      setErrorMessage(null);
      await orderApi.updateOpsExecution(order.orderDbId, {
        approvalState: 'manager_review_requested',
        managerReviewRequestedAt: new Date().toISOString(),
        managerReviewRequestedBy: 'Sales/Support',
        managerReviewReason:
          order.paymentStatus === 'cod'
            ? 'Don COD can manager xac nhan truoc khi handoff.'
            : order.paymentStatus === 'partial'
              ? 'Don thanh toan mot phan can manager xac nhan.'
              : 'Case pending can manager review.',
      });
      await loadPendingOrders();
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(error, 'Khong the chuyen don hang len manager.')
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleRejectOrder = async (reason: string) => {
    if (!rejectModal?.orderDbId) {
      setRejectModal(null);
      return;
    }

    try {
      setIsSubmittingAction(true);
      setErrorMessage(null);
      await orderApi.cancel(rejectModal.orderDbId, {
        reason: reason || 'Don bi tu choi boi nhan vien',
      });
      await loadPendingOrders();
      setRejectModal(null);
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(error, 'Khong the tu choi don hang nay.')
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleSendBackToSale = async (reason: string) => {
    if (!sendBackModal?.orderDbId) {
      setSendBackModal(null);
      return;
    }

    try {
      setIsSubmittingAction(true);
      setErrorMessage(null);
      await orderApi.updateOpsExecution(sendBackModal.orderDbId, {
        approvalState: 'sent_back_to_sale',
        managerReviewRequestedBy: 'Manager',
        managerReviewReason: reason || 'Manager yeu cau sale xu ly lai.',
      });
      await loadPendingOrders();
      setSendBackModal(null);
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(error, 'Khong the tra lai don hang cho sale.')
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleBulkProcess = async () => {
    const selected = filteredOrders.filter((order) =>
      selectedOrders.includes(order.id)
    );
    const targetIds = selected
      .map((order) => order.orderDbId)
      .filter((value): value is string => Boolean(value));

    if (targetIds.length === 0) {
      setSelectedOrders([]);
      return;
    }

    if (
      selected.some((order) =>
        scope === 'manager'
          ? !canManagerApprovePendingOrder(order)
          : !canSaleHandlePendingOrder(order)
      )
    ) {
      setErrorMessage(
        scope === 'manager'
          ? PENDING_ORDER_MANAGER_APPROVAL_MESSAGE
          : PENDING_ORDER_APPROVAL_MESSAGE
      );
      return;
    }

    try {
      setIsSubmittingAction(true);
      setErrorMessage(null);
      await Promise.all(targetIds.map((id) => orderApi.updateStatus(id, 'confirmed')));
      await loadPendingOrders();
      setSelectedOrders([]);
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(error, 'Khong the duyet mot hoac nhieu don hang.')
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <>
      <Header
        title={scope === 'manager' ? 'Don can manager duyet' : 'Don can xu ly'}
        subtitle={
          scope === 'manager'
            ? 'Xu ly cac case duoc staff chuyen len manager'
            : 'Xac nhan va xu ly don hang moi'
        }
      />

      <div className="space-y-6 p-6">
        <PendingStatsGrid
          totalCount={filteredOrders.length}
          selectedCount={visibleSelectedCount}
        />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
            <div className="flex w-full items-center gap-2 sm:max-w-[360px]">
              <div className="w-full">
                <SearchBar
                  placeholder="Tim ma don, ten KH, SDT..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-9 px-0 ${
                      createdDateFilter
                        ? 'border-yellow-400 text-yellow-700 hover:border-yellow-500'
                        : ''
                    }`}
                    aria-label="Loc theo ngay"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Loc theo ngay tao</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCreatedDateFilter('')}>
                    Tat ca
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setCreatedDateFilter(toLocalIsoDate(new Date()))}
                  >
                    Hom nay
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="space-y-2 px-2 py-2">
                    <p className="text-foreground/70 text-xs font-medium">
                      Chon ngay
                    </p>
                    <input
                      type="date"
                      value={createdDateFilter}
                      onChange={(event) => setCreatedDateFilter(event.target.value)}
                      className="border-input bg-background text-foreground h-9 w-full rounded-md border px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-200 focus-visible:ring-offset-2"
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedOrders.length > 0 && (
              <>
                {selectedBlockedCount > 0 && (
                  <p className="text-sm font-medium text-amber-700">
                    {selectedBlockedCount} don chua du dieu kien duyet
                  </p>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrders([])}
                  disabled={isSubmittingAction}
                >
                  Bo chon ({selectedOrders.length})
                </Button>

                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    void handleBulkProcess();
                  }}
                  disabled={isSubmittingAction || selectedBlockedCount > 0}
                >
                  <CheckCircle className="h-4 w-4" />
                  {scope === 'manager' ? 'Manager duyet loat' : 'Xac nhan hang loat'}
                </Button>
              </>
            )}
          </div>
        </div>

        {isLoading && (
          <p className="text-foreground/70 text-sm">Dang tai du lieu don hang...</p>
        )}
        {!isLoading && errorMessage && (
          <p className="text-destructive text-sm">{errorMessage}</p>
        )}

        <PendingOrderTable
          orders={paginatedOrders}
          scope={scope}
          selectedOrders={selectedOrders}
          showEmptyState={!isLoading && !errorMessage}
          onSelectAll={handleSelectAll}
          onSelectOrder={handleSelectOrder}
          onViewDetail={setDetailModal}
          onProcess={setProcessModal}
          onReject={setRejectModal}
          onEscalate={(order) => {
            void handleEscalateOrder(order);
          }}
          onSendBack={setSendBackModal}
        />

        {!isLoading && !errorMessage && filteredOrders.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredOrders.length}
            />
          </div>
        )}
      </div>

      <PendingDetailModal
        scope={scope}
        order={detailModal}
        onClose={() => setDetailModal(null)}
        onProcess={setProcessModal}
        onReject={setRejectModal}
        onEscalate={(order) => {
          void handleEscalateOrder(order);
        }}
        onSendBack={setSendBackModal}
      />

      <ProcessModal
        scope={scope}
        order={processModal}
        onClose={() => setProcessModal(null)}
        onConfirm={() => {
          void handleProcessOrder();
        }}
      />

      <RejectModal
        order={rejectModal}
        onClose={() => setRejectModal(null)}
        onConfirm={(reason) => {
          void handleRejectOrder(reason);
        }}
      />

      <SendBackModal
        order={sendBackModal}
        onClose={() => setSendBackModal(null)}
        onConfirm={(reason) => {
          void handleSendBackToSale(reason);
        }}
      />
    </>
  );
}
