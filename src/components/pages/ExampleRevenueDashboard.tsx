'use client';

import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Target } from 'lucide-react';
import { revenueAnalyticsData } from '@/data/revenueData';

/**
 * EXAMPLE: Revenue Dashboard Component
 * 
 * This demonstrates how to use the comprehensive revenue analytics mock data
 * from src/data/revenueData.ts in a real dashboard component.
 * 
 * Features shown:
 * - Summary cards with KPIs
 * - Revenue summary (today/week/month/year)
 * - Top products table
 * - Category performance
 * - Key insights
 * 
 * TODO when backend is ready:
 * - Replace mock data with real API calls
 * - Add charts (Recharts or Chart.js)
 * - Add date range picker
 * - Add export functionality
 * - Add real-time updates (WebSocket)
 */

export default function ExampleRevenueDashboard() {
  // Destructure the data we need from the mock
  const {
    revenueSummary,
    productSalesStats,
    categoryPerformance,
    frameStyleAnalytics,
    peakTimes,
  } = revenueAnalyticsData;

  // Get today's summary
  const todaySummary = revenueSummary.find((s) => s.period === 'today')!;
  const weekSummary = revenueSummary.find((s) => s.period === 'week')!;
  const monthSummary = revenueSummary.find((s) => s.period === 'month')!;

  // Get top 5 products by total sold
  const topProducts = [...productSalesStats]
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  // Get top 3 frame styles
  const topFrameStyles = [...frameStyleAnalytics]
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, 3);

  // Current period selector (you can add state to switch between periods)
  const currentPeriod = todaySummary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tổng quan doanh thu</h1>
        <p className="text-gray-600">Theo dõi hiệu suất kinh doanh và phân tích chi tiết</p>
      </div>

      {/* Period Selector */}
      <div className="flex gap-2">
        {['today', 'week', 'month', 'year'].map((period) => (
          <button
            key={period}
            className={`px-4 py-2 rounded-lg border ${
              period === 'today'
                ? 'bg-amber-500 text-white border-amber-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {period === 'today' && 'Hôm nay'}
            {period === 'week' && 'Tuần này'}
            {period === 'month' && 'Tháng này'}
            {period === 'year' && 'Năm nay'}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
              <h3 className="text-2xl font-bold mt-1">
                {currentPeriod.totalRevenue.toLocaleString()} ₫
              </h3>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-2">
                <TrendingUp className="w-4 h-4" />
                +{currentPeriod.growthRate}% so với kỳ trước
              </p>
            </div>
            <div className="bg-amber-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              <h3 className="text-2xl font-bold mt-1">{currentPeriod.totalOrders}</h3>
              <p className="text-sm text-gray-500 mt-2">
                {currentPeriod.totalCustomers} khách hàng
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Giá trị TB/đơn</p>
              <h3 className="text-2xl font-bold mt-1">
                {Math.round(currentPeriod.averageOrderValue).toLocaleString()} ₫
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                ~{Math.round(currentPeriod.averageOrderValue / 23000)} USD
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Target Achievement */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đạt mục tiêu</p>
              <h3 className="text-2xl font-bold mt-1">{currentPeriod.achievementRate}%</h3>
              <p className="text-sm text-gray-500 mt-2">
                Mục tiêu: {currentPeriod.targetRevenue.toLocaleString()} ₫
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Top 5 Sản phẩm bán chạy</h2>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.productId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0
                        ? 'bg-amber-500'
                        : index === 1
                        ? 'bg-gray-400'
                        : index === 2
                        ? 'bg-orange-600'
                        : 'bg-gray-300'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.productName}</p>
                    <p className="text-sm text-gray-500">
                      {product.brand} • {product.category}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{product.totalSold} đã bán</p>
                  <p className="text-sm text-gray-500">
                    {product.totalRevenue.toLocaleString()} ₫
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Hiệu suất theo danh mục</h2>
          <div className="space-y-3">
            {categoryPerformance.map((category) => (
              <div key={category.category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{category.displayName}</span>
                  <span className="text-sm text-gray-600">{category.revenueShare}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{ width: `${category.revenueShare}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {category.totalOrders} đơn
                  </span>
                  <span className="text-xs text-green-600">
                    +{category.growthRate}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top Frame Style */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200 p-6">
          <h3 className="font-bold text-amber-900 mb-2">🔥 Kiểu gọng hot nhất</h3>
          <p className="text-2xl font-bold text-amber-700">
            {topFrameStyles[0].displayName}
          </p>
          <p className="text-sm text-amber-600 mt-1">
            Trend Score: {topFrameStyles[0].trendScore}/10
          </p>
          <p className="text-xs text-amber-600 mt-2">
            Tăng trưởng: +{topFrameStyles[0].growthRate}%
          </p>
        </div>

        {/* Peak Time */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 p-6">
          <h3 className="font-bold text-blue-900 mb-2">⏰ Giờ cao điểm</h3>
          <p className="text-2xl font-bold text-blue-700">{peakTimes[1].description}</p>
          <p className="text-sm text-blue-600 mt-1">
            TB: {Math.round(peakTimes[1].averageRevenue / 1000000)}M ₫/giờ
          </p>
          <p className="text-xs text-blue-600 mt-2">{peakTimes[1].recommendation}</p>
        </div>

        {/* Month Performance */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 p-6">
          <h3 className="font-bold text-green-900 mb-2">📈 Tháng này</h3>
          <p className="text-2xl font-bold text-green-700">
            {Math.round(monthSummary.totalRevenue / 1000000000)}B ₫
          </p>
          <p className="text-sm text-green-600 mt-1">
            {monthSummary.totalOrders} đơn hàng
          </p>
          <p className="text-xs text-green-600 mt-2">
            Tăng +{monthSummary.growthRate}% vs tháng trước
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Gợi ý:</strong> Dữ liệu hiện tại đang sử dụng mock data từ{' '}
          <code className="bg-blue-100 px-2 py-1 rounded">src/data/revenueData.ts</code>.
          Khi backend team hoàn thành API, hãy thay thế bằng các endpoint thực từ{' '}
          <code className="bg-blue-100 px-2 py-1 rounded">/api/manager/revenue/*</code>.
          Xem chi tiết trong file <strong>REVENUE_API_GUIDE.md</strong>.
        </p>
      </div>
    </div>
  );
}
