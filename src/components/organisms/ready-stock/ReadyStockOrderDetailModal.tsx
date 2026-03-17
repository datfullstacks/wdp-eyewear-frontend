'use client';

import axios from 'axios';
import { orderApi } from '@/api';
import type {
  OrderOpsExecutionPatch,
  OrderRecord,
  OrderShippingInfo,
} from '@/api/orders';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  createDefaultReadyStockOpsState,
  createDefaultReadyStockItemState,
  formatCurrencyVnd,
  getReadyStockItemKey,
  getReadyStockWarnings,
  READY_STOCK_OPS_STATUS_LABEL,
  summarizeItems,
  toPaymentCode,
  toInvoiceCode,
} from '@/lib/readyStockOps';
import { useAuthStore } from '@/stores/authStore';
import { useReadyStockOpsStore } from '@/stores/readyStockOpsStore';
import type {
  ReadyStockItemOpsState,
  ReadyStockIssueType,
  ReadyStockOrderOpsState,
  ReadyStockOpsStatus,
} from '@/types/readyStockOps';
import {
  CheckCircle2,
  ChevronDown,
  ClipboardCopy,
  PackageX,
  ShieldAlert,
  Truck,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

function extractApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
}

function formatDateTime(value?: string) {
  if (!value) return '-';
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return '-';
  return dt.toLocaleString('vi-VN', { hour12: false });
}

function opsBadgeType(status: ReadyStockOpsStatus) {
  switch (status) {
    case 'delivered':
    case 'closed':
      return 'success' as const;
    case 'ready_to_ship':
    case 'shipment_created':
    case 'handover_to_carrier':
    case 'in_transit':
      return 'info' as const;
    case 'picking':
    case 'packing':
    case 'waiting_redelivery':
    case 'return_pending':
    case 'return_in_transit':
      return 'warning' as const;
    case 'delivery_failed':
    case 'waiting_customer_info':
    case 'on_hold':
    case 'exception_hold':
    case 'returned':
      return 'error' as const;
    default:
      return 'default' as const;
  }
}

function issueTypeLabel(type: ReadyStockIssueType | null): string {
  if (!type) return '-';
  if (type === 'out_of_stock') return 'Thiếu hàng';
  if (type === 'wrong_sku') return 'Sai SKU';
  if (type === 'damaged_item') return 'Hàng lỗi';
  if (type === 'address_issue') return 'Lỗi địa chỉ';
  if (type === 'shipping_label_error') return 'Lỗi vận đơn';
  return 'Khác';
}

function paymentBadge(order: OrderRecord, paymentFailed: boolean) {
  if (paymentFailed) return { label: 'Thất bại', type: 'error' as const };
  if (order.paymentStatus === 'paid')
    return { label: 'Đã thanh toán', type: 'success' as const };
  if (order.paymentStatus === 'partial')
    return { label: 'Thanh toán 1 phần', type: 'info' as const };
  if (order.paymentStatus === 'cod')
    return { label: 'COD', type: 'default' as const };
  return { label: 'Chờ thanh toán', type: 'warning' as const };
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // ignore
  }
}

