import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  RefundRequest,
  formatCurrency,
  formatDateTime,
  methodConfig,
  statusConfig,
} from '@/types/refund';

interface RefundDetailModalProps {
  refund: RefundRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getHistoryStatusLabel(status?: string) {
  const normalized = String(status || '').trim();
  if (!normalized || normalized === 'none') {
    return 'Chưa có trạng thái';
  }

  const mapped = (statusConfig as Record<string, { label: string }>)[normalized];
  return mapped?.label || normalized;
}

function getHistoryActorLabel(actorName?: string, actorRole?: string) {
  if (String(actorName || '').trim()) return String(actorName).trim();

  switch (String(actorRole || '').trim()) {
    case 'sales':
      return 'Sale/Staff';
    case 'operations':
      return 'Vận hành';
    case 'manager':
      return 'Quản lý';
    case 'customer':
      return 'Khách hàng';
    default:
      return 'Hệ thống';
  }
}

function getHistoryNoteLabel(note?: string) {
  const raw = String(note || '').trim();
  const normalized = raw.toLowerCase();

  if (!raw) return '';

  if (
    normalized === 'operations bat dau xu ly payout.' ||
    normalized === 'operations bắt đầu xử lý payout.'
  ) {
    return 'Vận hành bắt đầu xử lý hoàn tiền.';
  }

  if (
    normalized === 'order cancelled by customer' ||
    normalized === 'order canceled by customer'
  ) {
    return 'Đơn hàng đã bị hủy bởi khách hàng.';
  }

  if (
    normalized === 'case đã được trả lại reviewing do qc fail.' ||
    normalized === 'case da duoc tra lai reviewing do qc fail.'
  ) {
    return 'Case đã được trả lại bước xem xét do QC không đạt.';
  }

  return raw;
}

export const RefundDetailModal = ({
  refund,
  open,
  onOpenChange,
}: RefundDetailModalProps) => {
  const labelClass = 'text-xs font-bold tracking-normal text-slate-700';
  const valueClass = 'mt-1 text-[15px] font-semibold text-slate-950';
  const secondaryValueClass = 'mt-1 text-[14px] font-medium text-slate-700';
  const bodyTextClass = 'text-[15px] leading-7 text-slate-900';
  const fieldCardClass =
    'rounded-xl border border-slate-300 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)]';
  const sectionCardClass =
    'rounded-xl border border-slate-300 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.07)]';

  const breakdown = refund?.approvedBreakdown.total
    ? refund.approvedBreakdown
    : refund?.requestedBreakdown;
  const ownerLabel =
    refund?.currentOwnerRole === 'sales'
      ? 'Sale/Staff'
      : refund?.currentOwnerRole === 'operations'
        ? 'Operations'
        : refund?.currentOwnerRole === 'manager'
          ? 'Manager'
          : refund?.currentOwnerRole === 'customer'
            ? 'Khách hàng'
            : 'Đã đóng';
  const nextActionLabel =
    refund?.nextActionCode === 'customer_submit_info'
      ? 'Chờ khách bổ sung thông tin'
      : refund?.nextActionCode === 'manager_approve'
        ? 'Chờ manager quyết định'
        : refund?.nextActionCode === 'confirm_return_received'
          ? 'Chờ operations nhận/QC hàng hoàn'
          : refund?.nextActionCode === 'start_processing'
            ? 'Chờ operations bắt đầu payout'
            : refund?.nextActionCode === 'complete'
              ? 'Chờ operations xác nhận đã chuyển tiền'
              : refund?.nextActionCode === 'start_review'
                ? 'Chờ staff review'
                : '-';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] w-[94vw] max-w-3xl overflow-y-auto border-slate-300 bg-white p-0 text-slate-950 shadow-2xl sm:rounded-2xl">
        <DialogHeader className="border-b border-slate-200 bg-white px-5 py-4 sm:px-6 sm:py-5">
          <DialogTitle className="text-base font-semibold text-slate-900 sm:text-lg">
            Chi tiết yêu cầu hoàn tiền {refund?.id}
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Thông tin chi tiết về yêu cầu hoàn tiền
          </DialogDescription>
        </DialogHeader>

