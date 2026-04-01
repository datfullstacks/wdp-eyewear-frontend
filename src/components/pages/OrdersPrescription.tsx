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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';
import { orderApi, productApi, supportApi, type ProductDetail } from '@/api';
import type { SupportTicketRecord } from '@/api';
import type { OrderItem, OrderOpsStage, OrderRecord } from '@/api/orders';
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
  const size = String(
    variant?.options?.size || variant?.options?.Size || ''
  ).trim();
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
      variants.find(
        (variant) => String(variant?._id || '').trim() === variantId
      ) || null;
    if (matchedById) return matchedById;
  }

  const sku = String(item.sku || '')
    .trim()
    .toLowerCase();
  if (sku) {
    const matchedBySku =
      variants.find(
        (variant) =>
          String(variant?.sku || '')
            .trim()
            .toLowerCase() === sku
      ) || null;
    if (matchedBySku) return matchedBySku;
  }

  const normalizedVariant = normalizeVariantKey(item.variant);
  if (!normalizedVariant) return null;

  return (
    variants.find(
      (variant) =>
        normalizeVariantKey(toProductVariantLabel(variant)) ===
        normalizedVariant
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
        warehouseLocation: String(
          matchedVariant.warehouseLocation || ''
        ).trim(),
      };
    }),
  }));
}

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
    const response = (error as { response?: { data?: { message?: string } } })
      .response;
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

function isWithinDateRange(
  dateValue: string,
  fromDate: string,
  toDate: string
) {
  if (!fromDate && !toDate) return true;
  const normalized = String(dateValue || '').slice(0, 10);
  if (!normalized) return false;
  if (fromDate && normalized < fromDate) return false;
  if (toDate && normalized > toDate) return false;
  return true;
}

function matchesPrescriptionStageFilter(
  order: PrescriptionOrder,
  filterValue: string
) {
  switch (filterValue) {
    case 'pending_review':
      return order.prescriptionStatus === 'pending_review';
    case 'approved':
      return order.prescriptionStatus === 'approved';
    case 'waiting_lab':
      return order.workflowStage === 'waiting_lab';
    case 'lab_in_progress':
      return ['lens_processing', 'lens_fitting', 'qc_check'].includes(
        order.workflowStage
      );
    case 'ready_for_shipping':
      return ['ready_to_pack', 'packing', 'ready_to_ship'].includes(
        order.workflowStage
      );
    case 'shipping_active':
      return [
        'shipment_created',
        'handover_to_carrier',
        'in_transit',
        'delivery_failed',
        'waiting_redelivery',
        'return_pending',
        'return_in_transit',
        'exception_hold',
      ].includes(order.workflowStage);
    case 'delivered':
      return order.workflowStage === 'delivered';
    case 'returned':
      return order.workflowStage === 'returned';
    default:
      return true;
  }
}

function buildContactMessage(order: PrescriptionOrder, note: string) {
  const trimmed = note.trim();
  if (trimmed.length > 0) {
    return `[OPS] ${trimmed}`;
  }

  return `[OPS] Đơn ${order.orderId} cần xác nhận thêm toa kinh trước khi đưa vào gia công.`;
}

