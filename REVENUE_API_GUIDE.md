# Revenue Analytics API Guide

## 📊 Overview

This document outlines the API endpoints needed for the Revenue Analytics & Manager Dashboard based on the mock data in `src/data/revenueData.ts`. This guide helps the backend team understand:

1. **What data structures to return**
2. **What query parameters to support**
3. **What aggregations to compute**
4. **What performance optimizations are needed**

---

## 🎯 Core API Endpoints

### 1. Revenue Summary

**Endpoint:** `GET /api/manager/revenue/summary`

**Query Parameters:**
- `period`: `today` | `week` | `month` | `year`

**Response:**
```typescript
{
  period: 'today' | 'week' | 'month' | 'year',
  totalRevenue: number,
  totalOrders: number,
  totalCustomers: number,
  averageOrderValue: number,
  growthRate: number,
  targetRevenue: number,
  achievementRate: number
}
```

**Backend Notes:**
- Cache this data for 5-10 minutes (high frequency access)
- Pre-calculate `growthRate` by comparing with previous period
- Store targets in a separate `revenue_targets` table

---

### 2. Daily Sales Data

**Endpoint:** `GET /api/manager/revenue/daily-sales`

**Query Parameters:**
- `startDate`: YYYY-MM-DD (required)
- `endDate`: YYYY-MM-DD (required)
- `limit`: number (default: 30, max: 90)

**Response:**
```typescript
{
  data: [
    {
      date: string, // YYYY-MM-DD
      totalRevenue: number,
      totalOrders: number,
      averageOrderValue: number,
      customerCount: number,
      onlineRevenue: number,
      storeRevenue: number
    }
  ],
  summary: {
    totalRevenue: number,
    averageDaily: number,
    peakDay: string,
    lowestDay: string
  }
}
```

**Backend Notes:**
- Query from `orders` table, group by date
- Calculate online vs store from `order.channel` field
- Index on `created_at` and `channel` for performance

---

### 3. Hourly Sales Pattern

**Endpoint:** `GET /api/manager/revenue/hourly-pattern`

**Query Parameters:**
- `date`: YYYY-MM-DD (optional, defaults to today)
- `days`: number (analyze last N days, default: 30)

**Response:**
```typescript
{
  data: [
    {
      hour: number, // 0-23
      averageOrders: number,
      averageRevenue: number,
      peakLevel: 'low' | 'medium' | 'high' | 'peak'
    }
  ]
}
```

**Backend Notes:**
- Extract hour from `orders.created_at`
- Calculate averages across specified days
- Use materialized view for better performance
- Peak level logic: < 20% = low, 20-50% = medium, 50-80% = high, > 80% = peak

---

### 4. Product Sales Statistics

**Endpoint:** `GET /api/manager/revenue/product-stats`

**Query Parameters:**
- `category`: filter by category (optional)
- `brand`: filter by brand (optional)
- `sortBy`: `totalSold` | `totalRevenue` | `trend` (default: totalSold)
- `order`: `asc` | `desc` (default: desc)
- `limit`: number (default: 15)
- `startDate`: YYYY-MM-DD (optional)
- `endDate`: YYYY-MM-DD (optional)

**Response:**
```typescript
{
  data: [
    {
      productId: string,
      productName: string,
      productCode: string,
      category: 'frame' | 'lens' | 'sunglasses' | 'accessory' | 'service',
      brand: string,
      totalSold: number,
      totalRevenue: number,
      averagePrice: number,
      stockLevel: number,
      reorderPoint: number,
      trend: 'increasing' | 'stable' | 'decreasing',
      lastSoldDate: string
    }
  ]
}
```

**Backend Notes:**
- Join `orders`, `order_items`, `products`, `inventory`
- Trend calculation: compare current month vs previous month
- Use Redis cache for top products (updated daily)

---

### 5. Category Performance

**Endpoint:** `GET /api/manager/revenue/category-performance`

**Query Parameters:**
- `startDate`: YYYY-MM-DD (optional)
- `endDate`: YYYY-MM-DD (optional)

