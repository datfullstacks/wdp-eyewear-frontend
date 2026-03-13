'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';

import { orderApi } from '@/api';
import type { OrderRecord } from '@/api/orders';
import { Header } from '@/components/organisms/Header';
import { SearchBar } from '@/components/molecules/SearchBar';
import {
  ReadyStockFilterSheet,
  ReadyStockHoldModal,
  ReadyStockOrderDetailModal,
  ReadyStockOrdersTable,
  ReadyStockShipmentModal,
  ReadyStockStatsGrid,
  type ReadyStockFilters,
} from '@/components/organisms/ready-stock';
import { Button } from '@/components/ui/button';
import { mockReadyStockOrders } from '@/data/readyStockMock';
import { isReadyStockOrder } from '@/lib/orderWorkflow';
import {
  createDefaultReadyStockOpsState,
  getReadyStockWarnings,
  inferSalesApprovedAt,
  toInvoiceCode,
  toPaymentCode,
} from '@/lib/readyStockOps';
import { useAuthStore } from '@/stores/authStore';
import { useReadyStockOpsStore } from '@/stores/readyStockOpsStore';

function dateOnly(value: string): string {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString().slice(0, 10);
}

const DEFAULT_FILTERS: ReadyStockFilters = {
  salesApprovedFrom: '',
  salesApprovedTo: '',
  payment: 'all',
  opsStatus: 'all',
  assignee: 'all',
  hasNoteOnly: false,
  hasWarningOnly: false,
};

