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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Filter } from 'lucide-react';
import {
  emptyPrescriptionForm,
  PrescriptionData,
  PrescriptionOrder,
} from '@/types/rxPrescription';
import { mockPrescriptionOrders } from '@/data/rxPrescriptionData';
import { Header } from '@/components/organisms/Header';
import {
  RxApproveModal,
  RxContactModal,
  RxDetailModal,
  RxInputModal,
  RxOrderTable,
  RxStatsGrid,
} from '@/components/organisms/rx-prescription';

export default function OrdersPrescription() {
  const [orders, setOrders] = useState<PrescriptionOrder[]>(
    mockPrescriptionOrders
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<PrescriptionOrder | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [inputPrescriptionOpen, setInputPrescriptionOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState<PrescriptionData>(
    emptyPrescriptionForm
  );
  const [contactNote, setContactNote] = useState('');

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.phone.includes(searchTerm);
    const matchesStatus =
      statusFilter === 'all' || order.prescriptionStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    missing: orders.filter((o) => o.prescriptionStatus === 'missing').length,
    incomplete: orders.filter((o) => o.prescriptionStatus === 'incomplete')
      .length,
    pendingReview: orders.filter(
      (o) => o.prescriptionStatus === 'pending_review'
    ).length,
    approved: orders.filter((o) => o.prescriptionStatus === 'approved').length,
  };

  const handleOpenDetail = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    setDetailOpen(true);
  };

  const handleOpenInputPrescription = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    setPrescriptionForm(
      order.prescription
        ? { ...order.prescription }
        : { ...emptyPrescriptionForm }
    );
    setInputPrescriptionOpen(true);
  };

  const handleOpenContact = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    setContactNote('');
    setContactOpen(true);
  };

  const handleOpenApprove = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    setApproveOpen(true);
  };

  const handleSavePrescription = () => {
    if (!selectedOrder) return;
    setOrders(
      orders.map((o) =>
        o.id === selectedOrder.id
          ? {
              ...o,
              prescription: prescriptionForm,
              prescriptionStatus: 'pending_review' as const,
              source: 'store_input' as const,
            }
          : o
      )
    );
    setInputPrescriptionOpen(false);
  };

  const handleApprovePrescription = () => {
    if (!selectedOrder) return;
    setOrders(
      orders.map((o) =>
        o.id === selectedOrder.id
          ? { ...o, prescriptionStatus: 'approved' as const }
          : o
      )
    );
    setApproveOpen(false);
  };

  const handleSendContact = () => {
    setContactOpen(false);
  };

  return (
    <>
      <Header
        title="Đơn Prescription"
        subtitle="Quản lý đơn hàng cần thông số mắt để gia công tròng"
      />
      <div className="space-y-6 p-6">
        {/* Stats */}
        <RxStatsGrid stats={stats} />

        {/* Filters */}
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
                <DropdownMenuLabel>Trạng thái Rx</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <DropdownMenuRadioItem value="all">
                    Tất cả
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="missing">
                    Thiếu Rx
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="incomplete">
                    Chưa đầy đủ
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="pending_review">
                    Chờ duyệt
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="approved">
                    Đã duyệt
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Orders Table */}
        <RxOrderTable
          orders={filteredOrders}
          onViewDetail={handleOpenDetail}
          onInputPrescription={handleOpenInputPrescription}
          onContact={handleOpenContact}
          onApprove={handleOpenApprove}
        />

        {/* Modals */}
        <RxDetailModal
          open={detailOpen}
          onOpenChange={setDetailOpen}
          order={selectedOrder}
          onInputPrescription={handleOpenInputPrescription}
        />

        <RxInputModal
          open={inputPrescriptionOpen}
          onOpenChange={setInputPrescriptionOpen}
          orderId={selectedOrder?.orderId}
          customerName={selectedOrder?.customer}
          form={prescriptionForm}
          onFormChange={setPrescriptionForm}
          onSave={handleSavePrescription}
        />

        <RxContactModal
          open={contactOpen}
          onOpenChange={setContactOpen}
          order={selectedOrder}
          contactNote={contactNote}
          onContactNoteChange={setContactNote}
          onSend={handleSendContact}
        />

        <RxApproveModal
          open={approveOpen}
          onOpenChange={setApproveOpen}
          order={selectedOrder}
          onApprove={handleApprovePrescription}
        />
      </div>
    </>
  );
}