**Response:**
```typescript
{
  data: [
    {
      category: string,
      displayName: string,
      totalRevenue: number,
      totalOrders: number,
      totalQuantity: number,
      averageOrderValue: number,
      growthRate: number,
      revenueShare: number
    }
  ]
}
```

**Backend Notes:**
- Aggregate from `order_items` joined with `products`
- Calculate growth rate vs previous period
- Revenue share = (category revenue / total revenue) * 100

---

### 6. Brand Performance

**Endpoint:** `GET /api/manager/revenue/brand-performance`

**Query Parameters:**
- `limit`: number (default: 10)
- `sortBy`: `totalRevenue` | `totalSold` | `growthRate`

**Response:**
```typescript
{
  data: [
    {
      brand: string,
      totalRevenue: number,
      totalSold: number,
      averagePrice: number,
      growthRate: number,
      topProduct: string
    }
  ]
}
```

---

### 7. Frame Style Analytics (Eyewear-Specific)

**Endpoint:** `GET /api/manager/revenue/frame-styles`

**Response:**
```typescript
{
  data: [
    {
      style: string,
      displayName: string,
      totalSold: number,
      totalRevenue: number,
      averagePrice: number,
      trendScore: number, // 1-10
      ageGroup: string,
      growthRate: number
    }
  ]
}
```

**Backend Notes:**
- Requires `products.style` field (aviator, round, cat_eye, etc.)
- Join with customer age data for `ageGroup`
- Trend score based on sales velocity in last 90 days

---

### 8. Lens Type Analytics (Eyewear-Specific)

**Endpoint:** `GET /api/manager/revenue/lens-types`

**Response:**
```typescript
{
  data: [
    {
      lensType: string,
      displayName: string,
      totalSold: number,
      totalRevenue: number,
      averagePrice: number,
      revenueShare: number,
      prescriptionRate: number,
      popularCoating: string
    }
  ]
}
```

**Backend Notes:**
- Requires `products.lens_type` and `products.coating` fields
- Calculate prescription rate from orders with prescription uploads
- Popular coating = most frequently ordered coating for this lens type

---

### 9. Color Preference Analytics

**Endpoint:** `GET /api/manager/revenue/color-preferences`

**Response:**
```typescript
{
  data: [
    {
      color: string,
      displayName: string,
      totalSold: number,
      revenueShare: number,
      trendStatus: 'rising' | 'stable' | 'falling',
      popularCategory: string
    }
  ]
}
```

**Backend Notes:**
- Requires `products.color` field
- Trend: compare last month vs 3-month average
- Popular category = category with highest sales for this color

---

### 10. Age Demographic Analytics

**Endpoint:** `GET /api/manager/revenue/age-demographics`

**Response:**
```typescript
{
  data: [
    {
      ageGroup: string,
      displayName: string,
      customerCount: number,
      totalRevenue: number,
      averageOrderValue: number,
      topCategory: string,
      topStyle: string,
      preferredPrice: string
    }
  ]
}
```

**Backend Notes:**
- Requires `users.date_of_birth` field
- Calculate age: `YEAR(CURDATE()) - YEAR(date_of_birth)`
- Group into buckets: 18-24, 25-34, 35-44, 45-54, 55-64, 65+
- Privacy consideration: GDPR compliance for age data

---

### 11. Prescription Analytics

**Endpoint:** `GET /api/manager/revenue/prescription-analytics`

**Response:**
```typescript
{
  data: [
    {
      type: 'prescription' | 'non_prescription',
      displayName: string,
      totalOrders: number,
      totalRevenue: number,
      averageOrderValue: number,
      revenueShare: number,
      processingTime: string,
      returnRate: number
    }
  ]
}
```

**Backend Notes:**
- Check if order has `prescription_id` not null
- Processing time = average `fulfilled_at - created_at`
- Return rate = (returned orders / total orders) * 100

---

### 12. Return & Refund Analytics

**Endpoint:** `GET /api/manager/revenue/return-analytics`

**Query Parameters:**
- `startDate`: YYYY-MM-DD (optional)
- `endDate`: YYYY-MM-DD (optional)

