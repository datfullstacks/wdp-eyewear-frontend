'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/atoms';
import { Card } from '@/components/ui/card';
import { productApi, type Product } from '@/api';
import { AlertTriangle, Edit, Loader2, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400';

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        const data = await productApi.getById(productId);
        setProduct(data);
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      void loadProduct();
    }
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-600" />
          <h2 className="mt-4 text-xl font-semibold">Product not found</h2>
          <Button onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header
        title="Chi tiết sản phẩm"
        subtitle={`Thông tin: ${product.name}`}
        showAddButton
        addButtonLabel="Chỉnh sửa"
        onAdd={() => router.push(`/manager/products/${productId}/edit`)}
      />

      <div className="space-y-6 p-6">
        {apiError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Product Images */}
          <Card className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Package className="h-5 w-5" />
              Hình ảnh sản phẩm
            </h3>
            <div className="space-y-4">
              <img
                src={product.imageUrl || FALLBACK_IMAGE}
                alt={product.name}
                className="h-64 w-full rounded-md object-cover"
              />
              {product.mediaAssets && product.mediaAssets.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.mediaAssets
                    .filter((asset) => asset.role === 'gallery')
                    .map((asset, index) => (
                      <img
                        key={index}
                        src={asset.url}
                        alt={`${product.name} - ${index + 1}`}
                        className="h-20 w-20 rounded-md object-cover"
                      />
                    ))}
                </div>
              )}
            </div>
          </Card>

          {/* Product Details */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Thông tin chi tiết</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Tên sản phẩm</dt>
                <dd className="mt-1 text-base text-gray-900">{product.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Thương hiệu</dt>
                <dd className="mt-1 text-base text-gray-900">{product.brand}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Danh mục</dt>
                <dd className="mt-1 text-base text-gray-900">{product.category}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Giá</dt>
                <dd className="mt-1 text-lg font-semibold text-gray-900">
                  {product.price.toLocaleString()} VND
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Tồn kho</dt>
                <dd className="mt-1">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-sm font-medium',
                      product.stock < 10
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    )}
                  >
                    {product.stock} sản phẩm
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Trạng thái</dt>
                <dd className="mt-1">
                  <span
                    className={cn(
                      'rounded-full px-3 py-1 text-sm font-medium',
                      product.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                  </span>
                </dd>
              </div>
              {product.description && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Mô tả</dt>
                  <dd className="mt-1 text-base text-gray-900">{product.description}</dd>
                </div>
              )}
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
