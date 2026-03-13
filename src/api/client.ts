import axios from 'axios';

const baseURL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:3000'
).replace(/\/$/, '');

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let cachedAccessToken: { value: string | null; expiresAt: number } = {
  value: null,
  expiresAt: 0,
};

// Deduplication: only one getSession() in-flight at a time
let sessionPromise: Promise<string | null> | null = null;

async function getBrowserAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;

  const now = Date.now();
  if (now < cachedAccessToken.expiresAt) return cachedAccessToken.value;

  // Deduplicate concurrent calls
  if (sessionPromise) return sessionPromise;

  sessionPromise = (async () => {
    try {
      const { getSession } = await import('next-auth/react');
      const session = await getSession();
      const token = (session as { accessToken?: string } | null)?.accessToken ?? null;

      cachedAccessToken = {
        value: token,
        expiresAt: Date.now() + 10 * 60_000,
      };

      return token;
    } catch {
      // Session fetch failed (e.g. 404 on deployed env) — cache null briefly
      cachedAccessToken = {
        value: null,
        expiresAt: Date.now() + 30_000,
      };
      return null;
    } finally {
      sessionPromise = null;
    }
  })();

  return sessionPromise;
}

// Request interceptor
apiClient.interceptors.request.use(
  async (config) => {
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
