'use client';

import { Card } from '@/components/ui/card';
import type { RevenueSummary } from '@/api/analytics';

import {
  DistributionBars,
  TrendComparisonChart,
  type ChartDatum,
} from './ChartPrimitives';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatCompactCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0);

function formatOrderType(type: string) {
  switch (String(type || '').trim().toLowerCase()) {
    case 'ready_stock':
      return 'Ready stock';
    case 'pre_order':
      return 'Pre-order';
    default:
      return type || '--';
  }
}

function formatPaymentMethod(method: string) {
  switch (String(method || '').trim().toLowerCase()) {
    case 'sepay':
      return 'SePay';
    case 'cod':
      return 'COD';
    default:
      return method || '--';
  }
}

function toDistributionData(
  rows: Array<{
    type?: string;
    method?: string;
    revenue: number;
    orders: number;
  }>,
  kind: 'type' | 'method',
): ChartDatum[] {
  const palette =
    kind === 'type'
      ? ['#0f766e', '#f97316', '#2563eb', '#be123c']
      : ['#7c3aed', '#0284c7', '#ea580c', '#16a34a'];

  return (Array.isArray(rows) ? rows : [])
    .sort((left, right) => right.revenue - left.revenue)
    .map((row, index) => ({
      label:
        kind === 'type'
          ? formatOrderType(row.type || '')
          : formatPaymentMethod(row.method || ''),
      value: Number(row.revenue || 0),
      color: palette[index % palette.length],
      hint: `${row.orders || 0} orders`,
    }));
}

export function ManagerRevenueInsights({
  summary,
  title = 'Revenue intelligence',
  subtitle = 'Booked revenue vs collected cash across the latest six months.',
}: {
  summary: RevenueSummary | null;
  title?: string;
  subtitle?: string;
}) {
  if (!summary) {
    return null;
  }

  const orderTypeData = toDistributionData(summary.byOrderType, 'type');
  const paymentMethodData = toDistributionData(summary.byPaymentMethod, 'method');
  const peakMonth =
    [...(summary.monthly || [])].sort((left, right) => right.revenue - left.revenue)[0] ||
    null;
  const peakOrderMonth =
    [...(summary.monthly || [])].sort((left, right) => right.orders - left.orders)[0] ||
    null;
  const collectionRate =
    summary.summary.monthlyRevenue > 0
      ? (summary.summary.monthlyCollected / summary.summary.monthlyRevenue) * 100
      : 0;

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <Card className="p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            </div>
            <div className="rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
              Collection rate: {collectionRate.toFixed(0)}%
            </div>
          </div>

          <div className="mt-6">
            <TrendComparisonChart
              labels={(summary.monthly || []).map((item) => item.month)}
              series={[
                {
                  label: 'Revenue',
                  color: '#0f766e',
                  values: (summary.monthly || []).map((item) => item.revenue),
                  fill: true,
                },
                {
                  label: 'Collected',
                  color: '#2563eb',
                  values: (summary.monthly || []).map((item) => item.collected),
                },
              ]}
              valueFormatter={formatCompactCurrency}
            />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Signals</h3>
            <div className="mt-4 grid gap-4">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Peak revenue month
                </div>
                <div className="mt-2 text-lg font-semibold text-gray-900">
                  {peakMonth?.month || '--'}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {peakMonth ? formatCurrency(peakMonth.revenue) : '--'}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Highest order volume
                </div>
                <div className="mt-2 text-lg font-semibold text-gray-900">
                  {peakOrderMonth?.month || '--'}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {peakOrderMonth ? `${peakOrderMonth.orders} orders` : '--'}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Dominant payment rail
                </div>
                <div className="mt-2 text-lg font-semibold text-gray-900">
                  {paymentMethodData[0]?.label || '--'}
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {paymentMethodData[0]
                    ? formatCurrency(paymentMethodData[0].value)
                    : '--'}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly order cadence</h3>
            <div className="mt-4">
              <DistributionBars
                data={(summary.monthly || []).map((row, index) => ({
                  label: row.month,
                  value: row.orders,
                  color: ['#0f766e', '#2563eb', '#f97316', '#be123c', '#7c3aed', '#16a34a'][
                    index % 6
                  ],
                  hint: formatCurrency(row.revenue),
                }))}
              />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue by order type</h3>
          <p className="mt-1 text-sm text-gray-600">
            Highlights which commercial flow is carrying the month.
          </p>
          <div className="mt-6">
            <DistributionBars
              data={orderTypeData}
              valueFormatter={formatCurrency}
              emptyLabel="No order type revenue yet."
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">Revenue by payment method</h3>
          <p className="mt-1 text-sm text-gray-600">
            Tracks how cash is split across pay-now and pay-later rails.
          </p>
          <div className="mt-6">
            <DistributionBars
              data={paymentMethodData}
              valueFormatter={formatCurrency}
              emptyLabel="No payment method revenue yet."
            />
          </div>
        </Card>
      </div>
    </section>
  );
}
