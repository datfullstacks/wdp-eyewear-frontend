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

let cachedAccessToken: { value: string | null; expiresAt: number } = {
  value: null,
  expiresAt: 0,
};

async function getBrowserAccessToken() {
  if (typeof window === 'undefined') return null;

  const now = Date.now();
  if (now < cachedAccessToken.expiresAt) return cachedAccessToken.value;

  const { getSession } = await import('next-auth/react');
  const session = await getSession();
  const token = session?.accessToken ?? null;

  cachedAccessToken = {
    value: token,
    // Avoid hitting /api/auth/session too frequently (it can be slow in dev mode).
    expiresAt: now + 10 * 60_000,
  };

  return token;
}

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
    // Add auth token if available
    const token = await getBrowserAccessToken();

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
    return Promise.reject(error);
  }
);

export default apiClient;
