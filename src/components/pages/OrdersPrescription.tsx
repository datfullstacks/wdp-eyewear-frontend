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
import { orderApi, supportApi } from '@/api';
import type { SupportTicketRecord } from '@/api';
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
import { useDetailRoute } from '@/hooks/useDetailRoute';
import { useStatusRealtimeReload } from '@/hooks/useStatusRealtime';
import { toPrescriptionOrder } from '@/lib/orderAdapters';
import { isOperationsPrescriptionOrder } from '@/lib/orderWorkflow';
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
    lensType: form.lensType || '',
    coating: form.coating || '',
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

function buildContactMessage(order: PrescriptionOrder, note: string) {
  const trimmed = note.trim();
  if (trimmed.length > 0) {
    return `[OPS] ${trimmed}`;
  }

  return `[OPS] Don ${order.orderId} can xac nhan them toa kinh truoc khi dua vao gia cong.`;
}

function pickLatestTicketId(tickets: SupportTicketRecord[]) {
  return tickets
    .slice()
    .sort((left, right) => {
      const leftTime = new Date(
        left.lastMessageAt || left.updatedAt || left.createdAt || 0
      ).getTime();
      const rightTime = new Date(
        right.lastMessageAt || right.updatedAt || right.createdAt || 0
      ).getTime();
      return rightTime - leftTime;
    })[0]?.id;
}

export default function OrdersPrescription() {
  const { detailId, openDetail, closeDetail } = useDetailRoute();
  const [orders, setOrders] = useState<PrescriptionOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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
        .filter(isOperationsPrescriptionOrder)
        .map(toPrescriptionOrder)
        .filter((value): value is PrescriptionOrder => value !== null);
      setOrders(mapped);
    } catch {
      setErrorMessage('Khong tai duoc danh sach don prescription cho operations.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useStatusRealtimeReload({
    domains: ['order', 'shipping', 'support'],
    reload: loadOrders,
  });

  useEffect(() => {
    if (!detailId) {
      setDetailOpen(false);
      return;
    }

    const matchedOrder = orders.find((order) => order.id === detailId);
    if (matchedOrder) {
      setSelectedOrder(matchedOrder);
      setDetailOpen(true);
      return;
    }

    if (!isLoading) {
      setSelectedOrder(null);
      setDetailOpen(false);
    }
  }, [detailId, isLoading, orders]);

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
    pendingReview: orders.filter(
      (order) => order.prescriptionStatus === 'pending_review'
    ).length,
    waitingLab: orders.filter((order) => order.workflowStage === 'waiting_lab')
      .length,
    labInProgress: orders.filter((order) =>
      ['lens_processing', 'lens_fitting', 'qc_check'].includes(
        order.workflowStage
      )
    ).length,
    readyForShipping: orders.filter((order) =>
      ['ready_to_pack', 'packing', 'ready_to_ship'].includes(order.workflowStage)
    ).length,
  };

  const handleOpenDetail = (order: PrescriptionOrder) => {
    setSuccessMessage(null);
    openDetail(order.id);
  };

  const handleOpenInputPrescription = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    setSuccessMessage(null);
    setPrescriptionForm(
      order.prescription
        ? { ...order.prescription }
        : { ...emptyPrescriptionForm }
    );
    setInputPrescriptionOpen(true);
  };

  const handleOpenContact = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    setSuccessMessage(null);
    setContactNote('');
    setContactOpen(true);
  };

  const handleOpenApprove = (order: PrescriptionOrder) => {
    setSelectedOrder(order);
    setSuccessMessage(null);
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
      setSuccessMessage('Da cap nhat thong so prescription cho don hang.');
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(error, 'Khong the luu thong so prescription.')
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
      if (
        String(selectedOrder.opsStage || '').trim().toLowerCase() !==
        'waiting_lab'
      ) {
        await orderApi.updateOpsStage(selectedOrder.id, 'waiting_lab');
      }
      await loadOrders();
      setApproveOpen(false);
      setSuccessMessage('Da duyet Rx va chuyen don sang cho vao gia cong.');
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(
          error,
          'Khong the duyet prescription cho don hang nay.'
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
      setSuccessMessage(`Da cap nhat tien do don ${order.orderId}.`);
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(null);
      }
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(error, 'Khong the cap nhat tien do prescription.')
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
      setSuccessMessage(`Da tao van don GHN cho don ${order.orderId}.`);
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(null);
      }
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(error, 'Khong the tao van don GHN.')
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
      setSuccessMessage(`Da dong bo GHN cho don ${order.orderId}.`);
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(null);
      }
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(error, 'Khong the dong bo trang thai GHN.')
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleSendContact = async () => {
    if (!selectedOrder) return;

    try {
      setIsSubmittingAction(true);
      setErrorMessage(null);

      const result = await supportApi.getTickets({
        page: 1,
        limit: 20,
        category: 'prescription',
        orderId: selectedOrder.id,
      });
      const ticketId = pickLatestTicketId(result.items);
      const message = buildContactMessage(selectedOrder, contactNote);

      if (ticketId) {
        await supportApi.replyTicket(ticketId, { message });
      } else {
        await supportApi.createTicket({
          subject: `Prescription clarification for ${selectedOrder.orderId}`,
          message,
          category: 'prescription',
          priority: selectedOrder.priority === 'normal' ? 'normal' : 'high',
          orderId: selectedOrder.id,
        });
      }

      await loadOrders();
      setContactOpen(false);
      setSuccessMessage(
        `Da gui yeu cau xac nhan toa cho don ${selectedOrder.orderId}.`
      );
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(
          error,
          'Khong the gui yeu cau xac nhan prescription.'
        )
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <>
      <Header
        title="Don Prescription"
        subtitle="Queue operations cho review Rx, gia cong trong, QC va ban giao giao van"
      />
      <div className="space-y-6 p-6">
        <RxStatsGrid stats={stats} />

        {successMessage ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
          <div className="w-full sm:max-w-[240px]">
            <SearchBar
              placeholder="Tim theo ma don, ten khach, SDT..."
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
                  aria-label="Bo loc"
                  className="text-foreground/80 hover:text-foreground"
                >
                  <Filter />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Trang thai Rx</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <DropdownMenuRadioItem value="all">Tat ca</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="pending_review">
                    Cho duyet
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="approved">
                    Da duyet
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
            Lam moi
          </Button>
        </div>

        {isLoading ? (
          <p className="text-foreground/70 text-sm">
            Dang tai du lieu don prescription cho operations...
          </p>
        ) : null}

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
          onOpenChange={(open) => {
            setDetailOpen(open);
            if (open) return;
            if (detailId) {
              closeDetail();
              return;
            }
            setSelectedOrder(null);
          }}
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
          onSend={() => {
            void handleSendContact();
          }}
          isSubmitting={isSubmittingAction}
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
