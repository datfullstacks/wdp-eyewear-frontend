export interface Policy {
  id: string;
  title: string;
  category: 'purchase' | 'return' | 'warranty' | 'shipping';
  description: string;
  details: string;
  active: boolean;
  lastUpdated: string;
}

export const mockPolicies: Policy[] = [
  {
    id: 'p1',
    title: 'Standard Return Policy',
    category: 'return',
    description: '30-day money-back guarantee',
    details:
      'Customers can return products within 30 days of purchase for a full refund. Items must be in original condition with all packaging.',
    active: true,
    lastUpdated: '2025-12-01',
  },
  {
    id: 'p2',
    title: 'Prescription Glasses Warranty',
    category: 'warranty',
    description: '1-year warranty on frames and lenses',
    details:
      'All prescription glasses come with a 1-year warranty covering manufacturing defects. Does not cover damage from misuse or accidents.',
    active: true,
    lastUpdated: '2025-11-15',
  },
  {
    id: 'p3',
    title: 'Free Shipping Policy',
    category: 'shipping',
    description: 'Free shipping on orders over $100',
    details:
      'Orders totaling $100 or more qualify for free standard shipping. Express shipping available at additional cost.',
    active: true,
    lastUpdated: '2026-01-01',
  },
  {
    id: 'p4',
    title: 'Pre-Order Terms',
    category: 'purchase',
    description: 'Pre-order processing and timeline',
    details:
      'Pre-order items are charged at the time of order. Estimated delivery is 4-6 weeks. Cancellations accepted within 48 hours of order placement.',
    active: true,
    lastUpdated: '2025-10-20',
  },
  {
    id: 'p5',
    title: 'Lens Replacement Policy',
    category: 'warranty',
    description: 'Free lens replacement for defects',
    details:
      'If prescription lenses have defects within 90 days, we will replace them free of charge. Requires original prescription verification.',
    active: false,
    lastUpdated: '2025-09-10',
  },
];

export interface Promotion {
  id: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  minPurchase: number;
  startDate: string;
  endDate: string;
  active: boolean;
  usageCount: number;
  maxUsage: number | null;
}

export const mockPromotions: Promotion[] = [
  {
    id: 'pr1',
    name: 'New Year Sale',
    code: 'NEWYEAR2026',
    type: 'percentage',
    value: 20,
    minPurchase: 50,
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    active: true,
    usageCount: 143,
    maxUsage: 500,
  },
  {
    id: 'pr2',
    name: 'First Purchase Discount',
    code: 'WELCOME15',
    type: 'percentage',
    value: 15,
    minPurchase: 0,
    startDate: '2025-01-01',
    endDate: '2026-12-31',
    active: true,
    usageCount: 892,
    maxUsage: null,
  },
  {
    id: 'pr3',
    name: 'Free Shipping Weekend',
    code: 'FREESHIP',
    type: 'free_shipping',
    value: 0,
    minPurchase: 30,
    startDate: '2026-01-25',
    endDate: '2026-01-31',
    active: true,
    usageCount: 67,
    maxUsage: null,
  },
  {
    id: 'pr4',
    name: 'VIP Customer Bonus',
    code: 'VIP50',
    type: 'fixed_amount',
    value: 50,
    minPurchase: 200,
    startDate: '2025-12-01',
    endDate: '2026-02-28',
    active: true,
    usageCount: 24,
    maxUsage: 100,
  },
];
