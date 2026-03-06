'use client';

import { Button } from '@/components/atoms';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit, Eye, Power, PowerOff, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/api';

interface ProductTableTranslations {
  product: string;
  brand: string;
  category: string;
  price: string;
  stock: string;
  status: string;
  actions: string;
  noData: string;
  active: string;
  inactive: string;
  viewDetails: string;
  editProduct: string;
  activate: string;
  deactivate: string;
  deleteProduct: string;
}

interface ProductTableProps {
  products: Product[];
  onView?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onToggleStatus?: (product: Product) => void;
  translations?: ProductTableTranslations;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400';

const defaultTranslations: ProductTableTranslations = {
  product: 'Product',
  brand: 'Brand',
  category: 'Category',
  price: 'Price',
  stock: 'Stock',
  status: 'Status',
  actions: 'Actions',
  noData: 'No products found',
  active: 'Active',
  inactive: 'Inactive',
  viewDetails: 'View details',
  editProduct: 'Edit product',
  activate: 'Activate',
  deactivate: 'Deactivate',
  deleteProduct: 'Delete product',
};

export function ProductTable({
  products,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  translations: t = defaultTranslations,
}: ProductTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.product}</TableHead>
          <TableHead>{t.brand}</TableHead>
          <TableHead>{t.category}</TableHead>
          <TableHead>{t.price}</TableHead>
          <TableHead>{t.stock}</TableHead>
          <TableHead>{t.status}</TableHead>
          <TableHead>{t.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-gray-500">
              {t.noData}
            </TableCell>
          </TableRow>
        ) : (
          products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <img
                    src={product.imageUrl || FALLBACK_IMAGE}
                    alt={product.name}
                    className="h-10 w-10 rounded-md object-cover"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-500">ID: {product.id}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-gray-600">{product.brand}</TableCell>
              <TableCell className="text-gray-600">{product.category}</TableCell>
              <TableCell className="font-medium text-gray-900">
                {product.price.toLocaleString()} VND
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-xs font-medium',
                    product.stock < 10
                      ? 'bg-red-100 text-red-700'
                      : 'bg-green-100 text-green-700'
                  )}
                >
                  {product.stock}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    'rounded-full px-2 py-1 text-xs font-medium',
                    product.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  )}
                >
                  {product.status === 'active' ? t.active : t.inactive}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {onView && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onView(product)}
                      title={t.viewDetails}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(product)}
                      title={t.editProduct}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {onToggleStatus && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onToggleStatus(product)}
                      title={product.status === 'active' ? t.deactivate : t.activate}
                    >
                      {product.status === 'active' ? (
                        <PowerOff className="h-4 w-4 text-orange-600" />
                      ) : (
                        <Power className="h-4 w-4 text-green-600" />
                      )}
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(product)}
                      title={t.deleteProduct}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
