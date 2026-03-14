'use client';

import type { OrderRecord } from '@/api/orders';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  formatCurrencyVnd,
  getReadyStockItemKey,
  getReadyStockWarnings,
  READY_STOCK_OPS_STATUS_LABEL,
  summarizeItems,
} from '@/lib/readyStockOps';
import type {
  ReadyStockOrderOpsState,
  ReadyStockOpsStatus,
} from '@/types/readyStockOps';
import {
  AlertTriangle,
  ChevronDown,
  Eye,
  Hand,
  Package,
  PauseCircle,
  ShoppingBag,
  Truck,
} from 'lucide-react';

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
    case 'pending_operations':
    default:
      return 'default' as const;
  }
}

function paymentBadge(order: OrderRecord, ops: ReadyStockOrderOpsState) {
  if (ops.paymentFailed) return { label: 'That bai', type: 'error' as const };
  if (order.paymentStatus === 'paid') {
    return { label: 'Da thanh toan', type: 'success' as const };
  }
  if (order.paymentStatus === 'partial') {
    return { label: 'Thanh toan 1 phan', type: 'info' as const };
  }
  if (order.paymentStatus === 'cod') {
    return { label: 'COD', type: 'default' as const };
  }
  return { label: 'Cho thanh toan', type: 'warning' as const };
}

function warningLabel(
  key: ReturnType<typeof getReadyStockWarnings>[number]
): string {
  switch (key) {
    case 'missing_address':
      return 'Dia chi thieu/khong ro';
    case 'payment_pending':
      return 'Cho thanh toan';
    case 'payment_failed':
      return 'Thanh toan that bai';
    case 'special_note':
      return 'Co note dac biet';
    case 'item_issue':
      return 'Co item thieu/loi';
    case 'order_issue':
      return 'Co loi/ngoai le';
    case 'hold':
      return 'Dang hold';
    default:
      return key;
  }
}

function nextActionHint(
  status: ReadyStockOpsStatus,
  allPicked: boolean,
  hasShipment: boolean
): string | null {
  if (status === 'pending_operations') {
    return 'Can nhan xu ly truoc khi xac nhan lay hang.';
  }

  if (status === 'picking' && !allPicked) {
    return 'Vao chi tiet don va danh dau da lay du tat ca san pham truoc.';
  }

  if (status === 'packing') {
    return 'Sau khi pick du, xac nhan da dong goi de mo buoc tao van don.';
  }

  if (status === 'ready_to_ship' && !hasShipment) {
    return 'Can tao van don GHN truoc khi dong bo giao van.';
  }

  if (status === 'shipment_created') {
    return 'Van don GHN da duoc tao. Ban giao kien va dong bo GHN khi co cap nhat.';
  }

  return null;
}

