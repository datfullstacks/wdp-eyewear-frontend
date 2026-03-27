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
import { getCustomerShippingStatusMeta } from '@/lib/customerOrderStatus';
import {
  createDefaultReadyStockOpsState,
  createDefaultReadyStockItemState,
  formatCurrencyVnd,
  getReadyStockItemKey,
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
  if (type === 'out_of_stock') return 'Thi\u1ebfu h\u00e0ng';
  if (type === 'wrong_sku') return 'Sai SKU';
  if (type === 'damaged_item') return 'H\u00e0ng l\u1ed7i';
  if (type === 'address_issue') return 'L\u1ed7i \u0111\u1ecba ch\u1ec9';
  if (type === 'shipping_label_error') return 'L\u1ed7i v\u1eadn \u0111\u01a1n';
  return 'Kh\u00e1c';
}

function paymentBadge(order: OrderRecord, paymentFailed: boolean) {
  if (paymentFailed)
    return { label: 'Th\u1ea5t b\u1ea1i', type: 'error' as const };
  if (order.paymentStatus === 'paid')
    return { label: '\u0110\u00e3 thanh to\u00e1n', type: 'success' as const };
  if (order.paymentStatus === 'partial')
    return { label: 'Thanh to\u00e1n 1 ph\u1ea7n', type: 'info' as const };
  if (order.paymentStatus === 'cod')
    return { label: 'COD', type: 'default' as const };
  return { label: 'Ch\u1edd thanh to\u00e1n', type: 'warning' as const };
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
        setShippingError(
          'Kh\u00f4ng t\u1ea3i \u0111\u01b0\u1ee3c th\u00f4ng tin GHN cho \u0111\u01a1n n\u00e0y.'
        );
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
  const orderSuppliers = Array.from(
    new Set(
      order.items
        .map((item) => item.supplier)
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    )
  );
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
  const shippingStatusMeta = getCustomerShippingStatusMeta({
    shipment: latestShipment || undefined,
    opsStage: order.opsStage,
    rawStatus: order.rawStatus,
  });
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
      setShippingError(
        'Kh\u00f4ng th\u1ec3 nh\u1eadn x\u1eed l\u00fd \u0111\u01a1n h\u00e0ng.'
      );
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
      setShippingError(
        'Kh\u00f4ng th\u1ec3 x\u00e1c nh\u1eadn \u0111\u00e3 l\u1ea5y \u0111\u1ee7 s\u1ea3n ph\u1ea9m.'
      );
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
      setShippingError(
        'Kh\u00f4ng th\u1ec3 x\u00e1c nh\u1eadn \u0111\u00f3ng g\u00f3i \u0111\u01a1n h\u00e0ng.'
      );
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
      setShippingError(
        'Kh\u00f4ng th\u1ec3 c\u1eadp nh\u1eadt \u0111\u00e3 b\u00e0n giao cho GHN.'
      );
    }
  }

  async function persistOpsExecutionPatch(
    patch: OrderOpsExecutionPatch,
    errorMessage = 'Kh\u00f4ng th\u1ec3 l\u01b0u d\u1eef li\u1ec7u v\u1eadn h\u00e0nh.'
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
      'Kh\u00f4ng th\u1ec3 g\u00e1n \u0111\u01a1n cho b\u1ea1n tr\u00ean backend.'
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
      'Kh\u00f4ng th\u1ec3 l\u01b0u tr\u1ea1ng th\u00e1i l\u1ea5y h\u00e0ng.'
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
      setShippingError(
        '\u0110\u00e3 l\u1ea5y \u0111\u1ee7 h\u00e0ng nh\u01b0ng kh\u00f4ng th\u1ec3 chuy\u1ec3n sang \u0111\u00f3ng g\u00f3i.'
      );
    } finally {
      setItemSavingKey(null);
    }
  }

  async function handleSaveItemPatch(
    itemKey: string,
    patch: Partial<ReadyStockItemOpsState>,
    errorMessage = 'Kh\u00f4ng th\u1ec3 l\u01b0u th\u00f4ng tin s\u1ea3n ph\u1ea9m.'
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
      'Kh\u00f4ng th\u1ec3 l\u01b0u l\u1ed7i s\u1ea3n ph\u1ea9m tr\u00ean backend.'
    );

    try {
      await orderApi.updateOpsStage(order.id, holdStage);
      await onReload();
    } catch {
      setShippingError(
        'Kh\u00f4ng th\u1ec3 chuy\u1ec3n \u0111\u01a1n sang tr\u1ea1ng th\u00e1i hold.'
      );
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
        extractApiErrorMessage(
          error,
          'Kh\u00f4ng th\u1ec3 t\u1ea1o v\u1eadn \u0111\u01a1n GHN.'
        )
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
      setShippingError(
        extractApiErrorMessage(
          error,
          'Kh\u00f4ng th\u1ec3 \u0111\u1ed3ng b\u1ed9 GHN.'
        )
      );
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
      title: 'X\u00e1c nh\u1eadn nh\u1eadn x\u1eed l\u00fd',
      description: `B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n nh\u1eadn x\u1eed l\u00fd \u0111\u01a1n ${invoice} v\u00e0 chuy\u1ec3n sang b\u01b0\u1edbc l\u1ea5y h\u00e0ng?`,
      actionLabel: 'Nh\u1eadn x\u1eed l\u00fd',
      onConfirm: handleStartPicking,
    });
  }

  function openAssignToMeConfirm() {
    openConfirmation({
      title: 'X\u00e1c nh\u1eadn g\u00e1n cho t\u00f4i',
      description: `B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n nh\u1eadn ph\u1ee5 tr\u00e1ch \u0111\u01a1n ${invoice}?`,
      actionLabel: 'G\u00e1n cho t\u00f4i',
      onConfirm: handleAssignToMe,
    });
  }

  function openTogglePickedConfirm(
    itemKey: string,
    itemName: string,
    nextPicked: boolean
  ) {
    const verb = nextPicked
      ? '\u0111\u00e1nh d\u1ea5u \u0111\u00e3 l\u1ea5y h\u00e0ng'
      : 'b\u1ecf tr\u1ea1ng th\u00e1i \u0111\u00e3 l\u1ea5y h\u00e0ng';
    openConfirmation({
      title: nextPicked
        ? 'X\u00e1c nh\u1eadn \u0111\u00e1nh d\u1ea5u \u0111\u00e3 l\u1ea5y h\u00e0ng'
        : 'X\u00e1c nh\u1eadn b\u1ecf l\u1ea5y h\u00e0ng',
      description: `B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n ${verb} cho s\u1ea3n ph\u1ea9m "${itemName}" trong \u0111\u01a1n ${invoice}?`,
      actionLabel: nextPicked
        ? '\u0110\u00e1nh d\u1ea5u \u0111\u00e3 l\u1ea5y'
        : 'B\u1ecf l\u1ea5y h\u00e0ng',
      onConfirm: () => handleTogglePicked(itemKey, nextPicked),
    });
  }

  function openConfirmPackedStageConfirm() {
    openConfirmation({
      title: 'X\u00e1c nh\u1eadn \u0111\u00e3 \u0111\u00f3ng g\u00f3i',
      description: `B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n x\u00e1c nh\u1eadn \u0111\u01a1n ${invoice} \u0111\u00e3 \u0111\u00f3ng g\u00f3i v\u00e0 s\u1eb5n s\u00e0ng t\u1ea1o v\u1eadn \u0111\u01a1n?`,
      actionLabel: 'X\u00e1c nh\u1eadn \u0111\u00f3ng g\u00f3i',
      onConfirm: handleConfirmPackedStage,
    });
  }

  function openCreateShipmentConfirm() {
    openConfirmation({
      title: 'X\u00e1c nh\u1eadn t\u1ea1o v\u1eadn \u0111\u01a1n GHN',
      description: `B\u1ea1n c\u00f3 ch\u1eafc mu\u1ed1n t\u1ea1o v\u1eadn \u0111\u01a1n GHN cho \u0111\u01a1n ${invoice}?`,
      actionLabel: 'T\u1ea1o v\u1eadn \u0111\u01a1n',
      onConfirm: handleCreateShipment,
    });
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
          <DialogTitle>
            {'Chi ti\u1ebft \u0111\u01a1n c\u00f3 s\u1eb5n'} {'\u2022'}{' '}
            {order.code}
          </DialogTitle>
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
                <StatusBadge status="info">
                  {'Sales: \u0110\u00e3 duy\u1ec7t'}
                </StatusBadge>
                <StatusBadge status={opsBadgeType(resolvedOps.opsStatus)}>
                  {'V\u1eadn h\u00e0nh: '}
                  {READY_STOCK_OPS_STATUS_LABEL[resolvedOps.opsStatus]}
                </StatusBadge>
                <StatusBadge status={payment.type}>
                  {'Thanh to\u00e1n: '} {payment.label}
                </StatusBadge>
                <StatusBadge status="warning">
                  {'Lo\u1ea1i: \u0110\u01a1n c\u00f3 s\u1eb5n'}
                </StatusBadge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!resolvedOps.assignee && (
                <Button
                  onClick={() => {
                    void openStartPickingConfirm();
                  }}
                  title={
                    'Nh\u1eadn \u0111\u01a1n \u0111\u1ec3 b\u1eaft \u0111\u1ea7u x\u1eed l\u00fd'
                  }
                >
                  {'Nh\u1eadn x\u1eed l\u00fd'}
                </Button>
              )}
              {resolvedOps.assignee && resolvedOps.assignee !== meName && (
                <Button
                  variant="outline"
                  onClick={() => {
                    void openAssignToMeConfirm();
                  }}
                >
                  {'G\u00e1n cho t\u00f4i'}
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="gap-2">
                    {'Duy\u1ec7t tr\u1ea1ng th\u00e1i'}
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>
                    {'Chuy\u1ec3n b\u01b0\u1edbc'}
                  </DropdownMenuLabel>

                  {!hasAnyStatusAction && (
                    <DropdownMenuItem disabled>
                      {
                        'Kh\u00f4ng c\u00f3 thao t\u00e1c ph\u00f9 h\u1ee3p v\u1edbi tr\u1ea1ng th\u00e1i hi\u1ec7n t\u1ea1i.'
                      }
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
                      {'B\u1eaft \u0111\u1ea7u l\u1ea5y h\u00e0ng'}
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
                        !allPicked
                          ? 'C\u1ea7n pick \u0111\u1ee7 t\u1ea5t c\u1ea3 s\u1ea3n ph\u1ea9m tr\u01b0\u1edbc'
                          : ''
                      }
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {'X\u00e1c nh\u1eadn \u0111\u00e3 l\u1ea5y \u0111\u1ee7'}
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
                      {
                        'X\u00e1c nh\u1eadn \u0111\u00e3 \u0111\u00f3ng g\u00f3i'
                      }
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
                          !canHandover
                            ? 'C\u1ea7n c\u00f3 tracking tr\u01b0\u1edbc khi b\u00e0n giao'
                            : ''
                        }
                      >
                        <Truck className="h-4 w-4" />
                        {'B\u00e0n giao v\u1eadn chuy\u1ec3n'}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>{'T\u1ed5ng ti\u1ec1n'}</Label>
              <div className="text-foreground text-lg font-bold">
                {formatCurrencyVnd(order.total)}
              </div>
            </div>
            <div className="space-y-1">
              <Label>{'Ng\u00e0y t\u1ea1o'}</Label>
              <div className="text-foreground text-sm">
                {formatDateTime(order.createdAt)}
              </div>
            </div>
            <div className="space-y-1">
              <Label>{'Ph\u1ee5 tr\u00e1ch'}</Label>
              <div className="text-foreground text-sm">
                {resolvedOps.assignee || 'Ch\u01b0a nh\u1eadn'}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>{'C\u1eeda h\u00e0ng x\u1eed l\u00fd'}</Label>
              <div className="text-foreground text-sm font-semibold">
                {order.storeName || '-'}
              </div>
            </div>
            <div className="space-y-1">
              <Label>{'Nh\u00e0 cung c\u1ea5p'}</Label>
              <div className="text-foreground text-sm font-semibold">
                {orderSuppliers.length > 0 ? orderSuppliers.join(', ') : '-'}
              </div>
            </div>
          </div>

          <div className="border-border bg-muted/20 rounded-lg border p-3">
            <div className="text-foreground font-semibold">
              {'Th\u00f4ng tin duy\u1ec7t Sales'}
            </div>
            <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>{'Sales duy\u1ec7t'}</Label>
                <div className="text-sm font-semibold">
                  {formatDateTime(resolvedOps.salesApprovedAt)}
                </div>
              </div>
              <div className="space-y-1">
                <Label>{'Duy\u1ec7t b\u1edfi'}</Label>
                <div className="text-sm font-semibold">
                  {resolvedOps.salesApprovedBy || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-flow-row-dense lg:grid-cols-3">
          {/* Recipient */}

          <div className="lg:col-span-3">
            <div className="border-border rounded-xl border p-4">
              <div className="text-foreground mb-3 font-semibold">
                {'Th\u00f4ng tin ng\u01b0\u1eddi nh\u1eadn'}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label>{'H\u1ecd t\u00ean'}</Label>
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
                  <Label>{'S\u1ed1 \u0111i\u1ec7n tho\u1ea1i'}</Label>
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
                  <Label>{'Email (m\u1eabu)'}</Label>
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
                  <Label>
                    {'\u0110\u1ecba ch\u1ec9 \u0111\u1ea7y \u0111\u1ee7'}
                  </Label>
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
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>{'\u0110\u1ecba ch\u1ec9 d\u00f2ng 1'}</Label>
                  <div className="text-sm font-semibold">
                    {addr.addressLine1 || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>{'\u0110\u1ecba ch\u1ec9 d\u00f2ng 2'}</Label>
                  <div className="text-sm font-semibold">
                    {addr.addressLine2 || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>{'Ph\u01b0\u1eddng/x\u00e3'}</Label>
                  <div className="text-sm font-semibold">
                    {addr.ward || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>{'Qu\u1eadn/huy\u1ec7n'}</Label>
                  <div className="text-sm font-semibold">
                    {addr.district || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>{'T\u1ec9nh/th\u00e0nh'}</Label>
                  <div className="text-sm font-semibold">
                    {addr.province || '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>{'Qu\u1ed1c gia'}</Label>
                  <div className="text-sm font-semibold">{addr.country}</div>
                </div>

                <div className="space-y-1 sm:col-span-3">
                  <Label>{'Ghi ch\u00fa giao h\u00e0ng'}</Label>
                  <div className="text-foreground text-sm whitespace-pre-wrap">
                    {order.note || '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="lg:order-3 lg:col-span-3">
            <div className="border-border rounded-xl border p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="text-foreground font-semibold">
                  {'Danh s\u00e1ch s\u1ea3n ph\u1ea9m c\u1ea7n x\u1eed l\u00fd'}
                </div>
                <div className="text-foreground/90 text-xs">
                  {summary.totalItems} {'s\u1ea3n ph\u1ea9m'} {'\u2022'}{' '}
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
                  const location =
                    item.warehouseLocation || state?.warehouseLocation || '';
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
                                {'\u0110\u00e3 l\u1ea5y h\u00e0ng'}
                              </StatusBadge>
                            ) : (
                              <StatusBadge status="warning">
                                {'Ch\u01b0a l\u1ea5y h\u00e0ng'}
                              </StatusBadge>
                            )}
                            {issueType && (
                              <StatusBadge status="error">
                                {'L\u1ed7i: '} {issueTypeLabel(issueType)}
                              </StatusBadge>
                            )}
                          </div>
                          <div className="text-foreground/90 text-xs">
                            {'Lo\u1ea1i: '} {item.type || 'other'} {'\u2022'}{' '}
                            {'Bi\u1ebfn th\u1ec3: '} {item.variant} {'\u2022'}{' '}
                            {'SL: '} {item.quantity}
                          </div>
                          <div className="text-foreground/90 text-xs">
                            {'\u0110\u01a1n gi\u00e1: '}{' '}
                            {formatCurrencyVnd(item.unitPrice)} {'\u2022'}{' '}
                            {'Th\u00e0nh ti\u1ec1n: '}{' '}
                            {formatCurrencyVnd(item.lineTotal)}
                          </div>
                          <div className="text-foreground/90 text-xs">
                            {'Nh\u00e0 cung c\u1ea5p: '} {item.supplier || '-'}
                          </div>
                          <div className="text-foreground/90 text-xs">
                            {'SKU: '} {item.sku || '-'}
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
                              ? '\u0110ang l\u01b0u...'
                              : picked
                                ? 'B\u1ecf l\u1ea5y h\u00e0ng'
                                : '\u0110\u00e1nh d\u1ea5u \u0111\u00e3 l\u1ea5y h\u00e0ng'}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setItemState(order.id, key, {
                                issueType:
                                  'out_of_stock' as ReadyStockIssueType,
                                issueNote: `Thi\u1ebfu h\u00e0ng: ${item.name}`,
                              });
                              setHold(
                                order.id,
                                'stock',
                                `Thi\u1ebfu h\u00e0ng: ${item.name}`
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
                            {'B\u00e1o thi\u1ebfu h\u00e0ng'}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setItemState(order.id, key, {
                                issueType:
                                  'damaged_item' as ReadyStockIssueType,
                                issueNote: `H\u00e0ng l\u1ed7i: ${item.name}`,
                              });
                              setHold(
                                order.id,
                                'stock',
                                `H\u00e0ng l\u1ed7i c\u1ea7n x\u1eed l\u00fd: ${item.name}`
                              );
                              void handleReportItemIssue(
                                key,
                                'damaged_item',
                                `Damaged item: ${item.name}`
                              );
                            }}
                          >
                            {'B\u00e1o h\u00e0ng l\u1ed7i'}
                          </Button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label>
                            {'V\u1ecb tr\u00ed kho'}
                          </Label>
                          <Input
                            value={location}
                            readOnly
                            className="bg-slate-50 text-slate-700"
                            placeholder="Ch\u01b0a c\u00f3 v\u1ecb tr\u00ed kho trong data bi\u1ebfn th\u1ec3"
                          />
                        </div>
                        {issueType && (
                          <div className="space-y-1 sm:col-span-2">
                            <Label>{'Chi ti\u1ebft l\u1ed7i'}</Label>
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
                                  'Kh\u00f4ng th\u1ec3 l\u01b0u chi ti\u1ebft l\u1ed7i s\u1ea3n ph\u1ea9m.'
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
          <div className="lg:order-4 lg:col-span-3">
            <div className="border-border rounded-xl border p-4">
              <div className="mb-3 space-y-2">
                <div className="text-foreground font-semibold">
                  {'V\u1eadn \u0111\u01a1n GHN'}
                </div>
                {shippingStatusMeta ? (
                  <StatusBadge status={shippingStatusMeta.type}>
                    {shippingStatusMeta.label}
                  </StatusBadge>
                ) : (
                  <div className="text-sm font-semibold">-</div>
                )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-1">
                  <Label>{'\u0110\u01a1n v\u1ecb VC'}</Label>
                  <div className="text-sm font-semibold">
                    {'GHN - Giao H\u00e0ng Nhanh'}
                  </div>
                </div>
                <div className="space-y-1 sm:col-span-2 xl:col-span-1">
                  <Label>{'M\u00e3 v\u1eadn \u0111\u01a1n'}</Label>
                  <div className="font-mono text-sm">{trackingCode || '-'}</div>
                </div>
                <div className="space-y-1 sm:col-span-2 xl:col-span-1">
                  <Label>{'D\u1ecbch v\u1ee5'}</Label>
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
                    ? '\u0110ang t\u1ea1o...'
                    : 'T\u1ea1o v\u1eadn \u0111\u01a1n GHN'}
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
                    ? '\u0110ang \u0111\u1ed3ng b\u1ed9...'
                    : '\u0110\u1ed3ng b\u1ed9 GHN'}
                </Button>
                {trackingCode && (
                  <Button
                    variant="ghost"
                    onClick={() => copyText(trackingCode)}
                    className="gap-2"
                  >
                    <ClipboardCopy className="h-4 w-4" />
                    {'Sao ch\u00e9p m\u00e3'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {'\u0110\u00f3ng'}
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
              {'H\u1ee7y'}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={confirmSubmitting}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmAction();
              }}
            >
              {confirmSubmitting
                ? '\u0110ang x\u1eed l\u00fd...'
                : confirmAction?.actionLabel || 'X\u00e1c nh\u1eadn'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
