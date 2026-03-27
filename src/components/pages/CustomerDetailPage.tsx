'use client';

import apiClient from '@/api/client';
import productApi from '@/api/products';
import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react';

type CustomerDetailPageProps = {
  backHref: string;
  backLabel: string;
};

type FavouriteProductSummary = {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  price?: number;
  stock?: number;
  category?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
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

function formatDate(value?: unknown) {
  if (typeof value !== 'string' || !value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
}

function formatCurrency(value?: number, currency = 'VND') {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(value);
}

function resolvePhone(user: Record<string, unknown>) {
  const direct = user.phone;
  if (typeof direct === 'string' && direct.trim()) return direct;

  const addresses = user.addresses;
  if (!Array.isArray(addresses)) return undefined;
  const defaultAddress = addresses.find(
    (address) => isRecord(address) && (address as any).isDefault === true
  ) as Record<string, unknown> | undefined;
  const candidate = defaultAddress || (addresses[0] as any);
  if (!isRecord(candidate)) return undefined;

  const phone = candidate.phone;
  return typeof phone === 'string' && phone.trim() ? phone : undefined;
}

function getDefaultAddresses(user: Record<string, unknown>) {
  const addresses = Array.isArray(user.addresses)
    ? (user.addresses.filter(isRecord) as Record<string, unknown>[])
    : [];
  const defaults = addresses.filter((address) => address.isDefault === true);
  if (defaults.length > 0) return defaults;
  return addresses.slice(0, 1);
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

function addressText(address: Record<string, unknown>) {
  const parts = [
    address.line1,
    address.address,
    address.address1,
    address.ward,
    address.district,
    address.province,
  ]
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);

  return parts.join(', ') || 'Chưa có địa chỉ';
}

function SectionTitle({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em]">
      {icon}
      {children}
    </div>
  );
}

function InfoCard({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-lg border border-slate-200/80 bg-white/80 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={mono ? 'mt-1 font-mono text-[13px] font-semibold text-slate-900' : 'mt-1 text-sm font-semibold text-slate-900'}>
        {value}
      </p>
    </div>
  );
}

export function CustomerDetailPage({
  backHref,
  backLabel,
}: CustomerDetailPageProps) {
  const params = useParams();
  const customerId = String(params.id || '').trim();

  const [payload, setPayload] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const favouriteCacheRef = useRef(new Map<string, FavouriteProductSummary>());
  const [favouriteProducts, setFavouriteProducts] = useState<FavouriteProductSummary[]>([]);
  const [favouritesLoading, setFavouritesLoading] = useState(false);

  useEffect(() => {
    if (!customerId) {
      setErrorMessage('Không tìm thấy mã khách hàng.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadCustomer = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const response = await apiClient.get(`/api/users/${customerId}`);
        if (!isMounted) return;
        setPayload(response.data);
      } catch (error) {
        if (!isMounted) return;
        const message =
          (
            error as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (error as { message?: string })?.message ||
          'Không thể tải chi tiết khách hàng.';
        setErrorMessage(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadCustomer();

    return () => {
      isMounted = false;
    };
  }, [customerId]);

  const viewModel = useMemo(() => {
    const user = extractUserNode(payload);
    if (!user) return null;

    return {
      id:
        (typeof user._id === 'string' && user._id) ||
        (typeof user.id === 'string' && user.id) ||
        '',
      name: (typeof user.name === 'string' && user.name) || '(Chưa có tên)',
      email: (typeof user.email === 'string' && user.email) || '-',
      role: (typeof user.role === 'string' && user.role) || '-',
      provider: (typeof user.provider === 'string' && user.provider) || '-',
      avatarUrl:
        (typeof user.avatarUrl === 'string' && user.avatarUrl) ||
        (typeof user.avatar === 'string' && user.avatar) ||
        undefined,
      phone: resolvePhone(user) || '-',
      createdAt: formatDate(user.createdAt),
      updatedAt: formatDate(user.updatedAt),
      addresses: getDefaultAddresses(user),
      favouriteIds: extractFavouriteIds(user),
    };
  }, [payload]);

  useEffect(() => {
    if (!viewModel || viewModel.favouriteIds.length === 0) {
      setFavouriteProducts([]);
      setFavouritesLoading(false);
      return;
    }

    let isMounted = true;

    const loadFavourites = async () => {
      const idsToShow = viewModel.favouriteIds.slice(0, 12);
      const cache = favouriteCacheRef.current;
      const cachedProducts = idsToShow
        .map((id) => cache.get(id))
        .filter(Boolean) as FavouriteProductSummary[];
      setFavouriteProducts(cachedProducts);

      const toFetch = idsToShow.filter((id) => !cache.has(id));
      if (toFetch.length === 0) return;

      try {
        setFavouritesLoading(true);
        const results = await Promise.allSettled(toFetch.map((id) => productApi.getById(id)));

        for (let index = 0; index < results.length; index += 1) {
          const result = results[index];
          const requestedId = toFetch[index];
          if (result.status !== 'fulfilled') continue;
          const product = result.value;
          cache.set(requestedId, {
            id: product.id,
            name: product.name || '-',
            brand: product.brand || '-',
            imageUrl: product.imageUrl || '',
            price: product.price,
            stock: product.stock,
            category: product.category,
          });
        }

        if (!isMounted) return;
        setFavouriteProducts(
          idsToShow.map((id) => cache.get(id)).filter(Boolean) as FavouriteProductSummary[]
        );
      } finally {
        if (isMounted) setFavouritesLoading(false);
      }
    };

    void loadFavourites();

    return () => {
      isMounted = false;
    };
  }, [viewModel]);

  const copyText = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-4 p-4 sm:p-5">
      <Button
        variant="outline"
        size="sm"
        className="border-slate-300 bg-white text-slate-900 shadow-sm hover:bg-slate-100 hover:text-slate-950"
        asChild
      >
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </Button>

      {isLoading ? (
        <Card className="flex min-h-[240px] items-center justify-center p-5">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải chi tiết khách hàng...
          </div>
        </Card>
      ) : null}

      {!isLoading && errorMessage ? (
        <Card className="p-5">
          <div className="flex items-start gap-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{errorMessage}</p>
          </div>
        </Card>
      ) : null}

      {!isLoading && !errorMessage && viewModel ? (
        <div className="space-y-3">
          <div className="min-h-[108px] overflow-hidden rounded-xl border border-amber-200 bg-amber-50 px-4 py-5 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-amber-200/80 bg-white/90 p-2">
                  <Avatar
                    src={viewModel.avatarUrl}
                    name={viewModel.name}
                    size="lg"
                    className="ring-amber-100"
                  />
                </div>

                <div className="text-slate-950">
                  <span className="text-[11px] font-semibold tracking-[0.22em] text-slate-950/60">
                    KHÁCH HÀNG
                  </span>
                  <h1 className="mt-1 text-base font-extrabold leading-tight tracking-tight sm:text-lg">
                    {viewModel.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900">
                      Provider: {viewModel.provider}
                    </span>
                    <span className="inline-flex items-center rounded-full border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-900">
                      Vai trò: {viewModel.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-950"
                  onClick={() => copyText(viewModel.email === '-' ? '' : viewModel.email)}
                  disabled={!viewModel.email || viewModel.email === '-'}
                >
                  <Mail className="h-4 w-4" />
                  Copy email
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-300 bg-white text-slate-900 hover:bg-slate-100 hover:text-slate-950"
                  onClick={() => copyText(viewModel.phone === '-' ? '' : viewModel.phone)}
                  disabled={!viewModel.phone || viewModel.phone === '-'}
                >
                  <Phone className="h-4 w-4" />
                  Copy SĐT
                </Button>
              </div>
            </div>
          </div>

          <section className="bg-muted/20 border-border rounded-xl border p-3.5">
            <SectionTitle icon={<User className="h-4 w-4 text-yellow-600" />}>
              THÔNG TIN KHÁCH HÀNG
            </SectionTitle>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <InfoCard label="Email" value={viewModel.email} />
              <InfoCard label="Số điện thoại" value={viewModel.phone} />
              <InfoCard label="Mã khách hàng" value={viewModel.id || '-'} mono />
              <InfoCard label="Provider" value={viewModel.provider} />
              <InfoCard label="Ngày tạo" value={viewModel.createdAt} />
              <InfoCard label="Ngày cập nhật" value={viewModel.updatedAt} />
            </div>

            <div className="mt-3 rounded-lg border border-slate-200/80 bg-white/80 p-3">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <CalendarClock className="h-4 w-4 text-slate-500" />
                <span>Chi tiết khách hàng được tải trực tiếp từ hồ sơ người dùng.</span>
              </div>
            </div>
          </section>

          <section className="bg-muted/20 border-border rounded-xl border p-3.5">
            <SectionTitle icon={<MapPin className="h-4 w-4 text-yellow-600" />}>
              ĐỊA CHỈ MẶC ĐỊNH
            </SectionTitle>

            <div className="mt-3 space-y-2.5">
              {viewModel.addresses.length === 0 ? (
                <div className="rounded-lg border border-slate-200/70 bg-white/80 p-4 text-sm text-slate-600">
                  Chưa có địa chỉ mặc định.
                </div>
              ) : (
                viewModel.addresses.map((address, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-amber-200 bg-amber-50/70 p-3"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {viewModel.addresses.length > 1
                        ? `Địa chỉ mặc định #${idx + 1}`
                        : 'Địa chỉ mặc định'}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">
                      {addressText(address)}
                    </p>
                    {typeof address.phone === 'string' && address.phone.trim() ? (
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        Liên hệ: {address.phone.trim()}
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="bg-muted/20 border-border rounded-xl border p-3.5">
            <div className="flex items-center justify-between gap-3">
              <SectionTitle icon={<Heart className="h-4 w-4 text-yellow-600" />}>
                SẢN PHẨM YÊU THÍCH
              </SectionTitle>
              <span className="inline-flex min-w-8 items-center justify-center rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                {viewModel.favouriteIds.length}
              </span>
            </div>

            <div className="mt-3">
              {viewModel.favouriteIds.length === 0 ? (
                <div className="rounded-lg border border-slate-200/70 bg-white/80 p-4 text-sm text-slate-600">
                  Không có sản phẩm yêu thích.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {viewModel.favouriteIds.slice(0, 12).map((id) => {
                    const product = favouriteProducts.find((item) => item.id === id);

                    return (
                      <div
                        key={id}
                        className="bg-background/60 border-border flex items-center gap-2.5 rounded-lg border p-2.5"
                      >
                        <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200/70 bg-white">
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
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {product?.name || (favouritesLoading ? 'Đang tải...' : '(Không tải được)')}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600">
                              {product?.brand || 'Product'}
                            </span>
                            <span className="text-[11px] font-medium text-slate-500">
                              {product?.category || '-'}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            {formatCurrency(product?.price)}
                          </p>
                          <p className="text-[11px] font-medium text-slate-500">
                            Tồn: {typeof product?.stock === 'number' ? product.stock : '-'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
