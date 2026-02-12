export interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
}

export const mockRevenueData: RevenueData[] = [
  { month: 'Jan 2026', revenue: 45230, orders: 156 },
  { month: 'Dec 2025', revenue: 52100, orders: 189 },
  { month: 'Nov 2025', revenue: 41800, orders: 142 },
  { month: 'Oct 2025', revenue: 48900, orders: 167 },
  { month: 'Sep 2025', revenue: 39500, orders: 134 },
  { month: 'Aug 2025', revenue: 43200, orders: 148 },
];

export interface CategoryRevenue {
  category: string;
  revenue: number;
  percentage: number;
  change: number;
}

export const mockCategoryRevenue: CategoryRevenue[] = [
  { category: 'Sunglasses', revenue: 82450, percentage: 42, change: 12.5 },
  { category: 'Eyeglasses', revenue: 65200, percentage: 33, change: 8.3 },
  {
    category: 'Computer Glasses',
    revenue: 28900,
    percentage: 15,
    change: 22.1,
  },
  { category: 'Sports Glasses', revenue: 19650, percentage: 10, change: -3.2 },
];

export interface TopProduct {
  productName: string;
  category: string;
  unitsSold: number;
  revenue: number;
}

export const mockTopProducts: TopProduct[] = [
  {
    productName: 'Classic Aviator Sunglasses',
    category: 'Sunglasses',
    unitsSold: 234,
    revenue: 30426,
  },
  {
    productName: 'Blue Light Blocking Glasses',
    category: 'Computer Glasses',
    unitsSold: 189,
    revenue: 13221,
  },
  {
    productName: 'Vintage Cat Eye Frames',
    category: 'Eyeglasses',
    unitsSold: 156,
    revenue: 15594,
  },
  {
    productName: 'Polarized Wayfarer',
    category: 'Sunglasses',
    unitsSold: 142,
    revenue: 21298,
  },
  {
    productName: 'Modern Round Eyeglasses',
    category: 'Eyeglasses',
    unitsSold: 128,
    revenue: 11519,
  },
];

export interface CustomerMetrics {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageOrderValue: number;
  customerLifetimeValue: number;
}

export const mockCustomerMetrics: CustomerMetrics = {
  totalCustomers: 3458,
  newCustomers: 234,
  returningCustomers: 3224,
  averageOrderValue: 127.45,
  customerLifetimeValue: 342.89,
};