export default function OrdersReadyStock() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<ReadyStockFilters>(DEFAULT_FILTERS);

  const meName = useAuthStore((s) => s.user?.name) || 'Operations';

  const opsByOrderId = useReadyStockOpsStore((s) => s.byOrderId);
  const upsertOps = useReadyStockOpsStore((s) => s.upsert);
  const setAssignee = useReadyStockOpsStore((s) => s.setAssignee);
  const setHold = useReadyStockOpsStore((s) => s.setHold);
  const clearHold = useReadyStockOpsStore((s) => s.clearHold);
  const setStatus = useReadyStockOpsStore((s) => s.setStatus);
  const setTracking = useReadyStockOpsStore((s) => s.setTracking);

  const [detailOrder, setDetailOrder] = useState<OrderRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [holdOrder, setHoldOrder] = useState<OrderRecord | null>(null);
  const [holdOpen, setHoldOpen] = useState(false);
  const [shipmentOrder, setShipmentOrder] = useState<OrderRecord | null>(null);
  const [shipmentOpen, setShipmentOpen] = useState(false);
  const [shipmentMode, setShipmentMode] = useState<'create' | 'update'>(
    'create'
  );

  const resolveOps = useCallback(
    (order: OrderRecord) =>
      opsByOrderId[order.id] ?? createDefaultReadyStockOpsState(order),
    [opsByOrderId]
  );

  const ensureOps = useCallback(
    (order: OrderRecord) => {
      const current =
        opsByOrderId[order.id] ?? createDefaultReadyStockOpsState(order);
      if (!opsByOrderId[order.id]) upsertOps(order.id, current);
      return current;
    },
    [opsByOrderId, upsertOps]
  );

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await orderApi.getAll({ page: 1, limit: 200 });
      const ready = result.orders.filter(isReadyStockOrder);
      setOrders(ready);
    } catch {
      setOrders(mockReadyStockOrders);
      setErrorMessage(
        'Không tải được danh sách đơn từ API. Đang hiển thị dữ liệu mẫu.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const assigneeOptions = useMemo(() => {
    const names = new Set<string>();
    Object.values(opsByOrderId).forEach((ops) => {
      const n = String(ops.assignee || '').trim();
      if (n) names.add(n);
    });
    names.delete(meName);
    return Array.from(names).sort((a, b) => a.localeCompare(b, 'vi'));
  }, [meName, opsByOrderId]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return orders
      .filter(isReadyStockOrder)
      .filter((order) => {
        if (!query) return true;
        const haystack = [
          order.code,
          toPaymentCode(order),
          toInvoiceCode(order),
          order.customerName,
          order.customerPhone,
          ...order.items.map((i) => i.name),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(query);
      })
      .filter((order) => {
        const ops = resolveOps(order);

        const approvedAt = ops.salesApprovedAt || inferSalesApprovedAt(order);
        const approvedDate = dateOnly(approvedAt);
        if (
          filters.salesApprovedFrom &&
          approvedDate < filters.salesApprovedFrom
        )
          return false;
        if (filters.salesApprovedTo && approvedDate > filters.salesApprovedTo)
          return false;

        if (filters.payment !== 'all') {
          if (filters.payment === 'failed') {
            if (!ops.paymentFailed) return false;
          } else if (order.paymentStatus !== filters.payment) {
            return false;
          }
        }

        if (filters.opsStatus !== 'all' && ops.opsStatus !== filters.opsStatus)
          return false;

        const assignee = String(ops.assignee || '').trim();
        if (filters.assignee === 'unassigned' && assignee) return false;
        if (filters.assignee === 'me' && assignee !== meName) return false;
        if (
          filters.assignee !== 'all' &&
          filters.assignee !== 'unassigned' &&
          filters.assignee !== 'me' &&
          assignee !== filters.assignee
        ) {
          return false;
        }

        const warnings = getReadyStockWarnings(order, ops);
        const hasWarning = warnings.length > 0;
        const hasNote =
          Boolean(String(order.note || '').trim()) ||
          Boolean(String(ops.salesHandoffNote || '').trim()) ||
          Boolean(String(ops.internalNote || '').trim()) ||
          Boolean(String(ops.holdNote || '').trim()) ||
          Boolean(String(ops.issueNote || '').trim()) ||
          Object.values(ops.itemStates || {}).some((s) =>
            Boolean(String(s.internalNote || '').trim())
          );

        if (filters.hasWarningOnly && !hasWarning) return false;
        if (filters.hasNoteOnly && !hasNote) return false;

        return true;
      });
  }, [orders, filters, resolveOps, searchTerm, meName]);

  const openDetail = useCallback(
    (order: OrderRecord) => {
      ensureOps(order);
      setDetailOrder(order);
      setDetailOpen(true);
    },
    [ensureOps]
  );

  const openHold = useCallback(
    (order: OrderRecord) => {
      ensureOps(order);
      setHoldOrder(order);
      setHoldOpen(true);
    },
    [ensureOps]
  );

  const openShipmentModal = useCallback(
    (order: OrderRecord, mode: 'create' | 'update') => {
      ensureOps(order);
      setShipmentOrder(order);
      setShipmentMode(mode);
      setShipmentOpen(true);
    },
    [ensureOps]
  );

  const acceptOrder = useCallback(
    (order: OrderRecord) => {
      const current = ensureOps(order);
      setAssignee(order.id, meName);

      if (
        current.opsStatus === 'pending_operations' ||
        current.opsStatus === 'awaiting_picking'
      ) {
        setStatus(order.id, 'picking');
      }
    },
    [ensureOps, meName, setAssignee, setStatus]
  );

  const confirmPickedOrder = useCallback(
    (order: OrderRecord) => {
      const current = ensureOps(order);
      setAssignee(order.id, current.assignee || meName);
      setStatus(order.id, 'packed');
    },
    [ensureOps, meName, setAssignee, setStatus]
  );

  const packOrder = useCallback(
    (order: OrderRecord) => {
      const current = ensureOps(order);
      setAssignee(order.id, current.assignee || meName);
      setStatus(order.id, 'ready_to_ship');
    },
    [ensureOps, meName, setAssignee, setStatus]
  );

  const completeShipping = useCallback(
    (order: OrderRecord) => {
      ensureOps(order);
      setStatus(order.id, 'shipped');
    },
    [ensureOps, setStatus]
  );

  return (
    <>
      <Header
        title="Đơn có sẵn (Ready stock)"
        subtitle="Nhận đơn → lấy hàng → đóng gói → tạo vận đơn → bàn giao vận chuyển → ghi chú lỗi/hold"
      />

      <div className="space-y-6 p-6">
        <ReadyStockStatsGrid orders={orders} resolveOps={resolveOps} />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
            <div className="w-full sm:max-w-[320px]">
              <SearchBar
                placeholder="Tìm mã đơn / paymentCode / invoiceCode / tên / SĐT..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setFilterOpen(true)}
              aria-label="Mở bộ lọc"
            >
              <Filter className="h-4 w-4" />
              Lọc
            </Button>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={loadOrders} disabled={isLoading}>
              {isLoading ? 'Đang tải...' : 'Tải lại'}
            </Button>
          </div>
        </div>

        {errorMessage && (
          <p className="text-destructive text-sm">{errorMessage}</p>
        )}

        <ReadyStockOrdersTable
          orders={filteredOrders}
          resolveOps={resolveOps}
          onViewDetail={openDetail}
          onAccept={acceptOrder}
          onConfirmPicked={confirmPickedOrder}
          onPack={packOrder}
          onCreateShipment={(order) => openShipmentModal(order, 'create')}
          onUpdateTracking={(order) => openShipmentModal(order, 'update')}
          onCompleteShipping={completeShipping}
          onHold={openHold}
          currentUserName={meName}
        />
      </div>

      <ReadyStockFilterSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        filters={filters}
        assigneeOptions={assigneeOptions}
        onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))}
        onReset={() => setFilters(DEFAULT_FILTERS)}
      />

      <ReadyStockOrderDetailModal
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (!open) setDetailOrder(null);
        }}
        order={detailOrder}
      />

      <ReadyStockHoldModal
        open={holdOpen}
        onOpenChange={(open) => {
          setHoldOpen(open);
          if (!open) setHoldOrder(null);
        }}
        order={holdOrder}
        initialReason={holdOrder ? resolveOps(holdOrder).holdReason : null}
        initialNote={holdOrder ? resolveOps(holdOrder).holdNote : ''}
        onSubmit={(reason, note) => {
          if (!holdOrder) return;
          setHold(holdOrder.id, reason, note);
        }}
        onClear={() => {
          if (!holdOrder) return;
          clearHold(holdOrder.id);
        }}
      />

      <ReadyStockShipmentModal
        open={shipmentOpen}
        onOpenChange={(open) => {
          setShipmentOpen(open);
          if (!open) setShipmentOrder(null);
        }}
        order={shipmentOrder}
        mode={shipmentMode}
        initialCarrierId={
          shipmentOrder ? resolveOps(shipmentOrder).carrierId : ''
        }
        initialTrackingCode={
          shipmentOrder ? resolveOps(shipmentOrder).trackingCode : ''
        }
        onSubmit={(carrierId, trackingCode) => {
          if (!shipmentOrder) return;

          const current = ensureOps(shipmentOrder);
          setTracking(shipmentOrder.id, carrierId, trackingCode);

          if (current.opsStatus === 'packed') {
            setStatus(shipmentOrder.id, 'ready_to_ship');
          }
        }}
      />
    </>
  );
}
