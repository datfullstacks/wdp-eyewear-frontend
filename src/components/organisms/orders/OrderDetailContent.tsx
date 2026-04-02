import type { ReactNode } from 'react';
import {
  CalendarClock,
  CreditCard,
  FileText,
  MapPin,
  Package,
  Store,
  Truck,
  User,
} from 'lucide-react';

import type { OrderRecord } from '@/api/orders';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import {
  getCustomerOrderStatusMeta,
  getCustomerShippingStatusMeta,
} from '@/lib/customerOrderStatus';
import { toPrescriptionOrder, toSupplementOrder } from '@/lib/orderAdapters';
import { useTranslations } from 'next-intl';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

function paymentBadgeType(status: OrderRecord['paymentStatus']) {
  switch (status) {
    case 'paid':
      return 'success' as const;
    case 'partial':
      return 'info' as const;
    case 'cod':
      return 'default' as const;
    case 'pending':
    default:
      return 'warning' as const;
  }
}

function resolveDisplayPaymentStatus(order: OrderRecord): OrderRecord['paymentStatus'] {
  if (
    String(order.paymentMethod || '').trim().toLowerCase() === 'sepay' &&
    Number(order.payLaterTotal || 0) > 0 &&
    Number(order.total || 0) > Math.max(0, Number(order.paidAmount || 0))
  ) {
    return 'partial';
  }

  return order.paymentStatus;
}

const PAYMENT_STATUS_TEXT: Record<OrderRecord['paymentStatus'], string> = {
  paid: 'Đã thanh toán',
  pending: 'Chưa thanh toán',
  partial: 'Thanh toán một phần',
  cod: 'COD',
};

const ORDER_TYPE_TEXT: Record<string, string> = {
  ready_stock: 'Hàng có sẵn',
  pre_order: 'Đặt trước',
};

const PAYMENT_METHOD_TEXT: Record<string, string> = {
  cod: 'COD',
  cash: 'Tiền mặt',
  bank_transfer: 'Chuyển khoản',
  banking: 'Chuyển khoản',
  card: 'Thẻ',
  momo: 'MoMo',
  vnpay: 'VNPay',
  zalopay: 'ZaloPay',
};

function orderTypeLabel(order: OrderRecord, hasRx: boolean) {
  const orderType = String(order.orderType || '').toLowerCase();
  if (orderType && ORDER_TYPE_TEXT[orderType]) return ORDER_TYPE_TEXT[orderType];
  if (hasRx) return 'Làm theo đơn';
  return order.orderType || '-';
}

function paymentMethodLabel(method: string) {
  const normalized = String(method || '').trim().toLowerCase();
  if (!normalized) return '-';
  return PAYMENT_METHOD_TEXT[normalized] || normalized.replace(/_/g, ' ');
}

function Label({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground text-xs font-medium">{children}</p>;
}

function Value({ children }: { children: ReactNode }) {
  return <p className="text-foreground text-sm font-semibold">{children}</p>;
}

function SectionTitle({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em]">
      {icon}
      {children}
    </div>
  );
}

