export { default as apiClient } from './client';
export { default as productApi } from './products';
export { default as authApi } from './auth';
export { default as uploadApi } from './uploads';
export { default as userApi } from './users';

export type {
  Product,
  ProductDetail,
  ProductsResponse,
  ProductUpsertInput,
  ProductMediaAsset,
} from './products';
export type { User, UsersResponse, UserRole } from './users';
export type { AuthCredentials, RegisterData, AuthResponse } from './auth';
export type { UploadResult } from './uploads';
