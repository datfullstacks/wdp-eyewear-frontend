import { Product } from '@/components/organisms/ProductTable';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Classic Aviator Sunglasses',
    sku: 'AVT-001-BLK',
    category: 'Sunglasses',
    price: 129.99,
    stock: 45,
    status: 'active',
    variants: 3,
  },
  {
    id: '2',
    name: 'Modern Round Eyeglasses',
    sku: 'RND-002-GLD',
    category: 'Eyeglasses',
    price: 89.99,
    stock: 8,
    status: 'active',
    variants: 5,
  },
  {
    id: '3',
    name: 'Sport Performance Glasses',
    sku: 'SPT-003-RED',
    category: 'Sports',
    price: 159.99,
    stock: 0,
    status: 'out_of_stock',
    variants: 2,
  },
  {
    id: '4',
    name: 'Vintage Cat Eye Frames',
    sku: 'CAT-004-TRT',
    category: 'Eyeglasses',
    price: 99.99,
    stock: 23,
    status: 'active',
    variants: 4,
  },
  {
    id: '5',
    name: 'Blue Light Blocking Glasses',
    sku: 'BLU-005-BLK',
    category: 'Computer Glasses',
    price: 69.99,
    stock: 67,
    status: 'active',
    variants: 3,
  },
  {
    id: '6',
    name: 'Polarized Wayfarer',
    sku: 'WAY-006-BRN',
    category: 'Sunglasses',
    price: 149.99,
    stock: 15,
    status: 'inactive',
    variants: 2,
  },
];

export interface ProductVariant {
  id: string;
  productId: string;
  color: string;
  size: string;
  price: number;
  stock: number;
}

export const mockProductVariants: ProductVariant[] = [
  {
    id: 'v1',
    productId: '1',
    color: 'Black',
    size: 'Standard',
    price: 129.99,
    stock: 20,
  },
  {
    id: 'v2',
    productId: '1',
    color: 'Gold',
    size: 'Standard',
    price: 139.99,
    stock: 15,
  },
  {
    id: 'v3',
    productId: '1',
    color: 'Silver',
    size: 'Standard',
    price: 129.99,
    stock: 10,
  },
  {
    id: 'v4',
    productId: '2',
    color: 'Gold',
    size: 'Small',
    price: 89.99,
    stock: 3,
  },
  {
    id: 'v5',
    productId: '2',
    color: 'Gold',
    size: 'Medium',
    price: 89.99,
    stock: 5,
  },
];

export interface LensOption {
  id: string;
  name: string;
  type: 'single_vision' | 'bifocal' | 'progressive';
  price: number;
  features: string[];
}

export const mockLensOptions: LensOption[] = [
  {
    id: 'l1',
    name: 'Single Vision Clear',
    type: 'single_vision',
    price: 49.99,
    features: ['Anti-scratch', 'UV Protection'],
  },
  {
    id: 'l2',
    name: 'Single Vision Blue Light',
    type: 'single_vision',
    price: 79.99,
    features: ['Blue light blocking', 'Anti-scratch', 'UV Protection'],
  },
  {
    id: 'l3',
    name: 'Progressive Lenses',
    type: 'progressive',
    price: 199.99,
    features: ['Seamless transition', 'Anti-reflective', 'UV Protection'],
  },
  {
    id: 'l4',
    name: 'Bifocal Lenses',
    type: 'bifocal',
    price: 149.99,
    features: ['Dual vision zones', 'Anti-scratch', 'UV Protection'],
  },
];
