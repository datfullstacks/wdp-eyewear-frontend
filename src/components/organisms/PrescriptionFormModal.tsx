'use client';

import { X, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/atoms';
import { cn } from '@/lib/utils';
import type { PrescriptionData } from '@/types/rxPrescription';

interface PrescriptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PrescriptionData) => void;
  productName?: string;
  productImage?: string;
  initialData?: PrescriptionData;
}

const emptyForm: PrescriptionData = {
  sphereRight: '',
  cylinderRight: '',
  axisRight: '',
  sphereLeft: '',
  cylinderLeft: '',
  axisLeft: '',
  pd: '',
  addRight: '',
  addLeft: '',
  lensType: '',
  coating: '',
  notes: '',
};

export const PrescriptionFormModal: React.FC<PrescriptionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  productName,
  productImage,
  initialData,
}) => {
  const [formData, setFormData] = useState<PrescriptionData>(initialData || emptyForm);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Prevent body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof PrescriptionData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <Eye className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Nhập thông số đo kính
                  </h2>
                  {productName && (
                    <p className="text-sm text-gray-600">Sản phẩm: {productName}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Product Preview */}
              {productImage && (
                <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <img
                    src={productImage}
                    alt={productName}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{productName}</p>
                    <p className="text-xs text-gray-500">Kính theo đơn</p>
                  </div>
                </div>
              )}

              {/* Prescription Data - Right Eye */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Mắt phải (OD)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      SPH (Sphere) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sphereRight}
                      onChange={(e) => handleChange('sphereRight', e.target.value)}
                      placeholder="-2.50"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      CYL (Cylinder) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cylinderRight}
                      onChange={(e) => handleChange('cylinderRight', e.target.value)}
                      placeholder="-0.75"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      AXIS <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.axisRight}
                      onChange={(e) => handleChange('axisRight', e.target.value)}
                      placeholder="180"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="w-1/3">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    ADD (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.addRight || ''}
                    onChange={(e) => handleChange('addRight', e.target.value)}
                    placeholder="+1.50"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Prescription Data - Left Eye */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Mắt trái (OS)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      SPH (Sphere) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sphereLeft}
                      onChange={(e) => handleChange('sphereLeft', e.target.value)}
                      placeholder="-2.50"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      CYL (Cylinder) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.cylinderLeft}
                      onChange={(e) => handleChange('cylinderLeft', e.target.value)}
                      placeholder="-0.75"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      AXIS <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.axisLeft}
                      onChange={(e) => handleChange('axisLeft', e.target.value)}
                      placeholder="180"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="w-1/3">
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    ADD (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.addLeft || ''}
                    onChange={(e) => handleChange('addLeft', e.target.value)}
                    placeholder="+1.50"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* PD */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  PD (Pupillary Distance) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.pd}
                  onChange={(e) => handleChange('pd', e.target.value)}
                  placeholder="63"
                  className="w-1/3 rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Khoảng cách giữa hai đồng tử (mm)</p>
              </div>

              {/* Lens Type & Coating */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Loại tròng kính <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.lensType}
                    onChange={(e) => handleChange('lensType', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Chọn loại tròng</option>
                    <option value="single_vision">Đơn tròng</option>
                    <option value="bifocal">Hai tròng</option>
                    <option value="progressive">Đa tròng (Progressive)</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Lớp phủ <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.coating}
                    onChange={(e) => handleChange('coating', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">Chọn lớp phủ</option>
                    <option value="none">Không</option>
                    <option value="anti_reflective">Chống phản quang</option>
                    <option value="anti_blue_light">Chống ánh sáng xanh</option>
                    <option value="photochromic">Đổi màu (Photochromic)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Ghi chú thêm (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.notes || ''}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Ghi chú đặc biệt về đơn kính..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {initialData ? 'Cập nhật' : 'Thêm vào giỏ'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
