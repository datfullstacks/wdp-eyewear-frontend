'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, DollarSign, Loader2, Package, Tag, TrendingUp } from 'lucide-react';

import { Header } from '@/components/organisms/Header';
import { StatCard } from '@/components/molecules/StatCard';
import { Card } from '@/components/ui/card';
import productApi, { type Product } from '@/api/products';
import promotionApi from '@/api/promotions';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value || 0);

export default function PricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [promotionCount, setPromotionCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [productResult, promotionResult] = await Promise.all([
          productApi.getAll({ page: 1, limit: 100 }),
          promotionApi.getAll({ page: 1, limit: 100, status: 'active' }),
        ]);

        if (!active) return;

        setProducts(productResult.products);
        setPromotionCount(promotionResult.total);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load pricing data.');
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

  const stats = useMemo(() => {
    const activeProducts = products.filter((product) => product.status === 'active');
    const avgPrice =
      activeProducts.length > 0
        ? Math.round(
            activeProducts.reduce((sum, product) => sum + Number(product.price || 0), 0) /
              activeProducts.length,
          )
        : 0;

    return [
      {
        title: 'Average listed price',
        value: formatCurrency(avgPrice),
        icon: DollarSign,
      },
      {
        title: 'Active products',
        value: activeProducts.length,
        icon: Package,
      },
      {
        title: 'Active promotions',
        value: promotionCount,
        icon: Tag,
      },
      {
        title: 'In-stock products',
        value: products.filter((product) => product.stock > 0).length,
        icon: TrendingUp,
      },
    ];
  }, [products, promotionCount]);

  return (
    <>
      <Header
        title="Pricing Overview"
        subtitle="Use this view to monitor list prices, stock health, and promotion pressure across the catalog"
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
          <>
            <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </section>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Catalog price watch</h3>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-gray-500">
                      <th className="pb-3 pr-4">Product</th>
                      <th className="pb-3 pr-4">Brand</th>
                      <th className="pb-3 pr-4">Type</th>
                      <th className="pb-3 pr-4">Price</th>
                      <th className="pb-3 pr-4">Stock</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-gray-100 text-gray-700">
                        <td className="py-3 pr-4">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-xs text-gray-500">{product.category}</div>
                        </td>
                        <td className="py-3 pr-4">{product.brand || '-'}</td>
                        <td className="py-3 pr-4">{product.type}</td>
                        <td className="py-3 pr-4">{formatCurrency(product.price)}</td>
                        <td className="py-3 pr-4">{product.stock}</td>
                        <td className="py-3">{product.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}
      </div>
    </>
  );
}
