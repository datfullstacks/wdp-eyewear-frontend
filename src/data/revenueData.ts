// ============================================
// REVENUE ANALYTICS MOCK DATA
// ============================================
// 
// 🎯 PURPOSE:
// This file contains comprehensive MOCK DATA for revenue analytics
// and reporting features in the Manager Dashboard. It demonstrates
// the complete data structure that the backend team needs to implement.
//
// 📊 DATA INCLUDED (22 sections):
// 1. Daily Sales Data (30 days)
// 2. Hourly Sales Pattern (24 hours)
// 3. Product Sales Statistics (15 products)
// 4. Category Performance (5 categories)
// 5. Brand Performance (8 brands)
// 6. Monthly & Weekly Revenue (time-series data)
// 7. Customer Segments (4 segments)
// 8. Sales Channel Performance (online vs store)
// 9. Peak Times Analysis (5 time periods)
// 10. Inventory Alerts (5 products)
// 11. Revenue Summary (today/week/month/year)
// 12. Day of Week Statistics (7 days)
// 13. Frame Style Analytics (8 styles) - EYEWEAR SPECIFIC
// 14. Lens Type Analytics (6 types) - EYEWEAR SPECIFIC
// 15. Color Preference Analytics (8 colors)
// 16. Age Demographic Analytics (6 age groups)
// 17. Prescription vs Non-Prescription Analytics
// 18. Return & Refund Analytics (4 categories)
// 19. Seasonal Trends (4 seasons)
// 20. Customer Lifetime Value (4 segments)
// 21. Conversion Funnel (5 stages)
// 22. Top Performing Days (5 days)
//
// 🏪 BUSINESS CONTEXT:
// - Single eyewear store (physical location + online store)
// - Products: frames, lenses, sunglasses, accessories, services
// - Price range: 30,000 - 2,000,000 VND per item
// - Average daily revenue: 60,000,000 VND (~2,600 USD)
// - Average monthly revenue: 1,065,000,000 VND (~46,000 USD)
// - Average daily orders: 35-40
// - Peak hours: 2:00 PM - 5:00 PM (afternoon)
// - Peak days: Saturday, Sunday, Holidays
//
// 🔧 FOR BACKEND TEAM:
// See REVENUE_API_GUIDE.md for:
// - Required API endpoints
// - Query parameters
// - Performance optimization strategies
// - Database schema recommendations
// - Caching strategies
//
// 🎨 FOR FRONTEND TEAM:
// Import from this file for development:
// import { revenueAnalyticsData } from '@/data/revenueData';
// const { dailySales, productSalesStats, ... } = revenueAnalyticsData;
//
// ⚡ QUICK START:
// All data is exported as `revenueAnalyticsData` object at the bottom.
// Each section has TypeScript interfaces defined for type safety.
//
// ============================================

// ============================================
// 1. DAILY SALES DATA - Doanh thu theo ngày
// ============================================
export interface DailySales {
  date: string; // YYYY-MM-DD
  totalRevenue: number; // Tổng doanh thu
  totalOrders: number; // Số đơn hàng
  averageOrderValue: number; // Giá trị trung bình mỗi đơn
  customerCount: number; // Số khách mua hàng
  onlineRevenue: number; // Doanh thu online
  storeRevenue: number; // Doanh thu tại cửa hàng
}

export const dailySalesData: DailySales[] = [
  // Last 30 days data
  { date: '2024-02-05', totalRevenue: 45800000, totalOrders: 28, averageOrderValue: 1635714, customerCount: 26, onlineRevenue: 18320000, storeRevenue: 27480000 },
  { date: '2024-02-06', totalRevenue: 52300000, totalOrders: 31, averageOrderValue: 1687097, customerCount: 29, onlineRevenue: 20920000, storeRevenue: 31380000 },
  { date: '2024-02-07', totalRevenue: 38900000, totalOrders: 22, averageOrderValue: 1768182, customerCount: 21, onlineRevenue: 15560000, storeRevenue: 23340000 },
  { date: '2024-02-08', totalRevenue: 61200000, totalOrders: 35, averageOrderValue: 1748571, customerCount: 33, onlineRevenue: 24480000, storeRevenue: 36720000 },
  { date: '2024-02-09', totalRevenue: 49500000, totalOrders: 29, averageOrderValue: 1706897, customerCount: 27, onlineRevenue: 19800000, storeRevenue: 29700000 },
  { date: '2024-02-10', totalRevenue: 72800000, totalOrders: 42, averageOrderValue: 1733333, customerCount: 39, onlineRevenue: 29120000, storeRevenue: 43680000 },
  { date: '2024-02-11', totalRevenue: 68400000, totalOrders: 38, averageOrderValue: 1800000, customerCount: 36, onlineRevenue: 27360000, storeRevenue: 41040000 },
  { date: '2024-02-12', totalRevenue: 43200000, totalOrders: 25, averageOrderValue: 1728000, customerCount: 24, onlineRevenue: 17280000, storeRevenue: 25920000 },
  { date: '2024-02-13', totalRevenue: 54700000, totalOrders: 32, averageOrderValue: 1709375, customerCount: 30, onlineRevenue: 21880000, storeRevenue: 32820000 },
  { date: '2024-02-14', totalRevenue: 89200000, totalOrders: 51, averageOrderValue: 1749020, customerCount: 48, onlineRevenue: 35680000, storeRevenue: 53520000 }, // Valentine's Day - peak
  { date: '2024-02-15', totalRevenue: 47600000, totalOrders: 28, averageOrderValue: 1700000, customerCount: 26, onlineRevenue: 19040000, storeRevenue: 28560000 },
  { date: '2024-02-16', totalRevenue: 51800000, totalOrders: 30, averageOrderValue: 1726667, customerCount: 28, onlineRevenue: 20720000, storeRevenue: 31080000 },
  { date: '2024-02-17', totalRevenue: 76300000, totalOrders: 44, averageOrderValue: 1734091, customerCount: 41, onlineRevenue: 30520000, storeRevenue: 45780000 },
  { date: '2024-02-18', totalRevenue: 65900000, totalOrders: 39, averageOrderValue: 1689744, customerCount: 37, onlineRevenue: 26360000, storeRevenue: 39540000 },
  { date: '2024-02-19', totalRevenue: 42100000, totalOrders: 24, averageOrderValue: 1754167, customerCount: 23, onlineRevenue: 16840000, storeRevenue: 25260000 },
  { date: '2024-02-20', totalRevenue: 58300000, totalOrders: 34, averageOrderValue: 1714706, customerCount: 32, onlineRevenue: 23320000, storeRevenue: 34980000 },
  { date: '2024-02-21', totalRevenue: 53600000, totalOrders: 31, averageOrderValue: 1729032, customerCount: 29, onlineRevenue: 21440000, storeRevenue: 32160000 },
  { date: '2024-02-22', totalRevenue: 48900000, totalOrders: 29, averageOrderValue: 1686207, customerCount: 27, onlineRevenue: 19560000, storeRevenue: 29340000 },
  { date: '2024-02-23', totalRevenue: 71200000, totalOrders: 41, averageOrderValue: 1736585, customerCount: 38, onlineRevenue: 28480000, storeRevenue: 42720000 },
  { date: '2024-02-24', totalRevenue: 79600000, totalOrders: 46, averageOrderValue: 1730435, customerCount: 43, onlineRevenue: 31840000, storeRevenue: 47760000 },
  { date: '2024-02-25', totalRevenue: 67800000, totalOrders: 40, averageOrderValue: 1695000, customerCount: 37, onlineRevenue: 27120000, storeRevenue: 40680000 },
  { date: '2024-02-26', totalRevenue: 44700000, totalOrders: 26, averageOrderValue: 1719231, customerCount: 25, onlineRevenue: 17880000, storeRevenue: 26820000 },
  { date: '2024-02-27', totalRevenue: 56200000, totalOrders: 33, averageOrderValue: 1703030, customerCount: 31, onlineRevenue: 22480000, storeRevenue: 33720000 },
  { date: '2024-02-28', totalRevenue: 62400000, totalOrders: 37, averageOrderValue: 1686486, customerCount: 35, onlineRevenue: 24960000, storeRevenue: 37440000 },
  { date: '2024-02-29', totalRevenue: 59100000, totalOrders: 35, averageOrderValue: 1688571, customerCount: 33, onlineRevenue: 23640000, storeRevenue: 35460000 },
  { date: '2024-03-01', totalRevenue: 73500000, totalOrders: 43, averageOrderValue: 1709302, customerCount: 40, onlineRevenue: 29400000, storeRevenue: 44100000 },
  { date: '2024-03-02', totalRevenue: 81200000, totalOrders: 47, averageOrderValue: 1727660, customerCount: 44, onlineRevenue: 32480000, storeRevenue: 48720000 },
  { date: '2024-03-03', totalRevenue: 69300000, totalOrders: 41, averageOrderValue: 1690244, customerCount: 38, onlineRevenue: 27720000, storeRevenue: 41580000 },
  { date: '2024-03-04', totalRevenue: 55800000, totalOrders: 32, averageOrderValue: 1743750, customerCount: 30, onlineRevenue: 22320000, storeRevenue: 33480000 },
  { date: '2024-03-05', totalRevenue: 64100000, totalOrders: 38, averageOrderValue: 1686842, customerCount: 36, onlineRevenue: 25640000, storeRevenue: 38460000 },
];

