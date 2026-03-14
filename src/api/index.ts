export { default as apiClient } from './client';
export { default as productApi } from './products';
export { default as authApi } from './auth';
export { default as uploadApi } from './uploads';
export { default as userApi } from './users';
export { default as orderApi } from './orders';
export { default as preorderApi } from './preorders';
export { default as checkoutApi } from './checkout';
export {
  getProducts,
  createQuote,
  createCheckout,
  getOrderDetail,
} from './saleCheckout';

export type {
  Product,
  ProductDetail,
  ProductsResponse,
  ProductUpsertInput,
  ProductMediaAsset,
} from './products';
export type { User, UsersResponse, UserRole, CreateUserInput, UpdateUserInput } from './users';
export { toBackendRole, toFrontendRole } from './users';
export type { AuthCredentials, RegisterData, AuthResponse } from './auth';
export type { UploadResult } from './uploads';
export type {
  UiOrderStatus,
  UiPaymentStatus,
  OrderItem,
  OrderRecord,
  OrdersResponse,
} from './orders';
export type {
  PreorderBatchStatus,
  PreorderBatchItem,
  PreorderBatchRecord,
  CreatePreorderBatchInput,
  ReceivePreorderBatchInput,
} from './preorders';
export type {
  CheckoutItem,
  ShippingAddress,
  CheckoutQuoteRequest,
  CheckoutQuoteResponse,
  CheckoutRequest,
  CheckoutResponse,
} from './checkout';
export type {
  SaleCartItem,
  SaleProduct,
  SaleProductVariant,
  RealtimeOrderStatuses,
  ShippingAddressForm,
  SaleCheckoutPayload,
  QuoteData,
  CheckoutData,
  OrderDetailData,
} from '@/types/saleCheckout';
