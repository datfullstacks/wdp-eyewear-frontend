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
  CheckCircle2,
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
    case 'shipped':
      return 'success' as const;
    case 'ready_to_ship':
      return 'info' as const;
    case 'picking':
    case 'packed':
      return 'warning' as const;
    case 'blocked':
      return 'error' as const;
    case 'pending_operations':
    case 'awaiting_picking':
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
      return 'Có item thiếu/lỗi';
    case 'order_issue':
      return 'Có lỗi/ngoại lệ';
    case 'hold':
      return 'Đang hold';
    default:
      return key;
  }
}

export function ReadyStockOrdersTable({
  orders,
  resolveOps,
  onViewDetail,
  onAccept,
  onConfirmPicked,
  onPack,
  onCreateShipment,
  onUpdateTracking,
  onCompleteShipping,
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
  onUpdateTracking: (order: OrderRecord) => void;
  onCompleteShipping: (order: OrderRecord) => void;
  onHold: (order: OrderRecord) => void;
  currentUserName: string;
}) {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <div className="border-border flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="text-foreground/90 text-sm font-medium">
          Danh sách đơn ({orders.length})
        </div>
        <div className="text-foreground/60 text-xs">
          Tip: ưu tiên đơn chờ thanh toán + gần SLA, hoặc có cảnh báo/hold để xử
          lý trước.
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table className="min-w-[1080px] text-sm font-normal">
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[170px] whitespace-nowrap">
                Mã đơn
              </TableHead>
              <TableHead className="w-[220px] whitespace-nowrap">
                Khách
              </TableHead>
              <TableHead className="w-[140px] whitespace-nowrap">SĐT</TableHead>
              <TableHead className="w-[120px] whitespace-nowrap">
                Số lượng
              </TableHead>
              <TableHead className="w-[280px]">SP chính</TableHead>
              <TableHead className="whitespace-nowrap">Thanh toán</TableHead>
              <TableHead className="text-right whitespace-nowrap">
                Tổng tiền
              </TableHead>
              <TableHead className="whitespace-nowrap">Trạng thái</TableHead>
              <TableHead className="w-[190px] text-right whitespace-nowrap">
                Action chính
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
              const isMine =
                String(ops.assignee || '').trim() ===
                String(currentUserName || '').trim();
              const allPicked = order.items.every((item, index) => {
                const key = getReadyStockItemKey(order.id, item, index);
                return Boolean(ops.itemStates?.[key]?.picked);
              });
              const hasTracking = Boolean(
                String(ops.trackingCode || '').trim()
              );
              const hasShipmentDraft =
                Boolean(String(ops.carrierId || '').trim()) || hasTracking;
              const isClosed =
                ops.opsStatus === 'shipped' ||
                ops.opsStatus === 'delivered' ||
                ops.opsStatus === 'returned';
              const canAccept = !isMine && !isClosed;
              const canConfirmPicked = ops.opsStatus === 'picking';
              const canPack = ops.opsStatus === 'packed';
              const canCreateShipment =
                ops.opsStatus === 'ready_to_ship' && !hasTracking;
              const canUpdateTracking =
                hasShipmentDraft &&
                (ops.opsStatus === 'ready_to_ship' ||
                  ops.opsStatus === 'shipped' ||
                  ops.opsStatus === 'in_transit' ||
                  ops.opsStatus === 'delivered');
              const canCompleteShipping =
                ops.opsStatus === 'ready_to_ship' && hasTracking;

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
                    <StatusBadge status={opsBadgeType(ops.opsStatus)}>
                      {READY_STOCK_OPS_STATUS_LABEL[ops.opsStatus]}
                    </StatusBadge>
                  </TableCell>

                  <TableCell className="text-right whitespace-nowrap">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          aria-label="Mở action chính"
                        >
                          Thao tác
                          <ChevronDown className="h-4 w-4 opacity-70" />
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
                        <DropdownMenuLabel>Action chính</DropdownMenuLabel>

                        <DropdownMenuItem
                          onClick={() => onAccept(order)}
                          className="gap-2"
                          disabled={!canAccept}
                          title={
                            isMine
                              ? 'Bạn đang phụ trách đơn này'
                              : isClosed
                                ? 'Đơn đã hoàn tất giao vận'
                                : ''
                          }
                        >
                          <Hand className="h-4 w-4" />
                          Nhận xử lý
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onConfirmPicked(order)}
                          className="gap-2"
                          disabled={!canConfirmPicked || !allPicked}
                          title={
                            !canConfirmPicked
                              ? 'Cần nhận xử lý trước khi xác nhận lấy hàng'
                              : !allPicked
                                ? 'Cần đánh dấu đã pick đủ sản phẩm trong chi tiết đơn'
                                : ''
                          }
                        >
                          <ShoppingBag className="h-4 w-4" />
                          Xác nhận lấy hàng
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onPack(order)}
                          className="gap-2"
                          disabled={!canPack}
                          title={
                            !canPack
                              ? 'Cần xác nhận lấy hàng trước khi chuyển sang đóng gói'
                              : ''
                          }
                        >
                          <Package className="h-4 w-4" />
                          Đóng gói
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onCreateShipment(order)}
                          className="gap-2"
                          disabled={!canCreateShipment}
                          title={
                            !canCreateShipment
                              ? 'Cần hoàn tất bước đóng gói trước khi tạo vận đơn'
                              : ''
                          }
                        >
                          <Truck className="h-4 w-4" />
                          Tạo vận đơn
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onUpdateTracking(order)}
                          className="gap-2"
                          disabled={!canUpdateTracking}
                          title={
                            !canUpdateTracking
                              ? 'Cần có vận đơn hoặc tracking trước khi cập nhật'
                              : ''
                          }
                        >
                          <Truck className="h-4 w-4" />
                          Cập nhật tracking
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onCompleteShipping(order)}
                          className="gap-2"
                          disabled={!canCompleteShipping}
                          title={
                            !canCompleteShipping
                              ? 'Cần có tracking trước khi hoàn tất giao vận'
                              : ''
                          }
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Hoàn tất giao vận
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Tiện ích</DropdownMenuLabel>

                        <DropdownMenuItem
                          onClick={() => onViewDetail(order)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => onHold(order)}
                          className="gap-2"
                        >
                          <PauseCircle className="h-4 w-4" />
                          Đưa vào hold
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