// ============================================
// 2. HOURLY SALES PATTERN - Giờ bán hàng cao điểm
// ============================================
export interface HourlySalesPattern {
  hour: number; // 0-23
  averageOrders: number; // Số đơn trung bình trong giờ này
  averageRevenue: number; // Doanh thu trung bình
  peakLevel: 'low' | 'medium' | 'high' | 'peak'; // Mức độ cao điểm
}

export const hourlySalesPatternData: HourlySalesPattern[] = [
  { hour: 0, averageOrders: 0, averageRevenue: 0, peakLevel: 'low' },
  { hour: 1, averageOrders: 0, averageRevenue: 0, peakLevel: 'low' },
  { hour: 2, averageOrders: 0, averageRevenue: 0, peakLevel: 'low' },
  { hour: 3, averageOrders: 0, averageRevenue: 0, peakLevel: 'low' },
  { hour: 4, averageOrders: 0, averageRevenue: 0, peakLevel: 'low' },
  { hour: 5, averageOrders: 0, averageRevenue: 0, peakLevel: 'low' },
  { hour: 6, averageOrders: 0, averageRevenue: 0, peakLevel: 'low' },
  { hour: 7, averageOrders: 0, averageRevenue: 0, peakLevel: 'low' },
  { hour: 8, averageOrders: 1.2, averageRevenue: 2100000, peakLevel: 'low' }, // Mở cửa
  { hour: 9, averageOrders: 2.8, averageRevenue: 4850000, peakLevel: 'medium' },
  { hour: 10, averageOrders: 3.5, averageRevenue: 6125000, peakLevel: 'high' }, // Buổi sáng cao điểm
  { hour: 11, averageOrders: 3.2, averageRevenue: 5600000, peakLevel: 'high' },
  { hour: 12, averageOrders: 2.1, averageRevenue: 3675000, peakLevel: 'medium' }, // Giờ ăn trưa
  { hour: 13, averageOrders: 1.8, averageRevenue: 3150000, peakLevel: 'medium' },
  { hour: 14, averageOrders: 3.8, averageRevenue: 6650000, peakLevel: 'high' }, // Buổi chiều bắt đầu
  { hour: 15, averageOrders: 4.5, averageRevenue: 7875000, peakLevel: 'peak' }, // CAO ĐIỂM NHẤT
  { hour: 16, averageOrders: 4.2, averageRevenue: 7350000, peakLevel: 'peak' }, // CAO ĐIỂM
  { hour: 17, averageOrders: 3.9, averageRevenue: 6825000, peakLevel: 'high' },
  { hour: 18, averageOrders: 3.3, averageRevenue: 5775000, peakLevel: 'high' }, // Tối bắt đầu
  { hour: 19, averageOrders: 2.5, averageRevenue: 4375000, peakLevel: 'medium' },
  { hour: 20, averageOrders: 1.6, averageRevenue: 2800000, peakLevel: 'medium' },
  { hour: 21, averageOrders: 0.8, averageRevenue: 1400000, peakLevel: 'low' }, // Sắp đóng cửa
  { hour: 22, averageOrders: 0, averageRevenue: 0, peakLevel: 'low' },
  { hour: 23, averageOrders: 0, averageRevenue: 0, peakLevel: 'low' },
];

// ============================================
// 3. PRODUCT SALES STATISTICS - Thống kê bán hàng theo sản phẩm
// ============================================
export interface ProductSalesStats {
  productId: string;
  productName: string;
  productCode: string;
  category: 'frame' | 'lens' | 'sunglasses' | 'accessory' | 'service';
  brand: string;
  totalSold: number; // Tổng số lượng bán
  totalRevenue: number; // Tổng doanh thu
  averagePrice: number; // Giá bán trung bình
  stockLevel: number; // Tồn kho hiện tại
  reorderPoint: number; // Điểm đặt hàng lại
  trend: 'increasing' | 'stable' | 'decreasing'; // Xu hướng
  lastSoldDate: string;
}

