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
import { Upload, XCircle } from 'lucide-react';
import type { ProductMediaAsset } from '@/api';

export interface ProductFormState {
  name: string;
  brand: string;
  price: string;
  stock: string;
  category: string;
  description: string;
  heroImageUrl: string;
  thumbnailUrl: string;
  galleryUrls: string[];
}

export const CATEGORY_OPTIONS = [
  { value: 'sunglasses', label: 'Kinh mat' },
  { value: 'frame', label: 'Gong kinh' },
  { value: 'lens', label: 'Trong kinh' },
  { value: 'accessory', label: 'Phu kien' },
  { value: 'other', label: 'Khac' },
];

interface ProductFormProps {
  formData: ProductFormState;
  isSubmitting: boolean;
  uploadingKey: string;
  onChange: (updater: (prev: ProductFormState) => ProductFormState) => void;
  onUploadSingle: (file: File, role: ProductMediaAsset['role']) => Promise<void>;
  onUploadGallery: (files: FileList | null) => Promise<void>;
  onRemoveGallery: (index: number) => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  submitLabel?: string;
}

export function ProductForm({
  formData,
  isSubmitting,
  uploadingKey,
  onChange,
  onUploadSingle,
  onUploadGallery,
  onRemoveGallery,
  onCancel,
  onSubmit,
  submitLabel = 'Save',
}: ProductFormProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Product Name"
        value={formData.name}
        onChange={(event) =>
          onChange((prev) => ({ ...prev, name: event.target.value }))
        }
        placeholder="Enter product name"
        required
      />

      <Input
        label="Brand"
        value={formData.brand}
        onChange={(event) =>
          onChange((prev) => ({ ...prev, brand: event.target.value }))
        }
        placeholder="Enter brand"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price (VND)"
          type="number"
          value={formData.price}
          onChange={(event) =>
            onChange((prev) => ({ ...prev, price: event.target.value }))
          }
          placeholder="0"
        />
        <Input
          label="Stock"
          type="number"
          value={formData.stock}
          onChange={(event) =>
            onChange((prev) => ({ ...prev, stock: event.target.value }))
          }
          placeholder="0"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Category
        </label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            onChange((prev) => ({ ...prev, category: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(event) =>
            onChange((prev) => ({ ...prev, description: event.target.value }))
          }
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
          placeholder="Optional product description"
        />
      </div>

      <div className="rounded-md border border-gray-200 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Upload className="h-4 w-4" />
          Hero image (role: hero)
        </div>
        {formData.heroImageUrl && (
          <img
            src={formData.heroImageUrl}
            alt="Hero preview"
            className="mb-2 h-20 w-20 rounded-md object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          disabled={isSubmitting || uploadingKey === 'hero'}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onUploadSingle(file, 'hero');
          }}
          className="block w-full text-sm text-gray-600"
        />
      </div>

      <div className="rounded-md border border-gray-200 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Upload className="h-4 w-4" />
          Thumbnail image (role: thumbnail)
        </div>
        {formData.thumbnailUrl && (
          <img
            src={formData.thumbnailUrl}
            alt="Thumbnail preview"
            className="mb-2 h-20 w-20 rounded-md object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          disabled={isSubmitting || uploadingKey === 'thumbnail'}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onUploadSingle(file, 'thumbnail');
          }}
          className="block w-full text-sm text-gray-600"
        />
      </div>

      <div className="rounded-md border border-gray-200 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
          <Upload className="h-4 w-4" />
          Gallery images (role: gallery)
        </div>
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={isSubmitting || uploadingKey === 'gallery'}
          onChange={(event) => void onUploadGallery(event.target.files)}
          className="mb-3 block w-full text-sm text-gray-600"
        />
        {formData.galleryUrls.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {formData.galleryUrls.map((url, index) => (
              <div key={`${url}-${index}`} className="relative">
                <img
                  src={url}
                  alt={`Gallery ${index + 1}`}
                  className="h-16 w-16 rounded-md object-cover"
                />
                <button
                  type="button"
                  onClick={() => onRemoveGallery(index)}
                  className="absolute -top-2 -right-2 rounded-full bg-white text-red-600 shadow"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {(onCancel || onSubmit) && (
        <div className="flex justify-end gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          )}
          {onSubmit && (
            <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : submitLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
