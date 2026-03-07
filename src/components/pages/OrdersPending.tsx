'use client';
import { Header } from '@/components/organisms/Header';

import { SearchBar } from '@/components/molecules/SearchBar';
import { Pagination } from '@/components/molecules/Pagination';
import { CheckCircle, Filter } from 'lucide-react';
import { useCallback, useEffect, useState, useMemo } from 'react';

import { PendingOrder } from '@/types/pending';
import {
  PendingStatsGrid,
  PendingOrderTable,
  PendingDetailModal,
  ProcessModal,
  RejectModal,
} from '@/components/organisms/pending';
import { Button } from '@/components/atoms';
import { orderApi } from '@/api';
import { toPendingOrder } from '@/lib/orderAdapters';
import { needsActionOrder } from '@/lib/orderWorkflow';
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

const OrdersPending = () => {
  const [orders, setOrders] = useState<PendingOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createdDateFilter, setCreatedDateFilter] = useState<string>('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [detailModal, setDetailModal] = useState<PendingOrder | null>(null);
  const [processModal, setProcessModal] = useState<PendingOrder | null>(null);
  const [rejectModal, setRejectModal] = useState<PendingOrder | null>(null);
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
      setOrders(mapped);
      setSelectedOrders((prev) =>
        prev.filter((id) => mapped.some((order) => order.id === id))
      );
    } catch {
      setErrorMessage('Không tải được danh sách đơn cần xử lý.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPendingOrders();
  }, [loadPendingOrders]);

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

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage]);

  // Reset to page 1 when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, createdDateFilter]);

  const visibleSelectedCount = selectedOrders.filter((id) =>
    paginatedOrders.some((order) => order.id === id)
  ).length;

  const handleSelectAll = (checked: boolean) => {
    setSelectedOrders(checked ? paginatedOrders.map((o) => o.id) : []);
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    setSelectedOrders(
      checked
        ? [...selectedOrders, orderId]
        : selectedOrders.filter((id) => id !== orderId)
    );
  };

  const handleProcessOrder = async () => {
    if (!processModal?.orderDbId) {
      setProcessModal(null);
      return;
    }

    try {
      setIsSubmittingAction(true);
      await orderApi.updateStatus(processModal.orderDbId, 'confirmed');
      await loadPendingOrders();
      setProcessModal(null);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleRejectOrder = async (reason: string) => {
    if (!rejectModal?.orderDbId) {
      setRejectModal(null);
      return;
    }

    try {paginat
      setIsSubmittingAction(true);
      await orderApi.cancel(rejectModal.orderDbId, {
        reason: reason || 'Đơn bị từ chối bởi nhân viên',
      });
      await loadPendingOrders();
      setRejectModal(null);
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

    try {
      setIsSubmittingAction(true);
      await Promise.all(
        targetIds.map((id) => orderApi.updateStatus(id, 'confirmed'))
      );
      await loadPendingOrders();
      setSelectedOrders([]);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <>
      <Header title="Đơn cần xử lý" subtitle="Xác nhận và xử lý đơn hàng mới" />

      <div className="space-y-6 p-6">
        <PendingStatsGrid
          totalCount={filteredOrders.length}
          selectedCount={visibleSelectedCount}
        />

        {/* Filters & Actions */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
            <div className="flex w-full items-center gap-2 sm:max-w-[360px]">
              <div className="w-full">
                <SearchBar
                  placeholder="Tìm mã đơn, tên KH, SĐT..."
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
                    aria-label="Lọc theo ngày"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuLabel>Lọc theo ngày tạo</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setCreatedDateFilter('')}>
                    Tất cả
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setCreatedDateFilter(toLocalIsoDate(new Date()))}
                  >
                    Hôm nay
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="space-y-2 px-2 py-2">
                    <p className="text-foreground/70 text-xs font-medium">Chọn ngày</p>
                    <input
                      type="date"
                      value={createdDateFilter}
                      onChange={(e) => setCreatedDateFilter(e.target.value)}
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedOrders([])}
                  disabled={isSubmittingAction}
                >
                  Bỏ chọn ({selectedOrders.length})
                </Button>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => {
                    void handleBulkProcess();
                  }}
                  disabled={isSubmittingAction}
                >
                  <CheckCircle className="h-4 w-4" />
                  Xác nhận hàng loạt
                </Button>
              </>
            )}
          </div>
        </div>

        {isLoading && (
          <p className="text-foreground/70 text-sm">Đang tải dữ liệu đơn hàng...</p>
        )}
        {!isLoading && errorMessage && (
          <p className="text-destructive text-sm">{errorMessage}</p>
        )}

        <PendingOrderTable
          orders={paginatedOrders}
          selectedOrders={selectedOrders}
          showEmptyState={!isLoading && !errorMessage}
          onSelectAll={handleSelectAll}
          onSelectOrder={handleSelectOrder}
          onViewDetail={setDetailModal}
          onProcess={setProcessModal}
          onReject={setRejectModal}
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
        order={detailModal}
        onClose={() => setDetailModal(null)}
        onProcess={setProcessModal}
        onReject={setRejectModal}
      />
      <ProcessModal
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
    </>
  );
};

export default OrdersPending;