export const productSalesStatsData: ProductSalesStats[] = [
  // TOP SELLING PRODUCTS
  {
    productId: 'P001',
    productName: 'Gọng kính Ray-Ban Aviator Classic',
    productCode: 'RB-AV-001',
    category: 'frame',
    brand: 'Ray-Ban',
    totalSold: 156,
    totalRevenue: 62400000,
    averagePrice: 400000,
    stockLevel: 45,
    reorderPoint: 20,
    trend: 'increasing',
    lastSoldDate: '2024-03-05',
  },
  {
    productId: 'P002',
    productName: 'Gọng kính Oakley Holbrook',
    productCode: 'OAK-HOL-002',
    category: 'frame',
    brand: 'Oakley',
    totalSold: 142,
    totalRevenue: 85200000,
    averagePrice: 600000,
    stockLevel: 38,
    reorderPoint: 20,
    trend: 'increasing',
    lastSoldDate: '2024-03-05',
  },
  {
    productId: 'P003',
    productName: 'Tròng kính Essilor Crizal',
    productCode: 'ESS-CRI-003',
    category: 'lens',
    brand: 'Essilor',
    totalSold: 234,
    totalRevenue: 93600000,
    averagePrice: 400000,
    stockLevel: 120,
    reorderPoint: 50,
    trend: 'stable',
    lastSoldDate: '2024-03-05',
  },
  {
    productId: 'P004',
    productName: 'Kính mát Gucci GG0061S',
    productCode: 'GUC-061-004',
    category: 'sunglasses',
    brand: 'Gucci',
    totalSold: 89,
    totalRevenue: 133500000,
    averagePrice: 1500000,
    stockLevel: 22,
    reorderPoint: 15,
    trend: 'increasing',
    lastSoldDate: '2024-03-04',
  },
  {
    productId: 'P005',
    productName: 'Gọng kính Burberry BE2301',
    productCode: 'BUR-230-005',
    category: 'frame',
    brand: 'Burberry',
    totalSold: 78,
    totalRevenue: 62400000,
    averagePrice: 800000,
    stockLevel: 31,
    reorderPoint: 15,
    trend: 'stable',
    lastSoldDate: '2024-03-05',
  },
  {
    productId: 'P006',
    productName: 'Tròng kính Hoya BlueControl',
    productCode: 'HOY-BLU-006',
    category: 'lens',
    brand: 'Hoya',
    totalSold: 198,
    totalRevenue: 59400000,
    averagePrice: 300000,
    stockLevel: 95,
    reorderPoint: 40,
    trend: 'increasing',
    lastSoldDate: '2024-03-05',
  },
  {
    productId: 'P007',
    productName: 'Gọng kính Armani Exchange AX3070',
    productCode: 'ARM-307-007',
    category: 'frame',
    brand: 'Armani',
    totalSold: 65,
    totalRevenue: 42250000,
    averagePrice: 650000,
    stockLevel: 28,
    reorderPoint: 15,
    trend: 'stable',
    lastSoldDate: '2024-03-03',
  },
  {
    productId: 'P008',
    productName: 'Kính mát Prada PR17WS',
    productCode: 'PRA-17W-008',
    category: 'sunglasses',
    brand: 'Prada',
    totalSold: 56,
    totalRevenue: 112000000,
    averagePrice: 2000000,
    stockLevel: 18,
    reorderPoint: 10,
    trend: 'increasing',
    lastSoldDate: '2024-03-04',
  },
  {
    productId: 'P009',
    productName: 'Dung dịch rửa kính Zeiss Lens Cleaner',
    productCode: 'ZEI-CLE-009',
    category: 'accessory',
    brand: 'Zeiss',
    totalSold: 412,
    totalRevenue: 24720000,
    averagePrice: 60000,
    stockLevel: 245,
    reorderPoint: 100,
    trend: 'stable',
    lastSoldDate: '2024-03-05',
  },
  {
    productId: 'P010',
    productName: 'Tròng kính Chemi Progressive',
    productCode: 'CHE-PRO-010',
    category: 'lens',
    brand: 'Chemi',
    totalSold: 167,
    totalRevenue: 83500000,
    averagePrice: 500000,
    stockLevel: 78,
    reorderPoint: 35,
    trend: 'stable',
    lastSoldDate: '2024-03-05',
  },
  {
    productId: 'P011',
    productName: 'Gọng kính Dior Essence 01',
    productCode: 'DIO-ESS-011',
    category: 'frame',
    brand: 'Dior',
    totalSold: 42,
    totalRevenue: 63000000,
    averagePrice: 1500000,
    stockLevel: 15,
    reorderPoint: 8,
    trend: 'increasing',
    lastSoldDate: '2024-03-02',
  },
  {
    productId: 'P012',
    productName: 'Dịch vụ cắt tròng kính',
    productCode: 'SRV-CUT-012',
    category: 'service',
    brand: 'Eyes Dream',
    totalSold: 389,
    totalRevenue: 19450000,
    averagePrice: 50000,
    stockLevel: 0, // Service
    reorderPoint: 0,
    trend: 'stable',
    lastSoldDate: '2024-03-05',
  },
  {
    productId: 'P013',
    productName: 'Khăn lau kính Microfiber',
    productCode: 'ACC-MIC-013',
    category: 'accessory',
    brand: 'Generic',
    totalSold: 328,
    totalRevenue: 9840000,
    averagePrice: 30000,
    stockLevel: 567,
    reorderPoint: 200,
    trend: 'stable',
    lastSoldDate: '2024-03-05',
  },
  {
    productId: 'P014',
    productName: 'Gọng kính Gentle Monster',
    productCode: 'GEN-MON-014',
    category: 'frame',
    brand: 'Gentle Monster',
    totalSold: 38,
    totalRevenue: 45600000,
    averagePrice: 1200000,
    stockLevel: 12,
    reorderPoint: 8,
    trend: 'decreasing',
    lastSoldDate: '2024-02-28',
  },
  {
    productId: 'P015',
    productName: 'Kính mát Versace VE4403',
    productCode: 'VER-440-015',
    category: 'sunglasses',
    brand: 'Versace',
    totalSold: 34,
    totalRevenue: 61200000,
    averagePrice: 1800000,
    stockLevel: 11,
    reorderPoint: 8,
    trend: 'stable',
    lastSoldDate: '2024-03-01',
  },
];

// ============================================
// 4. CATEGORY PERFORMANCE - Hiệu suất theo danh mục
// ============================================
export interface CategoryPerformance {
  category: string;
  displayName: string;
  totalRevenue: number;
  totalOrders: number;
  totalQuantity: number;
  averageOrderValue: number;
  growthRate: number; // % so với tháng trước
  revenueShare: number; // % trong tổng doanh thu
}

export const categoryPerformanceData: CategoryPerformance[] = [
  {
    category: 'frame',
    displayName: 'Gọng kính',
    totalRevenue: 456000000,
    totalOrders: 689,
    totalQuantity: 856,
    averageOrderValue: 661856,
    growthRate: 12.5,
    revenueShare: 42.8,
  },
  {
    category: 'lens',
    displayName: 'Tròng kính',
    totalRevenue: 328000000,
    totalOrders: 892,
    totalQuantity: 1234,
    averageOrderValue: 367713,
    growthRate: 8.3,
    revenueShare: 30.8,
  },
  {
    category: 'sunglasses',
    displayName: 'Kính mát',
    totalRevenue: 198000000,
    totalOrders: 234,
    totalQuantity: 267,
    averageOrderValue: 846154,
    growthRate: 18.7,
    revenueShare: 18.6,
  },
  {
    category: 'accessory',
    displayName: 'Phụ kiện',
    totalRevenue: 45000000,
    totalOrders: 892,
    totalQuantity: 1456,
    averageOrderValue: 50448,
    growthRate: 5.2,
    revenueShare: 4.2,
  },
  {
    category: 'service',
    displayName: 'Dịch vụ',
    totalRevenue: 38000000,
    totalOrders: 756,
    totalQuantity: 756,
    averageOrderValue: 50265,
    growthRate: 3.8,
    revenueShare: 3.6,
  },
];

