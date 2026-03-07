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
import { Shield, FileText, Truck, ShoppingCart, Lock, ScrollText } from 'lucide-react';

export interface PolicyFormData {
  title: string;
  category: 'warranty' | 'return' | 'shipping' | 'purchase' | 'privacy' | 'terms';
  summary: string;
  content: string;
  effectiveDate: string;
  expiryDate: string;
  status: 'active' | 'inactive' | 'draft';
  version: string;
}

interface PolicyFormProps {
  formData: PolicyFormData;
  onChange: (data: PolicyFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const CATEGORY_OPTIONS = [
  { value: 'warranty', label: 'Bảo hành', icon: Shield, color: 'text-blue-600' },
  { value: 'return', label: 'Đổi trả', icon: FileText, color: 'text-green-600' },
  { value: 'shipping', label: 'Vận chuyển', icon: Truck, color: 'text-purple-600' },
  { value: 'purchase', label: 'Mua hàng', icon: ShoppingCart, color: 'text-amber-600' },
  { value: 'privacy', label: 'Bảo mật', icon: Lock, color: 'text-red-600' },
  { value: 'terms', label: 'Điều khoản', icon: ScrollText, color: 'text-gray-600' },
];

export function PolicyForm({
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Lưu chính sách',
}: PolicyFormProps) {
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
          <Input
            label="Tiêu đề chính sách"
            value={formData.title}
            onChange={(e) => onChange({ ...formData, title: e.target.value })}
            placeholder="VD: Chính sách bảo hành sản phẩm"
            required
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Danh mục
            </label>
            <Select
              value={formData.category}
              onValueChange={(value: PolicyFormData['category']) =>
                onChange({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${cat.color}`} />
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Tóm tắt
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => onChange({ ...formData, summary: e.target.value })}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
              placeholder="Tóm tắt ngắn gọn về chính sách"
              required
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Nội dung chính sách</h3>
        <div className="space-y-2">
          <label className="text-sm text-gray-600">
            Hỗ trợ Markdown syntax (##, ###, *, -, etc.)
          </label>
          <textarea
            value={formData.content}
            onChange={(e) => onChange({ ...formData, content: e.target.value })}
            rows={15}
            className="font-mono w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            placeholder={`## Chính sách bảo hành

### 1. Điều kiện bảo hành
- Sản phẩm còn trong thời hạn bảo hành
- Có phiếu bảo hành và hóa đơn

### 2. Thời gian bảo hành
- **Gọng kính**: 12 tháng
- **Tròng kính**: 6 tháng`}
            required
          />
        </div>
      </div>

      {/* Dates & Version */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Thời hạn & Phiên bản</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="Ngày hiệu lực"
              type="date"
              value={formData.effectiveDate}
              onChange={(e) => onChange({ ...formData, effectiveDate: e.target.value })}
              required
            />
            <Input
              label="Ngày hết hạn"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => onChange({ ...formData, expiryDate: e.target.value })}
              placeholder="Để trống nếu không có"
            />
            <Input
              label="Phiên bản"
              value={formData.version}
              onChange={(e) => onChange({ ...formData, version: e.target.value })}
              placeholder="VD: 1.0, 2.1"
              required
            />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Trạng thái</h3>
        <Select
          value={formData.status}
          onValueChange={(value: PolicyFormData['status']) =>
            onChange({ ...formData, status: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Đang hoạt động</span>
              </div>
            </SelectItem>
            <SelectItem value="draft">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span>Bản nháp</span>
              </div>
            </SelectItem>
            <SelectItem value="inactive">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-gray-500" />
                <span>Tạm dừng</span>
              </div>
            </SelectItem>
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
