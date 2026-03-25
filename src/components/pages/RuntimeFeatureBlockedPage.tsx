'use client';

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

import { Header } from '@/components/organisms/Header';
import { Card } from '@/components/ui/card';

interface RuntimeFeatureBlockedPageProps {
  title: string;
  subtitle: string;
  heading: string;
  message: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export function RuntimeFeatureBlockedPage({
  title,
  subtitle,
  heading,
  message,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: RuntimeFeatureBlockedPageProps) {
  return (
    <>
      <Header title={title} subtitle={subtitle} />

      <div className="p-6">
        <Card className="max-w-3xl border-amber-100 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">{heading}</h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">{message}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={primaryHref}
              className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700"
            >
              {primaryLabel}
            </Link>
            {secondaryHref && secondaryLabel ? (
              <Link
                href={secondaryHref}
                className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                {secondaryLabel}
              </Link>
            ) : null}
          </div>
        </Card>
      </div>
    </>
  );
}

export default RuntimeFeatureBlockedPage;