**Response:**
```typescript
{
  data: [
    {
      category: string,
      displayName: string,
      totalReturns: number,
      returnRate: number,
      topReason: string,
      averageRefundAmount: number,
      resolutionTime: string
    }
  ],
  summary: {
    totalReturns: number,
    totalRefunded: number,
    overallReturnRate: number
  }
}
```

**Backend Notes:**
- Query from `returns` table joined with `orders` and `products`
- Group by product category
- Resolution time = `resolved_at - created_at`

---

### 13. Seasonal Trends

**Endpoint:** `GET /api/manager/revenue/seasonal-trends`

**Response:**
```typescript
{
  data: [
    {
      season: string,
      displayName: string,
      averageMonthlyRevenue: number,
      topCategory: string,
      topProducts: string[],
      marketingOpportunity: string,
      expectedGrowth: number
    }
  ]
}
```

**Backend Notes:**
- Based on historical data (last 2-3 years)
- Spring: Mar-May, Summer: Jun-Aug, Fall: Sep-Nov, Winter: Dec-Feb
- Use machine learning for expected growth prediction (optional)

---

### 14. Customer Lifetime Value

**Endpoint:** `GET /api/manager/revenue/customer-lifetime-value`

**Response:**
```typescript
{
  data: [
    {
      segment: string,
      displayName: string,
      averageLifetimeValue: number,
      averagePurchaseFrequency: number,
      averageLifespan: number,
      retentionRate: number,
      churnRate: number,
      acquisitionCost: number,
      profitability: number
    }
  ]
}
```

**Backend Notes:**
- Complex calculation requiring historical customer data
- Segment customers based on total spending: premium (>10M), regular (3-10M), occasional (1-3M), new (<1M)
- Retention rate = (customers who returned / total customers) * 100
- Consider using a data warehouse for this calculation

---

### 15. Conversion Funnel (Online Only)

**Endpoint:** `GET /api/manager/revenue/conversion-funnel`

**Query Parameters:**
- `startDate`: YYYY-MM-DD (optional)
- `endDate`: YYYY-MM-DD (optional)

**Response:**
```typescript
{
  data: [
    {
      stage: string,
      displayName: string,
      visitors: number,
      conversionRate: number,
      dropOffRate: number,
      averageTimeSpent: string,
      optimizationTip: string
    }
  ]
}
```

**Backend Notes:**
- Requires analytics tracking (Google Analytics or custom)
- Stages: visit → product_view → add_to_cart → checkout → purchase
- Track using events/sessions table
- Time spent from session duration data

---

### 16. Peak Times Analysis

**Endpoint:** `GET /api/manager/revenue/peak-times`

**Response:**
```typescript
{
  data: [
    {
      period: string,
      description: string,
      averageRevenue: number,
      averageOrders: number,
      recommendation: string
    }
  ]
}
```

**Backend Notes:**
- Analyze patterns: weekday morning, afternoon, evening, weekend, holidays
- Use historical data (last 90 days minimum)
- Recommendations can be hard-coded based on thresholds

---

### 17. Monthly & Weekly Revenue

**Endpoints:**
- `GET /api/manager/revenue/monthly`
- `GET /api/manager/revenue/weekly`

**Query Parameters:**
- `months`: number (for monthly, default: 6)
- `weeks`: number (for weekly, default: 12)

**Response (Monthly):**
```typescript
{
  data: [
    {
      month: string, // YYYY-MM
      totalRevenue: number,
      totalOrders: number,
      averageOrderValue: number,
      customerCount: number,
      growthRate: number
    }
  ]
}
```

---

### 18. Day of Week Statistics

**Endpoint:** `GET /api/manager/revenue/day-of-week`

**Query Parameters:**
- `weeks`: number (analyze last N weeks, default: 4)

**Response:**
```typescript
{
  data: [
    {
      dayOfWeek: number, // 0=Sunday, 6=Saturday
      dayName: string,
      averageRevenue: number,
      averageOrders: number,
      averageOrderValue: number,
      performanceLevel: 'low' | 'medium' | 'high' | 'peak'
    }
  ]
}
```

---

### 19. Channel Performance

**Endpoint:** `GET /api/manager/revenue/channel-performance`

