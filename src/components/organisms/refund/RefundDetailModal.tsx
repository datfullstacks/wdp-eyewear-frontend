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

export const RefundDetailModal = ({
  refund,
  open,
  onOpenChange,
}: RefundDetailModalProps) => {
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
            ? 'Customer'
            : 'Closed';
  const nextActionLabel =
    refund?.nextActionCode === 'customer_submit_info'
      ? 'Cho khach bo sung thong tin'
      : refund?.nextActionCode === 'manager_approve'
        ? 'Cho manager quyet dinh'
        : refund?.nextActionCode === 'confirm_return_received'
          ? 'Cho operation nhan/QC hang hoan'
          : refund?.nextActionCode === 'start_processing'
            ? 'Cho operation bat dau payout'
            : refund?.nextActionCode === 'complete'
              ? 'Cho operation xac nhan da chuyen tien'
              : refund?.nextActionCode === 'start_review'
                ? 'Cho staff review'
                : '-';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] w-[92vw] max-w-lg overflow-y-auto p-4 sm:p-5">
        <DialogHeader>
          <DialogTitle className="text-foreground text-base font-semibold">
            Chi tiet yeu cau hoan tien {refund?.id}
          </DialogTitle>
          <DialogDescription className="text-foreground/70">
            Thong tin chi tiet ve yeu cau hoan tien
          </DialogDescription>
        </DialogHeader>

        {refund && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground/80">Ma don hang</Label>
                <p className="font-medium">{refund.orderId}</p>
              </div>
              <div>
                <Label className="text-foreground/80">Trang thai</Label>
                <div className="mt-1">
                  <StatusBadge status={statusConfig[refund.status].type}>
                    {statusConfig[refund.status].label}
                  </StatusBadge>
                </div>
              </div>
              <div>
                <Label className="text-foreground/80">Khach hang</Label>
                <p className="font-medium">{refund.customerName}</p>
                <p className="text-foreground/70 text-sm">
                  {refund.customerPhone}
                </p>
              </div>
              <div>
                <Label className="text-foreground/80">So tien hoan</Label>
                <p className="text-destructive text-lg font-bold">
                  {formatCurrency(refund.amount)}
                </p>
              </div>
            </div>

            <div>
              <Label className="text-foreground/80">Ly do hoan tien</Label>
              <p className="bg-muted/30 mt-1 rounded-lg p-3">{refund.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground/80">
                  Phuong thuc hoan tien
                </Label>
                <p className="font-medium">
                  {methodConfig[refund.method].label}
                </p>
              </div>
              <div>
                <Label className="text-foreground/80">Ngay tao yeu cau</Label>
                <p className="font-medium">{refund.createdAt}</p>
              </div>
            </div>

            {breakdown && (
              <div className="bg-muted/30 rounded-lg p-3">
                <Label className="text-foreground/80">
                  Breakdown hoan tien
                </Label>
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="text-foreground/70">Tien hang:</span>{' '}
                    {formatCurrency(breakdown.itemAmount)}
                  </p>
                  <p>
                    <span className="text-foreground/70">Phi giao hang:</span>{' '}
                    {formatCurrency(breakdown.shippingFeeAmount)}
                  </p>
                  <p>
                    <span className="text-foreground/70">Phi gui tra:</span>{' '}
                    {formatCurrency(breakdown.returnShippingFeeAmount)}
                  </p>
                  <p>
                    <span className="text-foreground/70">Tong:</span>{' '}
                    <span className="font-semibold">
                      {formatCurrency(breakdown.total)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {refund.bankInfo && (
              <div className="bg-muted/30 rounded-lg p-3">
                <Label className="text-foreground/80">
                  Tai khoan nhan tien
                </Label>
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="text-foreground/70">Ngan hang:</span>{' '}
                    {refund.bankInfo.bankName}
                  </p>
                  <p>
                    <span className="text-foreground/70">So TK:</span>{' '}
                    {refund.bankInfo.accountNumber}
                  </p>
                  <p>
                    <span className="text-foreground/70">Chu TK:</span>{' '}
                    {refund.bankInfo.accountHolder}
                  </p>
                  {refund.bankInfo.note && (
                    <p>
                      <span className="text-foreground/70">Ghi chu:</span>{' '}
                      {refund.bankInfo.note}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground/80">Trach nhiem</Label>
                <p className="font-medium">{refund.responsibility || '-'}</p>
              </div>
              <div>
                <Label className="text-foreground/80">Can tra hang</Label>
                <p className="font-medium">
                  {refund.requiresReturn ? 'Co' : 'Khong'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground/80">Owner hien tai</Label>
                <p className="font-medium">{ownerLabel}</p>
              </div>
              <div>
                <Label className="text-foreground/80">Buoc tiep theo</Label>
                <p className="font-medium">{nextActionLabel}</p>
              </div>
            </div>

            {refund.escalateReason && (
              <div>
                <Label className="text-foreground/80">Ly do escalate</Label>
                <p className="bg-muted/30 mt-1 rounded-lg p-3">
                  {refund.escalateReason}
                </p>
              </div>
            )}

            {refund.rejectReason && (
              <div>
                <Label className="text-foreground/80">Ly do tu choi</Label>
                <p className="bg-muted/30 mt-1 rounded-lg p-3">
                  {refund.rejectReason}
                </p>
              </div>
            )}

            {(refund.returnShipmentCode ||
              refund.returnCarrier ||
              refund.inspectionStatus !== 'not_required') && (
              <div className="bg-muted/30 rounded-lg p-3">
                <Label className="text-foreground/80">Thong tin return / inspection</Label>
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="text-foreground/70">Inspection:</span>{' '}
                    {refund.inspectionStatus}
                  </p>
                  {refund.inspectionNote ? (
                    <p>
                      <span className="text-foreground/70">Note:</span>{' '}
                      {refund.inspectionNote}
                    </p>
                  ) : null}
                  {refund.inspectionAt ? (
                    <p>
                      <span className="text-foreground/70">Inspection at:</span>{' '}
                      {formatDateTime(refund.inspectionAt)}
                    </p>
                  ) : null}
                  {refund.returnCarrier ? (
                    <p>
                      <span className="text-foreground/70">Carrier:</span>{' '}
                      {refund.returnCarrier}
                    </p>
                  ) : null}
                  {refund.returnShipmentCode ? (
                    <p>
                      <span className="text-foreground/70">Ma van don tra:</span>{' '}
                      {refund.returnShipmentCode}
                    </p>
                  ) : null}
                  {refund.returnReceivedAt ? (
                    <p>
                      <span className="text-foreground/70">Nhan hang luc:</span>{' '}
                      {formatDateTime(refund.returnReceivedAt)}
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            {refund.notes && (
              <div>
                <Label className="text-foreground/80">Ghi chu</Label>
                <p className="bg-muted/30 mt-1 rounded-lg p-3">
                  {refund.notes}
                </p>
              </div>
            )}

            {refund.processedAt && (
              <div>
                <Label className="text-foreground/80">Ngay xu ly</Label>
                <p className="font-medium">{refund.processedAt}</p>
              </div>
            )}

            {refund.payoutProofUrl ? (
              <div>
                <Label className="text-foreground/80">Bang chung payout</Label>
                <a
                  href={refund.payoutProofUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-blue-600 underline"
                >
                  Mo chung tu
                </a>
              </div>
            ) : null}

            {refund.evidence.length > 0 ? (
              <div>
                <Label className="text-foreground/80">Evidence tu customer</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {refund.evidence.map((url, index) => (
                    <a
                      key={`${url}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-blue-600 underline"
                    >
                      Evidence {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            ) : null}

            {refund.history.length > 0 ? (
              <div>
                <Label className="text-foreground/80">Timeline</Label>
                <div className="mt-2 space-y-2">
                  {refund.history
                    .slice()
                    .reverse()
                    .map((entry, index) => (
                      <div
                        key={`${entry.createdAt || entry.action}-${index}`}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium text-slate-900">
                            {entry.actorName || entry.actorRole || 'System'}
                          </span>
                          <span className="text-slate-500">
                            {formatDateTime(entry.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-700">
                          {entry.fromStatus} {'->'} {entry.toStatus}
                        </p>
                        {entry.note ? (
                          <p className="mt-1 text-slate-600">{entry.note}</p>
                        ) : null}
                      </div>
                    ))}
                </div>
              </div>
            ) : null}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Dong
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
