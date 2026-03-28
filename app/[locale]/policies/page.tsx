'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';

import policyApi, { type PolicyRecord } from '@/api/policies';

const CATEGORY_LABELS = {
  vi: {
    warranty: 'Bảo hành',
    return: 'Đổi trả',
    refund: 'Hoàn tiền',
    shipping: 'Vận chuyển',
    purchase: 'Mua hàng',
    privacy: 'Bảo mật',
    terms: 'Điều khoản',
  },
  en: {
    warranty: 'Warranty',
    return: 'Return',
    refund: 'Refund',
    shipping: 'Shipping',
    purchase: 'Purchase',
    privacy: 'Privacy',
    terms: 'Terms',
  },
} as const;

function formatDate(value: string, locale: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export default function PublicPoliciesPage() {
  const locale = useLocale();
  const isVi = locale === 'vi';
  const copy = useMemo(
    () => ({
      title: isVi ? 'Chính sách đang áp dụng' : 'Active Policies',
      subtitle: isVi
        ? 'Khách hàng có thể xem các chính sách hiện đang hiệu lực tại đây.'
        : 'Customers can review the policies that are currently in effect here.',
      backHome: isVi ? 'Về trang chủ' : 'Back to home',
      loading: isVi ? 'Đang tải chính sách...' : 'Loading policies...',
      empty: isVi
        ? 'Hiện chưa có chính sách active để hiển thị.'
        : 'There are no active policies to display yet.',
      updatedAt: isVi ? 'Cập nhật' : 'Updated',
      effectiveDate: isVi ? 'Hiệu lực' : 'Effective',
      expiryDate: isVi ? 'Hết hạn' : 'Expiry',
      version: isVi ? 'Phiên bản' : 'Version',
      noExpiry: isVi ? 'Không giới hạn' : 'No expiry',
    }),
    [isVi],
  );
  const categoryLabels = isVi ? CATEGORY_LABELS.vi : CATEGORY_LABELS.en;

  const [policies, setPolicies] = useState<PolicyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const result = await policyApi.getPublic({ page: 1, limit: 100 });
        if (active) {
          setPolicies(result.policies);
        }
      } catch (nextError) {
        if (active) {
          setError(
            nextError instanceof Error
              ? nextError.message
              : isVi
                ? 'Không thể tải chính sách.'
                : 'Failed to load policies.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [isVi]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.backHome}
        </Link>

        <div className="mt-6 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-800">
              <FileText className="h-3.5 w-3.5" />
              {isVi ? 'Policy Center' : 'Policy Center'}
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-900">
              {copy.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-stone-600">{copy.subtitle}</p>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-stone-200 bg-white px-6 py-12 text-stone-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>{copy.loading}</span>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700">
              {error}
            </div>
          ) : policies.length === 0 ? (
            <div className="rounded-2xl border border-stone-200 bg-white px-6 py-10 text-sm text-stone-600">
              {copy.empty}
            </div>
          ) : (
            policies.map((policy) => (
              <article
                key={policy.id}
                className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-stone-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                      {categoryLabels[policy.category]}
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold text-stone-900">
                      {policy.title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      {policy.summary}
                    </p>
                  </div>

                  <div className="grid min-w-[220px] grid-cols-2 gap-3 text-sm text-stone-600">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-stone-400">
                        {copy.version}
                      </div>
                      <div className="mt-1 font-medium text-stone-900">{policy.version}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-stone-400">
                        {copy.updatedAt}
                      </div>
                      <div className="mt-1 font-medium text-stone-900">
                        {formatDate(policy.updatedAt, locale)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-stone-400">
                        {copy.effectiveDate}
                      </div>
                      <div className="mt-1 font-medium text-stone-900">
                        {formatDate(policy.effectiveDate, locale)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-stone-400">
                        {copy.expiryDate}
                      </div>
                      <div className="mt-1 font-medium text-stone-900">
                        {policy.expiryDate
                          ? formatDate(policy.expiryDate, locale)
                          : copy.noExpiry}
                      </div>
                    </div>
                  </div>
                </div>

                <pre className="mt-5 whitespace-pre-wrap font-sans text-sm leading-7 text-stone-700">
                  {policy.content}
                </pre>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
