'use client';

import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('@/components/pages/Dashboard'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 p-6">
      <div className="h-8 w-56 animate-pulse rounded bg-slate-200/70" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-200/70" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-slate-200/70" />
    </div>
  ),
});

export default function Page() {
  return <Dashboard />;
}
