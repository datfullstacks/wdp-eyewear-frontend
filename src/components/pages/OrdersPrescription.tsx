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
import { orderApi } from '@/api';
import type { OrderOpsStage } from '@/api/orders';
import { Header } from '@/components/organisms/Header';
import {
  RxApproveModal,
  RxContactModal,
  RxDetailModal,
  RxInputModal,
  RxOrderTable,
  RxStatsGrid,
} from '@/components/organisms/rx-prescription';
import { useStatusRealtimeReload } from '@/hooks/useStatusRealtime';
import { toPrescriptionOrder } from '@/lib/orderAdapters';
import { canOperationHandlePrescription } from '@/lib/orderWorkflow';
import {
  emptyPrescriptionForm,
  PrescriptionData,
  PrescriptionOrder,
} from '@/types/rxPrescription';

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

function extractApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    const message = response?.data?.message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
}

function getNextPrescriptionOpsStage(
  workflowStage: PrescriptionOrder['workflowStage']
): OrderOpsStage | null {
  switch (workflowStage) {
    case 'waiting_lab':
      return 'lens_processing';
    case 'lens_processing':
      return 'lens_fitting';
    case 'lens_fitting':
      return 'qc_check';
    case 'qc_check':
      return 'ready_to_pack';
    case 'ready_to_pack':
      return 'packing';
    case 'packing':
      return 'ready_to_ship';
    default:
      return null;
  }
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
        .filter(canOperationHandlePrescription)
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

  useStatusRealtimeReload({
    domains: ['order', 'shipping'],
    reload: loadOrders,
  });

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
      setErrorMessage(null);
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
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(
          error,
          'Không thể lưu thông số prescription.'
        )
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleApprovePrescription = async () => {
    if (!selectedOrder) return;

    try {
      setIsSubmittingAction(true);
      setErrorMessage(null);
      if (String(selectedOrder.opsStage || '').trim().toLowerCase() !== 'waiting_lab') {
        await orderApi.updateOpsStage(selectedOrder.id, 'waiting_lab');
      }
      await loadOrders();
      setApproveOpen(false);
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(
          error,
          'Không thể duyệt prescription cho đơn hàng này.'
        )
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleAdvanceWorkflow = async (order: PrescriptionOrder) => {
    const nextOpsStage = getNextPrescriptionOpsStage(order.workflowStage);
    if (!nextOpsStage) return;

    try {
      setIsSubmittingAction(true);
      setErrorMessage(null);
      await orderApi.updateOpsStage(order.id, nextOpsStage);
      await loadOrders();
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(null);
      }
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(error, 'Không thể cập nhật tiến độ prescription.')
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleCreateShipment = async (order: PrescriptionOrder) => {
    try {
      setIsSubmittingAction(true);
      setErrorMessage(null);
      await orderApi.createShipment(order.id);
      await loadOrders();
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(null);
      }
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(error, 'Không thể tạo vận đơn GHN.')
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleSyncShipment = async (order: PrescriptionOrder) => {
    try {
      setIsSubmittingAction(true);
      setErrorMessage(null);
      await orderApi.syncShipment(order.id);
      await loadOrders();
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(null);
      }
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(error, 'Không thể đồng bộ trạng thái GHN.')
      );
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
        subtitle="Review Rx, theo dõi gia công tròng, QC và bàn giao vận chuyển"
      />
      <div className="space-y-6 p-6">
        <RxStatsGrid stats={stats} />

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
          <p className="text-foreground/70 text-sm">
            Đang tải dữ liệu đơn prescription...
          </p>
        )}
        {!isLoading && errorMessage && (
          <p className="text-destructive text-sm">{errorMessage}</p>
        )}

        <RxOrderTable
          orders={filteredOrders}
          onViewDetail={handleOpenDetail}
          onInputPrescription={handleOpenInputPrescription}
          onContact={handleOpenContact}
          onApprove={handleOpenApprove}
          onAdvanceWorkflow={handleAdvanceWorkflow}
          onCreateShipment={handleCreateShipment}
          onSyncShipment={handleSyncShipment}
        />

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
