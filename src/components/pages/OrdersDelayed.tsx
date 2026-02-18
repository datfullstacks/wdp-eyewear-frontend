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
  DelayedStatsGrid,
  DelayedOrderTable,
  DelayedDetailModal,
  EscalateModal,
  ContactModal,
  ResolveModal,
} from '@/components/organisms/delayed';
import { mockDelayedOrders, delayTypeLabels } from '@/data/delayedData';
import { DelayedOrder, ContactMethod, ResolveAction } from '@/types/delayed';
import { Filter } from 'lucide-react';
import { Header } from '@/components/organisms/Header';

export default function OrdersDelayed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const [detailOrder, setDetailOrder] = useState<DelayedOrder | null>(null);
  const [escalateOrder, setEscalateOrder] = useState<DelayedOrder | null>(null);
  const [contactOrder, setContactOrder] = useState<DelayedOrder | null>(null);
  const [resolveOrder, setResolveOrder] = useState<DelayedOrder | null>(null);

  const filteredOrders = mockDelayedOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone.includes(searchTerm);
    const matchesSeverity =
      severityFilter === 'all' || order.severity === severityFilter;
    const matchesType = typeFilter === 'all' || order.delayType === typeFilter;
    return matchesSearch && matchesSeverity && matchesType;
  });

  const stats = {
    critical: mockDelayedOrders.filter((o) => o.severity === 'critical').length,
    high: mockDelayedOrders.filter((o) => o.severity === 'high').length,
    medium: mockDelayedOrders.filter((o) => o.severity === 'medium').length,
    slaBreached: mockDelayedOrders.filter((o) => o.delayType === 'sla_breach')
      .length,
  };

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map((o) => o.id));
    }
  };

  const handleEscalate = (orderId: string, note: string) => {
    console.log('Escalating order:', orderId, 'Note:', note);
  };

  const handleContact = (
    orderId: string,
    method: ContactMethod,
    note: string
  ) => {
    console.log(
      'Contacting customer:',
      orderId,
      'Method:',
      method,
      'Note:',
      note
    );
  };

  const handleResolve = (
    orderId: string,
    action: ResolveAction,
    note: string
  ) => {
    console.log('Resolving order:', orderId, 'Action:', action, 'Note:', note);
  };

  return (
    <>
      <Header
        title="Đơn trễ & Cảnh báo"
        subtitle="Quản lý và xử lý các đơn hàng vi phạm SLA hoặc cần can thiệp"
      />
      <div className="space-y-6 p-6">
        {/* Stats */}
        <DelayedStatsGrid stats={stats} />
        {/* Filters */}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
          <div className="w-full sm:max-w-[240px]">
            <SearchBar
              placeholder="Tìm theo mã đơn, tên KH, SĐT..."
              value={searchTerm}
              onChange={setSearchTerm}
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
                <DropdownMenuLabel>Mức độ</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={severityFilter}
                  onValueChange={setSeverityFilter}
                >
                  <DropdownMenuRadioItem value="all">
                    Tất cả mức độ
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="critical">
                    Nghiêm trọng
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="high">
                    Cao
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="medium">
                    Trung bình
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="low">
                    Thấp
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Loại cảnh báo</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                >
                  <DropdownMenuRadioItem value="all">
                    Tất cả loại
                  </DropdownMenuRadioItem>
                  {Object.entries(delayTypeLabels).map(([value, label]) => (
                    <DropdownMenuRadioItem key={value} value={value}>
                      {label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Order List */}
        <DelayedOrderTable
          orders={filteredOrders}
          selectedOrders={selectedOrders}
          onSelectOrder={toggleSelectOrder}
          onSelectAll={toggleSelectAll}
          onViewDetail={setDetailOrder}
          onContact={setContactOrder}
          onEscalate={setEscalateOrder}
          onResolve={setResolveOrder}
        />

        {/* Modals */}
        <DelayedDetailModal
          order={detailOrder}
          onClose={() => setDetailOrder(null)}
          onResolve={setResolveOrder}
        />

        <EscalateModal
          order={escalateOrder}
          onClose={() => setEscalateOrder(null)}
          onSubmit={handleEscalate}
        />

        <ContactModal
          order={contactOrder}
          onClose={() => setContactOrder(null)}
          onSubmit={handleContact}
        />

        <ResolveModal
          order={resolveOrder}
          onClose={() => setResolveOrder(null)}
          onSubmit={handleResolve}
        />
      </div>
    </>
  );
}
