'use client';

import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';

import { orderApi } from '@/api';
import type {
  OrderRecord,
  OrderShippingInfo,
  OrderShippingTestStatus,
} from '@/api/orders';
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
import { useStatusRealtimeReload } from '@/hooks/useStatusRealtime';
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
  const [shipmentMode, setShipmentMode] = useState<'create' | 'sync'>('create');
  const [shipmentInfo, setShipmentInfo] = useState<OrderShippingInfo | null>(
    null
  );
  const [shipmentErrorMessage, setShipmentErrorMessage] = useState<
    string | null
  >(null);
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [shipmentSubmitting, setShipmentSubmitting] = useState(false);

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

  useEffect(() => {
    for (const order of orders) {
      const next = createDefaultReadyStockOpsState(order);
      upsertOps(order.id, next);
    }
  }, [orders, upsertOps]);

  useStatusRealtimeReload({
    domains: ['order', 'shipping'],
    reload: loadOrders,
  });

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
    async (order: OrderRecord, mode: 'create' | 'sync') => {
      ensureOps(order);
      setShipmentOrder(order);
      setShipmentMode(mode);
      setShipmentInfo(null);
      setShipmentErrorMessage(null);
      setShipmentOpen(true);
      setShipmentLoading(true);

      try {
        const info = await orderApi.getShipping(order.id);
        setShipmentInfo(info);
      } catch {
        setShipmentErrorMessage('Khong tai duoc thong tin GHN cho don nay.');
      } finally {
        setShipmentLoading(false);
      }
    },
    [ensureOps]
  );

  const acceptOrder = useCallback(
    async (order: OrderRecord) => {
      try {
        setErrorMessage(null);
        await orderApi.updateOpsStage(order.id, 'picking');
        setAssignee(order.id, meName);
        setStatus(order.id, 'picking');

        await loadOrders();
      } catch {
        setErrorMessage('Khong the nhan xu ly don hang.');
      }
    },
    [loadOrders, meName, setAssignee, setStatus]
  );

  const confirmPickedOrder = useCallback(
    async (order: OrderRecord) => {
      const current = ensureOps(order);
      try {
        setErrorMessage(null);
        await orderApi.updateOpsStage(order.id, 'packing');
        setAssignee(order.id, current.assignee || meName);
        setStatus(order.id, 'packing');
        await loadOrders();
      } catch {
        setErrorMessage('Khong the xac nhan da lay du san pham.');
      }
    },
    [ensureOps, loadOrders, meName, setAssignee, setStatus]
  );

  const packOrder = useCallback(
    async (order: OrderRecord) => {
      const current = ensureOps(order);
      try {
        setErrorMessage(null);
        await orderApi.updateOpsStage(order.id, 'ready_to_ship');
        setAssignee(order.id, current.assignee || meName);
        setStatus(order.id, 'ready_to_ship');
        await loadOrders();
      } catch {
        setErrorMessage('Khong the xac nhan dong goi don hang.');
      }
    },
    [ensureOps, loadOrders, meName, setAssignee, setStatus]
  );

  const submitShipmentAction = useCallback(async () => {
    if (!shipmentOrder) return;

    setShipmentSubmitting(true);
    setShipmentErrorMessage(null);

    try {
      const result =
        shipmentMode === 'create'
          ? await orderApi.createShipment(shipmentOrder.id)
          : await orderApi.syncShipment(shipmentOrder.id);

      const trackingCode =
        result.shipment?.orderCode || result.shipment?.trackingCode || '';
      const carrierId = result.shipment?.provider || 'ghn';

      if (trackingCode) {
        setTracking(shipmentOrder.id, carrierId, trackingCode);
      }

      setShipmentInfo(result);
      setShipmentOpen(false);
      setShipmentOrder(null);
      await loadOrders();
    } catch (error) {
      setShipmentErrorMessage(
        extractApiErrorMessage(
          error,
          shipmentMode === 'create'
            ? 'Khong the tao van don GHN.'
            : 'Khong the dong bo GHN.'
        )
      );
    } finally {
      setShipmentSubmitting(false);
    }
  }, [loadOrders, setTracking, shipmentMode, shipmentOrder]);

  const advanceShipmentTestStatus = useCallback(
    async (status: OrderShippingTestStatus) => {
      if (!shipmentOrder) return;

      setShipmentSubmitting(true);
      setShipmentErrorMessage(null);

      try {
        const result = await orderApi.updateShipmentTestStatus(
          shipmentOrder.id,
          status
        );
        const trackingCode =
          result.shipment?.orderCode || result.shipment?.trackingCode || '';
        const carrierId = result.shipment?.provider || 'ghn';

        if (trackingCode) {
          setTracking(shipmentOrder.id, carrierId, trackingCode);
        }

        setShipmentInfo(result);
        await loadOrders();
      } catch {
        setShipmentErrorMessage('Khong the cap nhat trang thai GHN test.');
      } finally {
        setShipmentSubmitting(false);
      }
    },
    [loadOrders, setTracking, shipmentOrder]
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
          onSyncShipment={(order) => {
            void openShipmentModal(order, 'sync');
          }}
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
        onReload={loadOrders}
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
        onSubmit={async (reason, note) => {
          if (!holdOrder) return;
          setHold(holdOrder.id, reason, note);
          try {
            const nextStage = reason === 'address' ? 'waiting_customer_info' : 'on_hold';
            await orderApi.updateOpsExecution(holdOrder.id, {
              holdReason: reason,
              holdNote: note,
            });
            await orderApi.updateOpsStage(holdOrder.id, nextStage);
            await loadOrders();
          } catch {
            setErrorMessage('Khong the luu hold tren backend.');
          }
        }}
        onClear={async () => {
          if (!holdOrder) return;
          clearHold(holdOrder.id);
          try {
            await orderApi.updateOpsExecution(holdOrder.id, {
              holdReason: null,
              holdNote: '',
            });
            await orderApi.updateOpsStage(holdOrder.id, 'pending_operations');
            await loadOrders();
          } catch {
            setErrorMessage('Khong the go hold tren backend.');
          }
        }}
      />

      <ReadyStockShipmentModal
        open={shipmentOpen}
        onOpenChange={(open) => {
          setShipmentOpen(open);
          if (!open) {
            setShipmentOrder(null);
            setShipmentInfo(null);
            setShipmentErrorMessage(null);
          }
        }}
        order={shipmentOrder}
        mode={shipmentMode}
        shippingInfo={shipmentInfo}
        isLoading={shipmentLoading}
        isSubmitting={shipmentSubmitting}
        errorMessage={shipmentErrorMessage}
        onSubmit={() => {
          void submitShipmentAction();
        }}
        onAdvanceStatus={(status) => {
          void advanceShipmentTestStatus(status);
        }}
      />
    </>
  );
}
