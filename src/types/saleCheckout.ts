export interface SaleProductVariant {
  _id: string;
  options?: {
    color?: string;
    size?: string;
    [key: string]: string | undefined;
  };
  price?: number;
  stock?: number;
}

export interface SaleProductImage {
  url?: string;
  role?: string;
  [key: string]: unknown;
}

export interface SaleProduct {
  _id: string;
  name: string;
  brand?: string;
  type?: string;
  description?: string;
  imageUrl?: string;
  media?: {
    assets?: SaleProductImage[];
  };
  variants: SaleProductVariant[];
  pricing?: {
    basePrice?: number;
    salePrice?: number;
  };
}

export interface SaleCartItem {
  productId: string;
  variantId: string;
  productName: string;
  productType: string;
  brand: string;
  image: string;
  variantOptions: {
    color: string;
    size: string;
  };
  price: number;
  stock: number;
  quantity: number;
}

export interface ShippingAddressForm {
  fullName: string;
  phone: string;
  email: string;
  line1: string;
  line2: string;
  ward: string;
  district: string;
  province: string;
  country: string;
  note: string;
}

export interface SaleCheckoutItemPayload {
  productId: string;
  product_id: string;
  variantId: string;
  variant_id: string;
  quantity: number;
}

export interface SaleCheckoutPayload {
  items: SaleCheckoutItemPayload[];
  shippingFee: number;
  discountAmount: number;
  shippingMethod: string;
  shippingAddress: ShippingAddressForm;
  note: string;
}

export interface QuoteItem {
  productId: string;
  variantId: string;
  name: string;
  type?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  payNow: number;
  payLater: number;
  variantOptions?: {
    color?: string;
    size?: string;
  };
}

export interface QuoteData {
  items: QuoteItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  payNow: number;
  payLater: number;
  payNowTotal: number;
  payLaterTotal: number;
  paymentMethod?: string;
}

export interface CheckoutInvoice {
  invoiceId?: string;
  invoiceCode?: string;
  status?: string;
  amountDue?: number;
  total?: number;
}

export interface CheckoutPayment {
  method?: string;
  status?: string;
  amount?: number;
  currency?: string;
  paymentCode?: string;
  content?: string;
  bankAccountId?: string;
  bankAccountNumber?: string;
  bankName?: string;
  bankAccountName?: string;
  description?: string;
  instruction?: string;
  qrUrl?: string;
}

export interface CheckoutBreakdown {
  subtotal?: number;
  shippingFee?: number;
  discountAmount?: number;
  total?: number;
  payNow?: number;
  payLater?: number;
}

export interface CheckoutData {
  orderId: string;
  invoice?: CheckoutInvoice;
  payment?: CheckoutPayment;
  breakdown?: CheckoutBreakdown;
}

export interface OrderDetailData {
  _id: string;
  paymentStatus?: string;
  status?: string;
  invoiceId?: {
    status?: string;
  } | null;
  payment?: CheckoutPayment;
}

export interface RealtimeOrderStatuses {
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  invoiceStatus: InvoiceStatus;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'unknown';
export type OrderStatus = 'pending' | 'confirmed' | 'cancelled' | 'unknown';
export type InvoiceStatus = 'issued' | 'paid' | 'void' | 'unknown';

export interface SaleProductOption {
  id: string;
  label: string;
  description: string;
  imageUrl: string;
}
