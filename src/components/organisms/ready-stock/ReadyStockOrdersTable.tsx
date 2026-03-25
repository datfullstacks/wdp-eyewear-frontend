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
  if (ops.paymentFailed) return { label: 'Thất bại', type: 'error' as const };
  if (order.paymentStatus === 'paid') {
    return { label: 'Đã thanh toán', type: 'success' as const };
  }
  if (order.paymentStatus === 'partial') {
    return { label: 'Thanh toán 1 phần', type: 'info' as const };
  }
  if (order.paymentStatus === 'cod') {
    return { label: 'COD', type: 'default' as const };
  }
  return { label: 'Chờ thanh toán', type: 'warning' as const };
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
      return 'Có note đặc biệt';
    case 'item_issue':
      return 'Có sản phẩm thiếu/lỗi';
    case 'order_issue':
      return 'Có lỗi/ngoại lệ';
    case 'hold':
      return 'Đang tạm giữ';
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
    return 'Cần nhận xử lý trước khi xác nhận lấy hàng.';
  }

  if (status === 'picking' && !allPicked) {
    return 'Vào chi tiết đơn và đánh dấu đã lấy đủ tất cả sản phẩm trước.';
  }

  if (status === 'packing') {
    return 'Sau khi lấy đủ, xác nhận đã đóng gói để mở bước tạo vận đơn.';
  }

  if (status === 'ready_to_ship' && !hasShipment) {
    return 'Cần tạo vận đơn GHN trước khi đồng bộ giao vận.';
  }

  if (status === 'shipment_created') {
    return 'Vận đơn GHN đã được tạo. Bàn giao kiện và đóng bộ GHN khi có cập nhật.';
  }

  return null;
}

function supplierSummary(order: OrderRecord): string {
  const suppliers = Array.from(
    new Set(
      order.items
        .map((item) => item.supplier)
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    )
  );
  if (suppliers.length === 0) return '-';
  if (suppliers.length === 1) return suppliers[0];
  return `${suppliers[0]} +${suppliers.length - 1}`;
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
          Danh sách đơn ({orders.length})
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[1260px] text-sm font-normal">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[170px] whitespace-nowrap">
                Mã đơn
              </TableHead>
              <TableHead className="w-[220px] whitespace-nowrap">
                Khách hàng
              </TableHead>
              <TableHead className="w-[140px] whitespace-nowrap">SDT</TableHead>
              <TableHead className="w-[120px] whitespace-nowrap">
                Số lượng
              </TableHead>
              <TableHead className="w-[220px] whitespace-nowrap">
                Cửa hàng
              </TableHead>
              <TableHead className="w-[220px] whitespace-nowrap">
                Nhà cung cấp
              </TableHead>
              <TableHead className="w-[280px]">Sản phẩm chính</TableHead>
              <TableHead className="whitespace-nowrap">Thanh toán</TableHead>
              <TableHead className="text-right whitespace-nowrap">
                Tổng tiền
              </TableHead>
              <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
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
              const canAccept =
                !isClosed && ops.opsStatus === 'pending_operations';
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

                  <TableCell className="whitespace-nowrap">
                    <div className="text-foreground/80" title={order.storeName || '-'}>
                      {order.storeName || '-'}
                    </div>
                  </TableCell>

                  <TableCell className="whitespace-nowrap">
                    <div className="text-foreground/80" title={supplierSummary(order)}>
                      {supplierSummary(order)}
                    </div>
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
                          className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                          aria-label="Mo action"
                        >
                          Thao tác
                          <ChevronDown className="h-4 w-4 text-slate-700" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel className="flex items-center gap-2">
                          <AlertTriangle className="text-warning h-4 w-4" />
                          Cảnh báo
                        </DropdownMenuLabel>
                        {hasWarnings ? (
                          warnings.map((w) => (
                            <DropdownMenuItem key={w} disabled>
                              {warningLabel(w)}
                            </DropdownMenuItem>
                          ))
                        ) : (
                          <DropdownMenuItem disabled>
                            Không có cảnh báo
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Hành động chính</DropdownMenuLabel>

                        {canAccept && (
                          <DropdownMenuItem
                            onClick={() => onAccept(order)}
                            className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                          >
                            <Hand className="h-4 w-4" />
                            Nhận xử lý
                          </DropdownMenuItem>
                        )}

                        {ops.opsStatus === 'picking' && (
                          <DropdownMenuItem
                            onClick={() => onConfirmPicked(order)}
                            className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                            disabled={!allPicked}
                          >
                            <ShoppingBag className="h-4 w-4" />
                            Xác nhận đã lấy đủ
                          </DropdownMenuItem>
                        )}

                        {canPack && (
                          <DropdownMenuItem
                            onClick={() => onPack(order)}
                            className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                          >
                            <Package className="h-4 w-4" />
                            Xác nhận đã đóng gói
                          </DropdownMenuItem>
                        )}

                        {canCreateShipment && (
                          <DropdownMenuItem
                            onClick={() => onCreateShipment(order)}
                            className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                          >
                            <Truck className="h-4 w-4" />
                            Tạo vận đơn GHN
                          </DropdownMenuItem>
                        )}

                        {canSyncShipment && (
                          <DropdownMenuItem
                            onClick={() => onSyncShipment(order)}
                            className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                          >
                            <Truck className="h-4 w-4" />
                            Đồng bộ GHN
                          </DropdownMenuItem>
                        )}

                        {!canAccept &&
                          ops.opsStatus !== 'picking' &&
                          !canPack &&
                          !canCreateShipment &&
                          !canSyncShipment && (
                            <DropdownMenuItem disabled>
                              Không có thao tác tiếp theo ở trạng thái này.
                            </DropdownMenuItem>
                          )}

                        {hint && (
                          <DropdownMenuItem disabled>{hint}</DropdownMenuItem>
                        )}

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Tiện ích</DropdownMenuLabel>

                        <DropdownMenuItem
                          onClick={() => onViewDetail(order)}
                          className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                        >
                          <Eye className="h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onHold(order)}
                          className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                        >
                          <PauseCircle className="h-4 w-4" />
                          Tạm dừng xử lý
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
                  Không có đơn phù hợp bộ lọc.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
