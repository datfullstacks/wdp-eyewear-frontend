import apiClient from './client';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role?: string;
  };
}

interface BackendEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

function parseAuthResponse(payload: BackendEnvelope<AuthResponse> | AuthResponse): AuthResponse {
  const unwrapped = (payload as BackendEnvelope<AuthResponse>)?.data
    ? (payload as BackendEnvelope<AuthResponse>).data
    : (payload as AuthResponse);

  if (!unwrapped?.token || !unwrapped?.user?.id || !unwrapped?.user?.email) {
    throw new Error('Invalid auth response payload');
  }

  return {
    token: unwrapped.token,
    user: {
      id: unwrapped.user?.id,
      email: unwrapped.user?.email,
      name: unwrapped.user?.name,
      role: unwrapped.user?.role,
    },
  };
}

export const authApi = {
  login: async (credentials: AuthCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/api/auth/login', credentials);
    return parseAuthResponse(data);
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/api/auth/register', {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: 'customer',
    });
    return parseAuthResponse(data);
  },

  logout: async (): Promise<void> => {
    return Promise.resolve();
  },

  getCurrentUser: async () => {
    const { data } = await apiClient.get('/api/auth/me');
    return (data as { data?: unknown })?.data ?? data;
  },
};

export default authApi;
