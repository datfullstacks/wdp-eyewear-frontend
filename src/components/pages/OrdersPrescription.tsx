'use client';
import { useCallback, useEffect, useState } from 'react';
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
import { Filter, RefreshCw } from 'lucide-react';
import {
  emptyPrescriptionForm,
  PrescriptionData,
  PrescriptionOrder,
} from '@/types/rxPrescription';
import { Header } from '@/components/organisms/Header';
import {
  RxApproveModal,
  RxContactModal,
  RxDetailModal,
  RxInputModal,
  RxOrderTable,
  RxStatsGrid,
} from '@/components/organisms/rx-prescription';
import { orderApi } from '@/api';
import { toPrescriptionOrder } from '@/lib/orderAdapters';

function buildPrescriptionPayload(form: PrescriptionData) {
  return {
    mode: 'manual' as const,
    isMyopic: true,
    rightEye: {
      sphere: form.sphereRight || '',
      cyl: form.cylinderRight || '',
      axis: form.axisRight || '',
      add: form.addRight || '',
    },
    leftEye: {
      sphere: form.sphereLeft || '',
      cyl: form.cylinderLeft || '',
      axis: form.axisLeft || '',
      add: form.addLeft || '',
    },
    pd: form.pd || '',
    note: form.notes || '',
    attachmentUrls: [],
  };
}

export default function OrdersPrescription() {
  const [orders, setOrders] = useState<PrescriptionOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
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

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await orderApi.getAll({ page: 1, limit: 200 });
      const mapped = result.orders
        .map(toPrescriptionOrder)
        .filter((value): value is PrescriptionOrder => value !== null);
      setOrders(mapped);
    } catch {
      setErrorMessage('Không tải được danh sách đơn prescription.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

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

  const handleSavePrescription = async () => {
    if (!selectedOrder) return;

    const targetItemIds =
      selectedOrder.rxItemIds && selectedOrder.rxItemIds.length > 0
        ? selectedOrder.rxItemIds
        : selectedOrder.primaryRxItemId
          ? [selectedOrder.primaryRxItemId]
          : [];

    if (targetItemIds.length === 0) {
      setInputPrescriptionOpen(false);
      return;
    }

    try {
      setIsSubmittingAction(true);
      await Promise.all(
        targetItemIds.map((itemId) =>
          orderApi.patchItem(selectedOrder.id, itemId, {
            customization: {
              prescription: buildPrescriptionPayload(prescriptionForm),
            },
          })
        )
      );
      await loadOrders();
      setInputPrescriptionOpen(false);
    } catch {
      setErrorMessage('Không thể lưu thông số prescription.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleApprovePrescription = async () => {
    if (!selectedOrder) return;

    try {
      setIsSubmittingAction(true);
      await orderApi.updateStatus(selectedOrder.id, 'processing');
      await loadOrders();
      setApproveOpen(false);
    } catch {
      setErrorMessage('Không thể duyệt prescription cho đơn hàng này.');
    } finally {
      setIsSubmittingAction(false);
    }
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
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              void loadOrders();
            }}
            disabled={isLoading || isSubmittingAction}
          >
            <RefreshCw className="h-4 w-4" />
            Làm mới
          </Button>
        </div>

        {isLoading && (
          <p className="text-foreground/70 text-sm">Đang tải dữ liệu đơn prescription...</p>
        )}
        {!isLoading && errorMessage && (
          <p className="text-destructive text-sm">{errorMessage}</p>
        )}

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
          onSave={() => {
            void handleSavePrescription();
          }}
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
          onApprove={() => {
            void handleApprovePrescription();
          }}
        />
      </div>
    </>
  );
}
