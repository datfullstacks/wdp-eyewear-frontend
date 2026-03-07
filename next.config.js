import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.on.aws',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  async rewrites() {
    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '');
    if (!apiUrl) return [];

    return {
      // beforeFiles: rewrite BEFORE filesystem routes (catches backend auth paths
      // that would otherwise be swallowed by the NextAuth [...nextauth] catch-all)
      beforeFiles: [
        { source: '/api/auth/login', destination: `${apiUrl}/api/auth/login` },
        { source: '/api/auth/register', destination: `${apiUrl}/api/auth/register` },
        { source: '/api/auth/me', destination: `${apiUrl}/api/auth/me` },
      ],
      // afterFiles: rewrite AFTER filesystem routes (products, users, orders,
      // uploads don't have local API routes, so afterFiles acts as fallback)
      afterFiles: [
        { source: '/api/products/:path*', destination: `${apiUrl}/api/products/:path*` },
        { source: '/api/products', destination: `${apiUrl}/api/products` },
        { source: '/api/users/:path*', destination: `${apiUrl}/api/users/:path*` },
        { source: '/api/users', destination: `${apiUrl}/api/users` },
        { source: '/api/orders/:path*', destination: `${apiUrl}/api/orders/:path*` },
        { source: '/api/orders', destination: `${apiUrl}/api/orders` },
        { source: '/api/uploads/:path*', destination: `${apiUrl}/api/uploads/:path*` },
        { source: '/api/uploads', destination: `${apiUrl}/api/uploads` },
      ],
    };
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default withNextIntl(nextConfig);
