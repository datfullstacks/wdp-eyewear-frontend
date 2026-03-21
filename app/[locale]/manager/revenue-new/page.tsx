'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

import { Header } from '@/components/organisms/Header';
import { Card } from '@/components/ui/card';
import analyticsApi, { type RevenueSummary } from '@/api/analytics';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function RevenueNewPage() {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await analyticsApi.getRevenueSummary();
        if (active) {
          setSummary(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load detailed revenue report.');
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
  }, []);

  return (
    <>
      <Header
        title="Detailed Revenue Report"
        subtitle="Break down performance by order type and payment method"
      />

      <div className="space-y-6 p-6">
        {error ? (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">By order type</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="pb-3 pr-4">Type</th>
                      <th className="pb-3 pr-4">Revenue</th>
                      <th className="pb-3">Orders</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary?.byOrderType.map((row) => (
                      <tr key={row.type} className="border-b border-gray-100 text-gray-700">
                        <td className="py-3 pr-4">{row.type}</td>
                        <td className="py-3 pr-4">{formatCurrency(row.revenue)}</td>
                        <td className="py-3">{row.orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">By payment method</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="pb-3 pr-4">Method</th>
                      <th className="pb-3 pr-4">Revenue</th>
                      <th className="pb-3 pr-4">Pay now</th>
                      <th className="pb-3">Pay later</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary?.byPaymentMethod.map((row) => (
                      <tr key={row.method} className="border-b border-gray-100 text-gray-700">
                        <td className="py-3 pr-4">{row.method}</td>
                        <td className="py-3 pr-4">{formatCurrency(row.revenue)}</td>
                        <td className="py-3 pr-4">{formatCurrency(row.payNow || 0)}</td>
                        <td className="py-3">{formatCurrency(row.payLater || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
