import { ProductCard } from '@/components/molecules/ProductCard';

export type ProductCardItem = {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  image: string;
  category: string;
};

interface ProductGridProps {
  compact?: boolean;
  products?: ProductCardItem[];
  onPreview?: (id: string) => void;
  previewLoadingId?: string | null;
}

export const ProductGrid = ({
  compact = false,
  products = [],
  onPreview,
  previewLoadingId = null,
}: ProductGridProps) => {
  return (
    <div
      className={
        compact
          ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      }
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          {...product}
          compact={compact}
          onPreview={onPreview}
          previewLoading={previewLoadingId === product.id}
        />
      ))}
    </div>
  );
};
