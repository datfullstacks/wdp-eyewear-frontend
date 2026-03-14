import apiClient from './client';

export interface CheckoutItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email?: string;
  line1: string;
  line2?: string;
  ward: string;
  district: string;
  province: string;
  country: string;
  note?: string;
}

export interface CheckoutQuoteRequest {
  items: CheckoutItem[];
  shippingFee?: number;
  discountAmount?: number;
  shippingMethod?: string;
  shippingAddress?: ShippingAddress;
  note?: string;
}

export interface CheckoutQuoteResponse {
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  tax: number;
  total: number;
  items: Array<{
    productId: string;
    variantId?: string;
    name: string;
    quantity: number;
    price: number;
    subtotal: number;
  }>;
}

export interface CheckoutRequest {
  items: CheckoutItem[];
  shippingFee?: number;
  discountAmount?: number;
  shippingMethod?: string;
  shippingAddress?: ShippingAddress;
  note?: string;
  paymentMethod?: 'cash' | 'qr' | 'card';
}

export interface CheckoutResponse {
  orderId: string;
  orderCode: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  qrCode?: string;
  bankInfo?: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    amount: number;
    content: string;
  };
}

export interface PaymentWebhookData {
  orderId: string;
  transactionId: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  timestamp: string;
}

const checkoutApi = {
  /**
   * Get checkout quote (giá tạm tính)
   */
  async getQuote(data: CheckoutQuoteRequest): Promise<CheckoutQuoteResponse> {
    const response = await apiClient.post<CheckoutQuoteResponse>(
      '/api/checkout/quote',
      data
    );
    return response.data;
  },

  /**
   * Create checkout order
   */
  async createOrder(data: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await apiClient.post<CheckoutResponse>(
      '/api/checkout',
      data
    );
    return response.data;
  },

  /**
   * Check payment status
   */
  async checkPaymentStatus(orderId: string): Promise<{
    status: string;
    isPaid: boolean;
  }> {
    const response = await apiClient.get(`/api/payments/status/${orderId}`);
    return response.data;
  },
};

export default checkoutApi;