function InfoTile({
  label,
  children,
}: {
  label: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white/80 p-3">
      <Label>{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function PrescriptionSummary({
  order,
}: {
  order: NonNullable<ReturnType<typeof toPrescriptionOrder>>;
}) {
  const prescription = order.prescription;
  const sourceLabel =
    order.source === 'customer_upload'
      ? 'Khách upload toa'
      : order.source === 'customer_input'
        ? 'Khách tự nhập thông số'
        : 'Đang chờ Rx';

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <InfoTile label="Trạng thái Rx">
          <Value>{order.prescriptionStatus}</Value>
          <p className="text-muted-foreground mt-1 text-xs">Nguồn: {sourceLabel}</p>
        </InfoTile>

        <InfoTile label="Loại tròng">
          <Value>{prescription?.lensType || '-'}</Value>
        </InfoTile>

        <InfoTile label="Lớp phủ">
          <Value>{prescription?.coating || '-'}</Value>
        </InfoTile>
      </div>

      {prescription ? (
        <div className="bg-background/70 border-border rounded-lg border p-3">
          <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold text-slate-700">
            <div />
            <div>SPH</div>
            <div>CYL</div>
            <div>AXIS</div>
            <div>ADD</div>
          </div>

          <div className="mt-2 grid grid-cols-5 gap-2 text-center text-sm font-medium text-slate-900">
            <div className="font-semibold text-slate-950">OD</div>
            <div>{prescription.sphereRight || '-'}</div>
            <div>{prescription.cylinderRight || '-'}</div>
            <div>{prescription.axisRight || '-'}</div>
            <div>{prescription.addRight || '-'}</div>
          </div>

          <div className="mt-2 grid grid-cols-5 gap-2 text-center text-sm font-medium text-slate-900">
            <div className="font-semibold text-slate-950">OS</div>
            <div>{prescription.sphereLeft || '-'}</div>
            <div>{prescription.cylinderLeft || '-'}</div>
            <div>{prescription.axisLeft || '-'}</div>
            <div>{prescription.addLeft || '-'}</div>
          </div>

          <div className="mt-3 border-t border-slate-200 pt-3 text-sm">
            <span className="font-medium text-slate-700">PD: </span>
            <span className="font-semibold text-slate-950">
              {prescription.pd || '-'} mm
            </span>
          </div>

          {prescription.notes ? (
            <div className="mt-3 border-t border-slate-200 pt-3">
              <Label>Ghi chú Rx</Label>
              <p className="text-foreground mt-1 whitespace-pre-wrap text-sm leading-6">
                {prescription.notes}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {order.attachmentUrl ? (
        <div className="bg-background/70 border-border rounded-lg border p-3">
          <div className="flex items-center justify-between gap-3">
            <Label>Toa upload</Label>
            <a
              href={order.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-medium text-sky-700 underline"
            >
              Mở ảnh gốc
            </a>
          </div>
          <img
            src={order.attachmentUrl}
            alt={`Prescription ${order.orderId}`}
            className="mt-3 max-h-96 w-full rounded-lg border border-slate-200 object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}

export function OrderDetailContent({ order }: { order: OrderRecord }) {
  const tc = useTranslations('manager.common');
  
  const createdAtLabel = order.createdAt
    ? new Date(order.createdAt).toLocaleString('vi-VN')
    : '-';

  const rx = toPrescriptionOrder(order);
  const supplement = toSupplementOrder(order);
  const orderTypeText = orderTypeLabel(order, Boolean(rx || supplement));
  const orderStatusMeta = getCustomerOrderStatusMeta(order);
  const shippingStatusMeta = getCustomerShippingStatusMeta(order);
  const trackingCode =
    order.shipment?.orderCode || order.shipment?.trackingCode || '-';
  const displayPaymentStatus = resolveDisplayPaymentStatus(order);
  const serviceLabel =
    order.shipment?.serviceName ||
    (order.shipment?.provider
      ? order.shipment.provider.toUpperCase()
      : 'Chưa tạo vận đơn');

  return (
    <div className="space-y-3">
      <div className="min-h-[108px] overflow-hidden rounded-xl border border-amber-200 bg-amber-50 px-4 py-5 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="text-slate-950">
            <span className="text-[11px] font-semibold tracking-[0.22em] text-slate-950/60">
              ĐƠN HÀNG
            </span>
            <span className="mt-1 block text-base font-extrabold leading-tight tracking-tight sm:text-lg">
              {order.code}
            </span>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-700">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" />
                {createdAtLabel}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5" />
                {order.storeName || '-'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={orderStatusMeta.type}>
              {orderStatusMeta.labelKey ? tc(`orderStatus.${orderStatusMeta.labelKey}` as any) : orderStatusMeta.label}
            </StatusBadge>
            <StatusBadge status={paymentBadgeType(displayPaymentStatus)}>
              {PAYMENT_STATUS_TEXT[displayPaymentStatus]}
            </StatusBadge>
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900">
              Loại đơn: {orderTypeText}
            </span>
          </div>
        </div>
      </div>

      <section className="bg-muted/20 border-border rounded-xl border p-3.5">
        <SectionTitle icon={<User className="h-4 w-4 text-yellow-600" />}>
          THÔNG TIN KHÁCH HÀNG
        </SectionTitle>

        <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <Label>Họ tên</Label>
            <p className="text-foreground mt-1 text-sm font-semibold">
              {order.customerName}
            </p>
          </div>

          <div>
            <Label>Số điện thoại</Label>
            <p className="text-foreground mt-1 text-sm font-semibold">
              {order.customerPhone || '-'}
            </p>
          </div>

          <div className="sm:col-span-2">
            <Label>Địa chỉ giao hàng</Label>
            <p className="text-foreground mt-1 flex items-start gap-1.5 text-sm font-semibold">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
              <span>{order.customerAddress || '-'}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="bg-muted/20 border-border rounded-xl border p-3.5">
        <SectionTitle icon={<Truck className="h-4 w-4 text-yellow-600" />}>
          THÔNG TIN ĐƠN HÀNG
        </SectionTitle>

        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <InfoTile label="Trạng thái đơn">
            <StatusBadge status={orderStatusMeta.type}>
              {orderStatusMeta.labelKey ? tc(`orderStatus.${orderStatusMeta.labelKey}` as any) : orderStatusMeta.label}
            </StatusBadge>
          </InfoTile>

          <InfoTile label="Thanh toán">
            <div className="space-y-1.5">
              <StatusBadge status={paymentBadgeType(displayPaymentStatus)}>
                {PAYMENT_STATUS_TEXT[displayPaymentStatus]}
              </StatusBadge>
              <p className="text-muted-foreground text-xs">
                Phương thức: {paymentMethodLabel(order.paymentMethod)}
              </p>
              {order.paidAmount > 0 ? (
                <p className="text-muted-foreground text-xs">
                  Đã trả: {formatCurrency(order.paidAmount)}
                </p>
              ) : null}
            </div>
          </InfoTile>

          <InfoTile label="Vận chuyển">
            {shippingStatusMeta ? (
              <div className="space-y-1.5">
                <StatusBadge status={shippingStatusMeta.type}>
                  {shippingStatusMeta.labelKey ? tc(`shippingStatus.${shippingStatusMeta.labelKey}` as any) : shippingStatusMeta.label}
                </StatusBadge>
                <p className="text-muted-foreground text-xs">{serviceLabel}</p>
              </div>
            ) : (
              <Value>Chưa tạo vận đơn</Value>
            )}
          </InfoTile>

          <InfoTile label="Mã vận đơn">
            <Value>{trackingCode}</Value>
            {order.shipment?.trackingUrl ? (
              <a
                href={order.shipment.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex text-xs font-medium text-sky-700 underline"
              >
                Xem hành trình
              </a>
            ) : null}
          </InfoTile>

          <InfoTile label="Ngày tạo">
            <Value>{createdAtLabel}</Value>
          </InfoTile>

          <InfoTile label="Cửa hàng">
            <Value>{order.storeName || '-'}</Value>
          </InfoTile>
        </div>
      </section>

      <section className="bg-muted/20 border-border rounded-xl border p-3.5">
        <SectionTitle icon={<Package className="h-4 w-4 text-yellow-600" />}>
          SẢN PHẨM ĐẶT MUA
        </SectionTitle>

        <div className="mt-3 space-y-2.5">
          {order.items.map((item) => {
            const isRx =
              item.hasPrescription ||
              item.orderMadeFromPrescriptionImage ||
              item.prescriptionMode !== 'none';

            return (
              <div
                key={item.id || `${item.name}-${item.variant}`}
                className="bg-background/60 border-border flex items-center gap-2.5 rounded-lg border p-2.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-yellow-400/20 bg-yellow-400/10 text-yellow-700">
                  <span className="text-xs font-bold">WD</span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {item.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="bg-muted text-muted-foreground inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium">
                      {item.variant || 'Mặc định'}
                    </span>
                    <span className="text-muted-foreground text-[11px] font-medium">
                      SL: {item.quantity}
                    </span>
                    {item.preOrder ? (
                      <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                        Đặt trước
                      </span>
                    ) : null}
                    {isRx ? (
                      <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700">
                        Rx
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-foreground text-sm font-semibold">
                    {formatCurrency(item.lineTotal)}
                  </p>
                  <p className="text-muted-foreground text-[11px] font-medium">
                    {formatCurrency(item.unitPrice)} / sp
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-border mt-3 flex items-end justify-between border-t pt-3">
          <div className="space-y-1">
            <p className="text-muted-foreground text-sm font-medium">Tổng cộng</p>
            {order.paidAmount > 0 ? (
              <p className="text-muted-foreground text-xs">
                Đã trả: {formatCurrency(order.paidAmount)}
              </p>
            ) : null}
          </div>
          <p className="text-foreground text-xl font-extrabold tracking-tight sm:text-2xl">
            {formatCurrency(order.total)}
          </p>
        </div>
      </section>

      {order.note ? (
        <section className="rounded-xl border border-yellow-400/25 bg-yellow-400/10 p-3.5">
          <SectionTitle icon={<CreditCard className="h-4 w-4 text-yellow-700" />}>
            GHI CHÚ
          </SectionTitle>
          <p className="text-foreground mt-1.5 whitespace-pre-wrap text-sm font-medium leading-6">
            {order.note}
          </p>
        </section>
      ) : null}

      {(rx || supplement) ? (
        <section className="bg-muted/20 border-border rounded-xl border p-3.5">
          <SectionTitle icon={<FileText className="h-4 w-4 text-yellow-600" />}>
            TOA KÍNH
          </SectionTitle>

          <div className="mt-3 space-y-3">
            {rx ? <PrescriptionSummary order={rx} /> : null}

            {supplement ? (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <Label>Cần bổ sung</Label>
                <p className="text-foreground mt-1 text-sm font-semibold">
                  {supplement.missingType}
                </p>
                {supplement.missingFields?.length > 0 ? (
                  <p className="text-muted-foreground mt-1 text-xs leading-5">
                    {supplement.missingFields
                      .map((field) => field.label)
                      .join(', ')}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
