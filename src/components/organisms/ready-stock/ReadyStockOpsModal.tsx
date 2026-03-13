'use client';

import type { OrderRecord } from '@/api/orders';
import { orderApi } from '@/api';
import { StatusBadge } from '@/components/atoms/StatusBadge';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { carriers } from '@/types/fulfillment';
import type { ReadyStockChecklistKey, ReadyStockOrderOpsState, ReadyStockOpsStatus } from '@/types/readyStockOps';
import { READY_STOCK_OPS_STATUS_LABEL } from '@/lib/readyStockOps';
import { useEffect, useMemo, useState } from 'react';

const OPS_STATUS_OPTIONS: ReadyStockOpsStatus[] = [
  'pending_operations',
  'awaiting_picking',
  'picking',
  'packed',
  'ready_to_ship',
  'shipped',
  'in_transit',
  'delivered',
  'delivery_failed',
  'returned',
  'blocked',
];

function backendStatusFromOps(ops: ReadyStockOpsStatus): string | null {
  if (ops === 'delivered') return 'delivered';
  if (ops === 'returned') return 'returned';
  if (ops === 'shipped' || ops === 'in_transit') return 'shipped';
  if (ops === 'blocked' || ops === 'delivery_failed') return null;
  return 'processing';
}

const CHECKLIST_LABELS: Record<ReadyStockChecklistKey, string> = {
  skuQuantityChecked: 'Đã kiểm SKU + số lượng',
  productConditionChecked: 'Đã kiểm tình trạng sản phẩm',
  addressChecked: 'Đã kiểm địa chỉ giao',
  packageReady: 'Đã đóng gói xong',
};

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
    const match = carriers.find((c) => c.id === (draft?.carrierId || ''));
    return match?.name || '';
  }, [draft?.carrierId]);

  useEffect(() => {
    if (!open) return;
    if (!ops) return;
    setDraft(ops);
    setBackendError(null);
  }, [open, ops]);

  if (!canShow || !order || !ops || !draft) return null;

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

  const handleSaveLocal = () => {
    setBackendError(null);
    onSave({
      opsStatus: draft.opsStatus,
      checklist: draft.checklist,
      carrierId: draft.carrierId,
      trackingCode: draft.trackingCode,
    });
    onOpenChange(false);
  };

  const handleSaveAndSync = async () => {
    const backendStatus = backendStatusFromOps(draft.opsStatus);
    setBackendError(null);
    setSavingBackend(true);
    try {
      onSave({
        opsStatus: draft.opsStatus,
        checklist: draft.checklist,
        carrierId: draft.carrierId,
        trackingCode: draft.trackingCode,
      });

      if (backendStatus) {
        await orderApi.updateStatus(order.id, backendStatus);
      }

      onOpenChange(false);
    } catch {
      setBackendError('Không cập nhật được trạng thái backend. Đã lưu local.');
    } finally {
      setSavingBackend(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-[720px] max-h-[78vh] overflow-y-auto p-4 text-foreground shadow-2xl">
        <DialogHeader>
          <DialogTitle>Vận hành đơn {order.code}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Loại đơn</Label>
              <div className="text-sm font-semibold">Ready stock</div>
            </div>
            <div className="space-y-1">
              <Label>Thanh toán</Label>
              <StatusBadge status={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                {order.paymentStatus}
              </StatusBadge>
            </div>
            <div className="space-y-1">
              <Label>Trạng thái vận hành</Label>
              <Select
                value={draft.opsStatus}
                onValueChange={(value) =>
                  setDraft((prev) => (prev ? { ...prev, opsStatus: value as ReadyStockOpsStatus } : prev))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {OPS_STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {READY_STOCK_OPS_STATUS_LABEL[s]}
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
              {(Object.keys(CHECKLIST_LABELS) as ReadyStockChecklistKey[]).map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={draft.checklist[key]}
                    onCheckedChange={() => toggleChecklist(key)}
                  />
                  <span className="text-foreground/90">{CHECKLIST_LABELS[key]}</span>
                </label>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-foreground text-sm font-semibold">Vận đơn / Tracking</div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label>Đơn vị VC</Label>
                <Select
                  value={draft.carrierId || ''}
                  onValueChange={(value) =>
                    setDraft((prev) => (prev ? { ...prev, carrierId: value } : prev))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đơn vị" />
                  </SelectTrigger>
                  <SelectContent>
                    {carriers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {carrierName && (
                  <div className="text-foreground/60 text-xs">Đang chọn: {carrierName}</div>
                )}
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Mã tracking</Label>
                <Input
                  value={draft.trackingCode}
                  onChange={(e) =>
                    setDraft((prev) => (prev ? { ...prev, trackingCode: e.target.value } : prev))
                  }
                  placeholder="VD: GHN123..."
                />
              </div>
            </div>
          </div>

          {backendError && <div className="text-destructive text-sm">{backendError}</div>}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onResetLocal}>
            Reset local
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={handleSaveLocal}>Lưu</Button>
          <Button
            variant="secondary"
            onClick={handleSaveAndSync}
            disabled={savingBackend}
            title="Lưu local và cố gắng cập nhật trạng thái backend (nếu có endpoint hỗ trợ)"
          >
            {savingBackend ? 'Đang cập nhật...' : 'Lưu + cập nhật backend'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
