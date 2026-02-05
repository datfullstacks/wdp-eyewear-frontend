import { Eye, Edit, Trash2 } from 'lucide-react';
import { StatusBadge } from '@/components/atoms/StatusBadge';

import { cn } from '@/lib/utils';
import { Button } from '@/components/atoms';

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  image: string;
  category: string;
  className?: string;
}

export const ProductCard = ({
  name,
  brand,
  price,
  stock,
  image,
  category,
  className,
}: ProductCardProps) => {
  const stockStatus = stock > 10 ? 'success' : stock > 0 ? 'warning' : 'error';
  const stockLabel =
    stock > 10 ? 'Còn hàng' : stock > 0 ? 'Sắp hết' : 'Hết hàng';
  const stockBadgeClassName = {
    success: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    warning: 'bg-amber-50 text-amber-600 border-amber-200',
    error: 'bg-rose-50 text-rose-600 border-rose-200',
  }[stockStatus];

  return (
    <div
      className={cn(
        'group overflow-hidden rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-md',
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <StatusBadge status={stockStatus} className={stockBadgeClassName}>
            {stockLabel}
          </StatusBadge>
        </div>
        <div className="absolute inset-0 flex items-end justify-center gap-2 bg-gradient-to-t from-black/30 via-black/10 to-transparent pb-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            size="sm"
            variant="secondary"
            className="gap-1 border border-white/40 bg-black/35 text-white hover:bg-black/55"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {/* <Button
            size="sm"
            variant="secondary"
            className="gap-1 border border-white/40 bg-black/35 text-white hover:bg-black/55"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="gap-1 border border-rose-200/80 bg-rose-500/15 text-rose-100 hover:bg-rose-500/30"
          >
            <Trash2 className="h-4 w-4" />
          </Button> */}
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs font-semibold tracking-wide text-amber-500 uppercase">
          {brand}
        </p>
        <h3 className="font-display mt-1 line-clamp-1 text-lg font-semibold text-slate-900">
          {name}
        </h3>
        <p className="text-sm text-slate-500">{category}</p>
        <div className="mt-3 flex items-center justify-between">
          <p className="font-display text-lg font-semibold text-slate-900">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(price)}
          </p>
          <p className="text-sm text-slate-500">SL: {stock}</p>
        </div>
      </div>
    </div>
  );
};