**Query Parameters:**
- `startDate`: YYYY-MM-DD (optional)
- `endDate`: YYYY-MM-DD (optional)

**Response:**
```typescript
{
  data: [
    {
      channel: 'online' | 'store',
      displayName: string,
      totalRevenue: number,
      totalOrders: number,
      averageOrderValue: number,
      conversionRate: number,
      revenueShare: number,
      growthRate: number
    }
  ]
}
```

**Backend Notes:**
- Store channel in `orders.channel` field
- Conversion rate for store = (orders / walk-ins) * 100
- Conversion rate for online = (orders / sessions) * 100

---

### 20. Inventory Alerts

**Endpoint:** `GET /api/manager/revenue/inventory-alerts`

**Query Parameters:**
- `status`: `critical` | `warning` | `normal` (optional, filter)

**Response:**
```typescript
{
  data: [
    {
      productId: string,
      productName: string,
      currentStock: number,
      reorderPoint: number,
      averageDailySales: number,
      daysUntilStockout: number,
      status: 'critical' | 'warning' | 'normal',
      action: string
    }
  ]
}
```

**Backend Notes:**
- Query from `inventory` table
- Average daily sales = sum(sold in last 30 days) / 30
- Days until stockout = currentStock / averageDailySales
- Status: critical (<7 days), warning (7-14 days), normal (>14 days)

---

### 21. Top Performing Days

**Endpoint:** `GET /api/manager/revenue/top-performing-days`

**Query Parameters:**
- `limit`: number (default: 5)
- `startDate`: YYYY-MM-DD (optional)
- `endDate`: YYYY-MM-DD (optional)

**Response:**
```typescript
{
  data: [
    {
      date: string,
      dayName: string,
      totalRevenue: number,
      totalOrders: number,
      specialEvent: string,
      keyFactors: string[]
    }
  ]
}
```

---

## 🔧 Performance Optimization Recommendations

### 1. Caching Strategy

```javascript
// High frequency (5-10 min cache)
- /api/manager/revenue/summary
- /api/manager/revenue/product-stats (top 20)
- /api/manager/revenue/category-performance

// Medium frequency (30-60 min cache)
- /api/manager/revenue/brand-performance
- /api/manager/revenue/channel-performance
- /api/manager/revenue/customer-segments

// Low frequency (daily cache)
- /api/manager/revenue/seasonal-trends
- /api/manager/revenue/customer-lifetime-value
- /api/manager/revenue/conversion-funnel
```

### 2. Database Indexing

```sql
-- Essential indexes
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_channel ON orders(channel);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_users_date_of_birth ON users(date_of_birth);

-- Composite indexes for common queries
CREATE INDEX idx_orders_date_channel ON orders(created_at, channel);
CREATE INDEX idx_order_items_product_date ON order_items(product_id, created_at);
```

### 3. Materialized Views (Optional)

For heavily queried aggregations:

```sql
-- Daily revenue summary (refresh nightly)
CREATE MATERIALIZED VIEW mv_daily_revenue AS
SELECT 
  DATE(created_at) as date,
  SUM(total_amount) as total_revenue,
  COUNT(*) as total_orders,
  AVG(total_amount) as average_order_value,
  COUNT(DISTINCT customer_id) as customer_count
FROM orders
WHERE status = 'completed'
GROUP BY DATE(created_at);

-- Product performance (refresh hourly)
CREATE MATERIALIZED VIEW mv_product_performance AS
SELECT 
  p.id as product_id,
  p.name as product_name,
  p.category,
  p.brand,
  SUM(oi.quantity) as total_sold,
  SUM(oi.quantity * oi.price) as total_revenue,
  MAX(o.created_at) as last_sold_date
FROM products p
LEFT JOIN order_items oi ON p.id = oi.product_id
LEFT JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'completed'
GROUP BY p.id;
```

### 4. Real-time Updates

For real-time dashboard updates, consider:

- **WebSocket connection** for live revenue counter
- **Redis Pub/Sub** for broadcasting new orders to connected dashboards
- **Server-Sent Events (SSE)** for simpler one-way updates

```javascript
// Example SSE endpoint
GET /api/manager/revenue/live-stream
```

