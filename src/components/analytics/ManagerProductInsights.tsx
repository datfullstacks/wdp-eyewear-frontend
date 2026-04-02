'use client';

import { useLocale } from 'next-intl';
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  Package,
  ShoppingBag,
} from 'lucide-react';

import type { ManagerProductAnalytics } from '@/api/analytics';
import { Card } from '@/components/ui/card';

import {
  DistributionBars,
  TrendComparisonChart,
  type ChartDatum,
} from './ChartPrimitives';

const BAR_PALETTE = ['#be123c', '#0f766e', '#2563eb', '#ea580c', '#7c3aed', '#16a34a'];

const formatNumber = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

function formatProductType(value: string, locale: string) {
  const normalized = String(value || '').trim().toLowerCase();

  if (normalized === 'eyeglasses') {
    return locale === 'vi' ? 'Gọng kính' : 'Eyeglasses';
  }

  if (normalized === 'sunglasses') {
    return locale === 'vi' ? 'Kính mát' : 'Sunglasses';
  }

  if (normalized === 'contact_lens' || normalized === 'contact_lenses') {
    return locale === 'vi' ? 'Kính áp tròng' : 'Contact lenses';
  }

  return value || '--';
}

export function ManagerProductInsights({
  analytics,
  title,
  subtitle,
}: {
  analytics: ManagerProductAnalytics | null;
  title?: string;
  subtitle?: string;
}) {
  const locale = useLocale();
  const copy =
    locale === 'vi'
      ? {
          title: 'Thống kê sản phẩm & nhịp đặt hàng',
          subtitle:
            'Theo dõi số lượt đặt theo ngày, tháng, quý, năm và nhóm sản phẩm được đặt nhiều nhất.',
          today: 'Hôm nay',
          thisMonth: 'Tháng này',
          thisQuarter: 'Quý này',
          thisYear: 'Năm nay',
          orders: 'Đơn hàng',
          units: 'Sản phẩm',
          dailyTitle: 'Nhịp đặt hàng theo ngày',
          dailySubtitle: '14 ngày gần nhất để nhìn tải đơn ngắn hạn.',
          monthlyTitle: 'Nhịp đặt hàng theo tháng',
          monthlySubtitle: '12 tháng gần nhất để nhìn mùa vụ và độ ổn định.',
          quarterlyTitle: 'Nhịp đặt hàng theo quý',
          quarterlySubtitle: '8 quý gần nhất để nhìn chu kỳ kinh doanh.',
          yearlyTitle: 'Nhịp đặt hàng theo năm',
          yearlySubtitle: '5 năm gần nhất để nhìn xu hướng dài hạn.',
          topProductsTitle: 'Sản phẩm được đặt nhiều nhất trong năm',
          topProductsSubtitle:
            'Xếp hạng theo số lượng bán ra, giữ lại số đơn và doanh thu để manager chốt ưu tiên.',
          productMixTitle: 'Cơ cấu top sản phẩm',
          productMixSubtitle: 'So sánh nhanh top sản phẩm theo số lượng bán ra.',
          product: 'Sản phẩm',
          brand: 'Thương hiệu',
          type: 'Loại',
          soldUnits: 'Đã bán',
          orderedIn: 'Số đơn',
          revenue: 'Doanh thu',
          noProducts: 'Chưa có dữ liệu sản phẩm được đặt.',
          ordersSeries: 'Đơn hàng',
          unitsSeries: 'Sản phẩm',
          topProductEmpty: 'Chưa có dữ liệu top sản phẩm.',
        }
      : {
          title: 'Product analytics & order cadence',
          subtitle:
            'Track order volume by day, month, quarter, year and see which products are being ordered the most.',
          today: 'Today',
          thisMonth: 'This month',
          thisQuarter: 'This quarter',
          thisYear: 'This year',
          orders: 'Orders',
          units: 'Units',
          dailyTitle: 'Daily order cadence',
          dailySubtitle: 'Latest 14 days for short-cycle demand visibility.',
          monthlyTitle: 'Monthly order cadence',
          monthlySubtitle: 'Latest 12 months to spot seasonality and stability.',
          quarterlyTitle: 'Quarterly order cadence',
          quarterlySubtitle: 'Latest 8 quarters to read business cycles.',
          yearlyTitle: 'Yearly order cadence',
          yearlySubtitle: 'Latest 5 years to show the long-term trend.',
          topProductsTitle: 'Top ordered products this year',
          topProductsSubtitle:
            'Ranked by units sold, with order count and revenue kept visible for prioritization.',
          productMixTitle: 'Top product mix',
          productMixSubtitle: 'Quick comparison of the top products by units sold.',
          product: 'Product',
          brand: 'Brand',
          type: 'Type',
          soldUnits: 'Units sold',
          orderedIn: 'Orders',
          revenue: 'Revenue',
          noProducts: 'No ordered product data yet.',
          ordersSeries: 'Orders',
          unitsSeries: 'Units',
          topProductEmpty: 'No top-product data yet.',
        };

  if (!analytics) {
    return null;
  }

  const summaryCards = [
    {
      label: copy.today,
      orders: analytics.summary.ordersToday,
      units: analytics.summary.unitsToday,
      icon: CalendarDays,
      tone: 'bg-red-50 text-red-700',
    },
    {
      label: copy.thisMonth,
      orders: analytics.summary.ordersThisMonth,
      units: analytics.summary.unitsThisMonth,
      icon: ShoppingBag,
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      label: copy.thisQuarter,
      orders: analytics.summary.ordersThisQuarter,
      units: analytics.summary.unitsThisQuarter,
      icon: CalendarRange,
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: copy.thisYear,
      orders: analytics.summary.ordersThisYear,
      units: analytics.summary.unitsThisYear,
      icon: BarChart3,
      tone: 'bg-blue-50 text-blue-700',
    },
  ];

  const topProductBars: ChartDatum[] = (analytics.topProducts || []).map(
    (product, index) => ({
      label: product.name,
      value: Number(product.unitsSold || 0),
      color: BAR_PALETTE[index % BAR_PALETTE.length],
      hint: `${formatNumber(product.orders)} ${copy.orders.toLowerCase()} • ${formatCurrency(product.revenue)}`,
    }),
  );

  const renderTrendCard = (
    sectionTitle: string,
    sectionSubtitle: string,
    rows: Array<{ label: string; orders: number; units: number }>,
  ) => (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900">{sectionTitle}</h3>
      <p className="mt-1 text-sm text-gray-600">{sectionSubtitle}</p>
      <div className="mt-6">
        <TrendComparisonChart
          labels={(rows || []).map((row) => row.label)}
          series={[
            {
              label: copy.ordersSeries,
              color: '#be123c',
              values: (rows || []).map((row) => row.orders),
              fill: true,
            },
            {
              label: copy.unitsSeries,
              color: '#0f766e',
              values: (rows || []).map((row) => row.units),
            },
          ]}
          valueFormatter={formatNumber}
        />
      </div>
    </Card>
  );

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          {title || copy.title}
        </h2>
        <p className="mt-1 text-sm text-gray-600">{subtitle || copy.subtitle}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.label} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-gray-500">
                    {card.label}
                  </div>
                  <div className="mt-3 text-3xl font-semibold text-gray-900">
                    {formatNumber(card.orders)}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {copy.orders}
                  </div>
                </div>
                <div
                  className={`rounded-2xl p-3 ${card.tone}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                <span className="text-gray-500">{copy.units}</span>
                <span className="font-medium text-gray-900">
                  {formatNumber(card.units)}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {renderTrendCard(
          copy.dailyTitle,
          copy.dailySubtitle,
          analytics.timelines.daily,
        )}
        {renderTrendCard(
          copy.monthlyTitle,
          copy.monthlySubtitle,
          analytics.timelines.monthly,
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {renderTrendCard(
          copy.quarterlyTitle,
          copy.quarterlySubtitle,
          analytics.timelines.quarterly,
        )}
        {renderTrendCard(
          copy.yearlyTitle,
          copy.yearlySubtitle,
          analytics.timelines.yearly,
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {copy.topProductsTitle}
          </h3>
          <p className="mt-1 text-sm text-gray-600">{copy.topProductsSubtitle}</p>

          {(analytics.topProducts || []).length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-500">
              {copy.noProducts}
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="pb-3 pr-4">{copy.product}</th>
                    <th className="pb-3 pr-4">{copy.soldUnits}</th>
                    <th className="pb-3 pr-4">{copy.orderedIn}</th>
                    <th className="pb-3">{copy.revenue}</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics.topProducts || []).map((product) => (
                    <tr
                      key={product.productId || product.name}
                      className="border-b border-gray-100 align-top text-gray-700"
                    >
                      <td className="py-3 pr-4">
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                          <span>{copy.brand}: {product.brand || '--'}</span>
                          <span>{copy.type}: {formatProductType(product.type, locale)}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-medium text-gray-900">
                        {formatNumber(product.unitsSold)}
                      </td>
                      <td className="py-3 pr-4">{formatNumber(product.orders)}</td>
                      <td className="py-3">{formatCurrency(product.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-gray-100 p-3 text-gray-700">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {copy.productMixTitle}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                {copy.productMixSubtitle}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <DistributionBars
              data={topProductBars}
              valueFormatter={formatNumber}
              emptyLabel={copy.topProductEmpty}
            />
          </div>
        </Card>
      </div>
    </section>
  );
}
