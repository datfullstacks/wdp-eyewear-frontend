'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button, Badge } from '@/components/atoms';
import { getProductById } from '@/api/managerProducts';
import { getPrimaryImageUrl, hasTryOnComplexity } from '@/lib/managerProduct';
import type { Product } from '@/types/managerProduct';

function formatMoney(value?: number): string {
  return Number(value || 0).toLocaleString('vi-VN');
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        const detail = await getProductById(productId);
        if (!mounted) return;
        setProduct(detail);
      } catch (loadError) {
        if (!mounted) return;
        const message =
          loadError instanceof Error ? loadError.message : 'Không thể tải chi tiết sản phẩm';
        setError(message);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [productId]);

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-600">Loading...</div>;
  }

  if (!product) {
    return <div className="p-6 text-sm text-red-700">{error || 'Không có dữ liệu sản phẩm.'}</div>;
  }

  const tryOnWarning = hasTryOnComplexity(product);

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={() => router.push('/manager/products')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to list
        </Button>

        <Button type="button" onClick={() => router.push(`/manager/products/${product._id}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit product
        </Button>
      </div>

      {tryOnWarning && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Product có try-on/3D. Bản editor hiện tại ưu tiên CRUD product thường, nên thao tác publish try-on sẽ xử lý ở phase sau.
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex gap-4">
          <img
            src={getPrimaryImageUrl(product) || 'https://via.placeholder.com/160x160?text=No+Image'}
            alt={product.name}
            className="h-40 w-40 rounded-md border border-gray-200 object-cover"
            onError={(event) => {
              event.currentTarget.src = 'https://via.placeholder.com/160x160?text=No+Image';
            }}
          />
          <div className="space-y-1 text-sm">
            <p className="text-xl font-semibold text-gray-900">{product.name}</p>
            <p><strong>_id:</strong> {product._id}</p>
            <p><strong>type:</strong> {product.type}</p>
            <p><strong>brand:</strong> {product.brand || '-'}</p>
            <p><strong>status:</strong> <Badge size="sm">{product.status || '-'}</Badge></p>
            <p><strong>basePrice:</strong> {formatMoney(product.pricing?.basePrice)} ₫</p>
            <p><strong>stockTotal:</strong> {Number(product.stockTotal || 0)}</p>
            <p><strong>variants:</strong> {(product.variants || []).length}</p>
          </div>
        </div>

        <pre className="mt-4 max-h-[420px] overflow-auto rounded bg-gray-50 p-3 text-xs text-gray-700">
          {JSON.stringify(product, null, 2)}
        </pre>
      </div>
    </div>
  );
}
