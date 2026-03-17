'use client';

import { READY_STOCK_OPS_STATUS_LABEL } from '@/lib/readyStockOps';
import type { ReadyStockOpsStatus } from '@/types/readyStockOps';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

export type ReadyStockShipmentFilter =
  | 'all'
  | 'without_tracking'
  | 'with_tracking'
  | 'in_delivery'
  | 'delivered'
  | 'issue';

export type ReadyStockFilters = {
  salesApprovedFrom: string;
  salesApprovedTo: string;
  shipment: ReadyStockShipmentFilter;
  opsStatus: 'all' | ReadyStockOpsStatus;
  assignee: 'all' | 'unassigned' | 'me' | string;
  hasNoteOnly: boolean;
  hasIssueOnly: boolean;
};

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

export function ReadyStockFilterSheet({
  open,
  onOpenChange,
  filters,
  onChange,
  onReset,
  assigneeOptions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: ReadyStockFilters;
  onChange: (patch: Partial<ReadyStockFilters>) => void;
  onReset: () => void;
  assigneeOptions: string[];
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[92vw] max-w-[420px]">
        <SheetHeader>
          <SheetTitle>{'Bộ lọc đơn Ready Stock'}</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-5">
          <div className="space-y-2">
            <div className="text-foreground text-sm font-semibold">
              {'Ngày Sales duyệt'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="sales-from">{'Từ'}</Label>
                <Input
                  id="sales-from"
                  type="date"
                  value={filters.salesApprovedFrom}
                  onChange={(e) =>
                    onChange({ salesApprovedFrom: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="sales-to">{'Đến'}</Label>
                <Input
                  id="sales-to"
                  type="date"
                  value={filters.salesApprovedTo}
                  onChange={(e) =>
                    onChange({ salesApprovedTo: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="text-foreground text-sm font-semibold">
              {'Trạng thái vận hành'}
            </div>
            <Select
              value={filters.opsStatus}
              onValueChange={(value) =>
                onChange({ opsStatus: value as ReadyStockFilters['opsStatus'] })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={'Chọn trạng thái vận hành'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{'Tất cả'}</SelectItem>
                {OPS_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {READY_STOCK_OPS_STATUS_LABEL[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-foreground text-sm font-semibold">
              {'Tình trạng GHN'}
            </div>
            <Select
              value={filters.shipment}
              onValueChange={(value) =>
                onChange({ shipment: value as ReadyStockShipmentFilter })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={'Chọn tình trạng GHN'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{'Tất cả'}</SelectItem>
                <SelectItem value="without_tracking">
                  {'Chưa có vận đơn'}
                </SelectItem>
                <SelectItem value="with_tracking">
                  {'Đã có vận đơn GHN'}
                </SelectItem>
                <SelectItem value="in_delivery">
                  {'Đang giao / luồng GHN'}
                </SelectItem>
                <SelectItem value="delivered">
                  {'Đã giao thành công'}
                </SelectItem>
                <SelectItem value="issue">
                  {'Lỗi giao / hoàn / cần xử lý'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="text-foreground text-sm font-semibold">
              {'Người phụ trách'}
            </div>
            <Select
              value={filters.assignee}
              onValueChange={(value) => onChange({ assignee: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={'Chọn người phụ trách'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{'Tất cả'}</SelectItem>
                <SelectItem value="unassigned">{'Chưa nhận'}</SelectItem>
                <SelectItem value="me">{'Tôi'}</SelectItem>
                {assigneeOptions.map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="text-foreground text-sm font-semibold">
              {'Tùy chọn'}
            </div>
            <label className="border-border bg-muted/20 flex items-center gap-2 rounded-md border p-2 text-sm">
              <Checkbox
                checked={filters.hasNoteOnly}
                onCheckedChange={() =>
                  onChange({ hasNoteOnly: !filters.hasNoteOnly })
                }
              />
              <span className="text-foreground/90">
                {'Chỉ hiển thị đơn có ghi chú'}
              </span>
            </label>
            <label className="border-border bg-muted/20 flex items-center gap-2 rounded-md border p-2 text-sm">
              <Checkbox
                checked={filters.hasIssueOnly}
                onCheckedChange={() =>
                  onChange({ hasIssueOnly: !filters.hasIssueOnly })
                }
              />
              <span className="text-foreground/90">
                {'Chỉ hiển thị đơn có vấn đề cần xử lý'}
              </span>
            </label>
          </div>
        </div>

        <SheetFooter className="mt-6">
          <Button variant="outline" onClick={onReset}>
            {'Đặt lại'}
          </Button>
          <Button onClick={() => onOpenChange(false)}>{'Áp dụng'}</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
