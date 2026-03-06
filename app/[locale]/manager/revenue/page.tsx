'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  ShoppingCart,
  Users,
  TrendingDown,
  Package,
  Clock,
  MapPin,
  AlertTriangle,
  BarChart3,
  Award,
} from 'lucide-react';
import {
  revenueAnalyticsData,
  type ProductSalesStats,
  type CategoryPerformance,
  type BrandPerformance,
  type HourlySalesPattern,
  type ChannelPerformance,
  type CustomerSegment,
  type InventoryAlert,
  type DayOfWeekStats,
} from '@/data/revenueData';

export default function RevenuePage() {
  const t = useTranslations('manager.revenue');

  // Get latest summary data
  const todaySummary = revenueAnalyticsData.revenueSummary.find(s => s.period === 'today')!;
  const monthSummary = revenueAnalyticsData.revenueSummary.find(s => s.period === 'month')!;
  const yearSummary = revenueAnalyticsData.revenueSummary.find(s => s.period === 'year')!;

  const revenueStats = [
    {
      title: t('stats.monthlyRevenue'),
      value: `${(monthSummary.totalRevenue / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      trend: { value: monthSummary.growthRate, isPositive: monthSummary.growthRate > 0 },
    },
    {
      title: t('stats.growth'),
      value: `${monthSummary.growthRate > 0 ? '+' : ''}${monthSummary.growthRate.toFixed(1)}%`,
      icon: TrendingUp,
      trend: { value: monthSummary.growthRate, isPositive: monthSummary.growthRate > 0 },
    },
    {
      title: t('stats.yearlyRevenue'),
      value: `${(yearSummary.totalRevenue / 1000000000).toFixed(1)}B`,
      icon: Calendar,
      trend: { value: yearSummary.growthRate, isPositive: yearSummary.growthRate > 0 },
    },
    {
      title: t('stats.targetAchieved'),
      value: `${monthSummary.achievementRate.toFixed(0)}%`,
      icon: Target,
      trend: { value: monthSummary.achievementRate - 100, isPositive: monthSummary.achievementRate >= 100 },
    },
  ];

  // Top selling products
  const topProducts = [...revenueAnalyticsData.productSalesStats]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  // Peak hours
  const peakHours = revenueAnalyticsData.hourlySalesPattern
    .filter(h => h.peakLevel === 'peak' || h.peakLevel === 'high')
    .sort((a, b) => b.averageRevenue - a.averageRevenue)
    .slice(0, 5);

  // Critical inventory alerts
  const criticalAlerts = revenueAnalyticsData.inventoryAlerts.filter(a => a.status === 'critical');
  const warningAlerts = revenueAnalyticsData.inventoryAlerts.filter(a => a.status === 'warning');

  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  return (
    <>
      <Header title={t('title')} subtitle={t('subtitle')} />

      <div className="space-y-6 p-6">
        {/* Summary Stats */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {revenueStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </section>

        {/* Today's Performance */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Doanh số hôm nay</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600">Doanh thu</p>
                  <p className="mt-1 text-2xl font-bold text-blue-900">
                    {formatCurrency(todaySummary.totalRevenue)}đ
                  </p>
                </div>
                <DollarSign className="h-10 w-10 text-blue-500" />
              </div>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600">Đơn hàng</p>
                  <p className="mt-1 text-2xl font-bold text-green-900">{todaySummary.totalOrders}</p>
                </div>
                <ShoppingCart className="h-10 w-10 text-green-500" />
              </div>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600">Khách hàng</p>
                  <p className="mt-1 text-2xl font-bold text-purple-900">{todaySummary.totalCustomers}</p>
                </div>
                <Users className="h-10 w-10 text-purple-500" />
              </div>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600">Giá trị TB</p>
                  <p className="mt-1 text-2xl font-bold text-amber-900">
                    {formatCurrency(todaySummary.averageOrderValue)}đ
                  </p>
                </div>
                <Target className="h-10 w-10 text-amber-500" />
              </div>
            </div>
          </div>
        </section>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Top Selling Products */}
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Sản phẩm bán chạy</h2>
              <Package className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.productId} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      index === 0 ? 'bg-amber-400 text-white' :
                      index === 1 ? 'bg-gray-300 text-gray-700' :
                      index === 2 ? 'bg-orange-300 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.productName}</p>
                      <p className="text-sm text-gray-500">{product.brand}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{product.totalSold} sp</p>
                    <p className="text-sm text-gray-500">{formatCurrency(product.totalRevenue)}đ</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Category Performance */}
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Doanh thu theo danh mục</h2>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {revenueAnalyticsData.categoryPerformance.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{cat.displayName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(cat.totalRevenue)}đ
                      </span>
                      <span className={`text-xs ${cat.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {cat.growthRate > 0 ? '+' : ''}{cat.growthRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                      style={{ width: `${cat.revenueShare}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Peak Hours Analysis */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Giờ bán hàng cao điểm</h2>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            {peakHours.map((hour) => (
              <div
                key={hour.hour}
                className={`rounded-lg p-4 ${
                  hour.peakLevel === 'peak' ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'
                }`}
              >
                <div className="text-center">
                  <p className={`text-2xl font-bold ${hour.peakLevel === 'peak' ? 'text-red-900' : 'text-orange-900'}`}>
                    {hour.hour}:00
                  </p>
                  <p className={`text-sm ${hour.peakLevel === 'peak' ? 'text-red-600' : 'text-orange-600'}`}>
                    {hour.peakLevel === 'peak' ? 'CAO ĐIỂM' : 'Khá cao'}
                  </p>
                  <p className={`mt-2 text-lg font-semibold ${hour.peakLevel === 'peak' ? 'text-red-800' : 'text-orange-800'}`}>
                    {hour.averageOrders.toFixed(1)} đơn
                  </p>
                  <p className="text-xs text-gray-600">{formatCurrency(hour.averageRevenue)}đ</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-600 italic">
            💡 Khuyến nghị: Tăng cường nhân sự trong khung giờ 14:00-18:00 để phục vụ tốt hơn
          </p>
        </section>

        {/* Sales Channel Performance */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Kênh bán hàng</h2>
            <MapPin className="h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {revenueAnalyticsData.channelPerformance.map((channel) => (
              <div key={channel.channel} className="rounded-lg border-2 border-gray-200 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{channel.displayName}</h3>
                  <p className="text-sm text-gray-500">Tỷ trọng: {channel.revenueShare.toFixed(1)}%</p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doanh thu:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(channel.totalRevenue)}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số đơn:</span>
                    <span className="font-semibold text-gray-900">{channel.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá trị TB:</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(channel.averageOrderValue)}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tăng trưởng:</span>
                    <span className={`font-semibold ${channel.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {channel.growthRate > 0 ? '+' : ''}{channel.growthRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Brand Performance */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Thương hiệu bán chạy</h2>
            <Award className="h-5 w-5 text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thương hiệu</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Doanh thu</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Số lượng</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Giá TB</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Tăng trưởng</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sản phẩm nổi bật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {revenueAnalyticsData.brandPerformance.map((brand) => (
                  <tr key={brand.brand} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{brand.brand}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-900">{formatCurrency(brand.totalRevenue)}đ</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">{brand.totalSold}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600">{formatCurrency(brand.averagePrice)}đ</td>
                    <td className={`px-4 py-3 text-right text-sm font-medium ${brand.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {brand.growthRate > 0 ? '+' : ''}{brand.growthRate.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{brand.topProduct}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Day of Week Performance */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Hiệu suất theo ngày trong tuần</h2>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-7">
            {revenueAnalyticsData.dayOfWeekStats.map((day) => (
              <div
                key={day.dayOfWeek}
                className={`rounded-lg border-2 p-4 ${
                  day.performanceLevel === 'peak' ? 'border-amber-400 bg-amber-50' :
                  day.performanceLevel === 'high' ? 'border-green-400 bg-green-50' :
                  day.performanceLevel === 'medium' ? 'border-blue-400 bg-blue-50' :
                  'border-gray-300 bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <p className={`text-sm font-semibold ${
                    day.performanceLevel === 'peak' ? 'text-amber-900' :
                    day.performanceLevel === 'high' ? 'text-green-900' :
                    day.performanceLevel === 'medium' ? 'text-blue-900' :
                    'text-gray-900'
                  }`}>
                    {day.dayName}
                  </p>
                  <p className="mt-2 text-lg font-bold text-gray-900">{formatCurrency(day.averageRevenue)}đ</p>
                  <p className="text-xs text-gray-600">{day.averageOrders} đơn</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Inventory Alerts */}
        {(criticalAlerts.length > 0 || warningAlerts.length > 0) && (
          <section className="rounded-lg border border-red-200 bg-red-50 p-6">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h2 className="text-xl font-semibold text-red-900">Cảnh báo tồn kho</h2>
            </div>
            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <div key={alert.productId} className="rounded-lg border border-red-300 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-red-900">{alert.productName}</p>
                      <p className="mt-1 text-sm text-red-700">
                        <span className="font-medium">Tồn kho:</span> {alert.currentStock} sản phẩm
                      </p>
                      <p className="text-sm text-red-600">
                        Còn khoảng {alert.daysUntilStockout} ngày nữa sẽ hết hàng
                      </p>
                    </div>
                    <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
                      KHẨN CẤP
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-red-800">⚠️ {alert.action}</p>
                </div>
              ))}
              {warningAlerts.map((alert) => (
                <div key={alert.productId} className="rounded-lg border border-orange-300 bg-white p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-orange-900">{alert.productName}</p>
                      <p className="mt-1 text-sm text-orange-700">
                        <span className="font-medium">Tồn kho:</span> {alert.currentStock} sản phẩm
                      </p>
                      <p className="text-sm text-orange-600">
                        Còn khoảng {alert.daysUntilStockout} ngày nữa sẽ hết hàng
                      </p>
                    </div>
                    <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                      CẢNH BÁO
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-medium text-orange-800">💡 {alert.action}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Customer Segments */}
        <section className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Phân khúc khách hàng</h2>
            <Users className="h-5 w-5 text-gray-400" />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {revenueAnalyticsData.customerSegments.map((segment) => (
              <div key={segment.segment} className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900">{segment.displayName}</h3>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số khách:</span>
                    <span className="font-medium text-gray-900">{segment.customerCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Doanh thu:</span>
                    <span className="font-medium text-gray-900">{formatCurrency(segment.totalRevenue)}đ</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tỷ trọng:</span>
                    <span className="font-medium text-amber-600">{segment.revenueShare.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tần suất:</span>
                    <span className="font-medium text-gray-900">{segment.orderFrequency.toFixed(1)} đơn</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Note for Backend Team */}
        <section className="rounded-lg border-2 border-amber-400 bg-amber-50 p-6">
          <h2 className="mb-3 text-lg font-semibold text-amber-900">📋 Ghi chú cho đội Backend</h2>
          <div className="space-y-2 text-sm text-amber-800">
            <p>
              <strong>Đây là dữ liệu giả (mock data)</strong> để minh họa cấu trúc dữ liệu và logic báo cáo. File:{' '}
              <code className="rounded bg-amber-200 px-2 py-1">src/data/revenueData.ts</code>
            </p>
            <p className="mt-3 font-semibold">Các API cần thiết:</p>
            <ul className="ml-5 list-disc space-y-1">
              <li>
                <code className="rounded bg-amber-200 px-1">GET /api/revenue/summary</code> - Tổng quan doanh thu
              </li>
              <li>
                <code className="rounded bg-amber-200 px-1">GET /api/revenue/daily?from=YYYY-MM-DD&to=YYYY-MM-DD</code> - Doanh thu theo ngày
              </li>
              <li>
                <code className="rounded bg-amber-200 px-1">GET /api/analytics/products/top-selling</code> - Sản phẩm bán chạy
              </li>
              <li>
                <code className="rounded bg-amber-200 px-1">GET /api/analytics/peak-hours</code> - Giờ cao điểm
              </li>
              <li>
                <code className="rounded bg-amber-200 px-1">GET /api/analytics/categories</code> - Hiệu suất danh mục
              </li>
              <li>
                <code className="rounded bg-amber-200 px-1">GET /api/analytics/brands</code> - Hiệu suất thương hiệu
              </li>
              <li>
                <code className="rounded bg-amber-200 px-1">GET /api/analytics/channels</code> - Hiệu suất kênh bán
              </li>
              <li>
                <code className="rounded bg-amber-200 px-1">GET /api/inventory/alerts</code> - Cảnh báo tồn kho
              </li>
              <li>
                <code className="rounded bg-amber-200 px-1">GET /api/analytics/customers/segments</code> - Phân khúc khách hàng
              </li>
            </ul>
          </div>
        </section>
      </div>
    </>
  );
}