---

## 📊 Example Dashboard Layout

### Revenue Overview Page
```
┌─────────────────────────────────────────────────────────┐
│  Revenue Summary Cards (period selector)                │
│  [Today] [Week] [Month] [Year]                         │
│                                                         │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │ 64.1M│ │  38  │ │ 1.69M│ │106.8%│                  │
│  │Revenue│ │Orders│ │  AOV │ │Target│                  │
│  └──────┘ └──────┘ └──────┘ └──────┘                  │
├─────────────────────────────────────────────────────────┤
│  Revenue Chart (Line/Bar)                               │
│  [Daily] [Weekly] [Monthly]                            │
│  📈 Chart component here                               │
├─────────────────────────────────────────────────────────┤
│  Top Products          │  Category Performance         │
│  1. Ray-Ban Aviator    │  📊 Pie/Donut chart          │
│  2. Oakley Holbrook    │                              │
│  3. Essilor Crizal     │                              │
└─────────────────────────────────────────────────────────┘
```

### Analytics Deep Dive Page
```
┌─────────────────────────────────────────────────────────┐
│  Filters: [Date Range] [Category] [Channel] [Export]   │
├─────────────────────────────────────────────────────────┤
│  Peak Times Heatmap     │  Day of Week Chart           │
│  ⏰ Hourly pattern       │  📅 Sun-Sat comparison       │
├─────────────────────────────────────────────────────────┤
│  Frame Style Trends     │  Lens Type Distribution      │
│  👓 Popular styles       │  👁️ Prescription analytics   │
├─────────────────────────────────────────────────────────┤
│  Customer Demographics  │  Conversion Funnel           │
│  👥 Age distribution     │  🎯 Online funnel steps      │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Implementation Priority

### Phase 1 (MVP - Week 1-2)
✅ Revenue Summary
✅ Daily Sales Data
✅ Product Sales Statistics
✅ Category Performance
✅ Inventory Alerts

### Phase 2 (Core Analytics - Week 3-4)
✅ Hourly Sales Pattern
✅ Peak Times Analysis
✅ Brand Performance
✅ Channel Performance
✅ Day of Week Statistics

### Phase 3 (Advanced - Week 5-6)
✅ Frame Style Analytics
✅ Lens Type Analytics
✅ Age Demographics
✅ Prescription Analytics
✅ Return Analytics

### Phase 4 (Expert - Week 7-8)
✅ Customer Lifetime Value
✅ Conversion Funnel
✅ Seasonal Trends
✅ Color Preferences
✅ Top Performing Days

---

## 📝 Additional Notes

### Data Retention
- **Hot data** (last 90 days): MySQL/PostgreSQL
- **Warm data** (90 days - 2 years): Compressed tables or separate database
- **Cold data** (>2 years): Archive to S3/BigQuery for long-term analysis

### Testing Recommendations
1. Use the mock data from `revenueData.ts` for frontend development
2. Create seed data script based on mock data structure
3. Test with realistic data volumes (10k+ orders)
4. Performance test with concurrent requests

### Security Considerations
- ✅ Manager role only (`ROLE_MANAGER`, `ROLE_ADMIN`)
- ✅ Rate limiting: 100 requests/minute per user
- ✅ No PII in analytics responses (anonymize customer data)
- ✅ Audit logging for data exports

---

## 🤝 Communication with Frontend Team

### API Response Format
All endpoints should follow this structure:

```typescript
{
  success: boolean,
  data: T | T[], // actual data
  message?: string,
  metadata?: {
    total?: number,
    page?: number,
    limit?: number,
    generatedAt: string // ISO timestamp
  }
}
```

### Error Handling
```typescript
{
  success: false,
  error: {
    code: string, // e.g., "INVALID_DATE_RANGE"
    message: string, // User-friendly message
    details?: any // Additional context
  }
}
```

---

## 📧 Questions?

Contact the frontend team lead for clarifications on:
- Data structure requirements
- Visualization needs
- Performance expectations
- Real-time update requirements

---

**Last Updated:** March 6, 2026
**Version:** 1.0
**Owner:** Frontend Team
