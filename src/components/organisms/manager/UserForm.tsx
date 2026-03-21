'use client';

import { useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/atoms';
import type { StoreRecord } from '@/api/stores';
import type { UserTabRole } from './UserTable';

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  department?: string;
  position?: string;
  permissions?: string[];
  password?: string;
  storeScopeMode?: 'all' | 'selected';
  primaryStoreId?: string;
  storeIds?: string[];
  storeScopeNote?: string;
}

interface UserFormProps {
  role: UserTabRole;
  formData: UserFormData;
  onChange: (data: UserFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  showPassword?: boolean;
  storeOptions?: StoreRecord[];
}

type RoleOption = {
  value: string;
  label: string;
};

function getRoleFieldConfig(role: UserTabRole): {
  label: string;
  field: 'department' | 'position';
  options: RoleOption[];
} {
  switch (role) {
    case 'manager':
      return {
        label: 'Phong ban quan ly',
        field: 'department',
        options: [
          { value: 'sales', label: 'Quan ly ban hang' },
          { value: 'operations', label: 'Quan ly van hanh' },
          { value: 'inventory', label: 'Quan ly kho' },
          { value: 'marketing', label: 'Quan ly marketing' },
        ],
      };
    case 'admin':
      return {
        label: 'Pham vi he thong',
        field: 'department',
        options: [
          { value: 'identity', label: 'Auth / permission' },
          { value: 'security', label: 'Security / audit' },
          { value: 'integrations', label: 'Webhook / integration' },
          { value: 'platform', label: 'Platform settings' },
        ],
      };
    case 'operation':
      return {
        label: 'Vi tri van hanh',
        field: 'position',
        options: [
          { value: 'warehouse-ops', label: 'Kho van' },
          { value: 'lab-ops', label: 'Prescription / lab' },
          { value: 'shipping-ops', label: 'Dieu phoi giao hang' },
          { value: 'inventory-ops', label: 'Dieu phoi ton kho' },
        ],
      };
    case 'staff':
      return {
        label: 'Vi tri staff',
        field: 'position',
        options: [
          { value: 'sales-staff', label: 'Nhan vien ban hang' },
          { value: 'customer-service', label: 'Cham soc khach hang' },
          { value: 'order-intake', label: 'Tiep nhan don hang' },
          { value: 'refund-intake', label: 'Tiep nhan doi tra / hoan tien' },
        ],
      };
    default:
      return {
        label: 'Vi tri',
        field: 'position',
        options: [],
      };
  }
}

function getPermissionOptions(role: UserTabRole): RoleOption[] {
  if (role === 'admin') {
    return [
      { value: 'auth', label: 'Auth / permission' },
      { value: 'security', label: 'Security / audit' },
      { value: 'integrations', label: 'Webhook / integration' },
      { value: 'platform', label: 'Platform settings' },
    ];
  }

  if (role === 'manager') {
    return [
      { value: 'products', label: 'Quan ly san pham' },
      { value: 'pricing', label: 'Quan ly gia' },
      { value: 'users', label: 'Quan ly nguoi dung' },
      { value: 'policies', label: 'Quan ly chinh sach' },
      { value: 'reports', label: 'Bao cao doanh thu' },
    ];
  }

  return [];
}

export function UserForm({
  role,
  formData,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
  showPassword: showPasswordField = false,
  storeOptions = [],
}: UserFormProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const roleField = useMemo(() => getRoleFieldConfig(role), [role]);
  const permissionOptions = useMemo(() => getPermissionOptions(role), [role]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            Ho va ten <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(event) => onChange({ ...formData, name: event.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            placeholder="Nhap ho va ten"
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
            onChange={(event) => onChange({ ...formData, email: event.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            placeholder="email@company.com"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            So dien thoai
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(event) => onChange({ ...formData, phone: event.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
            placeholder="0901234567"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            {roleField.label}
          </label>
          <select
            value={roleField.field === 'department' ? formData.department : formData.position}
            onChange={(event) =>
              onChange({
                ...formData,
                ...(roleField.field === 'department'
                  ? { department: event.target.value }
                  : { position: event.target.value }),
              })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
          >
            <option value="">Chon gia tri</option>
            {roleField.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {permissionOptions.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-900">
            {role === 'admin' ? 'Nang luc he thong' : 'Quyen han'}
          </label>
          <div className="space-y-2.5">
            {permissionOptions.map((permission) => (
              <label
                key={permission.value}
                className="flex items-center gap-2.5 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  checked={formData.permissions?.includes(permission.value)}
                  onChange={(event) => {
                    const updatedPermissions = event.target.checked
                      ? [...(formData.permissions || []), permission.value]
                      : (formData.permissions || []).filter(
                          (value) => value !== permission.value
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

      <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-gray-900">Pham vi cua hang</p>
          <p className="text-xs text-gray-500">
            Dung de tach queue don hang, refund va van hanh theo tung chi nhanh trong mo hinh chuoi cua hang.
          </p>
        </div>

        {role === 'admin' ? (
          <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            System Admin mac dinh co pham vi toan he thong.
          </div>
        ) : role === 'customer' ? (
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
            Customer khong can gan store scope truc tiep. Pham vi phuc vu se duoc xac dinh theo order.
          </div>
        ) : (
          <>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700">
                <input
                  type="radio"
                  name="user-store-scope"
                  checked={(formData.storeScopeMode || 'all') === 'all'}
                  onChange={() =>
                    onChange({
                      ...formData,
                      storeScopeMode: 'all',
                      primaryStoreId: '',
                      storeIds: [],
                    })
                  }
                  className="mr-2"
                />
                Toan bo cua hang
              </label>
              <label className="rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700">
                <input
                  type="radio"
                  name="user-store-scope"
                  checked={(formData.storeScopeMode || 'all') === 'selected'}
                  onChange={() =>
                    onChange({
                      ...formData,
                      storeScopeMode: 'selected',
                    })
                  }
                  className="mr-2"
                />
                Chi cac cua hang duoc chon
              </label>
            </div>

            {(formData.storeScopeMode || 'all') === 'selected' && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-900">
                    Cua hang mac dinh
                  </label>
                  <select
                    value={formData.primaryStoreId || ''}
                    onChange={(event) =>
                      onChange({
                        ...formData,
                        primaryStoreId: event.target.value,
                        storeIds: Array.from(
                          new Set([
                            ...(formData.storeIds || []),
                            event.target.value,
                          ].filter(Boolean))
                        ),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                  >
                    <option value="">Chon cua hang mac dinh</option>
                    {storeOptions.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name} ({store.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="mb-2 block text-sm font-medium text-gray-900">
                    Cua hang duoc phep xu ly
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {storeOptions.map((store) => {
                      const checked = (formData.storeIds || []).includes(store.id);
                      return (
                        <label
                          key={store.id}
                          className="flex items-start gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              const currentStoreIds = formData.storeIds || [];
                              const nextStoreIds = event.target.checked
                                ? [...currentStoreIds, store.id]
                                : currentStoreIds.filter((value) => value !== store.id);
                              const nextPrimaryStoreId =
                                formData.primaryStoreId && nextStoreIds.includes(formData.primaryStoreId)
                                  ? formData.primaryStoreId
                                  : '';
                              onChange({
                                ...formData,
                                storeIds: Array.from(new Set(nextStoreIds)),
                                primaryStoreId: nextPrimaryStoreId,
                              });
                            }}
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                          />
                          <span className="leading-5">
                            <span className="block font-medium text-gray-900">{store.name}</span>
                            <span className="text-xs text-gray-500">{store.code}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-900">
                    Ghi chu
                  </label>
                  <textarea
                    value={formData.storeScopeNote || ''}
                    onChange={(event) =>
                      onChange({ ...formData, storeScopeNote: event.target.value })
                    }
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                    placeholder="Vi du: chi phu trach cum Ha Noi noi thanh"
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showPasswordField && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-900">
            Mat khau <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={passwordVisible ? 'text' : 'password'}
              value={formData.password || ''}
              onChange={(event) =>
                onChange({ ...formData, password: event.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-gray-900 placeholder-gray-400 transition-colors focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none [&::-ms-clear]:hidden [&::-ms-reveal]:hidden"
              placeholder="Nhap mat khau"
              required
            />
            <button
              type="button"
              onClick={() => setPasswordVisible((currentValue) => !currentValue)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600"
              aria-label={passwordVisible ? 'An mat khau' : 'Hien mat khau'}
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
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Huy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Dang luu...' : 'Luu'}
        </Button>
      </div>
    </form>
  );
}