export function ReadyStockOrdersTable({
  orders,
  resolveOps,
  onViewDetail,
  onAccept,
  onConfirmPicked,
  onPack,
  onCreateShipment,
  onSyncShipment,
  onHold,
  currentUserName,
}: {
  orders: OrderRecord[];
  resolveOps: (order: OrderRecord) => ReadyStockOrderOpsState;
  onViewDetail: (order: OrderRecord) => void;
  onAccept: (order: OrderRecord) => void;
  onConfirmPicked: (order: OrderRecord) => void;
  onPack: (order: OrderRecord) => void;
  onCreateShipment: (order: OrderRecord) => void;
  onSyncShipment: (order: OrderRecord) => void;
  onHold: (order: OrderRecord) => void;
  currentUserName: string;
}) {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <div className="border-border flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="text-foreground/90 text-sm font-medium">
          Danh sach don ({orders.length})
        </div>
        <div className="text-foreground/60 text-xs">
          Uu tien don gan SLA hoac co canh bao de xu ly truoc.
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[1080px] text-sm font-normal">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[170px] whitespace-nowrap">
                Ma don
              </TableHead>
              <TableHead className="w-[220px] whitespace-nowrap">
                Khach
              </TableHead>
              <TableHead className="w-[140px] whitespace-nowrap">SDT</TableHead>
              <TableHead className="w-[120px] whitespace-nowrap">
                So luong
              </TableHead>
              <TableHead className="w-[280px]">SP chinh</TableHead>
              <TableHead className="whitespace-nowrap">Thanh toan</TableHead>
              <TableHead className="text-right whitespace-nowrap">
                Tong tien
              </TableHead>
              <TableHead className="whitespace-nowrap">Trang thai</TableHead>
              <TableHead className="w-[190px] text-right whitespace-nowrap">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const ops = resolveOps(order);
              const payment = paymentBadge(order, ops);
              const summary = summarizeItems(order);
              const warnings = getReadyStockWarnings(order, ops);
              const hasWarnings = warnings.length > 0;
              const allPicked = order.items.every((item, index) => {
                const key = getReadyStockItemKey(order.id, item, index);
                return Boolean(ops.itemStates?.[key]?.picked);
              });
              const hasShipment = Boolean(
                String(
                  order.shipment?.orderCode ||
                    order.shipment?.trackingCode ||
                    ops.trackingCode ||
                    ''
                ).trim()
              );
              const isClosed =
                ops.opsStatus === 'delivered' ||
                ops.opsStatus === 'closed' ||
                ops.opsStatus === 'returned';
              const canAccept = !isClosed && ops.opsStatus === 'pending_operations';
              const canConfirmPicked = ops.opsStatus === 'picking';
              const canPack = ops.opsStatus === 'packing';
              const canCreateShipment =
                ops.opsStatus === 'ready_to_ship' && !hasShipment;
              const canSyncShipment =
                hasShipment &&
                [
                  'shipment_created',
                  'handover_to_carrier',
                  'in_transit',
                  'delivery_failed',
                  'waiting_redelivery',
                  'return_pending',
                  'return_in_transit',
                ].includes(ops.opsStatus);
              const hint = nextActionHint(
                ops.opsStatus,
                allPicked,
                hasShipment
              );

              return (
                <TableRow key={order.id} className="hover:bg-muted/30">
                  <TableCell className="whitespace-nowrap">
                    <div className="text-foreground font-mono">
                      {order.code}
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <div className="text-foreground">{order.customerName}</div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <div className="text-foreground/80">
                      {order.customerPhone || '-'}
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <div className="text-foreground">{summary.totalItems}</div>
                  </TableCell>

                  <TableCell className="min-w-0">
                    <div
                      className="text-foreground truncate"
                      title={summary.mainProduct}
                    >
                      {summary.mainProduct}
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <StatusBadge status={payment.type}>
                      {payment.label}
                    </StatusBadge>
                  </TableCell>

                  <TableCell className="text-right whitespace-nowrap">
                    <div className="text-foreground font-semibold">
                      {formatCurrencyVnd(order.total)}
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <div className="space-y-1">
                      <StatusBadge status={opsBadgeType(ops.opsStatus)}>
                        {READY_STOCK_OPS_STATUS_LABEL[ops.opsStatus]}
                      </StatusBadge>
                      {order.shipment?.latestStatus && (
                        <div className="text-foreground/70 text-xs">
                          GHN: {order.shipment.latestStatus}
                        </div>
                      )}
                      {order.shipment?.orderCode && (
                        <div className="text-foreground/70 font-mono text-xs">
                          {order.shipment.orderCode}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-right whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          aria-label="Mo action"
                        >
                          Thao tac
                          <ChevronDown className="h-4 w-4 opacity-70" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center gap-2">
                          <AlertTriangle className="text-warning h-4 w-4" />
                          Canh bao
                        </DropdownMenuLabel>
                        {hasWarnings ? (
                          warnings.map((w) => (
                            <DropdownMenuItem key={w} disabled>
                              {warningLabel(w)}
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <DropdownMenuItem disabled>
                            Khong co canh bao
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Action chinh</DropdownMenuLabel>

                        {canAccept && (
                          <DropdownMenuItem
                            onClick={() => onAccept(order)}
                            className="gap-2"
                          >
                            <Hand className="h-4 w-4" />
                            Nhan xu ly
                          </DropdownMenuItem>
                        )}

                        {ops.opsStatus === 'picking' && (
                          <DropdownMenuItem
                            onClick={() => onConfirmPicked(order)}
                            className="gap-2"
                            disabled={!allPicked}
                          >
                            <ShoppingBag className="h-4 w-4" />
                            Xac nhan da lay du
                          </DropdownMenuItem>
                        )}

                        {canPack && (
                          <DropdownMenuItem
                            onClick={() => onPack(order)}
                            className="gap-2"
                          >
                            <Package className="h-4 w-4" />
                            Xac nhan da dong goi
                          </DropdownMenuItem>
                        )}

                        {canCreateShipment && (
                          <DropdownMenuItem
                            onClick={() => onCreateShipment(order)}
                            className="gap-2"
                          >
                            <Truck className="h-4 w-4" />
                            Tao van don GHN
                          </DropdownMenuItem>
                        )}

                        {canSyncShipment && (
                          <DropdownMenuItem
                            onClick={() => onSyncShipment(order)}
                            className="gap-2"
                          >
                            <Truck className="h-4 w-4" />
                            Dong bo GHN
                          </DropdownMenuItem>
                        )}

                        {!canAccept &&
                          ops.opsStatus !== 'picking' &&
                          !canPack &&
                          !canCreateShipment &&
                          !canSyncShipment && (
                            <DropdownMenuItem disabled>
                              Khong co thao tac tiep theo o trang thai nay.
                            </DropdownMenuItem>
                          )}

                        {hint && <DropdownMenuItem disabled>{hint}</DropdownMenuItem>}

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Tien ich</DropdownMenuLabel>

                        <DropdownMenuItem
                          onClick={() => onViewDetail(order)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Xem chi tiet
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onHold(order)}
                          className="gap-2"
                        >
                          <PauseCircle className="h-4 w-4" />
                          Dua vao hold
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}

            {orders.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-foreground/70 py-10 text-center"
                >
                  Khong co don phu hop bo loc.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
