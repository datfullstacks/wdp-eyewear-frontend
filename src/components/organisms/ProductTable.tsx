'use client';

import React from 'react';
import { DataTable, Column } from '../molecules';
import { Badge, Button } from '../atoms';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  variants: number;
}

interface ProductTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onView?: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
  onView,
}) => {
  const columns: Column<Product>[] = [
    {
      key: 'sku',
      label: 'SKU',
      render: (product) => (
        <span className="font-mono text-sm">{product.sku}</span>
      ),
    },
    {
      key: 'name',
      label: 'Product Name',
      render: (product) => (
        <div>
          <p className="font-medium text-gray-900">{product.name}</p>
          <p className="text-sm text-gray-500">{product.category}</p>
        </div>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (product) => (
        <span className="font-semibold">${product.price.toFixed(2)}</span>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      render: (product) => (
        <span
          className={
            product.stock < 10 ? 'font-semibold text-red-600' : 'text-gray-900'
          }
        >
          {product.stock} units
        </span>
      ),
    },
    {
      key: 'variants',
      label: 'Variants',
    },
    {
      key: 'status',
      label: 'Status',
      render: (product) => {
        const variantMap = {
          active: 'success',
          inactive: 'warning',
          out_of_stock: 'danger',
        } as const;

        const labelMap = {
          active: 'Active',
          inactive: 'Inactive',
          out_of_stock: 'Out of Stock',
        };

        return (
          <Badge variant={variantMap[product.status]}>
            {labelMap[product.status]}
          </Badge>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      onRowClick={onView}
      actions={(product) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit?.(product)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete?.(product)}
          >
            Delete
          </Button>
        </div>
      )}
    />
  );
};
