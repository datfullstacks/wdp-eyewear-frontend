'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, MapPin, Sparkles, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/atoms';
import { Input } from '@/components/atoms/Input';
import { Card } from '@/components/ui/card';
import { storeApi, type StoreRecord, type StoreStatus, type StoreType } from '@/api';
import {
  locationApi,
  type ProvinceOption,
  type DistrictOption,
  type WardOption,
} from '@/api/locations';

type Workspace = 'manager' | 'admin';

type StoreFormState = {
  name: string;
  code: string;
  status: StoreStatus;
  type: StoreType;
  phone: string;
  email: string;
  addressLine1: string;
  ward: string;
  district: string;
  city: string;
  openingHours: string;
  note: string;
  supportsTryOn: boolean;
  supportsPickup: boolean;
  isDefault: boolean;
  sortOrder: string;
  ghnSyncOnSave: boolean;
  ghnShopId: string;
  ghnClientId: string;
  ghnProvinceId: string;
  ghnProvinceName: string;
  ghnDistrictId: string;
  ghnDistrictName: string;
  ghnWardCode: string;
  ghnWardName: string;
  ghnAddress: string;
};

const EMPTY_FORM: StoreFormState = {
  name: '',
  code: '',
  status: 'active',
  type: 'branch',
  phone: '',
  email: '',
  addressLine1: '',
  ward: '',
  district: '',
  city: '',
  openingHours: '',
  note: '',
  supportsTryOn: false,
  supportsPickup: true,
  isDefault: false,
  sortOrder: '0',
  ghnSyncOnSave: false,
  ghnShopId: '',
  ghnClientId: '',
  ghnProvinceId: '',
  ghnProvinceName: '',
  ghnDistrictId: '',
  ghnDistrictName: '',
  ghnWardCode: '',
  ghnWardName: '',
  ghnAddress: '',
};

function toPositiveString(value: unknown) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? String(number) : '';
}

function isGhnReady(store: Pick<StoreRecord, 'ghn'>) {
  return Boolean(
    store.ghn?.shopId && store.ghn?.districtId && store.ghn?.wardCode && store.ghn?.address
  );
}

function mapStoreToForm(store: StoreRecord): StoreFormState {
  return {
    name: store.name || '',
    code: store.code || '',
    status: store.status || 'active',
    type: (store.type || 'branch') as StoreType,
    phone: store.phone || '',
    email: store.email || '',
    addressLine1: store.addressLine1 || '',
    ward: store.ward || '',
    district: store.district || '',
    city: store.city || '',
    openingHours: store.openingHours || '',
    note: store.note || '',
    supportsTryOn: Boolean(store.supportsTryOn),
    supportsPickup: store.supportsPickup !== false,
    isDefault: Boolean(store.isDefault),
    sortOrder: String(store.sortOrder ?? 0),
    ghnSyncOnSave: false,
    ghnShopId: toPositiveString(store.ghn?.shopId),
    ghnClientId: toPositiveString(store.ghn?.clientId),
    ghnProvinceId: toPositiveString(store.ghn?.provinceId),
    ghnProvinceName: store.ghn?.provinceName || store.city || '',
    ghnDistrictId: toPositiveString(store.ghn?.districtId),
    ghnDistrictName: store.ghn?.districtName || store.district || '',
    ghnWardCode: String(store.ghn?.wardCode || ''),
    ghnWardName: store.ghn?.wardName || store.ward || '',
    ghnAddress: store.ghn?.address || store.addressLine1 || '',
  };
}

function buildPayload(form: StoreFormState) {
  return {
    name: form.name.trim(),
    code: form.code.trim().toUpperCase(),
    status: form.status,
    type: form.type,
    phone: form.phone.trim(),
    email: form.email.trim(),
    addressLine1: form.addressLine1.trim(),
    ward: form.ward.trim(),
    district: form.district.trim(),
    city: form.city.trim(),
    openingHours: form.openingHours.trim(),
    note: form.note.trim(),
    supportsTryOn: Boolean(form.supportsTryOn),
    supportsPickup: Boolean(form.supportsPickup),
    isDefault: Boolean(form.isDefault),
    sortOrder: Number.isFinite(Number(form.sortOrder)) ? Number(form.sortOrder) : 0,
    ghn: {
      autoCreate: Boolean(form.ghnSyncOnSave),
      shopId: Number.isFinite(Number(form.ghnShopId)) ? Number(form.ghnShopId) : null,
      clientId: Number.isFinite(Number(form.ghnClientId)) ? Number(form.ghnClientId) : null,
      provinceId: Number.isFinite(Number(form.ghnProvinceId)) ? Number(form.ghnProvinceId) : null,
      provinceName: form.ghnProvinceName.trim(),
      districtId: Number.isFinite(Number(form.ghnDistrictId)) ? Number(form.ghnDistrictId) : null,
      districtName: form.ghnDistrictName.trim(),
      wardCode: form.ghnWardCode.trim(),
      wardName: form.ghnWardName.trim(),
      address: form.ghnAddress.trim() || form.addressLine1.trim(),
    },
  };
}