// ============================================
// 5. BRAND PERFORMANCE - Hiệu suất theo thương hiệu
// ============================================
export interface BrandPerformance {
  brand: string;
  totalRevenue: number;
  totalSold: number;
  averagePrice: number;
  growthRate: number;
  topProduct: string;
}

export const brandPerformanceData: BrandPerformance[] = [
  {
    brand: 'Ray-Ban',
    totalRevenue: 78400000,
    totalSold: 189,
    averagePrice: 414815,
    growthRate: 15.2,
    topProduct: 'Ray-Ban Aviator Classic',
  },
  {
    brand: 'Oakley',
    totalRevenue: 96300000,
    totalSold: 156,
    averagePrice: 617308,
    growthRate: 12.8,
    topProduct: 'Oakley Holbrook',
  },
  {
    brand: 'Essilor',
    totalRevenue: 102400000,
    totalSold: 245,
    averagePrice: 418367,
    growthRate: 8.5,
    topProduct: 'Essilor Crizal',
  },
  {
    brand: 'Gucci',
    totalRevenue: 145600000,
    totalSold: 95,
    averagePrice: 1532632,
    growthRate: 22.3,
    topProduct: 'Gucci GG0061S',
  },
  {
    brand: 'Burberry',
    totalRevenue: 68900000,
    totalSold: 82,
    averagePrice: 840244,
    growthRate: 10.5,
    topProduct: 'Burberry BE2301',
  },
  {
    brand: 'Hoya',
    totalRevenue: 64500000,
    totalSold: 208,
    averagePrice: 310096,
    growthRate: 14.2,
    topProduct: 'Hoya BlueControl',
  },
  {
    brand: 'Prada',
    totalRevenue: 128000000,
    totalSold: 62,
    averagePrice: 2064516,
    growthRate: 19.7,
    topProduct: 'Prada PR17WS',
  },
  {
    brand: 'Dior',
    totalRevenue: 89400000,
    totalSold: 52,
    averagePrice: 1719231,
    growthRate: 25.6,
    topProduct: 'Dior Essence 01',
  },
];

// ============================================
// 6. REVENUE BY TIME PERIOD - Doanh thu theo khoảng thời gian
// ============================================
export interface MonthlyRevenue {
  month: string; // YYYY-MM
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  customerCount: number;
  growthRate: number; // % so với tháng trước
}

export const monthlyRevenueData: MonthlyRevenue[] = [
  { month: '2024-01', totalRevenue: 892000000, totalOrders: 1234, averageOrderValue: 722785, customerCount: 1156, growthRate: 0 },
  { month: '2024-02', totalRevenue: 1065000000, totalOrders: 1489, averageOrderValue: 715247, customerCount: 1389, growthRate: 19.4 },
  { month: '2024-03', totalRevenue: 945000000, totalOrders: 1312, averageOrderValue: 720274, customerCount: 1234, growthRate: -11.3 }, // Projected (partial month)
];

export interface WeeklyRevenue {
  week: string; // YYYY-Www (e.g., 2024-W05)
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
}

export const weeklyRevenueData: WeeklyRevenue[] = [
  { week: '2024-W05', startDate: '2024-01-29', endDate: '2024-02-04', totalRevenue: 245000000, totalOrders: 342, averageOrderValue: 716374, },
  { week: '2024-W06', startDate: '2024-02-05', endDate: '2024-02-11', totalRevenue: 436700000, totalOrders: 622, averageOrderValue: 701929, },
  { week: '2024-W07', startDate: '2024-02-12', endDate: '2024-02-18', totalRevenue: 378100000, totalOrders: 534, averageOrderValue: 708052, },
  { week: '2024-W08', startDate: '2024-02-19', endDate: '2024-02-25', totalRevenue: 377400000, totalOrders: 520, averageOrderValue: 725769, },
  { week: '2024-W09', startDate: '2024-02-26', endDate: '2024-03-03', totalRevenue: 456400000, totalOrders: 637, averageOrderValue: 716483, },
  { week: '2024-W10', startDate: '2024-03-04', endDate: '2024-03-10', totalRevenue: 358000000, totalOrders: 498, averageOrderValue: 718875, },
];

// ============================================
// 7. CUSTOMER SEGMENTS - Phân khúc khách hàng
// ============================================
export interface CustomerSegment {
  segment: string;
  displayName: string;
  customerCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  orderFrequency: number; // Số đơn trung bình mỗi khách
  revenueShare: number;
}

export const customerSegmentData: CustomerSegment[] = [
  {
    segment: 'premium',
    displayName: 'Khách hàng cao cấp',
    customerCount: 156,
    totalRevenue: 389000000,
    averageOrderValue: 2493590,
    orderFrequency: 3.2,
    revenueShare: 36.5,
  },
  {
    segment: 'regular',
    displayName: 'Khách hàng thường xuyên',
    customerCount: 428,
    totalRevenue: 445000000,
    averageOrderValue: 1039720,
    orderFrequency: 2.1,
    revenueShare: 41.8,
  },
  {
    segment: 'occasional',
    displayName: 'Khách hàng thỉnh thoảng',
    customerCount: 892,
    totalRevenue: 178000000,
    averageOrderValue: 199551,
    orderFrequency: 1.2,
    revenueShare: 16.7,
  },
  {
    segment: 'new',
    displayName: 'Khách hàng mới',
    customerCount: 234,
    totalRevenue: 53000000,
    averageOrderValue: 226496,
    orderFrequency: 1.0,
    revenueShare: 5.0,
  },
];

// ============================================
// 8. SALES CHANNEL PERFORMANCE - Hiệu suất kênh bán hàng
// ============================================
export interface ChannelPerformance {
  channel: 'online' | 'store';
  displayName: string;
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  conversionRate: number; // %
  revenueShare: number; // %
  growthRate: number; // %
}

export const channelPerformanceData: ChannelPerformance[] = [
  {
    channel: 'store',
    displayName: 'Cửa hàng vật lý',
    totalRevenue: 674000000,
    totalOrders: 856,
    averageOrderValue: 787383,
    conversionRate: 68.5,
    revenueShare: 63.3,
    growthRate: 8.2,
  },
  {
    channel: 'online',
    displayName: 'Bán hàng online',
    totalRevenue: 391000000,
    totalOrders: 633,
    averageOrderValue: 617698,
    conversionRate: 2.8,
    revenueShare: 36.7,
    growthRate: 24.5,
  },
];

// ============================================
// 9. PEAK TIMES ANALYSIS - Phân tích thời gian cao điểm
// ============================================
export interface PeakTimeAnalysis {
  period: string;
  description: string;
  averageRevenue: number;
  averageOrders: number;
  recommendation: string;
}

