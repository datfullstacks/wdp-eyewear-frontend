'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Header } from '@/components/organisms/Header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { SupplementOrder, ContactType } from '@/types/prescription';
import { mockSupplementOrders } from '@/data/prescriptionData';
import { Filter, Clock, AlertTriangle, Send, RefreshCw } from 'lucide-react';
import {
  BulkContactModal,
  ContactHistoryModal,
  OrderDetailModal,
  PrescriptionOrderTable,
  PrescriptionStatsGrid,
  UploadImageModal,
} from '@/components/organisms/prescription';

const typeOptions = [
  { value: 'no_prescription', label: 'Chưa có Rx' },
  { value: 'incomplete_data', label: 'Thiếu dữ liệu' },
  { value: 'unclear_image', label: 'Ảnh không rõ' },
  { value: 'need_verification', label: 'Cần xác nhận' },
];

const priorityOptions = [
  { value: 'urgent', label: 'Gấp' },
  { value: 'high', label: 'Cao' },
  { value: 'normal', label: 'Bình thường' },
];

export default function OrdersPrescriptionSupplement() {
  const [orders, setOrders] = useState<SupplementOrder[]>(mockSupplementOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('pending');

  const [selectedOrder, setSelectedOrder] = useState<SupplementOrder | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [_contactOpen, setContactOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [bulkContactOpen, setBulkContactOpen] = useState(false);
  const [uploadImageOpen, setUploadImageOpen] = useState(false);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm);
    const matchesType =
      typeFilter === 'all' || order.missingType === typeFilter;
    const matchesPriority =
      priorityFilter === 'all' || order.priority === priorityFilter;
    return matchesSearch && matchesType && matchesPriority;
  });

  const pendingOrders = filteredOrders.filter((o) => o.contactAttempts < 3);
  const escalatedOrders = filteredOrders.filter((o) => o.contactAttempts >= 3);

  const stats = {
    total: orders.length,
    noPrescription: orders.filter((o) => o.missingType === 'no_prescription')
      .length,
    incomplete: orders.filter((o) => o.missingType === 'incomplete_data')
      .length,
    unclear: orders.filter((o) => o.missingType === 'unclear_image').length,
    needVerify: orders.filter((o) => o.missingType === 'need_verification')
      .length,
    urgent: orders.filter((o) => o.priority === 'urgent').length,
    escalated: orders.filter((o) => o.contactAttempts >= 3).length,
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentOrders =
        activeTab === 'pending' ? pendingOrders : escalatedOrders;
      setSelectedOrders(currentOrders.map((o) => o.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    setSelectedOrders((prev) =>
      checked ? [...prev, orderId] : prev.filter((id) => id !== orderId)
    );
  };

  const handleOpenModal = (
    order: SupplementOrder,
    setter: (open: boolean) => void
  ) => {
    setSelectedOrder(order);
    setter(true);
  };

  // const handleSendContact = (contact: Omit<ContactHistory, 'id'>) => {
  //   if (!selectedOrder) return;
  //   const newContact: ContactHistory = { ...contact, id: `C${Date.now()}` };
  //   setOrders((prev) =>
  //     prev.map((o) =>
  //       o.id === selectedOrder.id
  //         ? {
  //             ...o,
  //             contactAttempts: o.contactAttempts + 1,
  //             lastContactDate: new Date().toISOString().split('T')[0],
  //             contactHistory: [...o.contactHistory, newContact],
  //           }
  //         : o
  //     )
  //   );
  // };

  const handleBulkContact = (
    _contactType?: ContactType,
    _templateId?: string
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        selectedOrders.includes(o.id)
          ? {
              ...o,
              contactAttempts: o.contactAttempts + 1,
              lastContactDate: new Date().toISOString().split('T')[0],
            }
          : o
      )
    );
    setSelectedOrders([]);
    setBulkContactOpen(false);
  };

  return (
    <>
      <Header
        title="Đơn cần bổ sung Prescription"
        subtitle="Quản lý và theo dõi các đơn hàng đang thiếu thông số mắt"
      />
      <div className="space-y-6 p-6">
        {/* Stats */}
        <PrescriptionStatsGrid stats={stats} />

        {/* Filters & Actions */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
            <div className="w-full sm:max-w-[240px]">
              <SearchBar
                placeholder="Tìm theo mã đơn, tên khách, SĐT..."
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
                  <DropdownMenuLabel>Loại thiếu</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                  >
                    <DropdownMenuRadioItem value="all">
                      Tất cả loại
                    </DropdownMenuRadioItem>
                    {typeOptions.map((opt) => (
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
                    <DropdownMenuRadioItem value="all">
                      Tất cả
                    </DropdownMenuRadioItem>
                    {priorityOptions.map((opt) => (
                      <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedOrders.length > 0 && (
              <Button onClick={() => setBulkContactOpen(true)}>
                <Send className="mr-2 h-4 w-4" />
                Liên hệ ({selectedOrders.length})
              </Button>
            )}
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Đang chờ ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="escalated" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Escalated ({escalatedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <PrescriptionOrderTable
              orders={pendingOrders}
              selectedOrders={selectedOrders}
              onSelectOrder={handleSelectOrder}
              onSelectAll={handleSelectAll}
              onViewDetail={(o) => handleOpenModal(o, setDetailOpen)}
              onContact={(o) => handleOpenModal(o, setContactOpen)}
              onViewHistory={(o) => handleOpenModal(o, setHistoryOpen)}
              onUploadImage={(o) => handleOpenModal(o, setUploadImageOpen)}
            />
          </TabsContent>

          <TabsContent value="escalated" className="space-y-3">
            <div className="text-foreground/80 flex items-center gap-2 text-sm">
              <AlertTriangle className="text-warning h-4 w-4" />
              Đơn đã liên hệ nhiều lần (≥3 lần) cần xử lý đặc biệt
            </div>
            <PrescriptionOrderTable
              orders={escalatedOrders}
              selectedOrders={selectedOrders}
              onSelectOrder={handleSelectOrder}
              onSelectAll={handleSelectAll}
              onViewDetail={(o) => handleOpenModal(o, setDetailOpen)}
              onContact={(o) => handleOpenModal(o, setContactOpen)}
              onViewHistory={(o) => handleOpenModal(o, setHistoryOpen)}
              onUploadImage={(o) => handleOpenModal(o, setUploadImageOpen)}
            />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <OrderDetailModal
          open={detailOpen}
          onOpenChange={setDetailOpen}
          order={selectedOrder}
          onContact={() =>
            selectedOrder && handleOpenModal(selectedOrder, setContactOpen)
          }
        />
        {/* <ContactModal
          open={contactOpen}
          onOpenChange={setContactOpen}
          order={selectedOrder}
          onSend={handleSendContact}
        /> */}
        <ContactHistoryModal
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          order={selectedOrder}
          onContact={() =>
            selectedOrder && handleOpenModal(selectedOrder, setContactOpen)
          }
        />
        <BulkContactModal
          open={bulkContactOpen}
          onOpenChange={setBulkContactOpen}
          selectedCount={selectedOrders.length}
          onSend={handleBulkContact}
        />
        <UploadImageModal
          open={uploadImageOpen}
          onOpenChange={setUploadImageOpen}
          order={selectedOrder}
        />
      </div>
    </>
  );
}