export function StoreNetworkPage({ workspace }: { workspace: Workspace }) {
  const canManageStores = workspace === 'admin';
  const [stores, setStores] = useState<StoreRecord[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState('');
  const [form, setForm] = useState<StoreFormState>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [apiError, setApiError] = useState('');
  const [provinces, setProvinces] = useState<ProvinceOption[]>([]);
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [wards, setWards] = useState<WardOption[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  const loadStores = useCallback(async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const result = await storeApi.getAll({ status: 'all', limit: 100 });
      setStores(result.stores);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to load stores');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStores();
  }, [loadStores]);

  useEffect(() => {
    if (workspace !== 'admin') return;
    let cancelled = false;
    setIsLoadingLocations(true);
    locationApi
      .getProvinces()
      .then((rows) => {
        if (!cancelled) {
          setProvinces(rows);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setApiError(error instanceof Error ? error.message : 'Failed to load GHN provinces');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingLocations(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [workspace]);

  useEffect(() => {
    if (workspace !== 'admin') return;
    const provinceId = Number(form.ghnProvinceId);
    if (!Number.isInteger(provinceId) || provinceId < 1) {
      setDistricts([]);
      return;
    }
    let cancelled = false;
    locationApi
      .getDistricts(provinceId)
      .then((rows) => {
        if (!cancelled) {
          setDistricts(rows);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setApiError(error instanceof Error ? error.message : 'Failed to load GHN districts');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [form.ghnProvinceId, workspace]);

  useEffect(() => {
    if (workspace !== 'admin') return;
    const districtId = Number(form.ghnDistrictId);
    if (!Number.isInteger(districtId) || districtId < 1) {
      setWards([]);
      return;
    }
    let cancelled = false;
    locationApi
      .getWards(districtId)
      .then((rows) => {
        if (!cancelled) {
          setWards(rows);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setApiError(error instanceof Error ? error.message : 'Failed to load GHN wards');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [form.ghnDistrictId, workspace]);

  const visibleStores = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return stores;
    return stores.filter((store) =>
      [store.name, store.code, store.city, store.district]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [search, stores]);

  const stats = useMemo(
    () => [
      { label: 'Tong cua hang', value: stores.length, icon: Building2 },
      { label: 'Dang hoat dong', value: stores.filter((store) => store.status === 'active').length, icon: MapPin },
      { label: 'Co try-on', value: stores.filter((store) => store.supportsTryOn).length, icon: Sparkles },
      { label: 'GHN san sang', value: stores.filter((store) => isGhnReady(store)).length, icon: MapPin },
    ],
    [stores]
  );

  const startCreate = () => {
    setEditingId('');
    setForm(EMPTY_FORM);
    setApiError('');
  };

  const startEdit = (store: StoreRecord) => {
    setEditingId(store.id);
    setForm(mapStoreToForm(store));
    setApiError('');
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      setApiError('Store name and code are required');
      return;
    }
    if (workspace === 'admin' && form.ghnSyncOnSave) {
      if (!form.phone.trim()) {
        setApiError('Store phone is required before creating GHN store');
        return;
      }
      if (!form.ghnDistrictId.trim() || !form.ghnWardCode.trim()) {
        setApiError('Select GHN district and ward before syncing store to GHN');
        return;
      }
      if (!(form.ghnAddress.trim() || form.addressLine1.trim())) {
        setApiError('Store address is required before creating GHN store');
        return;
      }
    }

    setIsSaving(true);
    setApiError('');
    try {
      const payload = buildPayload(form);
      if (editingId) {
        await storeApi.update(editingId, payload);
      } else {
        await storeApi.create(payload);
      }
      await loadStores();
      startCreate();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to save store');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (store: StoreRecord) => {
    if (!confirm(`Delete store "${store.name}"?`)) return;
    try {
      await storeApi.remove(store.id);
      await loadStores();
      if (editingId === store.id) startCreate();
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to delete store');
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">{stat.label}</div>
                <div className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</div>
              </div>
              <div className="rounded-full bg-amber-50 p-3 text-amber-700">
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </Card>
        ))}
      </section>

      {apiError ? (
        <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          <span>{apiError}</span>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-lg font-semibold text-gray-900">Danh sach cua hang</div>
              <div className="text-sm text-gray-500">
                Workspace: {workspace === 'admin' ? 'System Admin' : 'Manager'}
              </div>
            </div>
            <div className="flex gap-3">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tim theo ten, ma, thanh pho..."
              />
              {canManageStores ? (
                <Button type="button" variant="outline" onClick={startCreate}>
                  Them moi
                </Button>
              ) : null}
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-gray-500">Loading stores...</div>
          ) : visibleStores.length === 0 ? (
            <div className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
              Chua co cua hang nao.
            </div>
          ) : (
            <div className="space-y-3">
              {visibleStores.map((store) => (
                <div
                  key={store.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="font-semibold text-gray-900">
                          {store.name} ({store.code})
                        </div>
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                          {store.type}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            store.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {store.status}
                        </span>
                        {store.isDefault ? (
                          <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-800">
                            Default
                          </span>
                        ) : null}
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            isGhnReady(store)
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {isGhnReady(store) ? 'GHN ready' : 'GHN chua xong'}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        {[store.addressLine1, store.district, store.city].filter(Boolean).join(', ') || 'Chua co dia chi'}
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Try-on: {store.supportsTryOn ? 'Co' : 'Khong'} | Pickup:{' '}
                        {store.supportsPickup ? 'Co' : 'Khong'} | Gio mo cua:{' '}
                        {store.openingHours || 'Chua cap nhat'}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Shop GHN: {store.ghn?.shopId || 'Chua gan'} | District:{' '}
                        {store.ghn?.districtName || store.ghn?.districtId || 'Chua gan'} | Ward:{' '}
                        {store.ghn?.wardName || store.ghn?.wardCode || 'Chua gan'}
                      </div>
                      {store.ghn?.lastSyncError ? (
                        <div className="mt-1 text-xs text-red-600">{store.ghn.lastSyncError}</div>
                      ) : null}
                    </div>
                    {canManageStores ? (
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => startEdit(store)}>
                          Sua
                        </Button>
                        <Button type="button" variant="destructive" onClick={() => handleDelete(store)}>
                          Xoa
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {editingId ? 'Cap nhat cua hang' : 'Tao cua hang moi'}
              </div>
              <div className="text-sm text-gray-500">
                Quan ly chi nhanh, showroom va kho trung tam trong chuoi.
              </div>
            </div>
            {editingId && canManageStores ? (
              <Button type="button" variant="ghost" onClick={startCreate}>
                Bo chon
              </Button>
            ) : null}
          </div>

          {canManageStores ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ten cua hang"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
              <Input
                label="Ma cua hang"
                value={form.code}
                onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
              />
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Loai</label>
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, type: event.target.value as StoreType }))
                  }
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                >
                  <option value="flagship">flagship</option>
                  <option value="branch">branch</option>
                  <option value="kiosk">kiosk</option>
                  <option value="warehouse">warehouse</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Trang thai</label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, status: event.target.value as StoreStatus }))
                  }
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phone"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
              <Input
                label="Email"
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>

            <Input
              label="Dia chi"
              value={form.addressLine1}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, addressLine1: event.target.value }))
              }
            />

            <div className="grid grid-cols-3 gap-4">
              <Input
                label="Ward"
                value={form.ward}
                onChange={(event) => setForm((prev) => ({ ...prev, ward: event.target.value }))}
              />
              <Input
                label="District"
                value={form.district}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, district: event.target.value }))
                }
              />
              <Input
                label="City"
                value={form.city}
                onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Gio mo cua"
                value={form.openingHours}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, openingHours: event.target.value }))
                }
                placeholder="09:00 - 21:00"
              />
              <Input
                label="Thu tu hien thi"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, sortOrder: event.target.value }))
                }
                type="number"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Ghi chu</label>
              <textarea
                value={form.note}
                onChange={(event) => setForm((prev) => ({ ...prev, note: event.target.value }))}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.supportsTryOn}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, supportsTryOn: event.target.checked }))
                  }
                />
                Cua hang ho tro try-on
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.supportsPickup}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, supportsPickup: event.target.checked }))
                  }
                />
                Cua hang ho tro nhan hang
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, isDefault: event.target.checked }))
                  }
                />
                Dat lam cua hang mac dinh
              </label>
            </div>

            {workspace === 'admin' ? (
              <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div>
                  <div className="text-sm font-semibold text-slate-900">Cau hinh GHN cho cua hang</div>
                  <div className="text-xs text-slate-600">
                    Admin gan GHN shop vao cua hang de tinh phi ship theo chi nhanh dang duoc chon.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="GHN Shop ID"
                    value={form.ghnShopId}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, ghnShopId: event.target.value }))
                    }
                    placeholder="De trong neu tao moi tren GHN"
                  />
                  <Input
                    label="GHN Client ID"
                    value={form.ghnClientId}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, ghnClientId: event.target.value }))
                    }
                    placeholder="Tu dong dien sau khi sync"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Tinh / Thanh GHN</label>
                    <select
                      value={form.ghnProvinceId}
                      onChange={(event) => {
                        const nextProvinceId = event.target.value;
                        const province = provinces.find((item) => String(item.id) === nextProvinceId);
                        setForm((prev) => ({
                          ...prev,
                          ghnProvinceId: nextProvinceId,
                          ghnProvinceName: province?.name || '',
                          city: province?.name || prev.city,
                          ghnDistrictId: '',
                          ghnDistrictName: '',
                          ghnWardCode: '',
                          ghnWardName: '',
                        }));
                        setDistricts([]);
                        setWards([]);
                      }}
                      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                    >
                      <option value="">Chon tinh / thanh</option>
                      {provinces.map((province) => (
                        <option key={province.id} value={province.id}>
                          {province.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Quan / Huyen GHN</label>
                    <select
                      value={form.ghnDistrictId}
                      onChange={(event) => {
                        const nextDistrictId = event.target.value;
                        const district = districts.find((item) => String(item.id) === nextDistrictId);
                        setForm((prev) => ({
                          ...prev,
                          ghnDistrictId: nextDistrictId,
                          ghnDistrictName: district?.name || '',
                          district: district?.name || prev.district,
                          ghnWardCode: '',
                          ghnWardName: '',
                        }));
                        setWards([]);
                      }}
                      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                      disabled={!form.ghnProvinceId}
                    >
                      <option value="">Chon quan / huyen</option>
                      {districts.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Phuong / Xa GHN</label>
                    <select
                      value={form.ghnWardCode}
                      onChange={(event) => {
                        const nextWardCode = event.target.value;
                        const ward = wards.find((item) => item.code === nextWardCode);
                        setForm((prev) => ({
                          ...prev,
                          ghnWardCode: nextWardCode,
                          ghnWardName: ward?.name || '',
                          ward: ward?.name || prev.ward,
                        }));
                      }}
                      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
                      disabled={!form.ghnDistrictId}
                    >
                      <option value="">Chon phuong / xa</option>
                      {wards.map((ward) => (
                        <option key={ward.code} value={ward.code}>
                          {ward.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Dia chi lay hang tren GHN"
                  value={form.ghnAddress}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, ghnAddress: event.target.value }))
                  }
                  placeholder="Mac dinh se dung dia chi cua hang neu de trong"
                />

                <div className="grid grid-cols-1 gap-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.ghnSyncOnSave}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, ghnSyncOnSave: event.target.checked }))
                      }
                    />
                    Tao moi cua hang tren GHN khi luu
                  </label>
                  <div className="text-xs text-gray-500">
                    {isLoadingLocations
                      ? 'Dang tai master-data GHN...'
                      : 'Neu GHN Shop ID da ton tai, co the de tat checkbox va gan truc tiep shop ID.'}
                  </div>
                  {editingId && form.ghnShopId ? (
                    <div className="text-xs text-emerald-700">
                      Store nay dang duoc gan voi GHN Shop ID {form.ghnShopId}.
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            <Button type="button" onClick={handleSubmit} isLoading={isSaving}>
              {editingId ? 'Cap nhat cua hang' : 'Tao cua hang'}
            </Button>
          </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-600">
              Manager chi xem danh sach cua hang. Admin la role tao, cap nhat va gan GHN store de tinh phi giao hang.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
