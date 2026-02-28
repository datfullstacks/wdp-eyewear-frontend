'use client';

import dynamic from 'next/dynamic';

const Products = dynamic(() => import('@/components/pages/Products'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 p-6">
      <div className="h-8 w-56 animate-pulse rounded bg-slate-200/70" />
      <div className="h-12 animate-pulse rounded-xl bg-slate-200/70" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl bg-slate-200/70"
          />
        ))}
      </div>
    </div>
  ),
});

export default function Page() {
  return <Products />;
}
