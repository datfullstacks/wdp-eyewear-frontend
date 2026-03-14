import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Package, Plus, Trash2 } from 'lucide-react';
import { Input } from '@/components/atoms';

export interface ImportDraftItem {
  key: string;
  productId: string;
  variantId: string;
  orderedQty: number;
}

export interface ImportProductVariantOption {
  id: string;
  label: string;
  sku: string;
  stock: number;
}

export interface ImportProductOption {
  id: string;
  name: string;
  brand: string;
  variants: ImportProductVariantOption[];
}

interface ImportCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: {
    batchCode: string;
    supplier: string;
    orderDate: string;
    expectedDate: string;
    note: string;
    items: ImportDraftItem[];
  };
  products: ImportProductOption[];
  isSubmitting?: boolean;
  errorMessage?: string;
  onFieldChange: (
    field: 'batchCode' | 'supplier' | 'orderDate' | 'expectedDate' | 'note',
    value: string
  ) => void;
  onItemChange: (
    itemKey: string,
    field: 'productId' | 'variantId' | 'orderedQty',
    value: string | number
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (itemKey: string) => void;
  onConfirm: () => void;
}

export const ImportCreateModal = ({
  open,
  onOpenChange,
  draft,
  products,
  isSubmitting = false,
  errorMessage,
  onFieldChange,
  onItemChange,
  onAddItem,
  onRemoveItem,
  onConfirm,
}: ImportCreateModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] overflow-y-auto p-4 sm:p-5">
      <DialogHeader>
        <DialogTitle>Tao dot hang Pre-order moi</DialogTitle>
        <DialogDescription>
          Operation tao batch nhap kho de theo doi hang pre-order ve kho.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="batchCode">Ma dot hang</Label>
            <Input
              id="batchCode"
              placeholder="VD: PO-20260314-001"
              value={draft.batchCode}
              onChange={(event) =>
                onFieldChange('batchCode', event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier">Nha cung cap</Label>
            <Input
              id="supplier"
              placeholder="Nhap ten nha cung cap"
              value={draft.supplier}
              onChange={(event) =>
                onFieldChange('supplier', event.target.value)
              }
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="orderDate">Ngay dat hang</Label>
            <Input
              id="orderDate"
              type="date"
              value={draft.orderDate}
              onChange={(event) =>
                onFieldChange('orderDate', event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectedDate">Ngay du kien ve</Label>
            <Input
              id="expectedDate"
              type="date"
              value={draft.expectedDate}
              onChange={(event) =>
                onFieldChange('expectedDate', event.target.value)
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Danh sach san pham</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={onAddItem}
            >
              <Plus className="h-4 w-4" />
              Them dong
            </Button>
          </div>

          <div className="space-y-3 rounded-lg border p-3">
            {draft.items.map((item, index) => {
              const product = products.find(
                (productOption) => productOption.id === item.productId
              );
              const variants = product?.variants || [];

              return (
                <div
                  key={item.key}
                  className="grid gap-3 rounded-lg border p-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_120px_40px]"
                >
                  <div className="space-y-2">
                    <Label>San pham {index + 1}</Label>
                    <Select
                      value={item.productId || undefined}
                      onValueChange={(value) =>
                        onItemChange(item.key, 'productId', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chon san pham" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((productOption) => (
                          <SelectItem
                            key={productOption.id}
                            value={productOption.id}
                          >
                            {productOption.name}
                            {productOption.brand
                              ? ` - ${productOption.brand}`
                              : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Bien the</Label>
                    <Select
                      value={item.variantId || undefined}
                      onValueChange={(value) =>
                        onItemChange(item.key, 'variantId', value)
                      }
                      disabled={!item.productId || variants.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            item.productId
                              ? variants.length > 0
                                ? 'Chon bien the'
                                : 'San pham chua co bien the'
                              : 'Chon san pham truoc'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {variants.map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>So luong</Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.orderedQty}
                      onChange={(event) =>
                        onItemChange(
                          item.key,
                          'orderedQty',
                          Number(event.target.value || 0)
                        )
                      }
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveItem(item.key)}
                      disabled={draft.items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {item.productId && variants.length === 0 ? (
                    <div className="text-muted-foreground text-xs md:col-span-4">
                      Product nay khong co bien the hop le de tao batch.
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preorderNote">Ghi chu</Label>
          <Textarea
            id="preorderNote"
            placeholder="Thong tin bo sung ve batch pre-order..."
            value={draft.note}
            onChange={(event) => onFieldChange('note', event.target.value)}
          />
        </div>

        {errorMessage ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            {errorMessage}
          </div>
        ) : null}

        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
            <Package className="h-4 w-4" />
            Luu y
          </div>
          Sau khi tao batch, operation co the tiep tuc xac nhan hang ve kho,
          cap nhat ton kho va theo doi tien do nhap hang trong cung man hinh
          nay.
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          Huy
        </Button>
        <Button onClick={onConfirm} disabled={isSubmitting}>
          <Plus className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Dang tao...' : 'Tao dot hang'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