function parseAddress(address: string) {
  const parts = String(address || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const addressLine1 = parts[0] || String(address || '').trim();
  const province = parts.length >= 1 ? parts[parts.length - 1]! : '';
  const district = parts.length >= 2 ? parts[parts.length - 2]! : '';
  const ward = parts.length >= 3 ? parts[parts.length - 3]! : '';

  return {
    addressLine1,
    addressLine2: '',
    ward,
    district,
    province,
    country: 'VN',
  };
}

type ConfirmActionState = {
  title: string;
  description: string;
  actionLabel: string;
  onConfirm: () => Promise<void>;
};
export function ReadyStockOrderDetailModal({
  open,
  onOpenChange,
  order,
  onReload,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderRecord | null;
  onReload: () => Promise<void> | void;
}) {
  const meName = useAuthStore((s) => s.user?.name) || 'Operations';

  const ops = useReadyStockOpsStore((s) =>
    order ? s.byOrderId[order.id] : undefined
  );
  const upsertOps = useReadyStockOpsStore((s) => s.upsert);
  const setAssignee = useReadyStockOpsStore((s) => s.setAssignee);
  const setStatus = useReadyStockOpsStore((s) => s.setStatus);
  const setTracking = useReadyStockOpsStore((s) => s.setTracking);
  const setHold = useReadyStockOpsStore((s) => s.setHold);
  const setItemState = useReadyStockOpsStore((s) => s.setItemState);
  const reportIssue = useReadyStockOpsStore((s) => s.reportIssue);

  const resolvedOps = useMemo(() => {
    if (!order) return null;
    return ops ?? createDefaultReadyStockOpsState(order);
  }, [ops, order]);

  const [shippingInfo, setShippingInfo] = useState<OrderShippingInfo | null>(
    null
  );
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingSubmitting, setShippingSubmitting] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [itemSavingKey, setItemSavingKey] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<ConfirmActionState | null>(
    null
  );
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (!order) return;
    if (!ops) {
      upsertOps(order.id, createDefaultReadyStockOpsState(order));
      return;
    }
    const missingItemStates: Record<
      string,
      ReturnType<typeof createDefaultReadyStockItemState>
    > = {};
    order.items.forEach((item, idx) => {
      const key = getReadyStockItemKey(order.id, item, idx);
      if (!ops.itemStates?.[key])
        missingItemStates[key] = createDefaultReadyStockItemState(item);
    });
    if (Object.keys(missingItemStates).length > 0) {
      upsertOps(order.id, {
        itemStates: {
          ...(ops.itemStates || {}),
          ...missingItemStates,
        },
      });
    }
  }, [open, order, ops, upsertOps]);

  useEffect(() => {
    if (!open || !order) return;

    let cancelled = false;
    setShippingError(null);
    setShippingLoading(true);

    void orderApi
      .getShipping(order.id)
      .then((info) => {
        if (cancelled) return;
        setShippingInfo(info);
      })
      .catch(() => {
        if (cancelled) return;
        setShippingInfo(null);
        setShippingError('Không tải được thông tin GHN cho đơn này.');
      })
      .finally(() => {
        if (!cancelled) setShippingLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, order]);

  useEffect(() => {
    if (open) return;
    setConfirmAction(null);
    setConfirmSubmitting(false);
  }, [open]);
  if (!order || !resolvedOps) return null;

  const invoice = toInvoiceCode(order);
  const paymentCode = toPaymentCode(order);
  const summary = summarizeItems(order);
  const warnings = getReadyStockWarnings(order, resolvedOps);

  const addr = parseAddress(order.customerAddress);
  const email =
    (String(order.customerPhone || '').replace(/\D/g, '') ||
      String(order.code || '').replace(/\s/g, '')) + '@example.com';

  const allPicked = order.items.every((item, idx) => {
    const key = getReadyStockItemKey(order.id, item, idx);
    return Boolean(resolvedOps.itemStates?.[key]?.picked);
  });

  const latestShipment =
    shippingInfo?.shipment || (order.shipment ? { ...order.shipment } : null);
  const trackingCode = String(
    latestShipment?.orderCode ||
      latestShipment?.trackingCode ||
      resolvedOps.trackingCode ||
      ''
  ).trim();
  const hasShipment = Boolean(trackingCode);
  const canCreateShipment = Boolean(shippingInfo?.permissions.create_shipment);
  const canSyncShipment = Boolean(shippingInfo?.permissions.sync_shipment);
  const canHandover =
    resolvedOps.opsStatus === 'shipment_created' && hasShipment;

  const payment = paymentBadge(order, resolvedOps.paymentFailed);

  async function handleStartPicking() {
    if (!order || !resolvedOps) return;
    setShippingError(null);
    try {
      await orderApi.updateOpsStage(order.id, 'picking');
      setAssignee(order.id, resolvedOps.assignee || meName);
      setStatus(order.id, 'picking');
      await onReload();
    } catch {
      setShippingError('Không thể nhận xử lý đơn hàng.');
    }
  }

  async function handleConfirmPickedStage() {
    if (!order || !resolvedOps) return;
    setShippingError(null);
    try {
      await orderApi.updateOpsStage(order.id, 'packing');
      setAssignee(order.id, resolvedOps.assignee || meName);
      setStatus(order.id, 'packing');
      await onReload();
    } catch {
      setShippingError('Không thể xác nhận đã lấy đủ sản phẩm.');
    }
  }

  async function handleConfirmPackedStage() {
    if (!order || !resolvedOps) return;
    setShippingError(null);
    try {
      await orderApi.updateOpsStage(order.id, 'ready_to_ship');
      setAssignee(order.id, resolvedOps.assignee || meName);
      setStatus(order.id, 'ready_to_ship');
      await onReload();
    } catch {
      setShippingError('Không thể xác nhận đóng gói đơn hàng.');
    }
  }

  async function handleConfirmHandoverStage() {
    if (!order || !resolvedOps) return;
    setShippingError(null);
    try {
      await orderApi.updateOpsStage(order.id, 'handover_to_carrier');
      setAssignee(order.id, resolvedOps.assignee || meName);
      setStatus(order.id, 'handover_to_carrier');
      await onReload();
    } catch {
      setShippingError('Không thể cập nhật đã bàn giao cho GHN.');
    }
  }

  async function persistOpsExecutionPatch(
    patch: OrderOpsExecutionPatch,
    errorMessage = 'Không thể lưu dữ liệu vận hành.'
  ) {
    if (!order) return null;
    setShippingError(null);
    try {
      const updated = await orderApi.updateOpsExecution(order.id, patch);
      upsertOps(order.id, createDefaultReadyStockOpsState(updated));
      return updated;
    } catch {
      setShippingError(errorMessage);
      return null;
    }
  }

  async function handleAssignToMe() {
    if (!order) return;
    setAssignee(order.id, meName);
    await persistOpsExecutionPatch(
      { assignee: meName },
      'Không thể gắn đơn cho bạn trên backend.'
    );
  }

  async function handleTogglePicked(itemKey: string, nextPicked: boolean) {
    const currentOps = resolvedOps;
    if (!order || !currentOps) return;
    setItemSavingKey(itemKey);
    const updated = await persistOpsExecutionPatch(
      {
        itemStates: {
          [itemKey]: {
            picked: nextPicked,
          },
        },
      },
      'Không thể lưu trạng thái lấy hàng.'
    );

    try {
      if (!updated || !nextPicked || currentOps.opsStatus !== 'picking') {
        return;
      }

      const nextAllPicked = order.items.every((item, idx) => {
        const currentKey = getReadyStockItemKey(order.id, item, idx);
        if (currentKey === itemKey) return nextPicked;
        return Boolean(currentOps.itemStates?.[currentKey]?.picked);
      });

      if (!nextAllPicked) {
        return;
      }

      await orderApi.updateOpsStage(order.id, 'packing');
      setAssignee(order.id, currentOps.assignee || meName);
      setStatus(order.id, 'packing');
      await onReload();
    } catch {
      setShippingError('Đã lấy đủ hàng nhưng không thể chuyển sang đóng gói.');
    } finally {
      setItemSavingKey(null);
    }
  }

  async function handleSaveItemPatch(
    itemKey: string,
    patch: Partial<ReadyStockItemOpsState>,
    errorMessage = 'Không thể lưu thông tin sản phẩm.'
  ) {
    await persistOpsExecutionPatch(
      {
        itemStates: {
          [itemKey]: patch,
        },
      },
      errorMessage
    );
  }

  async function handleReportItemIssue(
    itemKey: string,
    issueType: ReadyStockIssueType,
    note: string
  ) {
    if (!order) return;
    const holdStage =
      issueType === 'address_issue' ? 'waiting_customer_info' : 'on_hold';

    await persistOpsExecutionPatch(
      {
        holdReason: issueType === 'address_issue' ? 'address' : 'stock',
        holdNote: note,
        issueType,
        issueNote: note,
        itemStates: {
          [itemKey]: {
            issueType,
            issueNote: note,
          },
        },
      },
      'Không thể lưu lỗi sản phẩm trên backend.'
    );

    try {
      await orderApi.updateOpsStage(order.id, holdStage);
      await onReload();
    } catch {
      setShippingError('Không thể chuyển đơn sang trạng thái hold.');
    }
  }

  async function handleCreateShipment() {
    if (!order) return;
    setShippingSubmitting(true);
    setShippingError(null);
    try {
      const result = await orderApi.createShipment(order.id);
      setShippingInfo(result);
      const nextTrackingCode = String(
        result.shipment?.orderCode || result.shipment?.trackingCode || ''
      ).trim();
      if (nextTrackingCode) {
        setTracking(
          order.id,
          result.shipment?.provider || 'ghn',
          nextTrackingCode
        );
      }
      await onReload();
    } catch (error) {
      setShippingError(
        extractApiErrorMessage(error, 'Không thể tạo vận đơn GHN.')
      );
    } finally {
      setShippingSubmitting(false);
    }
  }

  async function handleSyncShipment() {
    if (!order) return;
    setShippingSubmitting(true);
    setShippingError(null);
    try {
      const result = await orderApi.syncShipment(order.id);
      setShippingInfo(result);
      const nextTrackingCode = String(
        result.shipment?.orderCode || result.shipment?.trackingCode || ''
      ).trim();
      if (nextTrackingCode) {
        setTracking(
          order.id,
          result.shipment?.provider || 'ghn',
          nextTrackingCode
        );
      }
      await onReload();
    } catch (error) {
      setShippingError(extractApiErrorMessage(error, 'Không thể đồng bộ GHN.'));
    } finally {
      setShippingSubmitting(false);
    }
  }

  function openConfirmation(action: ConfirmActionState) {
    setConfirmAction(action);
  }

  async function handleConfirmAction() {
    if (!confirmAction || confirmSubmitting) return;

    const nextAction = confirmAction;
    setConfirmSubmitting(true);
    try {
      await nextAction.onConfirm();
      setConfirmAction(null);
    } finally {
      setConfirmSubmitting(false);
    }
  }

  function openStartPickingConfirm() {
    openConfirmation({
      title: 'Xác nhận nhận xử lý',
      description: `Bạn có chắc muốn nhận xử lý đơn ${invoice} và chuyển sang bước lấy hàng?`,
      actionLabel: 'Nhận xử lý',
      onConfirm: handleStartPicking,
    });
  }

  function openAssignToMeConfirm() {
    openConfirmation({
      title: 'Xác nhận gắn cho tôi',
      description: `Bạn có chắc muốn nhận phụ trách đơn ${invoice}?`,
      actionLabel: 'Gắn cho tôi',
      onConfirm: handleAssignToMe,
    });
  }

  function openTogglePickedConfirm(
    itemKey: string,
    itemName: string,
    nextPicked: boolean
  ) {
    const verb = nextPicked
      ? 'đánh dấu đã lấy hàng'
      : 'bỏ trạng thái đã lấy hàng';
    openConfirmation({
      title: nextPicked
        ? 'Xác nhận đánh dấu đã lấy hàng'
        : 'Xác nhận bỏ lấy hàng',
      description: `Bạn có chắc muốn ${verb} chờ sản phẩm "${itemName}" trong đơn ${invoice}?`,
      actionLabel: nextPicked ? 'Đánh dấu đã lấy' : 'Bỏ lấy hàng',
      onConfirm: () => handleTogglePicked(itemKey, nextPicked),
    });
  }

  function openConfirmPackedStageConfirm() {
    openConfirmation({
      title: 'Xác nhận da dong goi',
      description: `Bạn có chắc muốn xác nhận đơn ${invoice} đã đóng gói và sẵn sàng tạo vận đơn?`,
      actionLabel: 'Xác nhận đóng gói',
      onConfirm: handleConfirmPackedStage,
    });
  }

  function openCreateShipmentConfirm() {
    openConfirmation({
      title: 'Xác nhận tạo vận đơn GHN',
      description: `Bạn có chắc muốn tạo vận đơn GHN cho đơn ${invoice}?`,
      actionLabel: 'Tạo vận đơn',
      onConfirm: handleCreateShipment,
    });
  }

  function warningLabel(
    key: ReturnType<typeof getReadyStockWarnings>[number]
  ): string {
    switch (key) {
      case 'missing_address':
        return 'Địa chỉ thiếu/không rõ';
      case 'payment_pending':
        return 'Chờ thanh toán';
      case 'payment_failed':
        return 'Thanh toán thất bại';
      case 'special_note':
        return 'Có ghi chú';
      case 'item_issue':
        return 'Có sản phẩm thiếu/lỗi';
      case 'order_issue':
        return 'Có lỗi/ngoại lệ';
      case 'hold':
        return 'Đang hold';
      default:
        return key;
    }
  }

  const canStartPicking = resolvedOps.opsStatus === 'pending_operations';
  const canConfirmPicked = resolvedOps.opsStatus === 'picking';
  const canConfirmPacked = resolvedOps.opsStatus === 'packing';
  const canConfirmHandover = resolvedOps.opsStatus === 'shipment_created';
  const hasAnyStatusAction =
    canStartPicking ||
    canConfirmPicked ||
    canConfirmPacked ||
    canConfirmHandover;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground max-h-[85vh] w-[96vw] max-w-[980px] overflow-y-auto p-4 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết đơn có sẵn • {order.code}</DialogTitle>
        </DialogHeader>

        {/* Header */}
        <div className="border-border bg-muted/10 space-y-3 rounded-xl border p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="text-foreground font-mono text-sm">
                {paymentCode}
              </div>
              <div className="text-foreground font-mono text-sm">{invoice}</div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status="info">Sales: Đã duyệt</StatusBadge>
                <StatusBadge status={opsBadgeType(resolvedOps.opsStatus)}>
                  Vận hành:{' '}
                  {READY_STOCK_OPS_STATUS_LABEL[resolvedOps.opsStatus]}
                </StatusBadge>
                <StatusBadge status={payment.type}>
                  Thanh toán: {payment.label}
                </StatusBadge>
                <StatusBadge status="default">
                  Loại: Đơn có sẵn
                </StatusBadge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!resolvedOps.assignee && (
                <Button
                  onClick={() => {
                    void openStartPickingConfirm();
                  }}
                  title="Nhận đơn để bắt đầu xử lý"
                >
                  Nhận xử lý
                </Button>
              )}
              {resolvedOps.assignee && resolvedOps.assignee !== meName && (
                <Button
                  variant="outline"
                  onClick={() => {
                    void openAssignToMeConfirm();
                  }}
                >
                  Gán cho tôi
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="gap-2">
                    Duyệt trạng thái
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Chuyển bước</DropdownMenuLabel>

                  {!hasAnyStatusAction && (
                    <DropdownMenuItem disabled>
                      Không có thao tác phù hợp với trạng thái hiện tại.
                    </DropdownMenuItem>
                  )}

                  {canStartPicking && (
                    <DropdownMenuItem
                      onClick={() => {
                        void openStartPickingConfirm();
                      }}
                      className="gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Bắt đầu lấy hàng
                    </DropdownMenuItem>
                  )}

                  {canConfirmPicked && (
                    <DropdownMenuItem
                      disabled={!allPicked}
                      onClick={() => {
                        void handleConfirmPickedStage();
                      }}
                      className="gap-2"
                      title={
                        !allPicked ? 'Cần pick đủ tất cả sản phẩm trước' : ''
                      }
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Xác nhận đã lấy đủ
                    </DropdownMenuItem>
                  )}

                  {canConfirmPacked && (
                    <DropdownMenuItem
                      onClick={() => {
                        void openConfirmPackedStageConfirm();
                      }}
                      className="gap-2"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Xác nhận đã đóng gói
                    </DropdownMenuItem>
                  )}

                  {canConfirmHandover && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={!canHandover}
                        onClick={() => {
                          void handleConfirmHandoverStage();
                        }}
                        className="gap-2"
                        title={
                          !canHandover ? 'Cần có tracking trước khi bàn giao' : ''
                        }
                      >
                        <Truck className="h-4 w-4" />
                        Bàn giao vận chuyển
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Tổng tiền</Label>
              <div className="text-foreground text-lg font-bold">
                {formatCurrencyVnd(order.total)}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Ngày tạo</Label>
              <div className="text-foreground text-sm">
                {formatDateTime(order.createdAt)}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Phụ trách</Label>
              <div className="text-foreground text-sm">
                {resolvedOps.assignee || 'Chưa nhận'}
              </div>
            </div>
          </div>

          {warnings.length > 0 && (
            <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-3 text-sm">
              <div className="text-destructive flex items-center gap-2 font-semibold">
                <ShieldAlert className="h-4 w-4" />
                Cảnh báo cần chú ý
              </div>
              <div className="text-foreground mt-2 text-sm">
                {warnings.map((w) => (
                  <div key={w}>- {warningLabel(w)}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-flow-row-dense lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="border-border rounded-xl border p-4">
              <div className="text-foreground mb-3 font-semibold">
                Thông tin duyệt Sales
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="space-y-1">
                  <Label>Sales duyệt</Label>
                  <div className="text-sm font-semibold">
                    {formatDateTime(resolvedOps.salesApprovedAt)}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Duyệt bởi</Label>
                  <div className="text-sm font-semibold">
                    {resolvedOps.salesApprovedBy || '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recipient */}

          <div className="lg:col-span-2">
            <div className="border-border rounded-xl border p-4">
              <div className="text-foreground mb-3 font-semibold">
                Thông tin người nhận
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label>Họ tên</Label>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">
                      {order.customerName || '-'}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyText(order.customerName || '')}
                    >
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Số điện thoại</Label>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">
                      {order.customerPhone || '-'}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyText(order.customerPhone || '')}
                    >
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Email (mẫu)</Label>
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold">{email}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyText(email)}
                    >
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-3">
                  <Label>Địa chỉ đầy đủ</Label>
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-foreground text-sm whitespace-pre-wrap">
                      {order.customerAddress || '-'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyText(order.customerAddress || '')}
                      >
                        <ClipboardCopy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          reportIssue(
                            order.id,
                            'address_issue',
                            `Địa chỉ cần bổ sung/kiểm tra lại: ${order.customerAddress || '-'}`
                          )
                        }
                      >
                        Báo lỗi địa chỉ
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>Địa chỉ dòng 1</Label>
                  <div className="text-sm font-semibold">
                    {addr.addressLine1 || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Địa chỉ dòng 2</Label>
                  <div className="text-sm font-semibold">
                    {addr.addressLine2 || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Phường/xã</Label>
                  <div className="text-sm font-semibold">
                    {addr.ward || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Quận/huyện</Label>
                  <div className="text-sm font-semibold">
                    {addr.district || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Tỉnh/thành</Label>
                  <div className="text-sm font-semibold">
                    {addr.province || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Quốc gia</Label>
                  <div className="text-sm font-semibold">{addr.country}</div>
                </div>

                <div className="space-y-1 sm:col-span-3">
                  <Label>Ghi chú giao hàng</Label>
                  <div className="text-foreground text-sm whitespace-pre-wrap">
                    {order.note || '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="lg:order-3 lg:col-span-2">
            <div className="border-border rounded-xl border p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="text-foreground font-semibold">
                  Danh sách sản phẩm cần xử lý
                </div>
                <div className="text-foreground/90 text-xs">
                  {summary.totalItems} sản phẩm •{' '}
                  {Object.entries(summary.byType)
                    .map(([t, n]) => `${n} ${t}`)
                    .join(', ')}
                </div>
              </div>

              <div className="space-y-2">
                {order.items.map((item, idx) => {
                  const key = getReadyStockItemKey(order.id, item, idx);
                  const state = resolvedOps.itemStates?.[key];
                  const picked = Boolean(state?.picked);
                  const issueType = state?.issueType || null;
                  const location = state?.warehouseLocation || '';
                  const internalNote = state?.internalNote || '';
                  const issueNote = state?.issueNote || '';

                  return (
                    <div
                      key={key}
                      className="border-border rounded-lg border p-3"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="text-foreground truncate font-semibold">
                              {item.name}
                            </div>
                            {picked ? (
                              <StatusBadge status="success">
                                Đã pick
                              </StatusBadge>
                            ) : (
                              <StatusBadge status="warning">
                                Chưa lấy hàng
                              </StatusBadge>
                            )}
                            {issueType && (
                              <StatusBadge status="error">
                                Lỗi: {issueTypeLabel(issueType)}
                              </StatusBadge>
                            )}
                          </div>
                          <div className="text-foreground/90 text-xs">
                            Loại: {item.type || 'other'} • Biến thể:{' '}
                            {item.variant} • SL: {item.quantity}
                          </div>
                          <div className="text-foreground/90 text-xs">
                            Đơn giá: {formatCurrencyVnd(item.unitPrice)} • Thành
                            tiền: {formatCurrencyVnd(item.lineTotal)}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            variant={picked ? 'secondary' : 'outline'}
                            size="sm"
                            onClick={() => {
                              void openTogglePickedConfirm(
                                key,
                                item.name,
                                !picked
                              );
                            }}
                            disabled={itemSavingKey === key}
                          >
                            {itemSavingKey === key
                              ? 'Đang lưu...'
                              : picked
                                ? 'Bỏ lấy hàng'
                                : 'Đánh dấu đã lấy hàng'}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setItemState(order.id, key, {
                                issueType:
                                  'out_of_stock' as ReadyStockIssueType,
                                issueNote: `Thiếu hàng: ${item.name}`,
                              });
                              setHold(
                                order.id,
                                'stock',
                                `Thiếu hàng: ${item.name}`
                              );
                              void handleReportItemIssue(
                                key,
                                'out_of_stock',
                                `Out of stock: ${item.name}`
                              );
                            }}
                            className="gap-1"
                          >
                            <PackageX className="h-4 w-4" />
                            Báo thiếu hàng
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setItemState(order.id, key, {
                                issueType:
                                  'damaged_item' as ReadyStockIssueType,
                                issueNote: `Hàng lỗi: ${item.name}`,
                              });
                              setHold(
                                order.id,
                                'stock',
                                `Hàng lỗi cần xử lý: ${item.name}`
                              );
                              void handleReportItemIssue(
                                key,
                                'damaged_item',
                                `Damaged item: ${item.name}`
                              );
                            }}
                          >
                            Báo hàng lỗi
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                          <Label>Vị trí kho / kho xử lý (mẫu)</Label>
                          <Input
                            value={location}
                            onChange={(e) =>
                              setItemState(order.id, key, {
                                warehouseLocation: e.target.value,
                              })
                            }
                            onBlur={() => {
                              void handleSaveItemPatch(
                                key,
                                { warehouseLocation: location },
                                'Không thể lưu vị trí kho của sản phẩm.'
                              );
                            }}
                            placeholder="VD: KHO-HCM-FRAME-A1"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label>Ghi chú nội bộ item</Label>
                          <Input
                            value={internalNote}
                            onChange={(e) =>
                              setItemState(order.id, key, {
                                internalNote: e.target.value,
                              })
                            }
                            onBlur={() => {
                              void handleSaveItemPatch(
                                key,
                                { internalNote },
                                'Không thể lưu ghi chú sản phẩm.'
                              );
                            }}
                            placeholder="Ghi chú cho Ops (không gửi khách)..."
                          />
                        </div>
                        {issueType && (
                          <div className="space-y-1 sm:col-span-3">
                            <Label>Chi tiết lỗi</Label>
                            <Textarea
                              value={issueNote}
                              onChange={(e) =>
                                setItemState(order.id, key, {
                                  issueNote: e.target.value,
                                })
                              }
                              onBlur={() => {
                                void handleSaveItemPatch(
                                  key,
                                  { issueNote },
                                  'Không thể lưu chi tiết lỗi sản phẩm.'
                                );
                              }}
                              rows={2}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:order-4 lg:col-span-1">
            <div className="border-border rounded-xl border p-4 lg:h-full">
              <div className="text-foreground mb-3 font-semibold">
                Vận đơn GHN
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="space-y-1">
                  <Label>Đơn vị VC</Label>
                  <div className="text-sm font-semibold">
                    GHN - Giao Hàng Nhanh
                  </div>
                </div>
                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                  <Label>Mã vận đơn</Label>
                  <div className="font-mono text-sm">{trackingCode || '-'}</div>
                </div>
                <div className="space-y-1">
                  <Label>Trạng thái GHN</Label>
                  <div className="text-sm font-semibold">
                    {latestShipment?.latestStatus ||
                      latestShipment?.state ||
                      '-'}
                  </div>
                </div>
                <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                  <Label>Dịch vụ</Label>
                  <div className="text-sm font-semibold">
                    {latestShipment?.serviceName || 'GHN'}
                  </div>
                </div>
              </div>
              {shippingError && (
                <div className="text-destructive mt-3 text-sm">
                  {shippingError}
                </div>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    void openCreateShipmentConfirm();
                  }}
                  disabled={
                    shippingLoading || shippingSubmitting || !canCreateShipment
                  }
                >
                  {shippingSubmitting && !hasShipment
                    ? 'Đang tạo...'
                    : 'Tạo vận đơn GHN'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    void handleSyncShipment();
                  }}
                  disabled={
                    shippingLoading || shippingSubmitting || !canSyncShipment
                  }
                >
                  {shippingSubmitting && hasShipment
                    ? 'Đang đồng bộ...'
                    : 'Đồng bộ GHN'}
                </Button>
                {trackingCode && (
                  <Button
                    variant="ghost"
                    onClick={() => copyText(trackingCode)}
                    className="gap-2"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    Sao chép mã
                  </Button>
                )}
              </div>
            </div>

          </div>

          <div className="lg:order-5 lg:col-span-3">
            <div className="border-border rounded-xl border p-4">
              <div className="text-foreground mb-3 font-semibold">
                Ghi chú nội bộ (Ops)
              </div>
              <Textarea
                value={resolvedOps.internalNote || ''}
                onChange={(e) =>
                  upsertOps(order.id, { internalNote: e.target.value })
                }
                onBlur={() => {
                  void persistOpsExecutionPatch(
                    { internalNote: resolvedOps.internalNote || '' },
                    'Không thể lưu ghi chú vận hành.'
                  );
                }}
                placeholder="Ghi chú vận hành, checklist, lưu ý đóng gói..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
      <AlertDialog
        open={Boolean(confirmAction)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !confirmSubmitting) {
            setConfirmAction(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={confirmSubmitting}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmSubmitting}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmAction();
              }}
            >
              {confirmSubmitting
                ? 'Dang xu ly...'
                : confirmAction?.actionLabel || 'Xac nhan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
