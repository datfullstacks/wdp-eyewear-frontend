import React from 'react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../atoms';

export interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  actions?: (item: T) => React.ReactNode;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  actions,
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200/50 bg-white/80 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
      {/* Decorative gradient top border */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100/50 transition-colors duration-300 hover:from-gray-100 hover:to-gray-200/50">
            {columns.map((column) => (
              <TableHead key={column.key} className="font-bold text-gray-700">
                {column.label}
              </TableHead>
            ))}
            {actions && (
              <TableHead className="text-right font-bold text-gray-700">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 1 : 0)}
                className="h-32 text-center"
              >
                <div className="flex flex-col items-center justify-center gap-2 text-gray-400">
                  <svg
                    className="h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <p className="text-sm font-medium">{emptyMessage}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow
                key={item.id}
                className={cn(
                  'border-b border-gray-100 transition-all duration-300',
                  onRowClick &&
                    'cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50',
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className="py-4">
                    {column.render
                      ? column.render(item)
                      : String((item as any)[column.key] || '-')}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell
                    className="py-4 text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {actions(item)}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
