'use client';

import { orderApi } from '@/api';
import type { OrderOpsStage, OrderRecord } from '@/api/orders';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { READY_STOCK_OPS_STATUS_LABEL } from '@/lib/readyStockOps';
import type {
  ReadyStockChecklistKey,
  ReadyStockOrderOpsState,
  ReadyStockOpsStatus,
} from '@/types/readyStockOps';
import { carriers } from '@/types/fulfillment';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useEffect, useMemo, useState } from 'react';

const OPS_STATUS_OPTIONS: ReadyStockOpsStatus[] = [
  'pending_operations',
  'picking',
  'packing',
  'ready_to_ship',
  'shipment_created',
  'handover_to_carrier',
  'in_transit',
  'delivery_failed',
  'waiting_redelivery',
  'return_pending',
  'return_in_transit',
  'waiting_customer_info',
  'on_hold',
  'exception_hold',
  'delivered',
  'returned',
  'closed',
];

function toBackendOpsStage(status: ReadyStockOpsStatus): OrderOpsStage | null {
  switch (status) {
    case 'awaiting_picking':
      return 'pending_operations';
    case 'packed':
      return 'packing';
    case 'shipped':
      return 'handover_to_carrier';
    case 'blocked':
      return 'on_hold';
    case 'pending_operations':
    case 'picking':
    case 'packing':
    case 'ready_to_ship':
    case 'shipment_created':
    case 'handover_to_carrier':
    case 'in_transit':
    case 'delivery_failed':
    case 'waiting_redelivery':
    case 'return_pending':
    case 'return_in_transit':
    case 'waiting_customer_info':
    case 'on_hold':
    case 'exception_hold':
    case 'delivered':
    case 'returned':
    case 'closed':
      return status;
    default:
      return null;
  }
}

const CHECKLIST_LABELS: Record<ReadyStockChecklistKey, string> = {
  skuQuantityChecked: 'Da kiem SKU + so luong',
  productConditionChecked: 'Da kiem tinh trang san pham',
  addressChecked: 'Da kiem dia chi giao',
  packageReady: 'Da dong goi xong',
};

function paymentBadgeMeta(order: OrderRecord) {
  if (order.paymentStatus === 'paid') {
    return { label: 'Da thanh toan', type: 'success' as const };
  }
  if (order.paymentStatus === 'partial') {
    return { label: 'Thanh toan mot phan', type: 'info' as const };
  }
  if (order.paymentStatus === 'cod') {
    return { label: 'COD', type: 'default' as const };
  }
  return { label: 'Cho thanh toan', type: 'warning' as const };
}

export function ReadyStockOpsModal({
  open,
  onOpenChange,
  order,
  ops,
  onSave,
  onResetLocal,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderRecord | null;
  ops: ReadyStockOrderOpsState | null;
  onSave: (patch: Partial<ReadyStockOrderOpsState>) => void;
  onResetLocal: () => void;
}) {
  const [savingBackend, setSavingBackend] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReadyStockOrderOpsState | null>(ops);

  const canShow = Boolean(order && ops && draft);

  const carrierName = useMemo(() => {
    const match = carriers.find((carrier) => carrier.id === (draft?.carrierId || ''));
    return match?.name || '';
  }, [draft?.carrierId]);

  useEffect(() => {
    if (!open || !ops) return;
    setDraft(ops);
    setBackendError(null);
  }, [open, ops]);

  if (!canShow || !order || !ops || !draft) return null;
  const paymentMeta = paymentBadgeMeta(order);

  const toggleChecklist = (key: ReadyStockChecklistKey) => {
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            checklist: { ...prev.checklist, [key]: !prev.checklist[key] },
          }
        : prev
    );
  };

  const localPatch: Partial<ReadyStockOrderOpsState> = {
    opsStatus: draft.opsStatus,
    checklist: draft.checklist,
    carrierId: draft.carrierId,
    trackingCode: draft.trackingCode,
  };

  const handleSaveLocal = () => {
    setBackendError(null);
    onSave(localPatch);
    onOpenChange(false);
  };

  const handleSaveAndSync = async () => {
    setBackendError(null);
    setSavingBackend(true);

    try {
      onSave(localPatch);
      const backendStage = toBackendOpsStage(draft.opsStatus);
      if (backendStage) {
        await orderApi.updateOpsStage(order.id, backendStage);
      }
      onOpenChange(false);
    } catch {
      setBackendError(
        'Khong cap nhat duoc ops stage tren backend. Da luu local.'
      );
    } finally {
      setSavingBackend(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-foreground w-[92vw] max-w-[720px] max-h-[78vh] overflow-y-auto p-4 shadow-2xl">
        <DialogHeader>
          <DialogTitle>Van hanh don {order.code}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Loai don</Label>
              <div className="text-sm font-semibold">Ready stock</div>
            </div>
            <div className="space-y-1">
              <Label>Thanh toan</Label>
              <StatusBadge status={paymentMeta.type}>{paymentMeta.label}</StatusBadge>
              <div className="text-muted-foreground text-xs">
                Phuong thuc: {String(order.paymentMethod || '-').toUpperCase()}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Trang thai van hanh</Label>
              <Select
                value={draft.opsStatus}
                onValueChange={(value) =>
                  setDraft((prev) =>
                    prev
                      ? { ...prev, opsStatus: value as ReadyStockOpsStatus }
                      : prev
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chon trang thai" />
                </SelectTrigger>
                <SelectContent>
                  {OPS_STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {READY_STOCK_OPS_STATUS_LABEL[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-foreground text-sm font-semibold">Checklist</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(Object.keys(CHECKLIST_LABELS) as ReadyStockChecklistKey[]).map(
                (key) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={draft.checklist[key]}
                      onCheckedChange={() => toggleChecklist(key)}
                    />
                    <span className="text-foreground/90">
                      {CHECKLIST_LABELS[key]}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-foreground text-sm font-semibold">
              Van don / Tracking
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label>Don vi VC</Label>
                <Select
                  value={draft.carrierId || ''}
                  onValueChange={(value) =>
                    setDraft((prev) =>
                      prev ? { ...prev, carrierId: value } : prev
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chon don vi" />
                  </SelectTrigger>
                  <SelectContent>
                    {carriers.map((carrier) => (
                      <SelectItem key={carrier.id} value={carrier.id}>
                        {carrier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {carrierName && (
                  <div className="text-foreground/60 text-xs">
                    Dang chon: {carrierName}
                  </div>
                )}
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Ma tracking</Label>
                <Input
                  value={draft.trackingCode}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev ? { ...prev, trackingCode: e.target.value } : prev
                    )
                  }
                  placeholder="VD: LT3DY4..."
                />
              </div>
            </div>
          </div>

          {backendError && (
            <div className="text-destructive text-sm">{backendError}</div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onResetLocal}>
            Reset local
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Dong
          </Button>
          <Button onClick={handleSaveLocal}>Luu</Button>
          <Button
            variant="secondary"
            onClick={handleSaveAndSync}
            disabled={savingBackend}
          >
            {savingBackend ? 'Dang cap nhat...' : 'Luu + cap nhat backend'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
