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
  READY_STOCK_OPS_STATUS_LABEL,
  summarizeItems,
} from '@/lib/readyStockOps';
import type {
  ReadyStockOrderOpsState,
  ReadyStockOpsStatus,
} from '@/types/readyStockOps';
import {
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
    return 'Vận đơn GHN đã được tạo. Bàn giao kiện và đồng bộ GHN khi có cập nhật.';
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
  void currentUserName;

  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <div className="border-border flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="text-foreground/90 text-sm font-medium">
          Danh sách đơn ({orders.length})
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[1120px] text-sm font-normal">
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
              <TableHead className="w-[280px]">Sản phẩm chính</TableHead>
              <TableHead className="whitespace-nowrap">Thanh toán</TableHead>
              <TableHead className="text-right whitespace-nowrap">
                Tổng tiền
              </TableHead>
              <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
              <TableHead className="w-[190px] text-right whitespace-nowrap">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => {
              const ops = resolveOps(order);
              const payment = paymentBadge(order, ops);
              const summary = summarizeItems(order);
              const allPicked = order.items.every((item, index) => {
                const key = getReadyStockItemKey(order.id, item, index);
                return Boolean(ops.itemStates?.[key]?.picked);
              });
              const shippingCode = String(
                order.shipment?.orderCode ||
                  order.shipment?.trackingCode ||
                  ops.trackingCode ||
                  ''
              ).trim();
              const hasShipment = Boolean(shippingCode);
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
                    <div
                      className="text-foreground/80"
                      title={order.storeName || '-'}
                    >
                      {order.storeName || '-'}
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
                      {shippingCode && (
                        <div className="text-foreground/70 font-mono text-xs">
                          {shippingCode}
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
                          aria-label="Mở thao tác chính"
                        >
                          Thao tác
                          <ChevronDown className="h-4 w-4 text-slate-700" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80">
                        <DropdownMenuLabel>Hoạt động chính</DropdownMenuLabel>

                        <DropdownMenuItem
                          onClick={() => onAccept(order)}
                          className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                          disabled={!canAccept}
                          title={
                            canAccept
                              ? ''
                              : 'Chỉ khả dụng khi đơn đang ở trạng thái chờ nhận xử lý.'
                          }
                        >
                          <Hand className="h-4 w-4" />
                          Nhận xử lý
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onConfirmPicked(order)}
                          className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                          disabled={!canConfirmPicked || !allPicked}
                          title={
                            !canConfirmPicked
                              ? 'Cần chuyển đơn sang bước lấy hàng trước.'
                              : !allPicked
                                ? 'Cần đánh dấu đã lấy đủ tất cả sản phẩm trước.'
                                : ''
                          }
                        >
                          <ShoppingBag className="h-4 w-4" />
                          Xác nhận đã lấy đủ
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onPack(order)}
                          className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                          disabled={!canPack}
                          title={
                            canPack ? '' : 'Cần hoàn tất bước lấy hàng trước.'
                          }
                        >
                          <Package className="h-4 w-4" />
                          Xác nhận đã đóng gói
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onCreateShipment(order)}
                          className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                          disabled={!canCreateShipment}
                          title={
                            canCreateShipment
                              ? ''
                              : hasShipment
                                ? 'Đơn đã có mã vận đơn.'
                                : 'Cần xác nhận đã đóng gói trước.'
                          }
                        >
                          <Truck className="h-4 w-4" />
                          Tạo vận đơn GHN
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onSyncShipment(order)}
                          className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                          disabled={!canSyncShipment}
                          title={
                            canSyncShipment
                              ? ''
                              : 'Cần có vận đơn GHN trước khi đồng bộ.'
                          }
                        >
                          <Truck className="h-4 w-4" />
                          Đồng bộ GHN
                        </DropdownMenuItem>

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
                  colSpan={10}
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
