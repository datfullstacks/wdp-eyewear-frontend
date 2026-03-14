import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const authSecret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
  .replace(/\/$/, '')
  .replace(/\/api$/, '');

if (process.env.NODE_ENV === 'production' && !authSecret) {
  console.error('[auth] Missing AUTH_SECRET or NEXTAUTH_SECRET in production');
}

type BackendEnvelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type LoginBackendResponse = {
  token: string;
  user: { id: string; email: string; name: string; role?: string };
};

async function loginWithCredentials(email: string, password: string) {
  const res = await fetch(`${apiBaseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  const payload = (await res.json()) as BackendEnvelope<LoginBackendResponse> | LoginBackendResponse;
  const unwrapped = (payload as BackendEnvelope<LoginBackendResponse>)?.data
    ? (payload as BackendEnvelope<LoginBackendResponse>).data
    : (payload as LoginBackendResponse);

  if (!res.ok || (payload as BackendEnvelope<LoginBackendResponse>)?.success === false) {
    const message = (payload as BackendEnvelope<LoginBackendResponse>)?.message || 'Invalid credentials';
    throw new Error(message);
  }

  if (!unwrapped?.token || !unwrapped?.user?.id || !unwrapped?.user?.email) {
    throw new Error('Invalid auth response payload');
  }

  return unwrapped;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  debug: process.env.NODE_ENV !== 'production',
  secret:
    authSecret ||
    (process.env.NODE_ENV === 'production'
      ? undefined
      : 'dev-secret-change-me'),
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          Google({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email as string | undefined;
          const password = credentials?.password as string | undefined;

          if (!email || !password) {
            console.warn('[auth] Missing credentials payload');
            return null;
          }

          const response = await loginWithCredentials(email, password);

          if (response.user) {
            return {
              id: response.user.id,
              email: response.user.email,
              name: response.user.name,
              role: response.user.role,
              accessToken: response.token,
              refreshToken: '',
            };
          }
          return null;
        } catch (error) {
          const message =
            (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
            (error as { message?: string })?.message ||
            'Unknown credentials signin error';
          console.error('[auth] Credentials authorize failed:', message);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | undefined;
        session.accessToken = token.accessToken as string;
        session.refreshToken = token.refreshToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
});