export const peakTimesData: PeakTimeAnalysis[] = [
  {
    period: 'weekday_morning',
    description: 'Sáng thứ 2-6 (9:00-12:00)',
    averageRevenue: 18500000,
    averageOrders: 26,
    recommendation: 'Tăng nhân sự để phục vụ khách hàng tốt hơn',
  },
  {
    period: 'weekday_afternoon',
    description: 'Chiều thứ 2-6 (14:00-18:00)',
    averageRevenue: 28500000,
    averageOrders: 42,
    recommendation: 'Thời điểm CAO ĐIỂM NHẤT - Cần tối ưu hóa quy trình',
  },
  {
    period: 'weekday_evening',
    description: 'Tối thứ 2-6 (18:00-21:00)',
    averageRevenue: 12800000,
    averageOrders: 18,
    recommendation: 'Giảm nhân sự để tiết kiệm chi phí',
  },
  {
    period: 'weekend',
    description: 'Cuối tuần (9:00-20:00)',
    averageRevenue: 35200000,
    averageOrders: 48,
    recommendation: 'Tăng cường khuyến mãi và hoạt động marketing',
  },
  {
    period: 'holiday',
    description: 'Ngày lễ đặc biệt',
    averageRevenue: 89200000,
    averageOrders: 51,
    recommendation: 'Chuẩn bị kỹ lưỡng về hàng hóa và nhân sự',
  },
];

// ============================================
// 10. INVENTORY ALERTS - Cảnh báo tồn kho
// ============================================
export interface InventoryAlert {
  productId: string;
  productName: string;
  currentStock: number;
  reorderPoint: number;
  averageDailySales: number;
  daysUntilStockout: number;
  status: 'critical' | 'warning' | 'normal';
  action: string;
}

export const inventoryAlertsData: InventoryAlert[] = [
  {
    productId: 'P011',
    productName: 'Gọng kính Dior Essence 01',
    currentStock: 15,
    reorderPoint: 8,
    averageDailySales: 1.4,
    daysUntilStockout: 10,
    status: 'warning',
    action: 'Nên đặt hàng trong tuần này',
  },
  {
    productId: 'P014',
    productName: 'Gọng kính Gentle Monster',
    currentStock: 12,
    reorderPoint: 8,
    averageDailySales: 1.3,
    daysUntilStockout: 9,
    status: 'warning',
    action: 'Nên đặt hàng trong tuần này',
  },
  {
    productId: 'P015',
    productName: 'Kính mát Versace VE4403',
    currentStock: 11,
    reorderPoint: 8,
    averageDailySales: 1.1,
    daysUntilStockout: 10,
    status: 'warning',
    action: 'Nên đặt hàng trong tuần này',
  },
  {
    productId: 'P004',
    productName: 'Kính mát Gucci GG0061S',
    currentStock: 22,
    reorderPoint: 15,
    averageDailySales: 3.0,
    daysUntilStockout: 7,
    status: 'critical',
    action: 'ĐẶT HÀNG NGAY - Sắp hết hàng',
  },
  {
    productId: 'P008',
    productName: 'Kính mát Prada PR17WS',
    currentStock: 18,
    reorderPoint: 10,
    averageDailySales: 1.9,
    daysUntilStockout: 9,
    status: 'warning',
    action: 'Nên đặt hàng trong tuần này',
  },
];

// ============================================
// 11. SUMMARY STATISTICS - Tổng quan chính
// ============================================
export interface RevenueSummary {
  period: 'today' | 'week' | 'month' | 'year';
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  growthRate: number;
  targetRevenue: number;
  achievementRate: number; // % đạt mục tiêu
}

export const revenueSummaryData: RevenueSummary[] = [
  {
    period: 'today',
    totalRevenue: 64100000,
    totalOrders: 38,
    totalCustomers: 36,
    averageOrderValue: 1686842,
    growthRate: 5.2,
    targetRevenue: 60000000,
    achievementRate: 106.8,
  },
  {
    period: 'week',
    totalRevenue: 456400000,
    totalOrders: 637,
    totalCustomers: 589,
    averageOrderValue: 716483,
    growthRate: 12.5,
    targetRevenue: 420000000,
    achievementRate: 108.7,
  },
  {
    period: 'month',
    totalRevenue: 1065000000,
    totalOrders: 1489,
    totalCustomers: 1389,
    averageOrderValue: 715247,
    growthRate: 19.4,
    targetRevenue: 1000000000,
    achievementRate: 106.5,
  },
  {
    period: 'year',
    totalRevenue: 2902000000,
    totalOrders: 4035,
    totalCustomers: 3779,
    averageOrderValue: 719231,
    growthRate: 15.8,
    targetRevenue: 12000000000,
    achievementRate: 24.2,
  },
];

// ============================================
// 12. DAY OF WEEK ANALYSIS - Phân tích theo ngày trong tuần
// ============================================
export interface DayOfWeekStats {
  dayOfWeek: number; // 0=Sunday, 1=Monday, ...
  dayName: string;
  averageRevenue: number;
  averageOrders: number;
  averageOrderValue: number;
  performanceLevel: 'low' | 'medium' | 'high' | 'peak';
}

export const dayOfWeekStatsData: DayOfWeekStats[] = [
  {
    dayOfWeek: 0,
    dayName: 'Chủ nhật',
    averageRevenue: 78600000,
    averageOrders: 112,
    averageOrderValue: 701786,
    performanceLevel: 'peak',
  },
  {
    dayOfWeek: 1,
    dayName: 'Thứ hai',
    averageRevenue: 48200000,
    averageOrders: 68,
    averageOrderValue: 708824,
    performanceLevel: 'medium',
  },
  {
    dayOfWeek: 2,
    dayName: 'Thứ ba',
    averageRevenue: 52800000,
    averageOrders: 74,
    averageOrderValue: 713514,
    performanceLevel: 'medium',
  },
  {
    dayOfWeek: 3,
    dayName: 'Thứ tư',
    averageRevenue: 59300000,
    averageOrders: 83,
    averageOrderValue: 714458,
    performanceLevel: 'high',
  },
  {
    dayOfWeek: 4,
    dayName: 'Thứ năm',
    averageRevenue: 61700000,
    averageOrders: 87,
    averageOrderValue: 709195,
    performanceLevel: 'high',
  },
  {
    dayOfWeek: 5,
    dayName: 'Thứ sáu',
    averageRevenue: 68900000,
    averageOrders: 96,
    averageOrderValue: 717708,
    performanceLevel: 'high',
  },
  {
    dayOfWeek: 6,
    dayName: 'Thứ bảy',
    averageRevenue: 82400000,
    averageOrders: 115,
    averageOrderValue: 716522,
    performanceLevel: 'peak',
  },
];

// ============================================
// 13. FRAME STYLE ANALYTICS - Phân tích theo kiểu dáng gọng
// ============================================
export interface FrameStyleAnalytics {
  style: string;
  displayName: string;
  totalSold: number;
  totalRevenue: number;
  averagePrice: number;
  trendScore: number; // 1-10, độ phổ biến
  ageGroup: string; // Nhóm tuổi ưa chuộng
  growthRate: number;
}

