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
        { source: '/api/checkout/:path*', destination: `${apiUrl}/api/checkout/:path*` },
        { source: '/api/checkout', destination: `${apiUrl}/api/checkout` },
        { source: '/api/analytics/:path*', destination: `${apiUrl}/api/analytics/:path*` },
        { source: '/api/analytics', destination: `${apiUrl}/api/analytics` },
        { source: '/api/payments/:path*', destination: `${apiUrl}/api/payments/:path*` },
        { source: '/api/payments', destination: `${apiUrl}/api/payments` },
        { source: '/api/system-config/:path*', destination: `${apiUrl}/api/system-config/:path*` },
        { source: '/api/system-config', destination: `${apiUrl}/api/system-config` },
        { source: '/api/products/:path*', destination: `${apiUrl}/api/products/:path*` },
        { source: '/api/products', destination: `${apiUrl}/api/products` },
        { source: '/api/policies/:path*', destination: `${apiUrl}/api/policies/:path*` },
        { source: '/api/policies', destination: `${apiUrl}/api/policies` },
        { source: '/api/users/:path*', destination: `${apiUrl}/api/users/:path*` },
        { source: '/api/users', destination: `${apiUrl}/api/users` },
        { source: '/api/orders/:path*', destination: `${apiUrl}/api/orders/:path*` },
        { source: '/api/orders', destination: `${apiUrl}/api/orders` },
        { source: '/api/support/:path*', destination: `${apiUrl}/api/support/:path*` },
        { source: '/api/support', destination: `${apiUrl}/api/support` },
        { source: '/api/invoices/:path*', destination: `${apiUrl}/api/invoices/:path*` },
        { source: '/api/invoices', destination: `${apiUrl}/api/invoices` },
        { source: '/api/inventory/:path*', destination: `${apiUrl}/api/inventory/:path*` },
        { source: '/api/inventory', destination: `${apiUrl}/api/inventory` },
        { source: '/api/preorders/:path*', destination: `${apiUrl}/api/preorders/:path*` },
        { source: '/api/preorders', destination: `${apiUrl}/api/preorders` },
        { source: '/api/carts/:path*', destination: `${apiUrl}/api/carts/:path*` },
        { source: '/api/carts', destination: `${apiUrl}/api/carts` },
        { source: '/api/promotions/:path*', destination: `${apiUrl}/api/promotions/:path*` },
        { source: '/api/promotions', destination: `${apiUrl}/api/promotions` },
        { source: '/api/locations/:path*', destination: `${apiUrl}/api/locations/:path*` },
        { source: '/api/locations', destination: `${apiUrl}/api/locations` },
        { source: '/api/stores/:path*', destination: `${apiUrl}/api/stores/:path*` },
        { source: '/api/stores', destination: `${apiUrl}/api/stores` },
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
