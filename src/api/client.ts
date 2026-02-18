import axios from 'axios';

const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const normalizedBaseUrl = rawBaseUrl.replace(/\/$/, '');

const apiClient = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('access_token')
        : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Backend currently has no /auth/refresh flow.
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