export const frameStyleAnalyticsData: FrameStyleAnalytics[] = [
  {
    style: 'aviator',
    displayName: 'Phi công (Aviator)',
    totalSold: 234,
    totalRevenue: 93600000,
    averagePrice: 400000,
    trendScore: 9,
    ageGroup: '25-45',
    growthRate: 15.2,
  },
  {
    style: 'round',
    displayName: 'Tròn (Round)',
    totalSold: 189,
    totalRevenue: 75600000,
    averagePrice: 400000,
    trendScore: 8,
    ageGroup: '20-35',
    growthRate: 22.5,
  },
  {
    style: 'rectangle',
    displayName: 'Chữ nhật (Rectangle)',
    totalSold: 312,
    totalRevenue: 124800000,
    averagePrice: 400000,
    trendScore: 7,
    ageGroup: '30-50',
    growthRate: 8.3,
  },
  {
    style: 'cat_eye',
    displayName: 'Mắt mèo (Cat Eye)',
    totalSold: 156,
    totalRevenue: 78000000,
    averagePrice: 500000,
    trendScore: 9,
    ageGroup: '25-40',
    growthRate: 28.7,
  },
  {
    style: 'wayfarer',
    displayName: 'Wayfarer',
    totalSold: 267,
    totalRevenue: 106800000,
    averagePrice: 400000,
    trendScore: 8,
    ageGroup: '20-40',
    growthRate: 12.1,
  },
  {
    style: 'square',
    displayName: 'Vuông (Square)',
    totalSold: 198,
    totalRevenue: 79200000,
    averagePrice: 400000,
    trendScore: 7,
    ageGroup: '25-45',
    growthRate: 6.5,
  },
  {
    style: 'oval',
    displayName: 'Ovan (Oval)',
    totalSold: 145,
    totalRevenue: 58000000,
    averagePrice: 400000,
    trendScore: 6,
    ageGroup: '30-55',
    growthRate: 3.2,
  },
  {
    style: 'oversized',
    displayName: 'Cỡ lớn (Oversized)',
    totalSold: 112,
    totalRevenue: 67200000,
    averagePrice: 600000,
    trendScore: 10,
    ageGroup: '20-35',
    growthRate: 35.8,
  },
];

// ============================================
// 14. LENS TYPE ANALYTICS - Phân tích theo loại tròng kính
// ============================================
export interface LensTypeAnalytics {
  lensType: string;
  displayName: string;
  totalSold: number;
  totalRevenue: number;
  averagePrice: number;
  revenueShare: number;
  prescriptionRate: number; // % có đơn thuốc
  popularCoating: string;
}

export const lensTypeAnalyticsData: LensTypeAnalytics[] = [
  {
    lensType: 'single_vision',
    displayName: 'Đơn tròng (Single Vision)',
    totalSold: 589,
    totalRevenue: 176700000,
    averagePrice: 300000,
    revenueShare: 43.2,
    prescriptionRate: 95.2,
    popularCoating: 'Chống phản quang',
  },
  {
    lensType: 'progressive',
    displayName: 'Đa tròng (Progressive)',
    totalSold: 234,
    totalRevenue: 140400000,
    averagePrice: 600000,
    revenueShare: 34.3,
    prescriptionRate: 100,
    popularCoating: 'Chống trầy xước',
  },
  {
    lensType: 'blue_light',
    displayName: 'Chống ánh sáng xanh',
    totalSold: 412,
    totalRevenue: 123600000,
    averagePrice: 300000,
    revenueShare: 30.2,
    prescriptionRate: 68.4,
    popularCoating: 'Chống phản quang',
  },
  {
    lensType: 'photochromic',
    displayName: 'Đổi màu (Photochromic)',
    totalSold: 167,
    totalRevenue: 83500000,
    averagePrice: 500000,
    revenueShare: 20.4,
    prescriptionRate: 89.2,
    popularCoating: 'Chống UV',
  },
  {
    lensType: 'polarized',
    displayName: 'Phân cực (Polarized)',
    totalSold: 145,
    totalRevenue: 72500000,
    averagePrice: 500000,
    revenueShare: 17.7,
    prescriptionRate: 52.4,
    popularCoating: 'Chống UV',
  },
  {
    lensType: 'bifocal',
    displayName: 'Hai tròng (Bifocal)',
    totalSold: 89,
    totalRevenue: 35600000,
    averagePrice: 400000,
    revenueShare: 8.7,
    prescriptionRate: 100,
    popularCoating: 'Chống trầy xước',
  },
];

// ============================================
// 15. COLOR PREFERENCE ANALYTICS - Phân tích màu sắc yêu thích
// ============================================
export interface ColorPreference {
  color: string;
  displayName: string;
  totalSold: number;
  revenueShare: number;
  trendStatus: 'rising' | 'stable' | 'falling';
  popularCategory: string;
}

export const colorPreferenceData: ColorPreference[] = [
  {
    color: 'black',
    displayName: 'Đen',
    totalSold: 456,
    revenueShare: 32.8,
    trendStatus: 'stable',
    popularCategory: 'Gọng kính & Kính mát',
  },
  {
    color: 'tortoiseshell',
    displayName: 'Vân rùa',
    totalSold: 312,
    revenueShare: 22.4,
    trendStatus: 'rising',
    popularCategory: 'Gọng kính',
  },
  {
    color: 'gold',
    displayName: 'Vàng',
    totalSold: 189,
    revenueShare: 13.6,
    trendStatus: 'stable',
    popularCategory: 'Kính mát cao cấp',
  },
  {
    color: 'silver',
    displayName: 'Bạc',
    totalSold: 167,
    revenueShare: 12.0,
    trendStatus: 'stable',
    popularCategory: 'Gọng kính',
  },
  {
    color: 'brown',
    displayName: 'Nâu',
    totalSold: 145,
    revenueShare: 10.4,
    trendStatus: 'stable',
    popularCategory: 'Gọng kính',
  },
  {
    color: 'transparent',
    displayName: 'Trong suốt',
    totalSold: 134,
    revenueShare: 9.6,
    trendStatus: 'rising',
    popularCategory: 'Gọng kính thời trang',
  },
  {
    color: 'pink',
    displayName: 'Hồng',
    totalSold: 98,
    revenueShare: 7.0,
    trendStatus: 'rising',
    popularCategory: 'Gọng kính nữ',
  },
  {
    color: 'blue',
    displayName: 'Xanh dương',
    totalSold: 87,
    revenueShare: 6.3,
    trendStatus: 'stable',
    popularCategory: 'Gọng kính',
  },
];

// ============================================
// 16. AGE DEMOGRAPHIC ANALYTICS - Phân tích theo độ tuổi
// ============================================
export interface AgeDemographic {
  ageGroup: string;
  displayName: string;
  customerCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  topCategory: string;
  topStyle: string;
  preferredPrice: string;
}

