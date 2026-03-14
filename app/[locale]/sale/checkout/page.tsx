'use client';

import dynamic from 'next/dynamic';

const SaleCheckoutPage = dynamic(
  () => import('@/components/organisms/SaleCheckoutPage').then((m) => m.SaleCheckoutPage),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-400 border-t-transparent" />
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    ),
  }
);

export default function Page() {
  return <SaleCheckoutPage />;
}
