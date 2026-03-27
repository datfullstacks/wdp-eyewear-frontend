'use client';

import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Filter } from 'lucide-react';

import { orderApi, productApi, type ProductDetail } from '@/api';
import type {
  OrderItem,
  OrderRecord,
  OrderShippingInfo,
  OrderShippingTestStatus,
} from '@/api/orders';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Header } from '@/components/organisms/Header';
import {
  CancelModal,
  PreorderDetailModal,
  PreorderShipmentModal,
  PreorderStatsGrid,
  PreorderTable,
} from '@/components/organisms/preorder';
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
  priorityFilterOptions,
  statusFilterOptions,
} from '@/data/preorderData';
import { useStatusRealtimeReload } from '@/hooks/useStatusRealtime';
import { toPreorderOrder } from '@/lib/orderAdapters';
import { hasOperationHandoff, isPreorderOrder } from '@/lib/orderWorkflow';
import type { PreorderOrder } from '@/types/preorder';

type ProductVariant = NonNullable<ProductDetail['variants']>[number];

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

function hydrateOrderItemsWithProductData(
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

function formatFilterDate(value: string) {
  const parts = value.split('-');
  if (parts.length !== 3) return value;

  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

const OrdersPreorder = () => {
  const [orders, setOrders] = useState<PreorderOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [detailOrder, setDetailOrder] = useState<PreorderOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelOrder, setCancelOrder] = useState<PreorderOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [shipmentOrder, setShipmentOrder] = useState<PreorderOrder | null>(
    null
  );
  const [shipmentMode, setShipmentMode] = useState<'create' | 'sync'>('create');
  const [isShipmentOpen, setIsShipmentOpen] = useState(false);
  const [shipmentInfo, setShipmentInfo] = useState<OrderShippingInfo | null>(
    null
  );
  const [shipmentLoading, setShipmentLoading] = useState(false);
  const [shipmentSubmitting, setShipmentSubmitting] = useState(false);
  const [shipmentErrorMessage, setShipmentErrorMessage] = useState<
    string | null
  >(null);

  const hydratePreorderOrders = useCallback(async (input: OrderRecord[]) => {
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

    return hydrateOrderItemsWithProductData(input, productDetailsById);
  }, []);

  const loadPreorderOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await orderApi.getAll({ page: 1, limit: 200 });
      const relevantOrders = result.orders.filter(
        (order) => isPreorderOrder(order) && hasOperationHandoff(order)
      );
      const hydratedOrders = await hydratePreorderOrders(relevantOrders);
      const mapped = hydratedOrders.map(toPreorderOrder);

      setOrders(mapped);
      setSelectedOrders((prev) =>
        prev.filter((id) => mapped.some((order) => order.id === id))
      );
    } catch {
      setErrorMessage('Không tải được danh sách đơn pre-order.');
    } finally {
      setIsLoading(false);
    }
  }, [hydratePreorderOrders]);

  useEffect(() => {
    void loadPreorderOrders();
  }, [loadPreorderOrders]);

  useEffect(() => {
    setDetailOrder((current) =>
      current ? orders.find((order) => order.id === current.id) || current : null
    );
    setCancelOrder((current) =>
      current ? orders.find((order) => order.id === current.id) || current : null
    );
    setShipmentOrder((current) =>
      current ? orders.find((order) => order.id === current.id) || current : null
    );
  }, [orders]);

  useStatusRealtimeReload({
    domains: ['order', 'shipping'],
    reload: loadPreorderOrders,
  });

  const patchOrder = useCallback(
    (orderId: string, updater: (current: PreorderOrder) => PreorderOrder) => {
      const updateCurrent = (current: PreorderOrder | null) =>
        current && current.id === orderId ? updater(current) : current;

      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updater(order) : order))
      );
      setDetailOrder((prev) => updateCurrent(prev));
      setCancelOrder((prev) => updateCurrent(prev));
      setShipmentOrder((prev) => updateCurrent(prev));
    },
    []
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const searchValue = searchQuery.toLowerCase();
        const matchesSearch =
          order.orderCode.toLowerCase().includes(searchValue) ||
          order.storeName.toLowerCase().includes(searchValue) ||
          order.customerName
            .toLowerCase()
            .includes(searchValue) ||
          order.customerPhone.includes(searchQuery) ||
          order.products.some((product) =>
            [product.name, product.sku, product.supplier, product.warehouseLocation]
              .join(' ')
              .toLowerCase()
              .includes(searchValue)
          );
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesPriority =
          priorityFilter === 'all' || order.priority === priorityFilter;
        const matchesDateFrom = !orderDateFrom || order.orderDate >= orderDateFrom;
        const matchesDateTo = !orderDateTo || order.orderDate <= orderDateTo;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesPriority &&
          matchesDateFrom &&
          matchesDateTo
        );
      }),
    [orderDateFrom, orderDateTo, orders, priorityFilter, searchQuery, statusFilter]
  );

  const stats = useMemo(
    () => ({
      total: orders.length,
      waitingStock: orders.filter((o) => o.status === 'waiting_stock').length,
      partialStock: orders.filter((o) => o.status === 'partial_stock').length,
      ready: orders.filter((o) => o.status === 'ready').length,
      urgent: orders.filter((o) => o.priority === 'urgent').length,
    }),
    [orders]
  );

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((o) => o.id));
    }
  };

  const openShipmentModal = useCallback(
    async (order: PreorderOrder, mode: 'create' | 'sync') => {
      setShipmentOrder(order);
      setShipmentMode(mode);
      setShipmentInfo(null);
      setShipmentErrorMessage(null);
      setIsShipmentOpen(true);
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
    []
  );

  const advanceShipmentTestStatus = useCallback(
    async (status: OrderShippingTestStatus) => {
      if (!shipmentOrder) return;

      try {
        setShipmentSubmitting(true);
        setShipmentErrorMessage(null);
        const result = await orderApi.updateShipmentTestStatus(
          shipmentOrder.id,
          status
        );
        setShipmentInfo(result);
        await loadPreorderOrders();
      } catch {
        setShipmentErrorMessage('Khong the cap nhat trang thai GHN test.');
      } finally {
        setShipmentSubmitting(false);
      }
    },
    [loadPreorderOrders, shipmentOrder]
  );

  const handleMarkArrived = useCallback(
    async (order: PreorderOrder) => {
      try {
        setErrorMessage(null);
        await orderApi.updateOpsStage(order.id, 'arrived');
        await loadPreorderOrders();
      } catch {
        setErrorMessage('Khong the cap nhat don pre-order.');
      }
    },
    [loadPreorderOrders]
  );

  const handleStockIn = useCallback(
    async (order: PreorderOrder) => {
      try {
        setErrorMessage(null);
        await orderApi.updateOpsStage(order.id, 'stocked');
        await loadPreorderOrders();
      } catch {
        setErrorMessage('Khong the cap nhat don pre-order.');
      }
    },
    [loadPreorderOrders]
  );

  const handleMoveToPacking = useCallback(
    async (order: PreorderOrder) => {
      try {
        setErrorMessage(null);
        await orderApi.updateOpsStage(
          order.id,
          order.opsStatus === 'stocked' ? 'ready_to_pack' : 'packing'
        );
        await loadPreorderOrders();
      } catch {
        setErrorMessage('Khong the cap nhat don pre-order.');
      }
    },
    [loadPreorderOrders]
  );

  return (
    <>
      <Header
        title="Đơn Pre-order"
        subtitle="Quản lý đơn hàng đặt trước chờ hàng về"
      />
      <div className="space-y-6 p-6">
        <PreorderStatsGrid stats={stats} />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
          <div className="w-full sm:max-w-[240px]">
            <SearchBar
              placeholder="Tìm theo mã đơn, tên khách, SĐT..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          <div className="flex justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Bộ lọc"
                  className="text-foreground/80 hover:text-foreground"
                >
                  <Filter />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Trạng thái</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  {statusFilterOptions.map((opt) => (
                    <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Độ ưu tiên</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  {priorityFilterOptions.map((opt) => (
                    <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <div className="space-y-3 p-2">
                  <div className="text-sm font-medium text-foreground">
                    Ngày tạo đơn
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground/80">
                      Từ ngày
                    </div>
                    <div className="relative">
                      <input
                        type="date"
                        value={orderDateFrom}
                        onChange={(event) => setOrderDateFrom(event.target.value)}
                        aria-label="Từ ngày"
                        className="absolute inset-0 z-10 cursor-pointer opacity-0"
                      />
                      <div className="flex h-9 items-center rounded-md border border-input bg-white px-3 pr-10 text-sm font-medium text-gray-900 shadow-sm">
                        {orderDateFrom ? (
                          formatFilterDate(orderDateFrom)
                        ) : (
                          <span className="text-gray-400">dd/mm/yyyy</span>
                        )}
                      </div>
                      <CalendarDays className="pointer-events-none absolute right-3 top-1/2 z-20 h-4 w-4 -translate-y-1/2 text-foreground/70" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-foreground/80">
                      Đến ngày
                    </div>
                    <div className="relative">
                      <input
                        type="date"
                        value={orderDateTo}
                        onChange={(event) => setOrderDateTo(event.target.value)}
                        aria-label="Đến ngày"
                        className="absolute inset-0 z-10 cursor-pointer opacity-0"
                      />
                      <div className="flex h-9 items-center rounded-md border border-input bg-white px-3 pr-10 text-sm font-medium text-gray-900 shadow-sm">
                        {orderDateTo ? (
                          formatFilterDate(orderDateTo)
                        ) : (
                          <span className="text-gray-400">dd/mm/yyyy</span>
                        )}
                      </div>
                      <CalendarDays className="pointer-events-none absolute right-3 top-1/2 z-20 h-4 w-4 -translate-y-1/2 text-foreground/70" />
                    </div>
                  </div>
                  {(orderDateFrom || orderDateTo) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 w-full justify-center text-sm"
                      onClick={() => {
                        setOrderDateFrom('');
                        setOrderDateTo('');
                      }}
                    >
                      Đặt lại ngày
                    </Button>
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <PreorderTable
          orders={filteredOrders}
          selectedOrders={selectedOrders}
          showEmptyState={!isLoading && !errorMessage}
          onSelectOrder={handleSelectOrder}
          onSelectAll={handleSelectAll}
          onViewDetail={(order) => {
            setDetailOrder(order);
            setIsDetailOpen(true);
          }}
          onCancel={(order) => {
            setCancelOrder(order);
            setCancelReason('');
            setIsCancelOpen(true);
          }}
          onMarkArrived={handleMarkArrived}
          onStockIn={handleStockIn}
          onMoveToPacking={handleMoveToPacking}
          onCreateShipment={(order) => {
            void openShipmentModal(order, 'create');
          }}
          onUpdateTracking={(order) => {
            void openShipmentModal(order, 'sync');
          }}
        />
        {isLoading && (
          <p className="text-foreground/70 text-sm">
            Đang tải dữ liệu pre-order...
          </p>
        )}
        {!isLoading && errorMessage && (
          <p className="text-destructive text-sm">{errorMessage}</p>
        )}

        <PreorderDetailModal
          order={detailOrder}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />
        <CancelModal
          order={cancelOrder}
          open={isCancelOpen}
          onOpenChange={setIsCancelOpen}
          cancelReason={cancelReason}
          onCancelReasonChange={setCancelReason}
          onConfirm={async () => {
            if (!cancelOrder || !cancelReason.trim()) return;

            try {
              setErrorMessage(null);
              await orderApi.cancel(cancelOrder.id, {
                reason: cancelReason.trim(),
              });
              patchOrder(cancelOrder.id, (current) => ({
                ...current,
                rawOrderStatus: 'cancelled',
                status: 'cancelled',
              }));
              setIsCancelOpen(false);
            } catch {
              setErrorMessage('Khong the huy don pre-order.');
            }
          }}
        />
        <PreorderShipmentModal
          order={shipmentOrder}
          open={isShipmentOpen}
          onOpenChange={(open) => {
            setIsShipmentOpen(open);
            if (!open) {
              setShipmentOrder(null);
              setShipmentInfo(null);
              setShipmentErrorMessage(null);
            }
          }}
          mode={shipmentMode}
          shippingInfo={shipmentInfo}
          isLoading={shipmentLoading}
          isSubmitting={shipmentSubmitting}
          errorMessage={shipmentErrorMessage}
          onSubmit={async () => {
            if (!shipmentOrder) return;

            try {
              setShipmentSubmitting(true);
              setShipmentErrorMessage(null);
              if (shipmentMode === 'create') {
                await orderApi.createShipment(shipmentOrder.id);
              } else {
                await orderApi.syncShipment(shipmentOrder.id);
              }
              setIsShipmentOpen(false);
              setShipmentOrder(null);
              await loadPreorderOrders();
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
          }}
          onAdvanceStatus={(status) => {
            void advanceShipmentTestStatus(status);
          }}
        />
      </div>
    </>
  );
};

export default OrdersPreorder;
