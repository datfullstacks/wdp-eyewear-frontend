'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

import { Header } from '@/components/organisms/Header';
import { Card } from '@/components/ui/card';

interface SystemScopeBlockedPageProps {
  title: string;
  subtitle: string;
  message: string;
}

export function SystemScopeBlockedPage({
  title,
  subtitle,
  message,
}: SystemScopeBlockedPageProps) {
  return (
    <>
      <Header title={title} subtitle={subtitle} />

      <div className="p-6">
        <Card className="max-w-3xl border-red-100 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            System admin khong so huu business workflow nay
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">{message}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Quay ve system dashboard
            </Link>
            <Link
              href="/admin/settings"
              className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Mo system config
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
