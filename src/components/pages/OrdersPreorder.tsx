'use client';
import { useState } from 'react';
import { SearchBar } from '@/components/molecules/SearchBar';
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
  PreorderStatsGrid,
  PreorderTable,
  PreorderDetailModal,
  LinkBatchModal,
  PreorderContactModal,
  CancelModal,
} from '@/components/organisms/preorder';
import {
  mockPreorderOrders,
  statusFilterOptions,
  priorityFilterOptions,
} from '@/data/preorderData';
import type { PreorderOrder } from '@/types/preorder';
import { Filter } from 'lucide-react';
import { Header } from '@/components/organisms/Header';

const OrdersPreorder = () => {
  const [orders, setOrders] = useState<PreorderOrder[]>(mockPreorderOrders);
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery);
    const matchesStatus =
      statusFilter === 'all' || order.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || order.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: orders.length,
    waitingStock: orders.filter((o) => o.status === 'waiting_stock').length,
    partialStock: orders.filter((o) => o.status === 'partial_stock').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    urgent: orders.filter((o) => o.priority === 'urgent').length,
  };

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
          onProcess={() => {}}
        />

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
              setOrders((prev) =>
                prev.map((o) =>
                  o.id === cancelOrder.id
                    ? { ...o, status: 'cancelled' as const }
                    : o
                )
              );

              setIsCancelOpen(false);
            }
          }}
        />
      </div>
    </>
  );
};

export default OrdersPreorder;