        {refund && (
          <div className="space-y-4 bg-slate-50 px-5 py-4 sm:px-6 sm:py-5">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className={fieldCardClass}>
                <Label className={labelClass}>Mã đơn hàng</Label>
                <p className={valueClass}>{refund.orderId}</p>
              </div>
              <div className={fieldCardClass}>
                <Label className={labelClass}>Trạng thái</Label>
                <div className="mt-2">
                  <StatusBadge status={statusConfig[refund.status].type}>
                    {statusConfig[refund.status].label}
                  </StatusBadge>
                </div>
              </div>
              <div className={fieldCardClass}>
                <Label className={labelClass}>Khách hàng</Label>
                <p className={valueClass}>{refund.customerName}</p>
                <p className={secondaryValueClass}>{refund.customerPhone}</p>
              </div>
              <div className={fieldCardClass}>
                <Label className={labelClass}>Số tiền hoàn</Label>
                <p className="mt-1 text-xl font-bold text-rose-700">
                  {formatCurrency(refund.amount)}
                </p>
              </div>
            </div>

            <div className={sectionCardClass}>
              <Label className={labelClass}>Lý do hoàn tiền</Label>
              <p className="mt-3 max-w-3xl text-[15px] leading-8 whitespace-pre-wrap text-slate-900">
                {refund.reason}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className={fieldCardClass}>
                <Label className={labelClass}>Phương thức hoàn tiền</Label>
                <p className={valueClass}>
                  {methodConfig[refund.method].label}
                </p>
              </div>
              <div className={fieldCardClass}>
                <Label className={labelClass}>Ngày tạo yêu cầu</Label>
                <p className={valueClass}>{refund.createdAt}</p>
              </div>
            </div>

            {breakdown && (
              <div className={sectionCardClass}>
                <Label className={labelClass}>Chi tiết khoản hoàn tiền</Label>
                <div className="mt-4 divide-y divide-slate-200">
                  <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
                    <span className="font-medium text-slate-700">
                      Tiền hàng
                    </span>
                    <span className="text-[15px] font-semibold text-slate-950">
                      {formatCurrency(breakdown.itemAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="font-medium text-slate-700">
                      Phí giao hàng
                    </span>
                    <span className="text-[15px] font-semibold text-slate-950">
                      {formatCurrency(breakdown.shippingFeeAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 py-3">
                    <span className="font-medium text-slate-700">
                      Phí gửi trả
                    </span>
                    <span className="text-[15px] font-semibold text-slate-950">
                      {formatCurrency(breakdown.returnShippingFeeAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 pt-4">
                    <span className="text-[15px] font-bold text-slate-950">
                      Tổng
                    </span>
                    <span className="text-lg font-bold text-slate-950">
                      {formatCurrency(breakdown.total)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {refund.bankInfo && (
              <div className={sectionCardClass}>
                <Label className={labelClass}>Tài khoản nhận tiền</Label>
                <div className="mt-3 grid gap-3 rounded-xl border border-slate-300 bg-slate-50 p-4 text-[15px] sm:grid-cols-2">
                  <div>
                    <span className="block text-xs font-bold text-slate-700">
                      Ngân hàng
                    </span>
                    <span className="mt-1 block text-[15px] font-semibold text-slate-950">
                      {refund.bankInfo.bankName}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-700">
                      Số TK
                    </span>
                    <span className="mt-1 block text-[15px] font-semibold text-slate-950">
                      {refund.bankInfo.accountNumber}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="block text-xs font-bold text-slate-700">
                      Chủ TK
                    </span>
                    <span className="mt-1 block text-[15px] font-semibold text-slate-950">
                      {refund.bankInfo.accountHolder}
                    </span>
                  </div>
                  {refund.bankInfo.note && (
                    <div className="sm:col-span-2">
                      <span className="block text-xs font-bold text-slate-700">
                        Ghi chú
                      </span>
                      <p className={`${bodyTextClass} mt-1`}>
                        {refund.bankInfo.note}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className={fieldCardClass}>
                <Label className={labelClass}>Trách nhiệm</Label>
                <p className={valueClass}>{refund.responsibility || '-'}</p>
              </div>
              <div className={fieldCardClass}>
                <Label className={labelClass}>Cần trả hàng</Label>
                <p className={valueClass}>
                  {refund.requiresReturn ? 'Có' : 'Không'}
                </p>
              </div>
              <div className={fieldCardClass}>
                <Label className={labelClass}>Người xử lý hiện tại</Label>
                <p className={valueClass}>{ownerLabel}</p>
              </div>
              <div className={fieldCardClass}>
                <Label className={labelClass}>Bước tiếp theo</Label>
                <p className={valueClass}>{nextActionLabel}</p>
              </div>
            </div>

            {refund.escalateReason && (
              <div className={sectionCardClass}>
                <Label className={labelClass}>Lý do chuyển manager</Label>
                <p className="mt-2 rounded-xl border border-slate-300 bg-slate-50 p-4 text-[15px] leading-7 text-slate-950">
                  {refund.escalateReason}
                </p>
              </div>
            )}

            {refund.rejectReason && (
              <div className={sectionCardClass}>
                <Label className={labelClass}>Lý do từ chối</Label>
                <p className="mt-2 rounded-xl border border-slate-300 bg-slate-50 p-4 text-[15px] leading-7 text-slate-950">
                  {refund.rejectReason}
                </p>
              </div>
            )}

            {(refund.returnShipmentCode ||
              refund.returnCarrier ||
              refund.inspectionStatus !== 'not_required') && (
              <div className={sectionCardClass}>
                <Label className={labelClass}>
                  Thông tin trả hàng / inspection
                </Label>
                <div className="mt-3 grid gap-3 rounded-xl border border-slate-300 bg-slate-50 p-4 text-[15px] sm:grid-cols-2">
                  <div>
                    <span className="block text-xs font-bold text-slate-700">
                      Inspection
                    </span>
                    <span className="mt-1 block text-[15px] font-semibold text-slate-950">
                      {refund.inspectionStatus}
                    </span>
                  </div>
                  {refund.inspectionNote ? (
                    <div className="sm:col-span-2">
                      <span className="block text-xs font-bold text-slate-700">
                        Ghi chú
                      </span>
                      <p className={`${bodyTextClass} mt-1`}>
                        {refund.inspectionNote}
                      </p>
                    </div>
                  ) : null}
                  {refund.inspectionAt ? (
                    <div>
                      <span className="block text-xs font-bold text-slate-700">
                        Thời điểm kiểm tra
                      </span>
                      <span className="mt-1 block text-[15px] font-semibold text-slate-950">
                        {formatDateTime(refund.inspectionAt)}
                      </span>
                    </div>
                  ) : null}
                  {refund.returnCarrier ? (
                    <div>
                      <span className="block text-xs font-bold text-slate-700">
                        Đơn vị vận chuyển
                      </span>
                      <span className="mt-1 block text-[15px] font-semibold text-slate-950">
                        {refund.returnCarrier}
                      </span>
                    </div>
                  ) : null}
                  {refund.returnShipmentCode ? (
                    <div>
                      <span className="block text-xs font-bold text-slate-700">
                        Mã vận đơn trả
                      </span>
                      <span className="mt-1 block text-[15px] font-semibold text-slate-950">
                        {refund.returnShipmentCode}
                      </span>
                    </div>
                  ) : null}
                  {refund.returnReceivedAt ? (
                    <div>
                      <span className="block text-xs font-bold text-slate-700">
                        Nhận hàng lúc
                      </span>
                      <span className="mt-1 block text-[15px] font-semibold text-slate-950">
                        {formatDateTime(refund.returnReceivedAt)}
                      </span>
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {refund.notes && (
              <div className={sectionCardClass}>
                <Label className={labelClass}>Ghi chú</Label>
                <p className="mt-2 rounded-xl border border-slate-300 bg-slate-50 p-4 text-[15px] leading-7 text-slate-950">
                  {refund.notes}
                </p>
              </div>
            )}

            {refund.processedAt && (
              <div className={fieldCardClass}>
                <Label className={labelClass}>Ngày xử lý</Label>
                <p className={valueClass}>{refund.processedAt}</p>
              </div>
            )}

            {refund.payoutProofUrl ? (
              <div className={sectionCardClass}>
                <Label className={labelClass}>Bằng chứng payout</Label>
                <a
                  href={refund.payoutProofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800 transition-colors hover:bg-blue-100"
                >
                  Mở chứng từ
                </a>
              </div>
            ) : null}

            {refund.evidence.length > 0 ? (
              <div className={sectionCardClass}>
                <Label className={labelClass}>Bằng chứng từ khách hàng</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {refund.evidence.map((url, index) => (
                    <a
                      key={`${url}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
                    >
                      Tệp {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {refund.history.length > 0 ? (
              <div className={sectionCardClass}>
                <Label className={labelClass}>Lịch sử xử lý</Label>
                <div className="mt-4 space-y-5 border-l-2 border-slate-200 pl-4">
                  {refund.history
                    .slice()
                    .reverse()
                    .map((entry, index) => (
                      <div
                        key={`${entry.createdAt || entry.action}-${index}`}
                        className="relative text-sm"
                      >
                        <span className="absolute top-1.5 -left-[1.1rem] h-3 w-3 rounded-full border-2 border-white bg-slate-900 shadow-sm" />
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                          <span className="text-[15px] font-semibold text-slate-950">
                            {getHistoryActorLabel(entry.actorName, entry.actorRole)}
                          </span>
                          <span className="text-sm font-medium text-slate-600">
                            {formatDateTime(entry.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 text-[15px] font-semibold text-slate-900">
                          {getHistoryStatusLabel(entry.fromStatus)} {'->'}{' '}
                          {getHistoryStatusLabel(entry.toStatus)}
                        </p>
                        {entry.note ? (
                          <p className="mt-2 max-w-3xl text-[15px] leading-7 text-slate-700">
                            {getHistoryNoteLabel(entry.note)}
                          </p>
                        ) : null}
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter className="border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
