export { default as apiClient } from './client';
export { default as productApi } from './products';
export { default as authApi } from './auth';
export { default as uploadApi } from './uploads';

export type {
  Product,
  ProductsResponse,
  ProductUpsertInput,
  ProductMediaAsset,
} from './products';
export type { AuthCredentials, RegisterData, AuthResponse } from './auth';
export type { UploadResult } from './uploads';
