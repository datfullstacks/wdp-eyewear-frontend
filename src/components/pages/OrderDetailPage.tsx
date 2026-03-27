'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';

import { orderApi, type OrderRecord } from '@/api/orders';
import { Header } from '@/components/organisms/Header';
import { OrderDetailContent } from '@/components/organisms/orders/OrderDetailContent';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type OrderDetailPageProps = {
  backHref: string;
  backLabel: string;
};

export function OrderDetailPage({
  backHref,
  backLabel,
}: OrderDetailPageProps) {
  const params = useParams();
  const orderId = String(params.id || '').trim();

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      setErrorMessage('Khong tim thay ma don hang.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      const nextOrder = await orderApi.getById(orderId);
      setOrder(nextOrder);
    } catch (error) {
      setOrder(null);
      setErrorMessage(
        error instanceof Error ? error.message : 'Khong the tai chi tiet don hang.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  return (
    <>
      <Header
        title="Chi tiet don hang"
        subtitle={order ? `Don ${order.code}` : 'Theo doi thong tin don ban hang'}
      />

      <div className="space-y-6 p-6">
        <Button variant="outline" asChild>
          <Link href={backHref}>
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        </Button>

        {isLoading ? (
          <Card className="flex min-h-[320px] items-center justify-center p-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Dang tai chi tiet don hang...
            </div>
          </Card>
        ) : null}

        {!isLoading && errorMessage ? (
          <Card className="p-6">
            <div className="flex items-start gap-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div className="space-y-3">
                <p>{errorMessage}</p>
                <Button variant="outline" onClick={() => void loadOrder()}>
                  Tai lai
                </Button>
              </div>
            </div>
          </Card>
        ) : null}

        {!isLoading && !errorMessage && order ? (
          <Card className="p-6">
            <OrderDetailContent order={order} />
          </Card>
        ) : null}
      </div>
    </>
  );
}
