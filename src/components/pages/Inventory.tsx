'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSession } from 'next-auth/react';
import { Filter } from 'lucide-react';
import inventoryApi from '@/api/inventory';
import { userApi } from '@/api/users';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Header } from '@/components/organisms/Header';
import {
  InventoryDetailModal,
  InventoryEditModal,
  InventoryHistoryModal,
  InventoryStatsGrid,
  InventoryTable,
} from '@/components/organisms/inventory';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  INVENTORY_STATUS_LABELS,
  InventoryItem,
  toInventoryDisplayStatus,
} from '@/types/inventory';
import { useDetailRoute } from '@/hooks/useDetailRoute';

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

const Inventory = () => {
  const { detailId, openDetail, closeDetail } = useDetailRoute();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] =
    useState<(typeof PAGE_SIZE_OPTIONS)[number]>(20);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [availableStores, setAvailableStores] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [resolvedStoreId, setResolvedStoreId] = useState('');
  const [resolvedStoreLabel, setResolvedStoreLabel] = useState('');
  const [storeScopeError, setStoreScopeError] = useState('');
  const [isResolvingStoreScope, setIsResolvingStoreScope] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await inventoryApi.getStockItems({
          page: 1,
          limit: 100,
        });
        if (!isMounted) return;
        setItems(result);
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
          'Không thể tải tồn kho. Vui lòng thử lại.';
        setError(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadStoreScope = async () => {
      setIsResolvingStoreScope(true);
      setStoreScopeError('');

      try {
        const session = await getSession();
        const currentUserId = String(session?.user?.id || '').trim();
        if (!currentUserId) {
          throw new Error('Không xác định dược tài khỏan đang nhập.');
        }

        const currentUser = await userApi.getById(currentUserId);
        const scope = currentUser.storeAccess;
        const scopeStores = Array.isArray(scope?.stores)
          ? scope.stores
              .map((store) => ({
                id: String(store?.id || '').trim(),
                name:
                  String(store?.name || '').trim() ||
                  String(store?.id || '').trim(),
              }))
              .filter((store) => store.id)
          : [];

        const storesById = new Map(
          scopeStores.map((store) => [store.id, store])
        );
        const primaryStoreId = String(scope?.primaryStoreId || '').trim();
        const primaryStoreName = String(scope?.primaryStore?.name || '').trim();
        if (primaryStoreId && !storesById.has(primaryStoreId)) {
          storesById.set(primaryStoreId, {
            id: primaryStoreId,
            name: primaryStoreName || primaryStoreId,
          });
        }

        const stores = Array.from(storesById.values());
        const nextStoreId =
          primaryStoreId ||
          String(scope?.storeIds?.[0] || '').trim() ||
          stores[0]?.id ||
          '';

        if (!nextStoreId) {
          throw new Error(
            'Tài khoản operation chưa được gán cửa hàng để nhập kho.'
          );
        }

        const nextStoreLabel = storesById.get(nextStoreId)?.name || '';

        if (!mounted) return;
        setAvailableStores(stores);
        setResolvedStoreId(nextStoreId);
        setResolvedStoreLabel(nextStoreLabel);
      } catch (err) {
        if (!mounted) return;
        setAvailableStores([]);
        setResolvedStoreId('');
        setResolvedStoreLabel('');
        const message =
          (
            err as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Không tải đuọc phạm vi cửa hàng của tài khoản operation.';
        setStoreScopeError(message);
      } finally {
        if (mounted) setIsResolvingStoreScope(false);
      }
    };

    void loadStoreScope();

    return () => {
      mounted = false;
    };
  }, []);

  const inventoryCategories = useMemo(() => {
    const categories = new Set(
      items.map((item) => item.category).filter(Boolean)
    );
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filteredInventory = useMemo(() => {
    return items.filter((item) => {
      const normalizedSearch = searchTerm.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.sku.toLowerCase().includes(normalizedSearch) ||
        item.brand.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === 'all' ||
        toInventoryDisplayStatus(item.status) === statusFilter;
      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, searchTerm, statusFilter, categoryFilter]);

  const stats = useMemo(
    () => ({
      total: items.length,
      inStock: items.filter(
        (item) => toInventoryDisplayStatus(item.status) === 'in_stock'
      ).length,
      outOfStock: items.filter(
        (item) => toInventoryDisplayStatus(item.status) === 'out_of_stock'
      ).length,
    }),
    [items]
  );

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredInventory.length / pageSize)),
    [filteredInventory.length, pageSize]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, pageSize]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(Math.max(1, page), totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (!detailId) {
      setIsDetailOpen(false);
      setSelectedItem(null);
      return;
    }

    const matchedItem = items.find((item) => item.id === detailId);
    if (matchedItem) {
      setSelectedItem(matchedItem);
      setIsDetailOpen(true);
      return;
    }

    if (!isLoading) {
      setSelectedItem(null);
      setIsDetailOpen(false);
    }
  }, [detailId, isLoading, items]);

  const paginatedInventory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInventory.slice(start, start + pageSize);
  }, [currentPage, filteredInventory, pageSize]);

  const handleViewDetail = (item: InventoryItem) => {
    openDetail(item.id);
  };

  const handleEditStock = (item: InventoryItem) => {
    if (!resolvedStoreId) return;
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleViewHistory = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsHistoryOpen(true);
  };

  const reloadItems = async () => {
    const result = await inventoryApi.getStockItems({ page: 1, limit: 100 });
    setItems(result);
  };

  const handleUpdateStock = async (
    item: InventoryItem,
    payload: {
      quantity: number;
      supplier: string;
      warehouseLocation?: string;
      note?: string;
    }
  ) => {
    if (item.trackInventory === false) {
      throw new Error('Sản phẩm này không theo dõi tồn kho.');
    }

    if (!resolvedStoreId) {
      throw new Error(
        storeScopeError ||
          'Tài khoản operation chưa được gán cửa hàng để nhập kho.'
      );
    }

    if (!item.productId || !item.variantId) {
      throw new Error('Không tìm thấy biến thể hợp lệ để tạo phiếu nhập kho.');
    }

    await inventoryApi.createReceipt({
      storeId: resolvedStoreId,
      supplier: payload.supplier,
      warehouseLocation: payload.warehouseLocation,
      note: payload.note,
      items: [
        {
          productId: item.productId,
          variantId: item.variantId,
          quantity: payload.quantity,
          sku: item.sku,
          variantLabel: item.variant,
        },
      ],
    });

    await reloadItems();
  };

  return (
    <>
      <Header
        title="Tồn kho và tình trạng hàng"
        subtitle="Operation theo dõi tồn kho và tạo phiếu nhập kho cho từng biến thể."
      />

      <div className="space-y-6 p-6">
        <InventoryStatsGrid stats={stats} />

        {storeScopeError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {storeScopeError}
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p className="font-medium">
              {resolvedStoreLabel
                ? `Phiếu nhập kho sẽ được tạo cho ${resolvedStoreLabel}.`
                : 'Operation có thể nhập kho trực tiếp từ màn này.'}
            </p>
            <p className="mt-1">
              Hàng nhập theo batch pre-order vẫn có thể xử lý tại{' '}
              <Link
                href="/operation/inventory/import"
                className="font-semibold underline underline-offset-4"
              >
                Nhập hàng pre-order
              </Link>
              .
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 text-sm text-slate-600">
            Đang tải tồn kho...
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start">
          <div className="w-full sm:max-w-[240px]">
            <SearchBar
              placeholder="Tìm theo tên, SKU, thương hiệu..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>

          {availableStores.length > 1 ? (
            <Select
              value={resolvedStoreId}
              onValueChange={(value) => {
                setResolvedStoreId(value);
                setResolvedStoreLabel(
                  availableStores.find((store) => store.id === value)?.name ||
                    ''
                );
              }}
              disabled={isResolvingStoreScope}
            >
              <SelectTrigger className="w-full sm:w-[260px]">
                <SelectValue placeholder="Chọn cửa hàng" />
              </SelectTrigger>
              <SelectContent>
                {availableStores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          <div className="flex justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Bộ lọc"
                  className="text-foreground/80 hover:text-foreground"
                >
                  <Filter />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Trạng thái</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <DropdownMenuRadioItem value="all">
                    Tất cả trạng thái
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="in_stock">
                    {INVENTORY_STATUS_LABELS.in_stock}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="out_of_stock">
                    {INVENTORY_STATUS_LABELS.out_of_stock}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Danh mục</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <DropdownMenuRadioItem value="all">
                    Tất cả danh mục
                  </DropdownMenuRadioItem>
                  {inventoryCategories.map((category) => (
                    <DropdownMenuRadioItem key={category} value={category}>
                      {category}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {!isLoading && !error ? (
          <>
            <InventoryTable
              items={paginatedInventory}
              onViewDetail={handleViewDetail}
              onEditStock={handleEditStock}
              onViewHistory={handleViewHistory}
              historyEnabled={false}
              stockEditEnabled={
                Boolean(resolvedStoreId) && !isResolvingStoreScope
              }
              stockEditLabel="Nhập kho"
            />

            {filteredInventory.length > 0 && totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-sm text-slate-700">
                <p>
                  Trang <span className="font-semibold">{currentPage}</span>/
                  {totalPages}{' '}
                  <span className="text-slate-500">
                    ({filteredInventory.length} dòng tồn kho)
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) =>
                      setPageSize(
                        Number(value) as (typeof PAGE_SIZE_OPTIONS)[number]
                      )
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="20 / trang" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={String(option)}>
                          {option} / trang
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage <= 1}
                  >
                    Trang trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage >= totalPages}
                  >
                    Trang sau
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}

        <InventoryDetailModal
          item={selectedItem}
          open={isDetailOpen}
          onOpenChange={(open) => {
            setIsDetailOpen(open);
            if (open) return;
            if (detailId) {
              closeDetail();
              return;
            }
            setSelectedItem(null);
          }}
        />

        <InventoryEditModal
          item={selectedItem}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          storeLabel={resolvedStoreLabel}
          onUpdate={handleUpdateStock}
        />

        <InventoryHistoryModal
          item={selectedItem}
          entries={[]}
          open={isHistoryOpen}
          onOpenChange={setIsHistoryOpen}
        />
      </div>
    </>
  );
};

export default Inventory;
