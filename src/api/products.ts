import apiClient from './client';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  brand: string;
  stock: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export const productApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
  }): Promise<ProductsResponse> => {
    const { data } = await apiClient.get('/products', { params });
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get(`/products/${id}`);
    return data;
  },

  search: async (query: string): Promise<Product[]> => {
    const { data } = await apiClient.get('/products/search', {
      params: { q: query },
    });
    return data;
  },
};

export default productApi;
