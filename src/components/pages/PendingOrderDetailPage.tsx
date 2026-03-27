'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';

import { orderApi } from '@/api';
import {
  PendingDetailContent,
  ProcessModal,
  RejectModal,
  SendBackModal,
} from '@/components/organisms/pending';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toPendingOrder } from '@/lib/orderAdapters';
import { needsActionOrder } from '@/lib/orderWorkflow';
import {
  canManagerApprovePendingOrder,
  canManagerHandlePendingOrder,
  canSaleHandlePendingOrder,
  needsManagerReview,
  PENDING_ORDER_APPROVAL_MESSAGE,
  PENDING_ORDER_MANAGER_APPROVAL_MESSAGE,
} from '@/lib/pendingOrders';
import { PendingOrder } from '@/types/pending';

type PendingOrderDetailPageProps = {
  scope: 'sale' | 'manager';
  backHref: string;
  backLabel: string;
};

function extractApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return fallback;
}

export function PendingOrderDetailPage({
  scope,
  backHref,
  backLabel,
}: PendingOrderDetailPageProps) {
  const params = useParams();
  const router = useRouter();
  const routeId = String(params.id || '').trim().toLowerCase();

  const [order, setOrder] = useState<PendingOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [processModal, setProcessModal] = useState<PendingOrder | null>(null);
  const [rejectModal, setRejectModal] = useState<PendingOrder | null>(null);
  const [sendBackModal, setSendBackModal] = useState<PendingOrder | null>(null);

  const loadOrder = useCallback(async () => {
    if (!routeId) {
      setOrder(null);
      setErrorMessage('Không tìm thấy mã đơn hàng.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);

      const result = await orderApi.getAll({
        page: 1,
        limit: 200,
      });

      const mapped = result.orders.filter(needsActionOrder).map(toPendingOrder);
      const scoped =
        scope === 'manager'
          ? mapped.filter((nextOrder) => canManagerHandlePendingOrder(nextOrder))
          : mapped.filter((nextOrder) => !needsManagerReview(nextOrder));

      const matchedOrder =
        scoped.find((nextOrder) => {
          const orderCode = String(nextOrder.id || '').trim().toLowerCase();
          const orderDbId = String(nextOrder.orderDbId || '')
            .trim()
            .toLowerCase();
          return orderCode === routeId || orderDbId === routeId;
        }) || null;

      if (!matchedOrder) {
        setOrder(null);
        setErrorMessage('Không tìm thấy đơn cần xử lý.');
        return;
      }

      setOrder(matchedOrder);
    } catch (error) {
      setOrder(null);
      setErrorMessage(
        extractApiErrorMessage(error, 'Không thể tải chi tiết đơn cần xử lý.')
      );
    } finally {
      setIsLoading(false);
    }
  }, [routeId, scope]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const leaveDetail = useCallback(() => {
    router.push(backHref);
  }, [backHref, router]);

  const handleProcessOrder = useCallback(async () => {
    if (!processModal?.orderDbId) {
      setProcessModal(null);
      return;
    }

    if (
      (scope === 'manager' && !canManagerApprovePendingOrder(processModal)) ||
      (scope !== 'manager' && !canSaleHandlePendingOrder(processModal))
    ) {
      setErrorMessage(
        scope === 'manager'
          ? PENDING_ORDER_MANAGER_APPROVAL_MESSAGE
          : PENDING_ORDER_APPROVAL_MESSAGE
      );
      setProcessModal(null);
      return;
    }

    try {
      setIsSubmittingAction(true);
      setErrorMessage(null);
      await orderApi.updateStatus(processModal.orderDbId, 'confirmed');
      setProcessModal(null);
      leaveDetail();
    } catch (error) {
      setErrorMessage(
        extractApiErrorMessage(error, 'Không thể duyệt đơn hàng này.')
      );
    } finally {
      setIsSubmittingAction(false);
    }
  }, [leaveDetail, processModal, scope]);

  const handleEscalateOrder = useCallback(
    async (nextOrder: PendingOrder) => {
      if (!nextOrder.orderDbId) return;

      try {
        setIsSubmittingAction(true);
        setErrorMessage(null);
        await orderApi.updateOpsExecution(nextOrder.orderDbId, {
          approvalState: 'manager_review_requested',
          managerReviewRequestedAt: new Date().toISOString(),
          managerReviewRequestedBy: 'Sales/Support',
          managerReviewReason:
            nextOrder.paymentStatus === 'cod'
              ? 'Đơn COD cần manager xác nhận trước khi handoff.'
              : nextOrder.paymentStatus === 'partial'
                ? 'Đơn thanh toán một phần cần manager xác nhận.'
                : 'Case pending cần manager review.',
        });
        leaveDetail();
      } catch (error) {
        setErrorMessage(
          extractApiErrorMessage(error, 'Không thể chuyển đơn hàng lên manager.')
        );
      } finally {
        setIsSubmittingAction(false);
      }
    },
    [leaveDetail]
  );

  const handleRejectOrder = useCallback(
    async (reason: string) => {
      if (!rejectModal?.orderDbId) {
        setRejectModal(null);
        return;
      }

      try {
        setIsSubmittingAction(true);
        setErrorMessage(null);
        await orderApi.cancel(rejectModal.orderDbId, {
          reason: reason || 'Đơn bị từ chối bởi nhân viên',
        });
        setRejectModal(null);
        leaveDetail();
      } catch (error) {
        setErrorMessage(
          extractApiErrorMessage(error, 'Không thể từ chối đơn hàng này.')
        );
      } finally {
        setIsSubmittingAction(false);
      }
    },
    [leaveDetail, rejectModal]
  );

  const handleSendBackToSale = useCallback(
    async (reason: string) => {
      if (!sendBackModal?.orderDbId) {
        setSendBackModal(null);
        return;
      }

      try {
        setIsSubmittingAction(true);
        setErrorMessage(null);
        await orderApi.updateOpsExecution(sendBackModal.orderDbId, {
          approvalState: 'sent_back_to_sale',
          managerReviewRequestedBy: 'Manager',
          managerReviewReason: reason || 'Manager yêu cầu sale xử lý lại.',
        });
        setSendBackModal(null);
        leaveDetail();
      } catch (error) {
        setErrorMessage(
          extractApiErrorMessage(error, 'Không thể trả lại đơn hàng cho sale.')
        );
      } finally {
        setIsSubmittingAction(false);
      }
    },
    [leaveDetail, sendBackModal]
  );

  return (
    <>
      <div className="space-y-4 p-4 sm:p-5">
        <Button
          variant="outline"
          size="sm"
          className="border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-100 hover:text-slate-950"
          asChild
        >
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>

        {isLoading ? (
          <Card className="flex min-h-[240px] items-center justify-center p-5">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang tải chi tiết đơn cần xử lý...
            </div>
          </Card>
        ) : null}

        {!isLoading && errorMessage ? (
          <Card className="p-5">
            <div className="flex items-start gap-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-3">
                <p>{errorMessage}</p>
                <Button variant="outline" onClick={() => void loadOrder()}>
                  Tải lại
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {!isLoading && !errorMessage && order ? (
          <PendingDetailContent
            scope={scope}
            order={order}
            onReject={setRejectModal}
            onEscalate={(nextOrder) => {
              void handleEscalateOrder(nextOrder);
            }}
            onSendBack={setSendBackModal}
            onProcess={setProcessModal}
          />
        ) : null}
      </div>

      <ProcessModal
        scope={scope}
        order={processModal}
        onClose={() => {
          if (isSubmittingAction) return;
          setProcessModal(null);
        }}
        onConfirm={() => {
          if (isSubmittingAction) return;
          void handleProcessOrder();
        }}
      />

      <RejectModal
        order={rejectModal}
        onClose={() => {
          if (isSubmittingAction) return;
          setRejectModal(null);
        }}
        onConfirm={(reason) => {
          if (isSubmittingAction) return;
          void handleRejectOrder(reason);
        }}
      />

      <SendBackModal
        order={sendBackModal}
        onClose={() => {
          if (isSubmittingAction) return;
          setSendBackModal(null);
        }}
        onConfirm={(reason) => {
          if (isSubmittingAction) return;
          void handleSendBackToSale(reason);
        }}
      />
    </>
  );
}
