import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, type AuthCredentials, type RegisterData } from '@/api';
import { useAuthStore } from '@/stores';

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (credentials: AuthCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.token, '');
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.token);
        localStorage.removeItem('refresh_token');
      }
    },
  });
};

export const useRegister = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (userData: RegisterData) => authApi.register(userData),
    onSuccess: (data) => {
      setAuth(data.user, data.token, '');
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', data.token);
        localStorage.removeItem('refresh_token');
      }
    },
  });
};

export const useLogout = () => {
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
      queryClient.clear();
    },
  });
};
