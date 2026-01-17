import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi, type Product } from '@/api';

export const useProducts = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getAll(params),
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });
};

export const useProductSearch = (query: string) => {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => productApi.search(query),
    enabled: query.length > 0,
  });
};
