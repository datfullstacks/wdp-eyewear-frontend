import {
  AlertTriangle,
  Banknote,
  CheckCircle,
  CornerUpLeft,
  CreditCard,
  Eye,
  MessageSquareWarning,
  MoreHorizontal,
  PackageCheck,
  RotateCcw,
  XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  RefundRequest,
  formatCurrency,
  hasRefundBankInfo,
  methodConfig,
  statusConfig,
} from '@/types/refund';
import { useTranslations } from 'next-intl';

interface RefundTableProps {
  refunds: RefundRequest[];
  scope: 'sale' | 'manager' | 'operation';
  onDetail: (refund: RefundRequest) => void;
  onApprove: (refund: RefundRequest) => void;
  onReject: (refund: RefundRequest) => void;
  onEscalate: (refund: RefundRequest) => void;
  onRequestInfo: (refund: RefundRequest) => void;
  onResumeReview: (refund: RefundRequest) => void;
  onSendBack: (refund: RefundRequest) => void;
  onConfirmReturnReceived: (refund: RefundRequest) => void;
  onInspectionFailed: (refund: RefundRequest) => void;
  onStartProcessing: (refund: RefundRequest) => void;
  onComplete: (refund: RefundRequest) => void;
  actionsDisabled?: boolean;
}

export const RefundTable = ({
  refunds,
  scope,
  onDetail,
  onApprove,
  onReject,
  onEscalate,
  onRequestInfo,
  onResumeReview,
  onSendBack,
  onConfirmReturnReceived,
  onInspectionFailed,
  onStartProcessing,
  onComplete,
  actionsDisabled = false,
}: RefundTableProps) => {
  const t = useTranslations('manager.refunds.table');
  const ta = useTranslations('manager.refunds.actions');

  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>{t('refundId')}</TableHead>
            <TableHead>{t('orderId')}</TableHead>
            <TableHead>{t('customer')}</TableHead>
            <TableHead>{t('amount')}</TableHead>
            <TableHead>{t('method')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('createdAt')}</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refunds.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-muted-foreground py-8 text-center text-sm"
              >
                {t('noRefunds')}
              </TableCell>
            </TableRow>
          )}

          {refunds.map((refund) => {
            const MethodIcon = methodConfig[refund.method].icon;
            const isOwnedBySales = refund.currentOwnerRole === 'sales';
            const isOwnedByManager = refund.currentOwnerRole === 'manager';
            const isOwnedByOperations = refund.currentOwnerRole === 'operations';
            const hasBankInfo = hasRefundBankInfo(refund.bankInfo);
            const canSaleApprove =
              scope === 'sale' &&
              isOwnedBySales &&
              (refund.status === 'requested' || refund.status === 'reviewing');
            const canSaleReject =
              scope === 'sale' &&
              (refund.status === 'requested' ||
                refund.status === 'reviewing' ||
                refund.status === 'waiting_customer_info');
            const canSaleEscalate =
              scope === 'sale' &&
              isOwnedBySales &&
              (refund.status === 'requested' || refund.status === 'reviewing');
            const canSaleRequestInfo =
              scope === 'sale' &&
              isOwnedBySales &&
              (refund.status === 'requested' ||
                refund.status === 'reviewing' ||
                (!hasBankInfo &&
                  ['approved', 'return_received', 'processing'].includes(
                    refund.status
                  )));
            const canResumeReview =
              scope === 'sale' && refund.status === 'waiting_customer_info';
            const canManagerDecide =
              scope === 'manager' &&
              isOwnedByManager &&
              refund.status === 'escalated_to_manager';
            const canOperationConfirmReturn =
              scope === 'operation' &&
              isOwnedByOperations &&
              refund.status === 'return_pending';
            const canOperationFailInspection =
              scope === 'operation' &&
              isOwnedByOperations &&
              refund.status === 'return_pending';
            const canSaleStartProcessing =
              scope === 'sale' &&
              isOwnedBySales &&
              hasBankInfo &&
              (refund.status === 'return_received' ||
                (refund.status === 'approved' && !refund.requiresReturn));
            const canSaleComplete =
              scope === 'sale' &&
              isOwnedBySales &&
              hasBankInfo &&
              refund.status === 'processing';
            const shouldWarnMissingBankInfo =
              scope === 'sale' &&
              isOwnedBySales &&
              !hasBankInfo &&
              ['approved', 'return_received', 'processing'].includes(
                refund.status
              );

            return (
              <TableRow key={refund.id} className="hover:bg-muted/30">
                <TableCell className="text-foreground font-mono text-sm font-normal">
                  {refund.id}
                </TableCell>
                <TableCell>
                  <span className="text-foreground/80">{refund.orderId}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-foreground font-normal">
                      {refund.customerName}
                    </p>
                    <p className="text-foreground/80 text-sm">
                      {refund.customerPhone}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-destructive font-semibold">
                  {formatCurrency(refund.amount)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MethodIcon className="text-foreground/70 h-4 w-4" />
                    <span className="text-foreground/90">
                      {methodConfig[refund.method].label}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={
                      statusConfig[refund.status].type === 'success'
                        ? 'text-success'
                        : statusConfig[refund.status].type === 'warning'
                          ? 'text-warning'
                          : statusConfig[refund.status].type === 'error'
                            ? 'text-destructive'
                            : 'text-primary'
                    }
                  >
                    {statusConfig[refund.status].label}
                  </span>
                </TableCell>
                <TableCell className="text-foreground/80 text-sm">
                  {refund.createdAt}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-foreground/80 hover:text-foreground h-8 w-8"
                        disabled={actionsDisabled}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onDetail(refund)}>
                        <Eye className="mr-2 h-4 w-4" />
                        {ta('viewDetail')}
                      </DropdownMenuItem>

                      {(canSaleApprove || canManagerDecide) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onApprove(refund)}
                            disabled={actionsDisabled}
                          >
                            <CheckCircle className="text-success mr-2 h-4 w-4" />
                            {ta('approve')}
                          </DropdownMenuItem>
                        </>
                      )}

                      {(canSaleReject || canManagerDecide) && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onReject(refund)}
                            disabled={actionsDisabled}
                          >
                            <XCircle className="text-destructive mr-2 h-4 w-4" />
                            {ta('reject')}
                          </DropdownMenuItem>
                        </>
                      )}

                      {canSaleEscalate && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onEscalate(refund)}
                            disabled={actionsDisabled}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
                            {ta('escalate')}
                          </DropdownMenuItem>
                        </>
                      )}

                      {canSaleRequestInfo && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onRequestInfo(refund)}
                            disabled={actionsDisabled}
                          >
                            <MessageSquareWarning className="mr-2 h-4 w-4" />
                            {ta('requestInfo')}
                          </DropdownMenuItem>
                        </>
                      )}

                      {shouldWarnMissingBankInfo && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem disabled>
                            <Banknote className="mr-2 h-4 w-4 text-amber-600" />
                            Thiếu TK hoàn tiền
                          </DropdownMenuItem>
                        </>
                      )}

                      {canResumeReview && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onResumeReview(refund)}
                            disabled={actionsDisabled}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            {ta('resumeReview')}
                          </DropdownMenuItem>
                        </>
                      )}

                      {canManagerDecide && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onSendBack(refund)}
                            disabled={actionsDisabled}
                          >
                            <CornerUpLeft className="mr-2 h-4 w-4" />
                            {ta('sendBack')}
                          </DropdownMenuItem>
                        </>
                      )}

                      {canOperationConfirmReturn && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onConfirmReturnReceived(refund)}
                            disabled={actionsDisabled}
                          >
                            <PackageCheck className="mr-2 h-4 w-4 text-blue-600" />
                            {ta('confirmReturnReceived')}
                          </DropdownMenuItem>
                        </>
                      )}

                      {canOperationFailInspection && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onInspectionFailed(refund)}
                            disabled={actionsDisabled}
                          >
                            <AlertTriangle className="mr-2 h-4 w-4 text-amber-600" />
                            {ta('inspectionFailed')}
                          </DropdownMenuItem>
                        </>
                      )}

                      {canSaleStartProcessing && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onStartProcessing(refund)}
                            disabled={actionsDisabled}
                          >
                            <CreditCard className="mr-2 h-4 w-4 text-amber-600" />
                            {ta('startProcessing')}
                          </DropdownMenuItem>
                        </>
                      )}

                      {canSaleComplete && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onComplete(refund)}
                            disabled={actionsDisabled}
                          >
                            <Banknote className="mr-2 h-4 w-4 text-emerald-600" />
                            {ta('complete')}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