export const ageDemographicData: AgeDemographic[] = [
  {
    ageGroup: '18-24',
    displayName: '18-24 tuổi',
    customerCount: 234,
    totalRevenue: 98000000,
    averageOrderValue: 418803,
    topCategory: 'Gọng kính thời trang',
    topStyle: 'Round, Oversized',
    preferredPrice: '200.000 - 500.000 VND',
  },
  {
    ageGroup: '25-34',
    displayName: '25-34 tuổi',
    customerCount: 456,
    totalRevenue: 312000000,
    averageOrderValue: 684211,
    topCategory: 'Kính chống ánh sáng xanh',
    topStyle: 'Aviator, Cat Eye, Wayfarer',
    preferredPrice: '400.000 - 800.000 VND',
  },
  {
    ageGroup: '35-44',
    displayName: '35-44 tuổi',
    customerCount: 389,
    totalRevenue: 378000000,
    averageOrderValue: 971723,
    topCategory: 'Progressive Lens',
    topStyle: 'Rectangle, Square',
    preferredPrice: '600.000 - 1.200.000 VND',
  },
  {
    ageGroup: '45-54',
    displayName: '45-54 tuổi',
    customerCount: 312,
    totalRevenue: 289000000,
    averageOrderValue: 926282,
    topCategory: 'Progressive & Bifocal',
    topStyle: 'Rectangle, Oval',
    preferredPrice: '600.000 - 1.000.000 VND',
  },
  {
    ageGroup: '55-64',
    displayName: '55-64 tuổi',
    customerCount: 178,
    totalRevenue: 142000000,
    averageOrderValue: 797753,
    topCategory: 'Progressive Lens',
    topStyle: 'Rectangle, Oval',
    preferredPrice: '500.000 - 900.000 VND',
  },
  {
    ageGroup: '65+',
    displayName: '65 tuổi trở lên',
    customerCount: 89,
    totalRevenue: 67000000,
    averageOrderValue: 752809,
    topCategory: 'Bifocal & Reading Glasses',
    topStyle: 'Rectangle, Oval',
    preferredPrice: '400.000 - 800.000 VND',
  },
];

// ============================================
// 17. PRESCRIPTION VS NON-PRESCRIPTION - Có đơn thuốc vs Không đơn
// ============================================
export interface PrescriptionAnalytics {
  type: 'prescription' | 'non_prescription';
  displayName: string;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  revenueShare: number;
  processingTime: string; // Thời gian xử lý trung bình
  returnRate: number; // Tỷ lệ trả hàng %
}

export const prescriptionAnalyticsData: PrescriptionAnalytics[] = [
  {
    type: 'prescription',
    displayName: 'Có đơn thuốc (Prescription)',
    totalOrders: 1089,
    totalRevenue: 789000000,
    averageOrderValue: 724745,
    revenueShare: 74.1,
    processingTime: '2-3 ngày',
    returnRate: 2.8,
  },
  {
    type: 'non_prescription',
    displayName: 'Không đơn thuốc (Non-Prescription)',
    totalOrders: 400,
    totalRevenue: 276000000,
    averageOrderValue: 690000,
    revenueShare: 25.9,
    processingTime: '1 ngày',
    returnRate: 5.2,
  },
];

// ============================================
// 18. RETURN & REFUND ANALYTICS - Phân tích đổi trả & hoàn tiền
// ============================================
export interface ReturnAnalytics {
  category: string;
  displayName: string;
  totalReturns: number;
  returnRate: number; // %
  topReason: string;
  averageRefundAmount: number;
  resolutionTime: string; // Thời gian xử lý trung bình
}

export const returnAnalyticsData: ReturnAnalytics[] = [
  {
    category: 'frame',
    displayName: 'Gọng kính',
    totalReturns: 23,
    returnRate: 2.7,
    topReason: 'Không vừa khuôn mặt',
    averageRefundAmount: 520000,
    resolutionTime: '1-2 ngày',
  },
  {
    category: 'lens',
    displayName: 'Tròng kính',
    totalReturns: 18,
    returnRate: 2.0,
    topReason: 'Độ kính không chính xác',
    averageRefundAmount: 380000,
    resolutionTime: '2-3 ngày',
  },
  {
    category: 'sunglasses',
    displayName: 'Kính mát',
    totalReturns: 14,
    returnRate: 5.2,
    topReason: 'Không thích màu sắc',
    averageRefundAmount: 1200000,
    resolutionTime: '1 ngày',
  },
  {
    category: 'accessory',
    displayName: 'Phụ kiện',
    totalReturns: 8,
    returnRate: 0.9,
    topReason: 'Lỗi sản phẩm',
    averageRefundAmount: 45000,
    resolutionTime: '1 ngày',
  },
];

// ============================================
// 19. SEASONAL TRENDS - Xu hướng theo mùa
// ============================================
export interface SeasonalTrend {
  season: string;
  displayName: string;
  averageMonthlyRevenue: number;
  topCategory: string;
  topProducts: string[];
  marketingOpportunity: string;
  expectedGrowth: number; // %
}

export const seasonalTrendData: SeasonalTrend[] = [
  {
    season: 'spring',
    displayName: 'Mùa xuân (T3-T5)',
    averageMonthlyRevenue: 1120000000,
    topCategory: 'Kính mát & Gọng thời trang',
    topProducts: ['Kính mát Gucci', 'Gọng Gentle Monster', 'Tròng Photochromic'],
    marketingOpportunity: 'Khuyến mãi Tết, Back to School',
    expectedGrowth: 18.5,
  },
  {
    season: 'summer',
    displayName: 'Mùa hè (T6-T8)',
    averageMonthlyRevenue: 1350000000,
    topCategory: 'Kính mát chống UV',
    topProducts: ['Kính mát Polarized', 'Kính mát thể thao', 'Tròng Photochromic'],
    marketingOpportunity: 'Du lịch hè, Bảo vệ mắt khỏi UV',
    expectedGrowth: 25.3,
  },
  {
    season: 'fall',
    displayName: 'Mùa thu (T9-T11)',
    averageMonthlyRevenue: 1080000000,
    topCategory: 'Gọng kính thời trang',
    topProducts: ['Gọng Ray-Ban', 'Gọng Dior', 'Tròng Progressive'],
    marketingOpportunity: 'Khuyến mãi năm học mới',
    expectedGrowth: 12.8,
  },
  {
    season: 'winter',
    displayName: 'Mùa đông (T12-T2)',
    averageMonthlyRevenue: 1420000000,
    topCategory: 'Gọng kính cao cấp',
    topProducts: ['Gọng Prada', 'Gọng Burberry', 'Tròng Blue Light'],
    marketingOpportunity: 'Tết Nguyên Đán, Black Friday, Year-end Sale',
    expectedGrowth: 32.7,
  },
];

// ============================================
// 20. CUSTOMER LIFETIME VALUE - Giá trị vòng đời khách hàng
// ============================================
export interface CustomerLifetimeValue {
  segment: string;
  displayName: string;
  averageLifetimeValue: number;
  averagePurchaseFrequency: number; // Số lần mua trong 1 năm
  averageLifespan: number; // Số năm
  retentionRate: number; // %
  churnRate: number; // %
  acquisitionCost: number;
  profitability: number;
}

