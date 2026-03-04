'use client';

import { Button } from '@/components/atoms';
import { Input } from '@/components/atoms/Input';
import type { UserRole } from './UserTable';

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
  role: UserRole;
  formData: UserFormData;
  onChange: (data: UserFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function UserForm({
  role,
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: UserFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Họ và tên
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            placeholder="Nhập họ và tên"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Email
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => onChange({ ...formData, email: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            placeholder="email@company.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onChange({ ...formData, phone: e.target.value })}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            placeholder="0901234567"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-900">
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
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
            required
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
          <label className="mb-1 block text-sm font-medium text-gray-900">
            Quyền hạn
          </label>
          <div className="space-y-2">
            {[
              { value: 'products', label: 'Quản lý sản phẩm' },
              { value: 'pricing', label: 'Quản lý giá' },
              { value: 'users', label: 'Quản lý người dùng' },
              { value: 'policies', label: 'Quản lý chính sách' },
              { value: 'reports', label: 'Báo cáo doanh thu' },
            ].map((permission) => (
              <label
                key={permission.value}
                className="flex items-center gap-2 text-sm text-gray-700"
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

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-900">
          Mật khẩu
        </label>
        <input
          type="password"
          value={formData.password || ''}
          onChange={(e) => onChange({ ...formData, password: e.target.value })}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          placeholder="Nhập mật khẩu"
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
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