function pickLatestTicketId(tickets: SupportTicketRecord[]) {
  return tickets.slice().sort((left, right) => {
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
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');
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

  const hydratePrescriptionOrders = useCallback(
    async (input: OrderRecord[]) => {
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
    },
    []
  );

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await orderApi.getAll({ page: 1, limit: 200 });
      const relevantOrders = result.orders.filter(
        isOperationsPrescriptionOrder
      );
      const hydratedOrders = await hydratePrescriptionOrders(relevantOrders);
      const mapped = hydratedOrders
        .map(toPrescriptionOrder)
        .filter((value): value is PrescriptionOrder => value !== null);
      setOrders(mapped);
    } catch {
      setErrorMessage(
        'Không tải được danh sách đơn prescription cho operations.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [hydratePrescriptionOrders]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setSelectedOrder((current) =>
      current
        ? orders.find((order) => order.id === current.id) || current
        : null
    );
  }, [orders]);

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
      statusFilter === 'all' ||
      matchesPrescriptionStageFilter(order, statusFilter);
    const matchesOrderDate = isWithinDateRange(
      order.orderDate,
      orderDateFrom,
      orderDateTo
    );
    return matchesSearch && matchesStatus && matchesOrderDate;
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
      ['ready_to_pack', 'packing', 'ready_to_ship'].includes(
        order.workflowStage
      )
    ).length,
    shippingActive: orders.filter((order) =>
      [
        'shipment_created',
        'handover_to_carrier',
        'in_transit',
        'delivery_failed',
        'waiting_redelivery',
        'return_pending',
        'return_in_transit',
        'exception_hold',
      ].includes(order.workflowStage)
    ).length,
    closedFlow: orders.filter((order) =>
      ['delivered', 'returned'].includes(order.workflowStage)
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
      setSuccessMessage('Đã cập nhật thông số prescription cho đơn hàng.');
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(error, 'Không thể lưu thông số prescription.')
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
        String(selectedOrder.opsStage || '')
          .trim()
          .toLowerCase() !== 'waiting_lab'
      ) {
        await orderApi.updateOpsStage(selectedOrder.id, 'waiting_lab');
      }
      await loadOrders();
      setApproveOpen(false);
      setSuccessMessage('Đã duyệt Rx và chuyển đơn sang cho vào gia công.');
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
      setSuccessMessage(`Đã cập nhật tiến độ đơn ${order.orderId}.`);
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(null);
      }
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(
          error,
          'Không thể cập nhật tiến độ prescription.'
        )
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
      setSuccessMessage(`Đã tạo vận đơn GHN cho đơn ${order.orderId}.`);
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
      setSuccessMessage(`Đã đồng bộ GHN cho đơn ${order.orderId}.`);
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
        `Đã gửi yêu cầu xác nhận toa cho đơn ${selectedOrder.orderId}.`
      );
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(
          error,
          'Không thể gửi yêu cầu xác nhận prescription.'
        )
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <>
      <Header
        title="Đơn làm theo thông số"
        subtitle="Các công đoạn trong hàng đợi để review đơn kính (Rx), gia công tròng, kiểm tra chất lượng (QC), và bàn giao cho bộ phận giao vận."
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
              placeholder="Tìm theo mã đơn, tên khách, SDT..."
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
              <DropdownMenuContent
                align="start"
                alignOffset={12}
                sideOffset={8}
                collisionPadding={24}
                className="w-80"
              >
                <DropdownMenuLabel>Trạng thái Rx</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <DropdownMenuRadioItem value="all">
                    Tất cả
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="pending_review">
                    Chờ duyệt
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="approved">
                    Đã duyệt
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="waiting_lab">
                    Cho vao gia cong
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="lab_in_progress">
                    Dang gia cong
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ready_for_shipping">
                    Dong goi / cho van don
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="shipping_active">
                    Dang giao / theo GHN
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="delivered">
                    Da giao
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="returned">
                    Da hoan hang
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <div className="space-y-2 px-2 py-1.5">
                  <div className="text-sm font-semibold text-slate-900">
                    Ngày tạo đơn
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label
                        htmlFor="prescription-order-date-from"
                        className="font-semibold text-slate-900"
                      >
                        Từ ngày
                      </Label>
                      <Input
                        id="prescription-order-date-from"
                        type="date"
                        className="border-slate-300 bg-white text-slate-900 [color-scheme:light] focus-visible:ring-slate-400"
                        value={orderDateFrom}
                        onChange={(event) =>
                          setOrderDateFrom(event.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label
                        htmlFor="prescription-order-date-to"
                        className="font-semibold text-slate-900"
                      >
                        Đến ngày
                      </Label>
                      <Input
                        id="prescription-order-date-to"
                        type="date"
                        className="border-slate-300 bg-white text-slate-900 [color-scheme:light] focus-visible:ring-slate-400"
                        value={orderDateTo}
                        onChange={(event) => setOrderDateTo(event.target.value)}
                      />
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

        {isLoading ? (
          <p className="text-foreground/70 text-sm">
            Đang tải dữ liệu đơn làm theo thông số cho operations...
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
