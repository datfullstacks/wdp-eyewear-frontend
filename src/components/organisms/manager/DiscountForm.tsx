'use client';

import { Input } from '@/components/atoms/Input';
import { Button } from '@/components/atoms';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Percent, DollarSign } from 'lucide-react';

export interface DiscountFormData {
  code: string;
  name: string;
  description: string;
  type: 'percentage' | 'fixed';
  value: string;
  minPurchase: string;
  maxDiscount: string;
  startDate: string;
  endDate: string;
  usageLimit: string;
  applicableCategories: string[];
  status: 'active' | 'inactive' | 'scheduled';
}

interface DiscountFormProps {
  formData: DiscountFormData;
  onChange: (data: DiscountFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'Tất cả sản phẩm' },
  { value: 'frame', label: 'Gọng kính' },
  { value: 'lens', label: 'Tròng kính' },
  { value: 'accessory', label: 'Phụ kiện' },
  { value: 'service', label: 'Dịch vụ' },
];

export function DiscountForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Lưu khuyến mãi',
}: DiscountFormProps) {
  const toggleCategory = (category: string) => {
    const current = formData.applicableCategories;
    const updated = current.includes(category)
      ? current.filter((c) => c !== category)
      : [...current, category];
    onChange({ ...formData, applicableCategories: updated });
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-6"
    >
      {/* Basic Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Mã khuyến mãi"
              value={formData.code}
              onChange={(e) => onChange({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="VD: SUMMER2024"
              required
            />
            <Input
              label="Tên khuyến mãi"
              value={formData.name}
              onChange={(e) => onChange({ ...formData, name: e.target.value })}
              placeholder="VD: Khuyến mãi mùa hè 2024"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
              placeholder="Mô tả chi tiết về chương trình khuyến mãi"
            />
          </div>
        </div>
      </div>

      {/* Discount Value */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Giá trị khuyến mãi</h3>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Loại giảm giá
            </label>
            <Select
              value={formData.type}
              onValueChange={(value: 'percentage' | 'fixed') =>
                onChange({ ...formData, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">
                  <div className="flex items-center gap-2">
                    <Percent className="h-4 w-4 text-blue-600" />
                    <span>Phần trăm (%)</span>
                  </div>
                </SelectItem>
                <SelectItem value="fixed">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span>Giá cố định (đ)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label={formData.type === 'percentage' ? 'Giá trị (%)' : 'Giá trị (đ)'}
              type="number"
              value={formData.value}
              onChange={(e) => onChange({ ...formData, value: e.target.value })}
              placeholder={formData.type === 'percentage' ? '20' : '100000'}
              required
            />
            <Input
              label="Giá trị đơn tối thiểu (đ)"
              type="number"
              value={formData.minPurchase}
              onChange={(e) => onChange({ ...formData, minPurchase: e.target.value })}
              placeholder="500000"
            />
            <Input
              label="Giảm tối đa (đ)"
              type="number"
              value={formData.maxDiscount}
              onChange={(e) => onChange({ ...formData, maxDiscount: e.target.value })}
              placeholder="500000"
            />
          </div>
        </div>
      </div>

      {/* Time & Usage */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Thời gian & Giới hạn</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Ngày bắt đầu"
              type="date"
              value={formData.startDate}
              onChange={(e) => onChange({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="Ngày kết thúc"
              type="date"
              value={formData.endDate}
              onChange={(e) => onChange({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <Input
            label="Số lượt sử dụng tối đa"
            type="number"
            value={formData.usageLimit}
            onChange={(e) => onChange({ ...formData, usageLimit: e.target.value })}
            placeholder="0 = Không giới hạn"
          />
        </div>
      </div>

      {/* Applicable Categories */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Danh mục áp dụng</h3>
        <div className="space-y-2">
          {CATEGORY_OPTIONS.map((cat) => (
            <label
              key={cat.value}
              className="flex items-center gap-3 text-sm text-gray-700"
            >
              <input
                type="checkbox"
                checked={formData.applicableCategories.includes(cat.value)}
                onChange={() => toggleCategory(cat.value)}
                className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
              />
              <span>{cat.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Trạng thái</h3>
        <Select
          value={formData.status}
          onValueChange={(value: 'active' | 'inactive' | 'scheduled') =>
            onChange({ ...formData, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="scheduled">Đã lên lịch</SelectItem>
            <SelectItem value="inactive">Tạm dừng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          className="bg-amber-400 text-slate-900 hover:bg-amber-500"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Đang lưu...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
