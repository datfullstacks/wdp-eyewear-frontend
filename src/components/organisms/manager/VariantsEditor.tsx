import { Button, Input } from '@/components/atoms';
import type { Variant } from '@/types/managerProduct';

interface VariantsEditorProps {
  productId: string;
  variants: Variant[];
  onChange: (variants: Variant[]) => void;
}

const emptyVariant: Variant = {
  sku: '',
  barcode: '',
  options: { color: '', size: '' },
  price: 0,
  stock: 0,
  warehouseLocation: '',
  assetIds: [],
};

export function VariantsEditor({ productId, variants, onChange }: VariantsEditorProps) {
  const updateAt = (index: number, patch: Partial<Variant>) => {
    onChange(
      variants.map((variant, currentIndex) =>
        currentIndex === index ? { ...variant, ...patch } : variant
      )
    );
  };

  const removeAt = (index: number) => {
    onChange(variants.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Variants</h3>
        <Button type="button" variant="outline" onClick={() => onChange([...variants, { ...emptyVariant }])}>
          + Add variant
        </Button>
      </div>

      {variants.map((variant, index) => (
        <div
          key={`${productId}-${variant._id || 'variant'}-${index}`}
          className="space-y-2 rounded-md border border-gray-200 p-3"
        >
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <Input
              label="sku"
              value={variant.sku || ''}
              onChange={(event) => updateAt(index, { sku: event.target.value })}
            />
            <Input
              label="barcode"
              value={variant.barcode || ''}
              onChange={(event) => updateAt(index, { barcode: event.target.value })}
            />
            <Input
              label="options.color"
              value={variant.options?.color || ''}
              onChange={(event) =>
                updateAt(index, {
                  options: {
                    ...(variant.options || {}),
                    color: event.target.value,
                  },
                })
              }
            />
            <Input
              label="options.size"
              value={variant.options?.size || ''}
              onChange={(event) =>
                updateAt(index, {
                  options: {
                    ...(variant.options || {}),
                    size: event.target.value,
                  },
                })
              }
            />
            <Input
              type="number"
              label="price"
              value={Number(variant.price || 0)}
              onChange={(event) => updateAt(index, { price: Number(event.target.value || 0) })}
            />
            <Input
              type="number"
              label="stock"
              value={Number(variant.stock || 0)}
              onChange={(event) => updateAt(index, { stock: Number(event.target.value || 0) })}
            />
            <Input
              label="warehouseLocation"
              value={variant.warehouseLocation || ''}
              onChange={(event) =>
                updateAt(index, { warehouseLocation: event.target.value })
              }
            />
            <Input
              label="assetIds (comma separated)"
              value={(variant.assetIds || []).join(', ')}
              onChange={(event) =>
                updateAt(index, {
                  assetIds: event.target.value
                    .split(',')
                    .map((value) => value.trim())
                    .filter(Boolean),
                })
              }
            />
          </div>

          <div className="flex justify-end">
            <Button type="button" variant="destructive" onClick={() => removeAt(index)}>
              Remove
            </Button>
          </div>
        </div>
      ))}

      {variants.length === 0 && (
        <p className="text-sm text-gray-500">Chưa có variant. Bấm "Add variant" để thêm.</p>
      )}
    </div>
  );
}
