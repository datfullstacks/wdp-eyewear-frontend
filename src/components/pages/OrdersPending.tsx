'use client';
import { Header } from '@/components/organisms/Header';

import { SearchBar } from '@/components/molecules/SearchBar';
import { Button as UiButton } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter, CheckCircle, RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { PendingOrder } from '@/types/pending';
import { pendingOrders } from '@/data/pendingData';
import {
  PendingStatsGrid,
  PendingOrderTable,
  PendingDetailModal,
  ProcessModal,
  RejectModal,
} from '@/components/organisms/pending';
import { Button } from '@/components/atoms';

const OrdersPending = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [detailModal, setDetailModal] = useState<PendingOrder | null>(null);
  const [processModal, setProcessModal] = useState<PendingOrder | null>(null);
  const [rejectModal, setRejectModal] = useState<PendingOrder | null>(null);

  const filteredOrders = pendingOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery);
    const matchesPriority =
      priorityFilter === 'all' || order.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleSelectAll = (checked: boolean) => {
    setSelectedOrders(checked ? filteredOrders.map((o) => o.id) : []);
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    setSelectedOrders(
      checked
        ? [...selectedOrders, orderId]
        : selectedOrders.filter((id) => id !== orderId)
    );
  };

  const handleProcessOrder = () => {
    setProcessModal(null);
  };

  const handleRejectOrder = () => {
    setRejectModal(null);
  };

  const handleBulkProcess = () => {
    setSelectedOrders([]);
  };

  const urgentCount = pendingOrders.filter(
    (o) => o.priority === 'urgent'
  ).length;
  const highCount = pendingOrders.filter((o) => o.priority === 'high').length;

  return (
    <>
      <Header title="Đơn cần xử lý" subtitle="Xác nhận và xử lý đơn hàng mới" />

      <div className="space-y-6 p-6">
        <PendingStatsGrid
          totalCount={pendingOrders.length}
          urgentCount={urgentCount}
          highCount={highCount}
          selectedCount={selectedOrders.length}
        />

        {/* Filters & Actions */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
            <div className="w-full sm:max-w-[300px]">
              <SearchBar
                placeholder="Tìm mã đơn, tên KH, SĐT..."
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
            <div className="flex justify-start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <UiButton
                    variant="outline"
                    size="icon"
                    aria-label="Bộ lọc"
                    className="text-foreground/80 hover:text-foreground"
                  >
                    <Filter />
                  </UiButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Độ ưu tiên</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={priorityFilter}
                    onValueChange={setPriorityFilter}
                  >
                    <DropdownMenuRadioItem value="all">
                      Tất cả
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="urgent">
                      Khẩn cấp
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="high">
                      Ưu tiên cao
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="normal">
                      Bình thường
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="low">
                      Thấp
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
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
                >
                  Bỏ chọn ({selectedOrders.length})
                </Button>
                <Button size="sm" className="gap-2" onClick={handleBulkProcess}>
                  <CheckCircle className="h-4 w-4" />
                  Xác nhận hàng loạt
                </Button>
              </>
            )}

            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </div>

        <PendingOrderTable
          orders={filteredOrders}
          selectedOrders={selectedOrders}
          onSelectAll={handleSelectAll}
          onSelectOrder={handleSelectOrder}
          onViewDetail={setDetailModal}
          onProcess={setProcessModal}
          onReject={setRejectModal}
        />
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
        onConfirm={handleProcessOrder}
      />
      <RejectModal
        order={rejectModal}
        onClose={() => setRejectModal(null)}
        onConfirm={handleRejectOrder}
      />
    </>
  );
};

export default OrdersPending;
