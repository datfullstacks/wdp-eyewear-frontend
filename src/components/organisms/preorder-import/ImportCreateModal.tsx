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
    <DialogContent className="max-h-[85vh] w-[95vw] max-w-4xl overflow-y-auto border-slate-200 bg-white p-4 text-slate-900 shadow-xl sm:p-5">
      <DialogHeader className="pb-1">
        <DialogTitle className="text-xl font-semibold text-slate-950">
          Tạo đợt hàng Pre-order mới
        </DialogTitle>
        <DialogDescription className="text-sm leading-6 text-slate-600">
          Operation tạo batch nhập kho để theo dõi hàng pre-order về kho.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="batchCode" className="font-medium text-slate-800">
              Mã đợt hàng
            </Label>
            <Input
              id="batchCode"
              placeholder="VD: PO-20260314-001"
              value={draft.batchCode}
              className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
              onChange={(event) =>
                onFieldChange('batchCode', event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supplier" className="font-medium text-slate-800">
              Nhà cung cấp
            </Label>
            <Input
              id="supplier"
              placeholder="Nhập tên nhà cung cấp"
              value={draft.supplier}
              className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
              onChange={(event) =>
                onFieldChange('supplier', event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orderDate" className="font-medium text-slate-800">
              Ngày đặt hàng
            </Label>
            <Input
              id="orderDate"
              type="date"
              value={draft.orderDate}
              className="border-slate-300 bg-white text-slate-900"
              onChange={(event) =>
                onFieldChange('orderDate', event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="expectedDate"
              className="font-medium text-slate-800"
            >
              Ngày dự kiến về
            </Label>
            <Input
              id="expectedDate"
              type="date"
              value={draft.expectedDate}
              className="border-slate-300 bg-white text-slate-900"
              onChange={(event) =>
                onFieldChange('expectedDate', event.target.value)
              }
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-medium text-slate-800">
              Danh sách sản phẩm
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
              onClick={onAddItem}
            >
              <Plus className="h-4 w-4" />
              Thêm dòng
            </Button>
          </div>

          <div className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-slate-50/60 px-3">
            {draft.items.map((item, index) => {
              const product = products.find(
                (productOption) => productOption.id === item.productId
              );
              const variants = product?.variants || [];

              return (
                <div
                  key={item.key}
                  className="grid gap-3 py-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)_120px_40px]"
                >
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold tracking-[0.08em] text-slate-600 uppercase">
                      Sản phẩm {index + 1}
                    </Label>
                    <Select
                      value={item.productId || undefined}
                      onValueChange={(value) =>
                        onItemChange(item.key, 'productId', value)
                      }
                    >
                      <SelectTrigger className="border-slate-300 bg-white text-slate-900">
                        <SelectValue placeholder="Chọn sản phẩm" />
                      </SelectTrigger>
                      <SelectContent className="border-slate-200 bg-white text-slate-900">
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
                    <Label className="text-xs font-semibold tracking-[0.08em] text-slate-600 uppercase">
                      Biến thể
                    </Label>
                    <Select
                      value={item.variantId || undefined}
                      onValueChange={(value) =>
                        onItemChange(item.key, 'variantId', value)
                      }
                      disabled={!item.productId || variants.length === 0}
                    >
                      <SelectTrigger className="border-slate-300 bg-white text-slate-900">
                        <SelectValue
                          placeholder={
                            item.productId
                              ? variants.length > 0
                                ? 'Chọn biến thể'
                                : 'Sản phẩm chưa có biến thể'
                              : 'Chọn sản phẩm trước'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="border-slate-200 bg-white text-slate-900">
                        {variants.map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-semibold tracking-[0.08em] text-slate-600 uppercase">
                      Số lượng
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      value={item.orderedQty}
                      className="border-slate-300 bg-white text-slate-900"
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
                      className="text-slate-600 hover:bg-red-50 hover:text-red-600"
                      onClick={() => onRemoveItem(item.key)}
                      disabled={draft.items.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {item.productId && variants.length === 0 ? (
                    <div className="text-xs text-amber-700 md:col-span-4">
                      Sản phẩm này không có biến thể hợp lệ để tạo batch.
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="preorderNote" className="font-medium text-slate-800">
            Ghi chú
          </Label>
          <Textarea
            id="preorderNote"
            placeholder="Thông tin bổ sung về batch pre-order..."
            value={draft.note}
            className="min-h-[96px] border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
            onChange={(event) => onFieldChange('note', event.target.value)}
          />
        </div>

        {errorMessage ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex items-start gap-2 text-sm leading-6 text-slate-600">
          <div className="mt-0.5 text-amber-600">
            <Package className="h-4 w-4" />
          </div>
          <p>
            <span className="font-semibold text-slate-800">Lưu ý:</span> Sau khi
            tạo batch, operation có thể tiếp tục xác nhận hàng về kho, cập nhật
            tồn kho và theo dõi tiến độ nhập hàng trong cùng màn hình này.
          </p>
        </div>
      </div>

      <DialogFooter className="pt-2">
        <Button
          variant="outline"
          className="border-slate-300 bg-white text-slate-900 hover:bg-slate-100"
          onClick={() => onOpenChange(false)}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button onClick={onConfirm} disabled={isSubmitting}>
          <Plus className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Đang tạo...' : 'Tạo đơn hàng'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
