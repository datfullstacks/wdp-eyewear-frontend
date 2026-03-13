'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';

import { orderApi } from '@/api';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Header } from '@/components/organisms/Header';
import {
  CancelModal,
  LinkBatchModal,
  PreorderContactModal,
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
import { toPreorderOrder } from '@/lib/orderAdapters';
import type { PreorderOrder } from '@/types/preorder';

const OrdersPreorder = () => {
  const [orders, setOrders] = useState<PreorderOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [detailOrder, setDetailOrder] = useState<PreorderOrder | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isLinkBatchOpen, setIsLinkBatchOpen] = useState(false);
  const [linkBatchOrder, setLinkBatchOrder] = useState<PreorderOrder | null>(
    null
  );
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactOrder, setContactOrder] = useState<PreorderOrder | null>(null);
  const [contactNote, setContactNote] = useState('');
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [cancelOrder, setCancelOrder] = useState<PreorderOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [shipmentOrder, setShipmentOrder] = useState<PreorderOrder | null>(
    null
  );
  const [shipmentMode, setShipmentMode] = useState<'create' | 'update'>(
    'create'
  );
  const [isShipmentOpen, setIsShipmentOpen] = useState(false);

  const loadPreorderOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await orderApi.getAll({ page: 1, limit: 200 });
      const mapped = result.orders
        .filter(
          (order) =>
            order.orderType === 'pre_order' ||
            order.items.some((item) => item.preOrder)
        )
        .map(toPreorderOrder);

      setOrders(mapped);
      setSelectedOrders((prev) =>
        prev.filter((id) => mapped.some((order) => order.id === id))
      );
    } catch {
      setErrorMessage('Không tải được danh sách đơn pre-order.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPreorderOrders();
  }, [loadPreorderOrders]);

  const patchOrder = useCallback(
    (orderId: string, updater: (current: PreorderOrder) => PreorderOrder) => {
      const updateCurrent = (current: PreorderOrder | null) =>
        current && current.id === orderId ? updater(current) : current;

      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updater(order) : order))
      );
      setDetailOrder((prev) => updateCurrent(prev));
      setLinkBatchOrder((prev) => updateCurrent(prev));
      setContactOrder((prev) => updateCurrent(prev));
      setCancelOrder((prev) => updateCurrent(prev));
      setShipmentOrder((prev) => updateCurrent(prev));
    },
    []
  );

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const matchesSearch =
          order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          order.customerPhone.includes(searchQuery);
        const matchesStatus =
          statusFilter === 'all' || order.status === statusFilter;
        const matchesPriority =
          priorityFilter === 'all' || order.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
      }),
    [orders, priorityFilter, searchQuery, statusFilter]
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
    (order: PreorderOrder, mode: 'create' | 'update') => {
      setShipmentOrder(order);
      setShipmentMode(mode);
      setIsShipmentOpen(true);
    },
    []
  );

  const handleMarkArrived = useCallback(
    (order: PreorderOrder) => {
      patchOrder(order.id, (current) => ({
        ...current,
        status: 'ready',
        opsStatus: 'arrived',
        products: current.products.map((product) => ({
          ...product,
          status: 'arrived',
        })),
      }));
    },
    [patchOrder]
  );

  const handleStockIn = useCallback(
    (order: PreorderOrder) => {
      patchOrder(order.id, (current) => ({
        ...current,
        status: 'ready',
        opsStatus: 'stocked',
      }));
    },
    [patchOrder]
  );

  const handleMoveToPacking = useCallback(
    (order: PreorderOrder) => {
      patchOrder(order.id, (current) => ({
        ...current,
        status: 'ready',
        opsStatus: 'packing',
      }));
    },
    [patchOrder]
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
          onLinkBatch={(order) => {
            setLinkBatchOrder(order);
            setIsLinkBatchOpen(true);
          }}
          onContact={(order) => {
            setContactOrder(order);
            setContactNote('');
            setIsContactOpen(true);
          }}
          onCancel={(order) => {
            setCancelOrder(order);
            setCancelReason('');
            setIsCancelOpen(true);
          }}
          onMarkArrived={handleMarkArrived}
          onStockIn={handleStockIn}
          onMoveToPacking={handleMoveToPacking}
          onCreateShipment={(order) => openShipmentModal(order, 'create')}
          onUpdateTracking={(order) => openShipmentModal(order, 'update')}
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
        <LinkBatchModal
          order={linkBatchOrder}
          open={isLinkBatchOpen}
          onOpenChange={setIsLinkBatchOpen}
          onConfirm={() => {
            setIsLinkBatchOpen(false);
          }}
        />
        <PreorderContactModal
          order={contactOrder}
          open={isContactOpen}
          onOpenChange={setIsContactOpen}
          contactNote={contactNote}
          onContactNoteChange={setContactNote}
          onConfirm={() => {
            setIsContactOpen(false);
          }}
        />
        <CancelModal
          order={cancelOrder}
          open={isCancelOpen}
          onOpenChange={setIsCancelOpen}
          cancelReason={cancelReason}
          onCancelReasonChange={setCancelReason}
          onConfirm={() => {
            if (cancelOrder && cancelReason.trim()) {
              patchOrder(cancelOrder.id, (current) => ({
                ...current,
                status: 'cancelled',
              }));
              setIsCancelOpen(false);
            }
          }}
        />
        <PreorderShipmentModal
          order={shipmentOrder}
          open={isShipmentOpen}
          onOpenChange={setIsShipmentOpen}
          mode={shipmentMode}
          initialCarrierId={shipmentOrder?.carrierId || ''}
          initialTrackingCode={shipmentOrder?.trackingCode || ''}
          onSubmit={(carrierId, trackingCode) => {
            if (!shipmentOrder) return;

            patchOrder(shipmentOrder.id, (current) => ({
              ...current,
              status: 'ready',
              opsStatus: 'shipment_created',
              carrierId,
              trackingCode,
            }));
          }}
        />
      </div>
    </>
  );
};

export default OrdersPreorder;
