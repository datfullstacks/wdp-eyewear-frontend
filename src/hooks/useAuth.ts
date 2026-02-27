'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSession, signIn, signOut } from 'next-auth/react';
import { authApi, type AuthCredentials, type RegisterData } from '@/api';

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: AuthCredentials) => {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return getSession();
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData: RegisterData) => {
      await authApi.register(userData);

      const result = await signIn('credentials', {
        email: userData.email,
        password: userData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      return getSession();
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await signOut({ redirect: false });
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });
};
