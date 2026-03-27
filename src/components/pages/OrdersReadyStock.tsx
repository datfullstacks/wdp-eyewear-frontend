'use client';

import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';

import { orderApi, productApi, type ProductDetail } from '@/api';
import type {
  OrderItem,
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
import { isReadyStockOrder } from '@/lib/orderWorkflow';
import { useDetailRoute } from '@/hooks/useDetailRoute';
import { useStatusRealtimeReload } from '@/hooks/useStatusRealtime';
import {
  createDefaultReadyStockOpsState,
  inferSalesApprovedAt,
  toInvoiceCode,
  toPaymentCode,
} from '@/lib/readyStockOps';
import { useAuthStore } from '@/stores/authStore';
import { useReadyStockOpsStore } from '@/stores/readyStockOpsStore';

type ProductVariant = NonNullable<ProductDetail['variants']>[number];

function dateOnly(value: string): string {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '';
  return dt.toISOString().slice(0, 10);
}

function isReadyStockFulfillableOrder(order: OrderRecord): boolean {
  return (
    isReadyStockOrder(order) &&
    (order.paymentStatus === 'paid' || order.paymentStatus === 'cod')
  );
}

const DEFAULT_FILTERS: ReadyStockFilters = {
  salesApprovedFrom: '',
  salesApprovedTo: '',
  shipment: 'all',
  opsStatus: 'all',
  assignee: 'all',
};

const ACTIVE_SHIPMENT_STATUSES = new Set([
  'shipment_created',
  'handover_to_carrier',
  'in_transit',
]);

const DELIVERED_SHIPMENT_STATUSES = new Set(['delivered', 'closed']);

const SHIPMENT_ISSUE_STATUSES = new Set([
  'delivery_failed',
  'waiting_redelivery',
  'return_pending',
  'return_in_transit',
  'returned',
  'exception_hold',
]);

function normalizeVariantKey(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function toProductVariantLabel(variant?: ProductVariant): string {
  const color = String(
    variant?.options?.color ||
      variant?.options?.Colour ||
      variant?.options?.colour ||
      ''
  ).trim();
  const size = String(variant?.options?.size || variant?.options?.Size || '').trim();
  if (color && size) return `${color} - ${size}`;
  return color || size || 'Mac dinh';
}

function matchProductVariant(
  item: OrderItem,
  product?: ProductDetail | null
): ProductVariant | null {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (variants.length === 0) return null;

  const variantId = String(item.variantId || '').trim();
  if (variantId) {
    const matchedById =
      variants.find((variant) => String(variant?._id || '').trim() === variantId) ||
      null;
    if (matchedById) return matchedById;
  }

  const sku = String(item.sku || '').trim().toLowerCase();
  if (sku) {
    const matchedBySku =
      variants.find((variant) => String(variant?.sku || '').trim().toLowerCase() === sku) ||
      null;
    if (matchedBySku) return matchedBySku;
  }

  const normalizedVariant = normalizeVariantKey(item.variant);
  if (!normalizedVariant) return null;

  return (
    variants.find(
      (variant) =>
        normalizeVariantKey(toProductVariantLabel(variant)) === normalizedVariant
    ) || null
  );
}

function enrichReadyStockOrders(
  orders: OrderRecord[],
  productDetailsById: Record<string, ProductDetail>
): OrderRecord[] {
  return orders.map((order) => ({
    ...order,
    items: order.items.map((item) => {
      const productId = String(item.productId || '').trim();
      const product = productDetailsById[productId];
      const matchedVariant = matchProductVariant(item, product);

      if (!matchedVariant) return item;

      return {
        ...item,
        sku: String(matchedVariant.sku || '').trim() || item.sku,
        warehouseLocation: String(matchedVariant.warehouseLocation || '').trim(),
      };
    }),
  }));
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

export default function OrdersReadyStock() {
  const {
    detailId,
    openDetail: openDetailRoute,
    closeDetail,
  } = useDetailRoute();
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

  const hydrateReadyStockOrders = useCallback(async (input: OrderRecord[]) => {
    const productIds = Array.from(
      new Set(
        input
          .flatMap((order) =>
            order.items.map((item) => String(item.productId || '').trim())
          )
          .filter(Boolean)
      )
    );

    if (productIds.length === 0) return input;

    const results = await Promise.allSettled(
      productIds.map((productId) => productApi.getById(productId))
    );
    const productDetailsById: Record<string, ProductDetail> = {};

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        productDetailsById[productIds[index]] = result.value;
      }
    });

    return enrichReadyStockOrders(input, productDetailsById);
  }, []);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await orderApi.getAll({ page: 1, limit: 200 });
      const ready = result.orders.filter(isReadyStockFulfillableOrder);
      const hydrated = await hydrateReadyStockOrders(ready);
      setOrders(hydrated);
    } catch {
      setOrders([]);
      setErrorMessage(
        'Không tải được danh sách đơn từ API. Đang hiển thị dữ liệu mẫu.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [hydrateReadyStockOrders]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    for (const order of orders) {
      const next = createDefaultReadyStockOpsState(order);
      upsertOps(order.id, next);
    }
  }, [orders, upsertOps]);

  useEffect(() => {
    setDetailOrder((current) =>
      current ? orders.find((order) => order.id === current.id) || current : null
    );
    setHoldOrder((current) =>
      current ? orders.find((order) => order.id === current.id) || current : null
    );
    setShipmentOrder((current) =>
      current ? orders.find((order) => order.id === current.id) || current : null
    );
  }, [orders]);

  useStatusRealtimeReload({
    domains: ['order', 'shipping'],
    reload: loadOrders,
  });

  useEffect(() => {
    if (!detailId) {
      setDetailOpen(false);
      setDetailOrder(null);
      return;
    }

    const matchedOrder = orders.find((order) => order.id === detailId);
    if (matchedOrder) {
      ensureOps(matchedOrder);
      setDetailOrder(matchedOrder);
      setDetailOpen(true);
      return;
    }

    if (!isLoading) {
      setDetailOrder(null);
      setDetailOpen(false);
    }
  }, [detailId, ensureOps, isLoading, orders]);

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
      .filter(isReadyStockFulfillableOrder)
      .filter((order) => {
        if (!query) return true;
        const haystack = [
          order.code,
          toPaymentCode(order),
          toInvoiceCode(order),
          order.storeName,
          order.customerName,
          order.customerPhone,
          ...order.items.map((i) => i.name),
          ...order.items.map((i) => i.supplier),
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

        const trackingCode = String(
          order.shipment?.orderCode ||
            order.shipment?.trackingCode ||
            ops.trackingCode ||
            ''
        ).trim();
        const hasShipment = Boolean(trackingCode);

        if (filters.shipment === 'without_tracking' && hasShipment) {
          return false;
        }
        if (filters.shipment === 'with_tracking' && !hasShipment) {
          return false;
        }
        if (
          filters.shipment === 'in_delivery' &&
          !ACTIVE_SHIPMENT_STATUSES.has(ops.opsStatus)
        ) {
          return false;
        }
        if (
          filters.shipment === 'delivered' &&
          !DELIVERED_SHIPMENT_STATUSES.has(ops.opsStatus)
        ) {
          return false;
        }
        if (
          filters.shipment === 'issue' &&
          !SHIPMENT_ISSUE_STATUSES.has(ops.opsStatus)
        ) {
          return false;
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

        return true;
      });
  }, [orders, filters, resolveOps, searchTerm, meName]);

  const openDetail = useCallback(
    (order: OrderRecord) => {
      ensureOps(order);
      openDetailRoute(order.id);
    },
    [ensureOps, openDetailRoute]
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
        setShipmentErrorMessage('Không tải được thông tin GHN cho đơn này.');
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
        setErrorMessage('Không thể nhận xử lý đơn hàng.');
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
        setErrorMessage('Không thể xác nhận đã lấy đủ sản phẩm.');
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
        setErrorMessage('Không thể xác nhận đóng gói đơn hàng.');
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
            ? 'Không thể tạo vận đơn GHN.'
            : 'Không thể đồng bộ GHN.'
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
        setShipmentErrorMessage('Không thể cập nhật trạng thái GHN test.');
      } finally {
        setShipmentSubmitting(false);
      }
    },
    [loadOrders, setTracking, shipmentOrder]
  );

  return (
    <>
      <Header title="Quản lý đơn có sẵn" subtitle="" />

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
              className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
              onClick={() => setFilterOpen(true)}
              aria-label="Mở bộ lọc"
            >
              <Filter className="h-4 w-4" />
              Lọc
            </Button>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              className="border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
              onClick={loadOrders}
              disabled={isLoading}
            >
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
          if (open) return;
          if (detailId) {
            closeDetail();
            return;
          }
          setDetailOrder(null);
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
            const nextStage =
              reason === 'address' ? 'waiting_customer_info' : 'on_hold';
            await orderApi.updateOpsExecution(holdOrder.id, {
              holdReason: reason,
              holdNote: note,
            });
            await orderApi.updateOpsStage(holdOrder.id, nextStage);
            await loadOrders();
          } catch {
            setErrorMessage('Không thể lưu hold trên backend.');
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
            setErrorMessage('Không thể gỡ hold trên backend.');
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
