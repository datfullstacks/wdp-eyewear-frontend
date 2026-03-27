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
import { orderApi, productApi, type ProductDetail } from '@/api';
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
import { useStatusRealtimeReload } from '@/hooks/useStatusRealtime';
import { toPrescriptionOrder } from '@/lib/orderAdapters';
import { canOperationHandlePrescription } from '@/lib/orderWorkflow';
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
  const size = String(variant?.options?.size || variant?.options?.Size || '').trim();
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
      variants.find((variant) => String(variant?._id || '').trim() === variantId) ||
      null;
    if (matchedById) return matchedById;
  }

  const sku = String(item.sku || '').trim().toLowerCase();
  if (sku) {
    const matchedBySku =
      variants.find((variant) => String(variant?.sku || '').trim().toLowerCase() === sku) ||
      null;
    if (matchedBySku) return matchedBySku;
  }

  const normalizedVariant = normalizeVariantKey(item.variant);
  if (!normalizedVariant) return null;

  return (
    variants.find(
      (variant) =>
        normalizeVariantKey(toProductVariantLabel(variant)) === normalizedVariant
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
        warehouseLocation: String(matchedVariant.warehouseLocation || '').trim(),
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

export default function OrdersPrescription() {
  const [orders, setOrders] = useState<PrescriptionOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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

  const hydratePrescriptionOrders = useCallback(async (input: OrderRecord[]) => {
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
  }, []);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await orderApi.getAll({ page: 1, limit: 200 });
      const relevantOrders = result.orders.filter(canOperationHandlePrescription);
      const hydratedOrders = await hydratePrescriptionOrders(relevantOrders);
      const mapped = hydratedOrders
        .map(toPrescriptionOrder)
        .filter((value): value is PrescriptionOrder => value !== null);
      setOrders(mapped);
    } catch {
      setErrorMessage('Không tải được danh sách đơn prescription.');
    } finally {
      setIsLoading(false);
    }
  }, [hydratePrescriptionOrders]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    setSelectedOrder((current) =>
      current ? orders.find((order) => order.id === current.id) || current : null
    );
  }, [orders]);

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
    const matchesOrderDate = isWithinDateRange(
      order.orderDate,
      orderDateFrom,
      orderDateTo
    );
    return matchesSearch && matchesStatus && matchesOrderDate;
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
                        onChange={(event) => setOrderDateFrom(event.target.value)}
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
