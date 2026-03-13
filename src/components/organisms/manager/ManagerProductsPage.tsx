'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil } from 'lucide-react';
import { Button, Input, Select, Badge } from '@/components/atoms';
import { getProducts } from '@/api/managerProducts';
import { getPrimaryImageUrl } from '@/lib/managerProduct';
import type { Product } from '@/types/managerProduct';

const statusOptions = [
  { value: '', label: 'All status' },
  { value: 'draft', label: 'draft' },
  { value: 'active', label: 'active' },
  { value: 'inactive', label: 'inactive' },
  { value: 'out_of_stock', label: 'out_of_stock' },
];

const typeOptions = [
  '',
  'sunglasses',
  'frame',
  'lens',
  'contact_lens',
  'accessory',
  'service',
  'bundle',
  'gift_card',
  'other',
].map((value) => ({ value, label: value || 'All type' }));

function formatMoney(value?: number): string {
  return Number(value || 0).toLocaleString('vi-VN');
}

function formatDate(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
}

export function ManagerProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        const response = await getProducts();
        if (!mounted) return;
        setProducts(response.products);
      } catch (loadError) {
        if (!mounted) return;
        const message =
          loadError instanceof Error ? loadError.message : 'Không thể tải danh sách sản phẩm';
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
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchSearch =
        !keyword ||
        [product.name, product.brand, product.type]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(keyword);

      const matchStatus = !statusFilter || product.status === statusFilter;
      const matchType = !typeFilter || product.type === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [products, search, statusFilter, typeFilter]);

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manager Products</h1>
          <p className="text-sm text-gray-600">CRUD product thường: accessory/service/bundle/lens/frame đơn giản</p>
        </div>
        <Button type="button" onClick={() => router.push('/manager/products/create')}>
          Create product
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name / brand / type" />
        <Select options={statusOptions} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} />
        <Select options={typeOptions} value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} />
      </div>

      {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-3 py-2">Product</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Brand</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">BasePrice</th>
              <th className="px-3 py-2">StockTotal</th>
              <th className="px-3 py-2">Variants</th>
              <th className="px-3 py-2">UpdatedAt</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-gray-500">Loading...</td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-gray-500">No products found</td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id} className="border-t border-gray-100">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={getPrimaryImageUrl(product) || 'https://via.placeholder.com/56x56?text=No+Image'}
                        alt={product.name}
                        className="h-10 w-10 rounded border border-gray-200 object-cover"
                        onError={(event) => {
                          event.currentTarget.src = 'https://via.placeholder.com/56x56?text=No+Image';
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product._id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">{product.type || '-'}</td>
                  <td className="px-3 py-2">{product.brand || '-'}</td>
                  <td className="px-3 py-2">
                    <Badge size="sm">{product.status || '-'}</Badge>
                  </td>
                  <td className="px-3 py-2">{formatMoney(product.pricing?.basePrice)} ₫</td>
                  <td className="px-3 py-2">{Number(product.stockTotal || 0)}</td>
                  <td className="px-3 py-2">{(product.variants || []).length}</td>
                  <td className="px-3 py-2">{formatDate(product.updatedAt)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/manager/products/${product._id}`)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => router.push(`/manager/products/${product._id}/edit`)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
