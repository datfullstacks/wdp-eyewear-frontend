'use client';

import { useState } from 'react';
import { Button } from '@/components/atoms';
import { Eye, EyeOff } from 'lucide-react';
import type { UserTabRole } from './UserTable';

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  department?: string;
  position?: string;
  permissions?: string[];
  password?: string;
}

interface UserFormProps {
  role: UserTabRole;
  formData: UserFormData;
  onChange: (data: UserFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  /** Show password field (used for create). Hidden by default (edit mode). */
  showPassword?: boolean;
}

export function UserForm({
  role,
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
  showPassword: showPasswordField = false,
}: UserFormProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            Họ và tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            placeholder="Nhập họ và tên"
            required
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange({ ...formData, email: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            placeholder="email@company.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange({ ...formData, phone: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            placeholder="0901234567"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            {role === 'manager' ? 'Phòng ban quản lý' : 'Vị trí công việc'}
          </label>
          <select
            value={role === 'manager' ? formData.department : formData.position}
            onChange={(e) =>
              onChange({
                ...formData,
                ...(role === 'manager'
                  ? { department: e.target.value }
                  : { position: e.target.value }),
              })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          >
            {role === 'manager' ? (
              <>
                <option value="">Chọn phòng ban</option>
                <option value="sales">Quản lý Bán hàng</option>
                <option value="inventory">Quản lý Kho</option>
                <option value="marketing">Quản lý Marketing</option>
                <option value="operations">Quản lý Vận hành</option>
              </>
            ) : (
              <>
                <option value="">Chọn vị trí</option>
                <option value="sales-staff">Nhân viên bán hàng</option>
                <option value="warehouse-staff">Nhân viên kho</option>
                <option value="customer-service">Chăm sóc khách hàng</option>
                <option value="delivery-staff">Nhân viên giao hàng</option>
              </>
            )}
          </select>
        </div>
      </div>

      {role === 'manager' && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            Quyền hạn
          </label>
          <div className="space-y-2.5">
            {[
              { value: 'products', label: 'Quản lý sản phẩm' },
              { value: 'pricing', label: 'Quản lý giá' },
              { value: 'users', label: 'Quản lý người dùng' },
              { value: 'policies', label: 'Quản lý chính sách' },
              { value: 'reports', label: 'Báo cáo doanh thu' },
            ].map((permission) => (
              <label
                key={permission.value}
                className="flex items-center gap-2.5 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={formData.permissions?.includes(permission.value)}
                  onChange={(e) => {
                    const updatedPermissions = e.target.checked
                      ? [...(formData.permissions || []), permission.value]
                      : (formData.permissions || []).filter(
                          (p) => p !== permission.value
                        );
                    onChange({ ...formData, permissions: updatedPermissions });
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                {permission.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {showPasswordField && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={passwordVisible ? 'text' : 'password'}
              value={formData.password || ''}
              onChange={(e) => onChange({ ...formData, password: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
              placeholder="Nhập mật khẩu"
              required
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((prev) => !prev)}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={passwordVisible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {passwordVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </form>
  );
}
