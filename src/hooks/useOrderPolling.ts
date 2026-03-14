import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getOrderDetail } from '@/api/saleCheckout';
import type {
  InvoiceStatus,
  OrderDetailData,
  OrderStatus,
  PaymentStatus,
  RealtimeOrderStatuses,
} from '@/types/saleCheckout';

const DEFAULT_INTERVAL = 3000;
const DEFAULT_TIMEOUT = 10 * 60 * 1000;

function normalizePaymentStatus(value?: string): PaymentStatus {
  const status = String(value || '').trim().toLowerCase();
  if (status === 'paid') return 'paid';
  if (status === 'failed') return 'failed';
  if (status.includes('pending') || status.includes('qr')) return 'pending';
  return 'unknown';
}

function normalizeOrderStatus(value?: string): OrderStatus {
  const status = String(value || '').trim().toLowerCase();
  if (status === 'pending') return 'pending';
  if (status === 'confirmed') return 'confirmed';
  if (status === 'cancelled') return 'cancelled';
  return 'unknown';
}

function normalizeInvoiceStatus(value?: string): InvoiceStatus {
  const status = String(value || '').trim().toLowerCase();
  if (status === 'issued') return 'issued';
  if (status === 'paid') return 'paid';
  if (status === 'void') return 'void';
  return 'unknown';
}

interface UseOrderPollingOptions {
  intervalMs?: number;
  timeoutMs?: number;
}

export function useOrderPolling(options?: UseOrderPollingOptions) {
  const intervalMs = options?.intervalMs ?? DEFAULT_INTERVAL;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [orderDetail, setOrderDetail] = useState<OrderDetailData | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingError, setPollingError] = useState('');
  const [pollingTimedOut, setPollingTimedOut] = useState(false);

  const statuses = useMemo<RealtimeOrderStatuses>(() => {
    if (!orderDetail) {
      return {
        paymentStatus: 'unknown',
        orderStatus: 'unknown',
        invoiceStatus: 'unknown',
      };
    }

    return {
      paymentStatus: normalizePaymentStatus(
        orderDetail.paymentStatus || orderDetail.payment?.status
      ),
      orderStatus: normalizeOrderStatus(orderDetail.status),
      invoiceStatus: normalizeInvoiceStatus(orderDetail.invoiceId?.status),
    };
  }, [orderDetail]);

  const stopOrderPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsPolling(false);
  }, []);

  const startOrderPolling = useCallback(
    (orderId: string) => {
      if (!orderId) return;

      stopOrderPolling();
      setPollingError('');
      setPollingTimedOut(false);
      setIsPolling(true);

      const pollOnce = async () => {
        try {
          const detail = await getOrderDetail(orderId);
          setOrderDetail(detail);

          const paymentStatus = normalizePaymentStatus(
            detail.paymentStatus || detail.payment?.status
          );
          const orderStatus = normalizeOrderStatus(detail.status);

          const shouldStop =
            paymentStatus === 'paid' ||
            paymentStatus === 'failed' ||
            orderStatus === 'cancelled';

          if (shouldStop) {
            stopOrderPolling();
          }
        } catch (error) {
          const message =
            (
              error as {
                response?: { data?: { message?: string } };
                message?: string;
              }
            )?.response?.data?.message ||
            (error as { message?: string })?.message ||
            'Không thể kiểm tra trạng thái đơn hàng.';
          setPollingError(message);
        }
      };

      pollOnce();
      intervalRef.current = setInterval(pollOnce, intervalMs);
      timeoutRef.current = setTimeout(() => {
        setPollingTimedOut(true);
        stopOrderPolling();
      }, timeoutMs);
    },
    [intervalMs, stopOrderPolling, timeoutMs]
  );

  useEffect(() => {
    return () => {
      stopOrderPolling();
    };
  }, [stopOrderPolling]);

  return {
    orderDetail,
    statuses,
    isPolling,
    pollingError,
    pollingTimedOut,
    setOrderDetail,
    startOrderPolling,
    stopOrderPolling,
  };
}
