export type DashboardTone = 'amber' | 'sky' | 'emerald' | 'violet';

export interface DashboardBreakdownItem {
  label: string;
  share: number;
  revenue: number;
  change: number;
  tone: DashboardTone;
}

export interface DashboardWeeklySnapshot {
  label: string;
  revenue: number;
  orders: number;
}

export interface DashboardTopProduct {
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
}

export interface SaleDashboardMonth {
  id: string;
  label: string;
  fullLabel: string;
  revenue: number;
  target: number;
  orders: number;
  newCustomers: number;
  returningRate: number;
  conversionRate: number;
  fulfillmentRate: number;
  onTimeRate: number;
  refundRate: number;
  channels: DashboardBreakdownItem[];
  categories: DashboardBreakdownItem[];
  weeklyTrend: DashboardWeeklySnapshot[];
  topProducts: DashboardTopProduct[];
  highlights: string[];
}

export const saleDashboardData: SaleDashboardMonth[] = [
  {
    id: '2025-09',
    label: 'T09/2025',
    fullLabel: 'Tháng 09/2025',
    revenue: 248_000_000,
    target: 260_000_000,
    orders: 176,
    newCustomers: 58,
    returningRate: 34,
    conversionRate: 22.8,
    fulfillmentRate: 95.4,
    onTimeRate: 93.8,
    refundRate: 2.4,
    channels: [
      {
        label: 'Tại cửa hàng',
        share: 43,
        revenue: 106_640_000,
        change: 8.2,
        tone: 'amber',
      },
      {
        label: 'Facebook',
        share: 24,
        revenue: 59_520_000,
        change: 4.1,
        tone: 'sky',
      },
      {
        label: 'Website',
        share: 19,
        revenue: 47_120_000,
        change: 11.3,
        tone: 'emerald',
      },
      {
        label: 'TikTok Shop',
        share: 14,
        revenue: 34_720_000,
        change: 15.6,
        tone: 'violet',
      },
    ],
    categories: [
      {
        label: 'Gọng titan',
        share: 34,
        revenue: 84_320_000,
        change: 9.5,
        tone: 'amber',
      },
      {
        label: 'Gọng acetate',
        share: 28,
        revenue: 69_440_000,
        change: 6.4,
        tone: 'sky',
      },
      {
        label: 'Kính râm',
        share: 22,
        revenue: 54_560_000,
        change: 12.1,
        tone: 'emerald',
      },
      {
        label: 'Tròng chống ánh xanh',
        share: 16,
        revenue: 39_680_000,
        change: 18.2,
        tone: 'violet',
      },
    ],
    weeklyTrend: [
      { label: 'Tuần 1', revenue: 54_000_000, orders: 38 },
      { label: 'Tuần 2', revenue: 61_000_000, orders: 42 },
      { label: 'Tuần 3', revenue: 65_000_000, orders: 46 },
      { label: 'Tuần 4', revenue: 68_000_000, orders: 50 },
    ],
    topProducts: [
      {
        name: 'ED Titan Flex 02',
        category: 'Gọng titan',
        unitsSold: 34,
        revenue: 40_800_000,
      },
      {
        name: 'Urban Shade UV420',
        category: 'Kính râm',
        unitsSold: 29,
        revenue: 26_100_000,
      },
      {
        name: 'BlueCare Office 1.60',
        category: 'Tròng chống ánh xanh',
        unitsSold: 22,
        revenue: 23_540_000,
      },
      {
        name: 'Classic Ace Frame',
        category: 'Gọng acetate',
        unitsSold: 25,
        revenue: 22_500_000,
      },
    ],
    highlights: [
      'Kênh tại cửa hàng vẫn dẫn đầu doanh thu nhờ nhóm khách đo mắt trực tiếp và lên tròng tại chỗ.',
      'Tròng chống ánh xanh tăng nhanh, phù hợp để đẩy combo gọng + tròng cho nhóm khách văn phòng.',
      'Doanh thu tuần 4 tốt nhất tháng, nên giữ các chương trình chốt sale vào cuối tuần.',
    ],
  },
  {
    id: '2025-10',
    label: 'T10/2025',
    fullLabel: 'Tháng 10/2025',
    revenue: 271_000_000,
    target: 280_000_000,
    orders: 191,
    newCustomers: 63,
    returningRate: 36,
    conversionRate: 23.4,
    fulfillmentRate: 95.9,
    onTimeRate: 94.2,
    refundRate: 2.2,
    channels: [
      {
        label: 'Tại cửa hàng',
        share: 41,
        revenue: 111_110_000,
        change: 6.3,
        tone: 'amber',
      },
      {
        label: 'Facebook',
        share: 25,
        revenue: 67_750_000,
        change: 8.5,
        tone: 'sky',
      },
      {
        label: 'Website',
        share: 20,
        revenue: 54_200_000,
        change: 9.7,
        tone: 'emerald',
      },
      {
        label: 'TikTok Shop',
        share: 14,
        revenue: 37_940_000,
        change: 6.8,
        tone: 'violet',
      },
    ],
    categories: [
      {
        label: 'Gọng titan',
        share: 33,
        revenue: 89_430_000,
        change: 7.1,
        tone: 'amber',
      },
      {
        label: 'Gọng acetate',
        share: 30,
        revenue: 81_300_000,
        change: 10.8,
        tone: 'sky',
      },
      {
        label: 'Kính râm',
        share: 21,
        revenue: 56_910_000,
        change: 4.2,
        tone: 'emerald',
      },
      {
        label: 'Tròng chống ánh xanh',
        share: 16,
        revenue: 43_360_000,
        change: 15.5,
        tone: 'violet',
      },
    ],
    weeklyTrend: [
      { label: 'Tuần 1', revenue: 60_000_000, orders: 40 },
      { label: 'Tuần 2', revenue: 66_000_000, orders: 47 },
      { label: 'Tuần 3', revenue: 70_000_000, orders: 51 },
      { label: 'Tuần 4', revenue: 75_000_000, orders: 53 },
    ],
    topProducts: [
      {
        name: 'Minimal Acetate 07',
        category: 'Gọng acetate',
        unitsSold: 31,
        revenue: 33_170_000,
      },
      {
        name: 'ED Titan Flex 03',
        category: 'Gọng titan',
        unitsSold: 28,
        revenue: 31_920_000,
      },
      {
        name: 'Polar Street 2025',
        category: 'Kính râm',
        unitsSold: 24,
        revenue: 27_600_000,
      },
      {
        name: 'BlueCare Office 1.67',
        category: 'Tròng chống ánh xanh',
        unitsSold: 23,
        revenue: 25_760_000,
      },
    ],
    highlights: [
      'Gọng acetate tăng tốt nhờ nhu cầu đổi form kính mới trước mùa mua sắm cuối năm.',
      'Facebook bắt đầu tạo đơn ổn định hơn, phù hợp để hiển thị thêm chỉ số lead-to-order sau này.',
      'Tháng này doanh thu sát mục tiêu, layout nên giữ khối tiến độ mục tiêu ở vị trí nổi bật.',
    ],
  },
  {
    id: '2025-11',
    label: 'T11/2025',
    fullLabel: 'Tháng 11/2025',
    revenue: 289_000_000,
    target: 300_000_000,
    orders: 203,
    newCustomers: 69,
    returningRate: 37,
    conversionRate: 24.1,
    fulfillmentRate: 96.3,
    onTimeRate: 94.8,
    refundRate: 2.1,
    channels: [
      {
        label: 'Tại cửa hàng',
        share: 40,
        revenue: 115_600_000,
        change: 4.8,
        tone: 'amber',
      },
      {
        label: 'Facebook',
        share: 24,
        revenue: 69_360_000,
        change: 2.9,
        tone: 'sky',
      },
      {
        label: 'Website',
        share: 21,
        revenue: 60_690_000,
        change: 11.2,
        tone: 'emerald',
      },
      {
        label: 'TikTok Shop',
        share: 15,
        revenue: 43_350_000,
        change: 14.9,
        tone: 'violet',
      },
    ],
    categories: [
      {
        label: 'Gọng titan',
        share: 32,
        revenue: 92_480_000,
        change: 3.4,
        tone: 'amber',
      },
      {
        label: 'Gọng acetate',
        share: 29,
        revenue: 83_810_000,
        change: 6.6,
        tone: 'sky',
      },
      {
        label: 'Kính râm',
        share: 20,
        revenue: 57_800_000,
        change: 1.8,
        tone: 'emerald',
      },
      {
        label: 'Tròng chống ánh xanh',
        share: 19,
        revenue: 54_910_000,
        change: 17.4,
        tone: 'violet',
      },
    ],
    weeklyTrend: [
      { label: 'Tuần 1', revenue: 66_000_000, orders: 44 },
      { label: 'Tuần 2', revenue: 70_000_000, orders: 49 },
      { label: 'Tuần 3', revenue: 74_000_000, orders: 53 },
      { label: 'Tuần 4', revenue: 79_000_000, orders: 57 },
    ],
    topProducts: [
      {
        name: 'Titan Air Rimless',
        category: 'Gọng titan',
        unitsSold: 33,
        revenue: 37_620_000,
      },
      {
        name: 'BlueCare Office 1.67',
        category: 'Tròng chống ánh xanh',
        unitsSold: 27,
        revenue: 29_970_000,
      },
      {
        name: 'Minimal Acetate 09',
        category: 'Gọng acetate',
        unitsSold: 26,
        revenue: 28_080_000,
      },
      {
        name: 'Travel Sun Polar',
        category: 'Kính râm',
        unitsSold: 22,
        revenue: 24_860_000,
      },
    ],
    highlights: [
      'Website tăng trưởng rõ nhất trong 6 tháng, nên giữ một block riêng cho hiệu suất theo kênh.',
      'Tròng chống ánh xanh vượt 19% doanh thu, phù hợp để hiển thị như nhóm upsell chủ lực.',
      'Tỷ lệ hoàn đơn thấp và ổn định, có thể dùng làm chỉ số tin cậy vận hành trên dashboard.',
    ],
  },
  {
    id: '2025-12',
    label: 'T12/2025',
    fullLabel: 'Tháng 12/2025',
    revenue: 362_000_000,
    target: 340_000_000,
    orders: 257,
    newCustomers: 88,
    returningRate: 39,
    conversionRate: 27.6,
    fulfillmentRate: 97.1,
    onTimeRate: 95.6,
    refundRate: 1.8,
    channels: [
      {
        label: 'Tại cửa hàng',
        share: 38,
        revenue: 137_560_000,
        change: 11.4,
        tone: 'amber',
      },
      {
        label: 'Facebook',
        share: 23,
        revenue: 83_260_000,
        change: 9.6,
        tone: 'sky',
      },
      {
        label: 'Website',
        share: 22,
        revenue: 79_640_000,
        change: 17.3,
        tone: 'emerald',
      },
      {
        label: 'TikTok Shop',
        share: 17,
        revenue: 61_540_000,
        change: 22.4,
        tone: 'violet',
      },
    ],
    categories: [
      {
        label: 'Gọng titan',
        share: 30,
        revenue: 108_600_000,
        change: 13.2,
        tone: 'amber',
      },
      {
        label: 'Gọng acetate',
        share: 27,
        revenue: 97_740_000,
        change: 14.4,
        tone: 'sky',
      },
      {
        label: 'Kính râm',
        share: 24,
        revenue: 86_880_000,
        change: 19.1,
        tone: 'emerald',
      },
      {
        label: 'Tròng chống ánh xanh',
        share: 19,
        revenue: 68_780_000,
        change: 20.8,
        tone: 'violet',
      },
    ],
    weeklyTrend: [
      { label: 'Tuần 1', revenue: 82_000_000, orders: 54 },
      { label: 'Tuần 2', revenue: 88_000_000, orders: 63 },
      { label: 'Tuần 3', revenue: 93_000_000, orders: 67 },
      { label: 'Tuần 4', revenue: 99_000_000, orders: 73 },
    ],
    topProducts: [
      {
        name: 'Holiday Polar Premium',
        category: 'Kính râm',
        unitsSold: 41,
        revenue: 49_200_000,
      },
      {
        name: 'Titan Air Rimless',
        category: 'Gọng titan',
        unitsSold: 35,
        revenue: 42_700_000,
      },
      {
        name: 'Minimal Acetate 09',
        category: 'Gọng acetate',
        unitsSold: 32,
        revenue: 35_840_000,
      },
      {
        name: 'BlueCare Premium 1.67',
        category: 'Tròng chống ánh xanh',
        unitsSold: 29,
        revenue: 34_510_000,
      },
    ],
    highlights: [
      'Đây là tháng đỉnh doanh thu, nên biểu đồ xu hướng cần thể hiện rõ điểm bùng nổ mùa cao điểm.',
      'TikTok Shop đóng góp mạnh nhất trong dịp lễ, hợp lý để hiển thị thêm block kênh tăng trưởng.',
      'Nhóm kính râm bứt tốc ở cuối năm, phù hợp để đưa vào danh sách top sản phẩm nổi bật.',
    ],
  },
  {
    id: '2026-01',
    label: 'T01/2026',
    fullLabel: 'Tháng 01/2026',
    revenue: 318_000_000,
    target: 320_000_000,
    orders: 224,
    newCustomers: 72,
    returningRate: 40,
    conversionRate: 25.7,
    fulfillmentRate: 96.7,
    onTimeRate: 95.1,
    refundRate: 1.9,
    channels: [
      {
        label: 'Tại cửa hàng',
        share: 40,
        revenue: 127_200_000,
        change: -3.8,
        tone: 'amber',
      },
      {
        label: 'Facebook',
        share: 24,
        revenue: 76_320_000,
        change: -2.5,
        tone: 'sky',
      },
      {
        label: 'Website',
        share: 21,
        revenue: 66_780_000,
        change: 3.1,
        tone: 'emerald',
      },
      {
        label: 'TikTok Shop',
        share: 15,
        revenue: 47_700_000,
        change: -5.4,
        tone: 'violet',
      },
    ],
    categories: [
      {
        label: 'Gọng titan',
        share: 31,
        revenue: 98_580_000,
        change: -2.4,
        tone: 'amber',
      },
      {
        label: 'Gọng acetate',
        share: 28,
        revenue: 89_040_000,
        change: -1.7,
        tone: 'sky',
      },
      {
        label: 'Kính râm',
        share: 18,
        revenue: 57_240_000,
        change: -11.2,
        tone: 'emerald',
      },
      {
        label: 'Tròng chống ánh xanh',
        share: 23,
        revenue: 73_140_000,
        change: 6.5,
        tone: 'violet',
      },
    ],
    weeklyTrend: [
      { label: 'Tuần 1', revenue: 71_000_000, orders: 48 },
      { label: 'Tuần 2', revenue: 77_000_000, orders: 55 },
      { label: 'Tuần 3', revenue: 81_000_000, orders: 58 },
      { label: 'Tuần 4', revenue: 89_000_000, orders: 63 },
    ],
    topProducts: [
      {
        name: 'BlueCare Premium 1.67',
        category: 'Tròng chống ánh xanh',
        unitsSold: 31,
        revenue: 36_580_000,
      },
      {
        name: 'ED Titan Flex 05',
        category: 'Gọng titan',
        unitsSold: 28,
        revenue: 33_600_000,
      },
      {
        name: 'Minimal Acetate 10',
        category: 'Gọng acetate',
        unitsSold: 26,
        revenue: 29_640_000,
      },
      {
        name: 'Office Lite Combo',
        category: 'Tròng chống ánh xanh',
        unitsSold: 24,
        revenue: 26_880_000,
      },
    ],
    highlights: [
      'Sau tháng cao điểm cuối năm, doanh thu giảm nhưng nhóm tròng chống ánh xanh giữ nhịp rất tốt.',
      'Khách quay lại tăng lên 40%, phù hợp để hiển thị chỉ số khách cũ trong nhóm KPI chính.',
      'Website giữ mức ổn định đầu năm, là kênh nên ưu tiên đo conversion khi nối data thật.',
    ],
  },
  {
    id: '2026-02',
    label: 'T02/2026',
    fullLabel: 'Tháng 02/2026',
    revenue: 337_000_000,
    target: 350_000_000,
    orders: 236,
    newCustomers: 79,
    returningRate: 42,
    conversionRate: 26.4,
    fulfillmentRate: 97.4,
    onTimeRate: 96.2,
    refundRate: 1.6,
    channels: [
      {
        label: 'Tại cửa hàng',
        share: 39,
        revenue: 131_430_000,
        change: 3.3,
        tone: 'amber',
      },
      {
        label: 'Facebook',
        share: 23,
        revenue: 77_510_000,
        change: 1.6,
        tone: 'sky',
      },
      {
        label: 'Website',
        share: 22,
        revenue: 74_140_000,
        change: 11.0,
        tone: 'emerald',
      },
      {
        label: 'TikTok Shop',
        share: 16,
        revenue: 53_920_000,
        change: 13.0,
        tone: 'violet',
      },
    ],
    categories: [
      {
        label: 'Gọng titan',
        share: 32,
        revenue: 107_840_000,
        change: 6.8,
        tone: 'amber',
      },
      {
        label: 'Gọng acetate',
        share: 27,
        revenue: 90_990_000,
        change: 2.2,
        tone: 'sky',
      },
      {
        label: 'Kính râm',
        share: 19,
        revenue: 64_030_000,
        change: 8.4,
        tone: 'emerald',
      },
      {
        label: 'Tròng chống ánh xanh',
        share: 22,
        revenue: 74_140_000,
        change: 9.6,
        tone: 'violet',
      },
    ],
    weeklyTrend: [
      { label: 'Tuần 1', revenue: 74_000_000, orders: 50 },
      { label: 'Tuần 2', revenue: 82_000_000, orders: 58 },
      { label: 'Tuần 3', revenue: 86_000_000, orders: 61 },
      { label: 'Tuần 4', revenue: 95_000_000, orders: 67 },
    ],
    topProducts: [
      {
        name: 'Titan Air Rimless Pro',
        category: 'Gọng titan',
        unitsSold: 36,
        revenue: 46_800_000,
      },
      {
        name: 'BlueCare Premium 1.67',
        category: 'Tròng chống ánh xanh',
        unitsSold: 30,
        revenue: 37_800_000,
      },
      {
        name: 'Minimal Acetate 12',
        category: 'Gọng acetate',
        unitsSold: 28,
        revenue: 31_920_000,
      },
      {
        name: 'Street Polar S-Curve',
        category: 'Kính râm',
        unitsSold: 25,
        revenue: 30_750_000,
      },
    ],
    highlights: [
      'Doanh thu phục hồi tốt sau đầu năm, phù hợp để chọn làm tháng mặc định khi mở dashboard demo.',
      'Website và TikTok Shop đều tăng trưởng hai chữ số, nên phần cơ cấu kênh bán có giá trị hiển thị cao.',
      'Chỉ số vận hành đẹp nhất trong 6 tháng, phù hợp để hiển thị fulfillment và giao đúng hẹn ở cột bên phải.',
    ],
  },
];
