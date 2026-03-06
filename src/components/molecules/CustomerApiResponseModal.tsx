'use client';

import apiClient from '@/api/client';
import productApi from '@/api/products';
import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Heart, Mail, Phone } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type CustomerApiResponseModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
};

type FavouriteProductSummary = {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  status: string;
  price?: number;
  stock?: number;
  category?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toTitle(value?: string) {
  const trimmed = (value || '').trim();
  if (!trimmed) return '-';
  const normalized = trimmed.replace(/_/g, ' ');
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function normalizeKey(value: string) {
  return value.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function isRefundAccountSection(sectionKey: string) {
  const key = normalizeKey(sectionKey);
  return key === 'refundaccount' || key === 'refundaccountinfo';
}

function toRefundAccountLabel(key: string) {
  const map: Record<string, string> = {
    bank: 'Ngân hàng',
    bankname: 'Tên ngân hàng',
    bankcode: 'Mã ngân hàng',
    branch: 'Chi nhánh',

    account: 'Tài khoản',
    accountname: 'Chủ tài khoản',
    accountholder: 'Chủ tài khoản',
    holdername: 'Chủ tài khoản',
    fullname: 'Chủ tài khoản',

    accountnumber: 'Số tài khoản',
    accountno: 'Số tài khoản',
    bankaccountnumber: 'Số tài khoản',
    bankaccountname: 'Chủ tài khoản',
    bankaccountholdername: 'Chủ tài khoản',
    bankaccount: 'Tài khoản ngân hàng',
    beneficiaryname: 'Người thụ hưởng',
    beneficiaryaccount: 'Tài khoản thụ hưởng',

    swift: 'Mã SWIFT',
    swiftcode: 'Mã SWIFT',
    iban: 'IBAN',
    routingnumber: 'Routing number',

    qrcode: 'Mã QR',
    qr: 'Mã QR',
    qrcodeurl: 'Link mã QR',
    qrurl: 'Link mã QR',
    imageurl: 'Ảnh',

    status: 'Trạng thái',
    note: 'Ghi chú',

    createdat: 'Ngày tạo',
    updatedat: 'Ngày cập nhật',
  };

  return map[normalizeKey(key)];
}

function toAddressLabel(key: string) {
  const map: Record<string, string> = {
    fullname: 'Họ tên',
    name: 'Họ tên',
    phone: 'Số điện thoại',
    email: 'Email',

    address: 'Địa chỉ',
    address1: 'Địa chỉ',
    address2: 'Địa chỉ (bổ sung)',
    addressline1: 'Địa chỉ',
    addressline2: 'Địa chỉ (bổ sung)',
    street: 'Đường',

    ward: 'Phường/Xã',
    wardname: 'Phường/Xã',
    commune: 'Phường/Xã',

    district: 'Quận/Huyện',
    districtname: 'Quận/Huyện',

    city: 'Thành phố',
    cityname: 'Thành phố',

    province: 'Tỉnh/Thành',
    provincename: 'Tỉnh/Thành',
    state: 'Tỉnh/Thành',

    country: 'Quốc gia',

    zipcode: 'Mã bưu chính',
    postalcode: 'Mã bưu chính',

    note: 'Ghi chú',

    createdat: 'Ngày tạo',
    updatedat: 'Ngày cập nhật',
  };

  return map[normalizeKey(key)];
}

function toFieldLabel(key: string, sectionKey?: string) {
  if (sectionKey && isRefundAccountSection(sectionKey)) {
    return toRefundAccountLabel(key) ?? toTitle(key);
  }
  return toTitle(key);
}

function toAddressFieldLabel(key: string) {
  return toAddressLabel(key) ?? toTitle(key);
}

function formatDateTime(value?: unknown) {
  if (typeof value !== 'string' || !value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('vi-VN');
}

function formatDate(value?: unknown) {
  if (typeof value !== 'string' || !value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
}

function formatValue(value: unknown) {
  if (value === null) return 'null';
  if (value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'Có' : 'Không';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return value || '-';
  if (Array.isArray(value)) return `[${value.length}]`;
  return '{...}';
}

function isDateFieldKey(key: string) {
  const normalized = normalizeKey(key);
  return normalized === 'createdat' || normalized === 'updatedat';
}

function formatFieldValue(key: string, value: unknown) {
  if (isDateFieldKey(key)) return formatDate(value);
  return formatValue(value);
}

function sortRefundAccountEntries(entries: [string, unknown][]) {
  const order = new Map<string, number>([
    ['bankname', 0],
    ['bank', 1],
    ['bankcode', 2],
    ['branch', 3],
    ['accountnumber', 10],
    ['accountno', 11],
    ['bankaccountnumber', 12],
    ['accountname', 20],
    ['accountholder', 21],
    ['holdername', 22],
    ['fullname', 23],
    ['bankaccountname', 24],
    ['bankaccountholdername', 25],
    ['beneficiaryname', 30],
    ['beneficiaryaccount', 31],
    ['swift', 40],
    ['swiftcode', 41],
    ['iban', 42],
    ['routingnumber', 43],
    ['qrcode', 50],
    ['qr', 51],
    ['qrcodeurl', 52],
    ['qrurl', 53],
    ['imageurl', 54],
    ['status', 60],
    ['note', 61],
    ['createdat', 90],
    ['updatedat', 91],
  ]);

  return [...entries].sort((a, b) => {
    const ak = normalizeKey(a[0]);
    const bk = normalizeKey(b[0]);
    const ai = order.get(ak) ?? 999;
    const bi = order.get(bk) ?? 999;
    if (ai !== bi) return ai - bi;
    return a[0].localeCompare(b[0]);
  });
}

function formatCurrency(value?: number, currency = 'VND') {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(value);
}

function isIdLikeKey(key: string) {
  return (
    key === 'id' ||
    key === '_id' ||
    key.endsWith('_id') ||
    key.endsWith('Id') ||
    key.endsWith('ID')
  );
}

function getPrimitiveEntries(obj: Record<string, unknown>, omit = new Set<string>()) {
  return Object.entries(obj)
    .filter(([k]) => !omit.has(k))
    .filter(([, v]) => v === null || ['string', 'number', 'boolean'].includes(typeof v))
    .sort(([a], [b]) => a.localeCompare(b));
}

function extractUserNode(payload: unknown): Record<string, unknown> | null {
  if (!isRecord(payload)) return null;

  const data = payload.data;
  if (isRecord(data)) {
    if (isRecord((data as any).data)) return (data as any).data as Record<string, unknown>;
    return data;
  }

  return payload;
}

function resolvePhone(user: Record<string, unknown>) {
  const direct = user.phone;
  if (typeof direct === 'string' && direct.trim()) return direct;

  const addresses = user.addresses;
  if (!Array.isArray(addresses)) return undefined;
  const defaultAddress = addresses.find(
    (a) => isRecord(a) && (a as any).isDefault === true
  ) as Record<string, unknown> | undefined;
  const candidate = defaultAddress || (addresses[0] as any);
  if (isRecord(candidate)) {
    const phone = candidate.phone;
    if (typeof phone === 'string' && phone.trim()) return phone;
  }
  return undefined;
}

function extractFavouriteIds(user: Record<string, unknown>): string[] {
  const keys = [
    'favourite',
    'favourites',
    'favorite',
    'favorites',
    'wishlist',
    'wishList',
    'favouriteProducts',
    'favoriteProducts',
  ];

  const collected: string[] = [];

  const collectFromArray = (value: unknown[]) => {
    for (const item of value) {
      if (typeof item === 'string' && item.trim()) {
        collected.push(item.trim());
        continue;
      }
      if (isRecord(item)) {
        const maybeId =
          (typeof (item as any).productId === 'string' && (item as any).productId) ||
          (typeof (item as any)._id === 'string' && (item as any)._id) ||
          (typeof (item as any).id === 'string' && (item as any).id) ||
          '';
        if (maybeId.trim()) collected.push(maybeId.trim());
      }
    }
  };

  for (const key of keys) {
    const value = (user as any)[key] as unknown;

    if (Array.isArray(value)) {
      collectFromArray(value);
      continue;
    }

    if (isRecord(value)) {
      const nested =
        (value as any).ids ||
        (value as any).productIds ||
        (value as any).products ||
        (value as any).items;
      if (Array.isArray(nested)) collectFromArray(nested);
    }
  }

  return Array.from(new Set(collected));
}

function InfoItem({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={cn(
          'text-slate-900 font-semibold break-words',
          mono ? 'font-mono text-[13px] font-semibold' : ''
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function CustomerApiResponseModal({
  open,
  onOpenChange,
  userId,
}: CustomerApiResponseModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<unknown>(null);
  const favouriteCacheRef = useRef(new Map<string, FavouriteProductSummary>());
  const [favouritesLoading, setFavouritesLoading] = useState(false);
  const [favouritesError, setFavouritesError] = useState<string | null>(null);
  const [favouriteProducts, setFavouriteProducts] = useState<FavouriteProductSummary[]>([]);

  useEffect(() => {
    if (!open || !userId) return;

    let isMounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setPayload(null);
        const response = await apiClient.get(`/api/users/${userId}`);
        if (!isMounted) return;
        setPayload(response.data);
      } catch (err) {
        if (!isMounted) return;
        const message =
          (
            err as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Không thể tải chi tiết khách hàng.';
        setError(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, [open, userId]);

  const viewModel = useMemo(() => {
    const envelope = isRecord(payload) ? payload : null;
    const user = extractUserNode(payload);
    if (!user) return null;

    const id =
      (typeof user._id === 'string' && user._id) ||
      (typeof user.id === 'string' && user.id) ||
      '';
    const name = (typeof user.name === 'string' && user.name) || '(Chưa có tên)';
    const email = (typeof user.email === 'string' && user.email) || '-';
    const role = (typeof user.role === 'string' && user.role) || '-';
    const provider = (typeof user.provider === 'string' && user.provider) || '-';
    const avatarUrl =
      (typeof user.avatarUrl === 'string' && user.avatarUrl) ||
      (typeof user.avatar === 'string' && user.avatar) ||
      undefined;
    const phone = resolvePhone(user) || '-';

    const createdAt = formatDate(user.createdAt);
    const updatedAt = formatDate(user.updatedAt);

    const addressesAll = Array.isArray(user.addresses)
      ? (user.addresses.filter(isRecord) as Record<string, unknown>[])
      : [];
    const addresses = addressesAll.filter((a) => a.isDefault === true);

    const favouriteIds = extractFavouriteIds(user);

    const omit = new Set([
      '_id',
      'id',
      '__v',
      'name',
      'email',
      'role',
      'provider',
      'avatar',
      'avatarUrl',
      'phone',
      'addresses',
      'createdAt',
      'updatedAt',
      'favourite',
      'favourites',
      'favorite',
      'favorites',
      'wishlist',
      'wishList',
      'favouriteProducts',
      'favoriteProducts',
    ]);

    const otherPrimitive = getPrimitiveEntries(user, omit).filter(([k]) => !isIdLikeKey(k));

    const otherObjects = Object.entries(user)
      .filter(([k]) => !omit.has(k))
      .filter(([, v]) => isRecord(v))
      .map(([k, v]) => ({ key: k, value: v as Record<string, unknown> }))
      .sort((a, b) => a.key.localeCompare(b.key));

    const otherArrays = Object.entries(user)
      .filter(([k]) => !omit.has(k))
      .filter(([, v]) => Array.isArray(v))
      .map(([k, v]) => ({ key: k, value: v as unknown[] }))
      .sort((a, b) => a.key.localeCompare(b.key));

    const message =
      envelope && typeof envelope.message === 'string' ? envelope.message : undefined;

    return {
      id,
      name,
      email,
      phone,
      role,
      provider,
      avatarUrl,
      createdAt,
      updatedAt,
      addresses,
      favouriteIds,
      otherPrimitive,
      otherObjects,
      otherArrays,
      meta: { message },
    };
  }, [payload]);

  const favouriteIdsKey = useMemo(() => {
    return (viewModel?.favouriteIds || []).join('|');
  }, [viewModel?.favouriteIds]);

  useEffect(() => {
    if (!open) return;
    if (!viewModel) return;
    if (isLoading || error) return;

    const ids = viewModel.favouriteIds || [];
    if (ids.length === 0) {
      setFavouriteProducts([]);
      setFavouritesError(null);
      setFavouritesLoading(false);
      return;
    }

    let isMounted = true;

    const load = async () => {
      const idsToShow = ids.slice(0, 12);
      const cache = favouriteCacheRef.current;

      setFavouriteProducts(
        idsToShow.map((id) => cache.get(id)).filter(Boolean) as FavouriteProductSummary[]
      );

      const toFetch = idsToShow.filter((id) => !cache.has(id));
      if (toFetch.length === 0) return;

      try {
        setFavouritesLoading(true);
        setFavouritesError(null);

        const batchSize = 5;
        for (let i = 0; i < toFetch.length; i += batchSize) {
          const batch = toFetch.slice(i, i + batchSize);
          const results = await Promise.allSettled(
            batch.map((id) => productApi.getById(id))
          );

          for (let idx = 0; idx < results.length; idx += 1) {
            const res = results[idx];
            const requestedId = batch[idx];
            if (res.status !== 'fulfilled') {
              cache.set(requestedId, {
                id: requestedId,
                name: '(Không tải được)',
                brand: '-',
                imageUrl: '',
                status: '-',
              });
              continue;
            }
            const product = res.value;
            cache.set(product.id, {
              id: product.id,
              name: product.name || '-',
              brand: product.brand || '-',
              imageUrl: product.imageUrl || '',
              status: product.status || '-',
              price: product.price,
              stock: product.stock,
              category: product.category,
            });
          }

          if (!isMounted) return;
          setFavouriteProducts(
            idsToShow
              .map((id) => cache.get(id))
              .filter(Boolean) as FavouriteProductSummary[]
          );
        }
      } catch (e) {
        if (!isMounted) return;
        const message =
          (e as { message?: string })?.message || 'Không thể tải sản phẩm yêu thích.';
        setFavouritesError(message);
      } finally {
        if (isMounted) setFavouritesLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [open, viewModel?.id, favouriteIdsKey, isLoading, error]);

  const favouriteMap = useMemo(() => {
    return new Map(favouriteProducts.map((p) => [p.id, p]));
  }, [favouriteProducts]);

  const copyText = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw] max-w-2xl">
        <DialogHeader>
          <DialogTitle>Chi tiết khách hàng</DialogTitle>
          <DialogDescription>
            {userId ? 'Thông tin chi tiết khách hàng.' : 'Chưa chọn khách hàng.'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
            {isLoading ? (
              <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-sm text-slate-600">
                Đang tải dữ liệu...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            ) : !viewModel ? (
              <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-sm text-slate-600">
                Không có dữ liệu.
              </div>
            ) : (
              <div className="max-h-[55vh] space-y-5 overflow-y-auto pr-2">
                <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    1. Thông tin cơ bản
                  </p>
                  <div className="mt-4 grid gap-4 sm:grid-cols-[140px_1fr]">
                    <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4">
                      <div className="flex h-full items-center justify-center">
                        <Avatar
                          src={viewModel.avatarUrl}
                          name={viewModel.name}
                          size="lg"
                          className="ring-slate-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {viewModel.name}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700">
                          Provider: {viewModel.provider}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700">
                        <InfoItem label="Email" value={viewModel.email} />
                        <InfoItem label="Số điện thoại" value={viewModel.phone} />
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 font-semibold text-foreground"
                          onClick={() => copyText(viewModel.email === '-' ? '' : viewModel.email)}
                          disabled={!viewModel.email || viewModel.email === '-'}
                        >
                          <Mail className="h-4 w-4" />
                          Copy email
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 font-semibold text-foreground"
                          onClick={() => copyText(viewModel.phone === '-' ? '' : viewModel.phone)}
                          disabled={!viewModel.phone || viewModel.phone === '-'}
                        >
                          <Phone className="h-4 w-4" />
                          Copy SĐT
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
                  <p className="text-sm font-semibold text-slate-900">2. Thời gian</p>
                  <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
                    <InfoItem label="Ngày tạo" value={viewModel.createdAt} />
                    <InfoItem label="Ngày cập nhật" value={viewModel.updatedAt} />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
                  <p className="text-sm font-semibold text-slate-900">3. Địa chỉ</p>
                  <div className="mt-3 space-y-3">
                    {viewModel.addresses.length === 0 ? (
                      <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-600">
                        Chưa có địa chỉ mặc định.
                      </div>
                    ) : (
                      viewModel.addresses.map((addr, idx) => {
                        const entries = getPrimitiveEntries(
                          addr,
                          new Set(['isDefault', '_id', 'id', 'userId'])
                        ).filter(([k]) => !isIdLikeKey(k));
                        return (
                          <div
                            key={idx}
                            className="rounded-xl border border-amber-300 bg-amber-50 p-4"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-slate-900">
                                {viewModel.addresses.length > 1
                                  ? `Địa chỉ mặc định #${idx + 1}`
                                  : 'Địa chỉ mặc định'}
                              </p>
                            </div>

                            {entries.length === 0 ? (
                              <p className="mt-2 text-sm text-slate-600">Không có dữ liệu.</p>
                            ) : (
                                <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
                                  {entries.map(([k, v]) => (
                                    <InfoItem
                                      key={k}
                                      label={toAddressFieldLabel(k)}
                                      value={formatFieldValue(k, v)}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                      })
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-900">
                      4. Sản phẩm yêu thích
                    </p>
                    <span className="text-xs font-semibold text-slate-500">
                      {viewModel.favouriteIds.length}
                    </span>
                  </div>

                  <div className="mt-3">
                    {viewModel.favouriteIds.length === 0 ? (
                      <div className="rounded-xl border border-slate-200/70 bg-slate-50 p-4 text-sm text-slate-600">
                        Không có sản phẩm yêu thích.
                      </div>
                    ) : (
                      <>
                        {favouritesError ? (
                          <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                            {favouritesError}
                          </div>
                        ) : null}

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {viewModel.favouriteIds.slice(0, 12).map((id) => {
                            const product = favouriteMap.get(id);
                            return (
                              <div
                                key={id}
                                title={product?.name || ''}
                                className="group relative overflow-hidden rounded-xl border border-slate-200/70 bg-slate-50"
                              >
                                <div className="flex gap-3 p-3">
                                  <div className="h-14 w-14 overflow-hidden rounded-lg border border-slate-200/70 bg-white">
                                    {product?.imageUrl ? (
                                      <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                                        <Heart className="h-4 w-4" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
                                      {product?.brand || 'Product'}
                                    </p>
                                    <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
                                      {product?.name ||
                                        (favouritesLoading ? 'Đang tải...' : '(Không tải được)')}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
                                      <span className="truncate text-xs text-slate-500">
                                        {product?.category || '-'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                  <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-[2px]" />
                                  <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                                    <p className="text-sm font-semibold leading-snug">
                                      {product?.name || '-'}
                                    </p>
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                      <div>
                                        <p className="text-white/75">Giá</p>
                                        <p className="font-semibold">
                                          {formatCurrency(product?.price)}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="text-white/75">Tồn kho</p>
                                        <p className="font-semibold">
                                          {typeof product?.stock === 'number' ? product.stock : '-'}
                                        </p>
                                      </div>
                                      <div className="col-span-2">
                                        <p className="text-white/75">Danh mục</p>
                                        <p className="font-semibold">
                                          {product?.category || '-'}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {viewModel.favouriteIds.length > 12 ? (
                          <p className="mt-3 text-xs text-slate-500">
                            (Đang hiển thị 12/{viewModel.favouriteIds.length} sản phẩm)
                          </p>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>

                {(viewModel.otherPrimitive.length > 0 ||
                  viewModel.otherObjects.length > 0 ||
                  viewModel.otherArrays.length > 0) && (
                  <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4">
                    <p className="text-sm font-semibold text-slate-900">5. Trường khác</p>

                    {viewModel.otherPrimitive.length > 0 ? (
                      <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
                        {viewModel.otherPrimitive.map(([k, v]) => (
                          <InfoItem key={k} label={toTitle(k)} value={formatValue(v)} />
                        ))}
                      </div>
                    ) : null}

                    {viewModel.otherObjects.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {viewModel.otherObjects.map((section) => {
                          const isRefundAccount = isRefundAccountSection(section.key);
                          const entriesBase = (
                            isRefundAccount
                              ? getPrimitiveEntries(section.value, new Set(['__v']))
                              : getPrimitiveEntries(section.value)
                          ).filter(([k]) => !isIdLikeKey(k));
                          const entries = isRefundAccount
                            ? sortRefundAccountEntries(entriesBase)
                            : entriesBase;
                          return (
                            <div
                              key={section.key}
                              className="rounded-xl border border-slate-200/70 bg-slate-50 p-4"
                            >
                              <p className="text-sm font-semibold text-slate-900">
                                {isRefundAccount ? 'Tài khoản hoàn tiền' : toTitle(section.key)}
                              </p>
                              {entries.length === 0 ? (
                                <p className="mt-2 text-sm text-slate-600">
                                  Không có dữ liệu hiển thị.
                                </p>
                              ) : (
                                <div className="mt-3 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
                                  {entries.map(([k, v]) => (
                                    <InfoItem
                                      key={k}
                                      label={toFieldLabel(k, section.key)}
                                      value={formatFieldValue(k, v)}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}

                    {viewModel.otherArrays.length > 0 ? (
                      <div className="mt-4 space-y-3">
                        {viewModel.otherArrays.map((section) => {
                          const rows = section.value;
                          const recordRows = rows.filter(isRecord) as Record<string, unknown>[];
                          const primitiveRows = rows.filter(
                            (v) =>
                              v === null ||
                              ['string', 'number', 'boolean'].includes(typeof v)
                          );
                          return (
                            <div
                              key={section.key}
                              className="rounded-xl border border-slate-200/70 bg-slate-50 p-4"
                            >
                              <p className="text-sm font-semibold text-slate-900">
                                {toTitle(section.key)}{' '}
                                <span className="text-slate-500">({rows.length})</span>
                              </p>

                              {recordRows.length > 0 ? (
                                <div className="mt-3 space-y-2">
                                  {recordRows.slice(0, 5).map((row, idx) => {
                                    const entries = getPrimitiveEntries(row).filter(
                                      ([k]) => !isIdLikeKey(k)
                                    );
                                    return (
                                      <div
                                        key={idx}
                                        className="rounded-lg border border-slate-200/70 bg-white/80 p-3"
                                      >
                                        <p className="text-xs font-semibold text-slate-500">
                                          Item #{idx + 1}
                                        </p>
                                        {entries.length === 0 ? (
                                          <p className="mt-2 text-sm text-slate-600">
                                            Không có dữ liệu hiển thị.
                                          </p>
                                        ) : (
                                          <div className="mt-2 grid grid-cols-1 gap-3 text-sm text-slate-700 sm:grid-cols-2">
                                            {entries.map(([k, v]) => (
                                              <InfoItem
                                                key={k}
                                                label={toTitle(k)}
                                                value={formatValue(v)}
                                              />
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                  {recordRows.length > 5 ? (
                                    <p className="text-xs text-slate-500">
                                      (Đang hiển thị 5/{recordRows.length} items)
                                    </p>
                                  ) : null}
                                </div>
                              ) : primitiveRows.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {primitiveRows.slice(0, 20).map((v, idx) => (
                                    <span
                                      key={idx}
                                      className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700"
                                    >
                                      {formatValue(v)}
                                    </span>
                                  ))}
                                  {primitiveRows.length > 20 ? (
                                    <span className="text-xs text-slate-500">
                                      (Đang hiển thị 20/{primitiveRows.length})
                                    </span>
                                  ) : null}
                                </div>
                              ) : (
                                <p className="mt-2 text-sm text-slate-600">
                                  Không có dữ liệu hiển thị.
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            className="font-semibold text-foreground"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