export const customerLifetimeValueData: CustomerLifetimeValue[] = [
  {
    segment: 'premium',
    displayName: 'Khách hàng cao cấp',
    averageLifetimeValue: 15600000,
    averagePurchaseFrequency: 3.2,
    averageLifespan: 5.2,
    retentionRate: 85.3,
    churnRate: 14.7,
    acquisitionCost: 850000,
    profitability: 14750000,
  },
  {
    segment: 'regular',
    displayName: 'Khách hàng thường xuyên',
    averageLifetimeValue: 6800000,
    averagePurchaseFrequency: 2.1,
    averageLifespan: 3.8,
    retentionRate: 72.5,
    churnRate: 27.5,
    acquisitionCost: 420000,
    profitability: 6380000,
  },
  {
    segment: 'occasional',
    displayName: 'Khách hàng thỉnh thoảng',
    averageLifetimeValue: 2400000,
    averagePurchaseFrequency: 1.2,
    averageLifespan: 2.1,
    retentionRate: 45.8,
    churnRate: 54.2,
    acquisitionCost: 280000,
    profitability: 2120000,
  },
  {
    segment: 'new',
    displayName: 'Khách hàng mới',
    averageLifetimeValue: 450000,
    averagePurchaseFrequency: 1.0,
    averageLifespan: 0.5,
    retentionRate: 35.2,
    churnRate: 64.8,
    acquisitionCost: 320000,
    profitability: 130000,
  },
];

// ============================================
// 21. CONVERSION FUNNEL - Phễu chuyển đổi (Online)
// ============================================
export interface ConversionFunnel {
  stage: string;
  displayName: string;
  visitors: number;
  conversionRate: number; // % from previous stage
  dropOffRate: number; // % lost at this stage
  averageTimeSpent: string;
  optimizationTip: string;
}

export const conversionFunnelData: ConversionFunnel[] = [
  {
    stage: 'visit',
    displayName: '1. Truy cập website',
    visitors: 45000,
    conversionRate: 100,
    dropOffRate: 0,
    averageTimeSpent: '2m 34s',
    optimizationTip: 'Tăng tốc độ tải trang, cải thiện SEO',
  },
  {
    stage: 'product_view',
    displayName: '2. Xem sản phẩm',
    visitors: 18000,
    conversionRate: 40.0,
    dropOffRate: 60.0,
    averageTimeSpent: '3m 12s',
    optimizationTip: 'Cải thiện hình ảnh sản phẩm, thêm video demo',
  },
  {
    stage: 'add_to_cart',
    displayName: '3. Thêm vào giỏ hàng',
    visitors: 5400,
    conversionRate: 30.0,
    dropOffRate: 70.0,
    averageTimeSpent: '1m 45s',
    optimizationTip: 'Hiển thị rõ giá, khuyến mãi, và chính sách đổi trả',
  },
  {
    stage: 'checkout',
    displayName: '4. Thanh toán',
    visitors: 2160,
    conversionRate: 40.0,
    dropOffRate: 60.0,
    averageTimeSpent: '4m 28s',
    optimizationTip: 'Đơn giản hóa quy trình, thêm nhiều phương thức thanh toán',
  },
  {
    stage: 'purchase',
    displayName: '5. Hoàn tất mua hàng',
    visitors: 1296,
    conversionRate: 60.0,
    dropOffRate: 40.0,
    averageTimeSpent: '2m 15s',
    optimizationTip: 'Tối ưu trang xác nhận, gửi email cảm ơn',
  },
];

// ============================================
// 22. TOP PERFORMING DAYS - Ngày bán hàng xuất sắc nhất
// ============================================
export interface TopPerformingDay {
  date: string;
  dayName: string;
  totalRevenue: number;
  totalOrders: number;
  specialEvent: string;
  keyFactors: string[];
}

export const topPerformingDaysData: TopPerformingDay[] = [
  {
    date: '2024-02-14',
    dayName: 'Thứ tư - Valentine',
    totalRevenue: 89200000,
    totalOrders: 51,
    specialEvent: 'Ngày Valentine',
    keyFactors: ['Khuyến mãi đặc biệt -20%', 'Tặng kèm phụ kiện', 'Quảng cáo Facebook hiệu quả'],
  },
  {
    date: '2024-03-02',
    dayName: 'Thứ bảy',
    totalRevenue: 81200000,
    totalOrders: 47,
    specialEvent: 'Cuối tuần',
    keyFactors: ['Khách đến cửa hàng nhiều', 'Ra mắt bộ sưu tập mới', 'Thời tiết đẹp'],
  },
  {
    date: '2024-02-24',
    dayName: 'Thứ bảy',
    totalRevenue: 79600000,
    totalOrders: 46,
    specialEvent: 'Flash Sale cuối tuần',
    keyFactors: ['Flash Sale 18:00-20:00', 'Livestream bán hàng', 'Mã giảm giá độc quyền'],
  },
  {
    date: '2024-02-10',
    dayName: 'Thứ bảy',
    totalRevenue: 72800000,
    totalOrders: 42,
    specialEvent: 'Cuối tuần',
    keyFactors: ['Traffic cao', 'Nhân viên bán hàng xuất sắc', 'Khách hàng VIP ghé thăm'],
  },
  {
    date: '2024-03-01',
    dayName: 'Thứ sáu',
    totalRevenue: 73500000,
    totalOrders: 43,
    specialEvent: 'Đầu tháng mới',
    keyFactors: ['Khách hàng nhận lương', 'Khuyến mãi đầu tháng', 'Email marketing hiệu quả'],
  },
];

// ============================================
// EXPORT ALL DATA
// ============================================
export const revenueAnalyticsData = {
  // Core metrics
  dailySales: dailySalesData,
  revenueSummary: revenueSummaryData,
  monthlyRevenue: monthlyRevenueData,
  weeklyRevenue: weeklyRevenueData,
  
  // Time-based analytics
  hourlySalesPattern: hourlySalesPatternData,
  dayOfWeekStats: dayOfWeekStatsData,
  peakTimes: peakTimesData,
  seasonalTrends: seasonalTrendData,
  topPerformingDays: topPerformingDaysData,
  
  // Product analytics
  productSalesStats: productSalesStatsData,
  categoryPerformance: categoryPerformanceData,
  brandPerformance: brandPerformanceData,
  inventoryAlerts: inventoryAlertsData,
  
  // Eyewear-specific analytics
  frameStyleAnalytics: frameStyleAnalyticsData,
  lensTypeAnalytics: lensTypeAnalyticsData,
  colorPreference: colorPreferenceData,
  prescriptionAnalytics: prescriptionAnalyticsData,
  
  // Customer analytics
  customerSegments: customerSegmentData,
  ageDemographic: ageDemographicData,
  customerLifetimeValue: customerLifetimeValueData,
  
  // Channel & conversion
  channelPerformance: channelPerformanceData,
  conversionFunnel: conversionFunnelData,
  
  // Quality metrics
  returnAnalytics: returnAnalyticsData,
};
