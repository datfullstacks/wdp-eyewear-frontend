'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/organisms/Header';
import {
  Clock,
  Calendar,
  Glasses,
  Eye,
  Palette,
  Users,
  TrendingUp,
  ShoppingCart,
  RotateCcw,
  Sun,
  Award,
  DollarSign,
  Store,
  Globe,
  Target,
} from 'lucide-react';
import { revenueAnalyticsData } from '@/data/revenueData';

export default function DetailedReportsPage() {
  const t = useTranslations('manager.revenueNew');

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toLocaleString('vi-VN');
  };

  // Get data
  const hourlyPattern = revenueAnalyticsData.hourlySalesPattern;
  const dayOfWeekStats = revenueAnalyticsData.dayOfWeekStats;
  const frameStyles = revenueAnalyticsData.frameStyleAnalytics;
  const lensTypes = revenueAnalyticsData.lensTypeAnalytics;
  const colorPrefs = revenueAnalyticsData.colorPreference;
  const ageDemo = revenueAnalyticsData.ageDemographic;
  const prescriptionData = revenueAnalyticsData.prescriptionAnalytics;
  const customerSegments = revenueAnalyticsData.customerSegments;
  const customerLTV = revenueAnalyticsData.customerLifetimeValue;
  const channelPerf = revenueAnalyticsData.channelPerformance;
  const conversionFunnel = revenueAnalyticsData.conversionFunnel;
  const returnAnalytics = revenueAnalyticsData.returnAnalytics;
  const seasonalTrends = revenueAnalyticsData.seasonalTrends;
  const topDays = revenueAnalyticsData.topPerformingDays;

  // Get peak hours
  const peakHours = hourlyPattern
    .filter(h => h.peakLevel === 'peak')
    .sort((a, b) => b.averageRevenue - a.averageRevenue)
    .slice(0, 5);

  // Get top day of week
  const topDay = [...dayOfWeekStats].sort((a, b) => b.averageRevenue - a.averageRevenue)[0];

  // Get top frame style
  const topFrameStyle = [...frameStyles].sort((a, b) => b.totalRevenue - a.totalRevenue)[0];
  
  // Calculate total frame revenue for market share calculation
  const totalFrameRevenue = frameStyles.reduce((sum, f) => sum + f.totalRevenue, 0);
  
  // Calculate total customers for age demographic percentage
  const totalCustomers = ageDemo.reduce((sum, a) => sum + a.customerCount, 0);

  return (
    <>
      <Header title={t('title')} subtitle={t('subtitle')} />

      <div className="space-y-6 p-6">
        {/* ========== TIME-BASED ANALYTICS ========== */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800">
            <Clock className="h-5 w-5 text-blue-600" />
            {t('sections.timeAnalytics')}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Hourly Pattern */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-1 text-lg font-semibold text-gray-800">
                {t('hourlyPattern.title')}
              </h3>
              <p className="mb-4 text-sm text-gray-500">{t('hourlyPattern.description')}</p>

              <div className="space-y-2">
                <div className="mb-3 flex items-center gap-2 rounded-md bg-green-50 p-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-700">
                    {t('hourlyPattern.peakHours')}: {peakHours.map(h => `${h.hour}h`).join(', ')}
                  </span>
                </div>

                {hourlyPattern.slice(0, 12).map((hour) => (
                  <div key={hour.hour} className="flex items-center gap-3">
                    <span className="w-12 text-sm font-medium text-gray-600">
                      {hour.hour}:00
                    </span>
                    <div className="flex-1">
                      <div className="h-6 overflow-hidden rounded bg-gray-100">
                        <div
                          className={`h-full ${
                            hour.peakLevel === 'peak'
                              ? 'bg-red-500'
                              : hour.peakLevel === 'high'
                              ? 'bg-orange-400'
                              : hour.peakLevel === 'medium'
                              ? 'bg-yellow-400'
                              : 'bg-green-400'
                          }`}
                          style={{ width: `${(hour.averageRevenue / 8000000) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="w-20 text-right text-sm font-medium text-gray-700">
                      {formatCurrency(hour.averageRevenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Day of Week Stats */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-1 text-lg font-semibold text-gray-800">
                {t('dayOfWeek.title')}
              </h3>
              <p className="mb-4 text-sm text-gray-500">{t('dayOfWeek.description')}</p>

              <div className="mb-3 flex items-center gap-2 rounded-md bg-blue-50 p-2 text-sm">
                <Award className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-700">
                  Ngày bán chạy nhất: {topDay.dayName} ({formatCurrency(topDay.averageRevenue)})
                </span>
              </div>

              <div className="space-y-3">
                {dayOfWeekStats.map((day) => (
                  <div key={day.dayName} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-700">{day.dayName}</span>
                      <span className="text-sm text-gray-600">
                        {day.averageOrders} {t('dayOfWeek.orders')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                          style={{
                            width: `${(day.averageRevenue / topDay.averageRevenue) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="w-16 text-right text-sm font-semibold text-gray-700">
                        {formatCurrency(day.averageRevenue)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Seasonal Trends & Top Days */}
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {/* Seasonal Trends */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Sun className="h-5 w-5 text-orange-500" />
                {t('seasonalTrends.title')}
              </h3>
              <p className="mb-4 text-sm text-gray-500">{t('seasonalTrends.description')}</p>

              <div className="grid grid-cols-2 gap-3">
                {seasonalTrends.map((season) => (
                  <div
                    key={season.season}
                    className="rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-4"
                  >
                    <div className="text-sm font-medium text-gray-600">{season.displayName}</div>
                    <div className="mt-1 text-2xl font-bold text-gray-800">
                      {formatCurrency(season.averageMonthlyRevenue)}
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      TB/tháng • {season.topCategory}
                    </div>
                    <div className="mt-1 text-xs font-medium text-green-600">
                      +{season.expectedGrowth}% tăng trưởng
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Days */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Award className="h-5 w-5 text-yellow-500" />
                {t('topDays.title')}
              </h3>
              <p className="mb-4 text-sm text-gray-500">{t('topDays.description')}</p>

              <div className="space-y-2">
                {topDays.map((day, index) => (
                  <div
                    key={day.date}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        index === 0
                          ? 'bg-yellow-400 text-yellow-900'
                          : index === 1
                          ? 'bg-gray-300 text-gray-700'
                          : index === 2
                          ? 'bg-orange-300 text-orange-900'
                          : 'bg-blue-100 text-blue-700'
                      } text-sm font-bold`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{day.date}</div>
                      <div className="text-xs text-gray-500">{day.specialEvent}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">
                        {formatCurrency(day.totalRevenue)}
                      </div>
                      <div className="text-xs text-gray-500">{day.totalOrders} đơn</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== PRODUCT ANALYTICS ========== */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800">
            <Glasses className="h-5 w-5 text-purple-600" />
            {t('sections.productAnalytics')}
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Frame Styles */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-1 text-lg font-semibold text-gray-800">
                {t('frameStyles.title')}
              </h3>
              <p className="mb-4 text-sm text-gray-500">{t('frameStyles.description')}</p>

              <div className="mb-3 rounded-md bg-purple-50 p-2 text-sm">
                <span className="font-medium text-purple-700">
                  Top: {topFrameStyle.displayName} ({((topFrameStyle.totalRevenue / totalFrameRevenue) * 100).toFixed(1)}%)
                </span>
              </div>

              <div className="space-y-3">
                {frameStyles.slice(0, 6).map((style) => (
                  <div key={style.style}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{style.displayName}</span>
                      <span className="text-gray-600">
                        {formatCurrency(style.totalRevenue)}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        style={{ width: `${(style.totalRevenue / totalFrameRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lens Types */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Eye className="h-5 w-5 text-indigo-600" />
                {t('lensTypes.title')}
              </h3>
              <p className="mb-4 text-sm text-gray-500">{t('lensTypes.description')}</p>

              <div className="space-y-3">
                {lensTypes.map((lens) => (
                  <div
                    key={lens.lensType}
                    className="rounded-lg border border-gray-200 bg-gradient-to-r from-indigo-50 to-white p-3"
                  >
                    <div className="mb-1 font-medium text-gray-800">{lens.lensType}</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {lens.totalSold} {t('frameStyles.units')}
                      </span>
                      <span className="font-semibold text-indigo-600">
                        {formatCurrency(lens.averagePrice)}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500">
                      {formatCurrency(lens.totalRevenue)} tổng
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Preference */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Palette className="h-5 w-5 text-pink-600" />
                {t('colorPreference.title')}
              </h3>
              <p className="mb-4 text-sm text-gray-500">{t('colorPreference.description')}</p>

              <div className="space-y-2">
                {colorPrefs.map((color, index) => (
                  <div
                    key={color.color}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 p-3"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-700">
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{color.displayName || color.color}</div>
                      <div className="text-xs text-gray-500">
                        {color.totalSold} sản phẩm
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-700">{color.revenueShare.toFixed(1)}%</div>
                      <div className="text-xs text-gray-500">{color.popularCategory}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Prescription Analytics */}
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-1 text-lg font-semibold text-gray-800">
              {t('prescription.title')}
            </h3>
            <p className="mb-4 text-sm text-gray-500">{t('prescription.description')}</p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6">
                <div className="mb-2 text-sm font-medium text-blue-700">
                  {prescriptionData[0]?.displayName || t('prescription.withRx')}
                </div>
                <div className="mb-1 text-3xl font-bold text-blue-900">
                  {formatCurrency(prescriptionData[0]?.totalRevenue || 0)}
                </div>
                <div className="mb-3 text-sm text-blue-700">
                  {prescriptionData[0]?.totalOrders || 0} đơn hàng •{' '}
                  {prescriptionData[0]?.revenueShare.toFixed(1) || 0}%
                </div>
                <div className="text-xs text-blue-600">
                  Giá trị TB: {formatCurrency(prescriptionData[0]?.averageOrderValue || 0)}
                </div>
              </div>

              <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6">
                <div className="mb-2 text-sm font-medium text-green-700">
                  {prescriptionData[1]?.displayName || t('prescription.withoutRx')}
                </div>
                <div className="mb-1 text-3xl font-bold text-green-900">
                  {formatCurrency(prescriptionData[1]?.totalRevenue || 0)}
                </div>
                <div className="mb-3 text-sm text-green-700">
                  {prescriptionData[1]?.totalOrders || 0} đơn hàng •{' '}
                  {prescriptionData[1]?.revenueShare.toFixed(1) || 0}%
                </div>
                <div className="text-xs text-green-600">
                  Giá trị TB:{' '}
                  {formatCurrency(prescriptionData[1]?.averageOrderValue || 0)}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========== CUSTOMER INSIGHTS ========== */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800">
            <Users className="h-5 w-5 text-green-600" />
            {t('sections.customerInsights')}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Age Demographics */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-1 text-lg font-semibold text-gray-800">
                {t('ageDemo.title')}
              </h3>
              <p className="mb-4 text-sm text-gray-500">{t('ageDemo.description')}</p>

              <div className="space-y-3">
                {ageDemo.map((age) => {
                  const percentage = (age.customerCount / totalCustomers) * 100;
                  return (
                    <div key={age.ageGroup}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{age.displayName || age.ageGroup}</span>
                        <span className="text-gray-600">
                          {age.customerCount} {t('ageDemo.customers')}
                        </span>
                      </div>
                      <div className="mb-1 flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-teal-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-xs text-gray-600">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatCurrency(age.totalRevenue)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Customer Segments */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-1 text-lg font-semibold text-gray-800">
                {t('customerSegments.title')}
              </h3>
              <p className="mb-4 text-sm text-gray-500">{t('customerSegments.description')}</p>

              <div className="space-y-3">
                {customerSegments.map((segment) => (
                  <div
                    key={segment.segment}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-semibold text-gray-800">{segment.displayName || segment.segment}</span>
                      <span className="text-sm text-gray-600">
                        {segment.customerCount} khách
                      </span>
                    </div>
                    <div className="mb-1 text-2xl font-bold text-gray-900">
                      {formatCurrency(segment.totalRevenue)}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Giá trị TB: {formatCurrency(segment.averageOrderValue)}</span>
                      <span>{segment.revenueShare.toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Customer Lifetime Value */}
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-1 text-lg font-semibold text-gray-800">
              {t('customerLTV.title')}
            </h3>
            <p className="mb-4 text-sm text-gray-500">{t('customerLTV.description')}</p>

            <div className="grid gap-3 md:grid-cols-4">
              {customerLTV.map((ltv) => (
                <div
                  key={ltv.segment}
                  className="rounded-lg border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4"
                >
                  <div className="mb-1 text-xs font-medium text-gray-600">{ltv.displayName || ltv.segment}</div>
                  <div className="mb-2 text-2xl font-bold text-gray-900">
                    {formatCurrency(ltv.averageLifetimeValue)}
                  </div>
                  <div className="mb-1 text-xs text-gray-500">
                    {ltv.averagePurchaseFrequency.toFixed(1)} lần/năm • {ltv.averageLifespan.toFixed(1)} năm
                  </div>
                  <div className="mt-2 text-xs font-medium text-green-600">
                    Lợi nhuận: {formatCurrency(ltv.profitability)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========== CHANNEL PERFORMANCE ========== */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800">
            <ShoppingCart className="h-5 w-5 text-orange-600" />
            {t('sections.channelPerformance')}
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Channel Stats */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-1 text-lg font-semibold text-gray-800">
                {t('channelStats.title')}
              </h3>
              <p className="mb-4 text-sm text-gray-500">{t('channelStats.description')}</p>

              <div className="space-y-4">
                {channelPerf.map((channel) => (
                  <div key={channel.channel} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {channel.channel === 'online' ? (
                          <Globe className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Store className="h-5 w-5 text-green-600" />
                        )}
                        <span className="font-semibold text-gray-800">{channel.displayName}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {channel.revenueShare.toFixed(1)}%
                      </span>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3">
                      <div className="mb-2 text-2xl font-bold text-gray-900">
                        {formatCurrency(channel.totalRevenue)}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <div className="text-gray-500">Đơn hàng</div>
                          <div className="font-semibold text-gray-700">
                            {channel.totalOrders}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Giá trị TB</div>
                          <div className="font-semibold text-gray-700">
                            {formatCurrency(channel.averageOrderValue)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Tỷ lệ chuyển đổi</div>
                          <div className="font-semibold text-gray-700">
                            {channel.conversionRate.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Conversion Funnel */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-1 flex items-center gap-2 text-lg font-semibold text-gray-800">
                <Target className="h-5 w-5 text-red-600" />
                {t('conversionFunnel.title')}
              </h3>
              <p className="mb-4 text-sm text-gray-500">{t('conversionFunnel.description')}</p>

              <div className="space-y-2">
                {conversionFunnel.map((stage, index) => (
                  <div key={stage.stage}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{stage.displayName || stage.stage}</span>
                      <span className="text-gray-600">
                        {stage.visitors.toLocaleString()} ({stage.conversionRate.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="relative h-10 overflow-hidden rounded-lg bg-gray-100">
                      <div
                        className={`h-full ${
                          index === 0
                            ? 'bg-blue-500'
                            : index === 1
                            ? 'bg-indigo-500'
                            : index === 2
                            ? 'bg-purple-500'
                            : index === 3
                            ? 'bg-pink-500'
                            : 'bg-green-500'
                        }`}
                        style={{ width: `${stage.conversionRate}%` }}
                      />
                      {index < conversionFunnel.length - 1 && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-white">
                          -{stage.dropOffRate.toFixed(1)}%
                        </div>
                      )}
                    </div>
                    {index === conversionFunnel.length - 1 && (
                      <div className="mt-1 text-xs text-green-600">
                        Tỷ lệ chuyển đổi tổng: {stage.conversionRate.toFixed(1)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ========== QUALITY METRICS ========== */}
        <section>
          <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800">
            <RotateCcw className="h-5 w-5 text-red-600" />
            {t('sections.qualityMetrics')}
          </h2>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-1 text-lg font-semibold text-gray-800">
              {t('returnAnalytics.title')}
            </h3>
            <p className="mb-4 text-sm text-gray-500">{t('returnAnalytics.description')}</p>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {returnAnalytics.map((item) => (
                <div
                  key={item.category}
                  className="rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <div className="mb-2 text-sm font-medium text-red-700">{item.displayName}</div>
                  <div className="mb-1 text-2xl font-bold text-red-900">{item.totalReturns}</div>
                  <div className="mb-1 text-xs text-red-600">
                    {item.returnRate.toFixed(1)}% tỷ lệ trả hàng
                  </div>
                  <div className="mt-2 rounded bg-white px-2 py-1 text-xs text-red-700">
                    <div className="font-medium">Lý do: {item.topReason}</div>
                    <div className="mt-1">Hoàn tiền TB: {formatCurrency(item.averageRefundAmount)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-lg bg-yellow-50 p-4">
              <div className="flex items-start gap-2">
                <div className="text-yellow-600">⚠️</div>
                <div className="flex-1 text-sm text-yellow-800">
                  <span className="font-semibold">Khuyến nghị:</span> Tập trung cải thiện quy
                  trình kiểm tra chất lượng và đo lường chính xác để giảm tỷ lệ trả hàng do "Sản
                  phẩm lỗi" và "Không vừa".
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
