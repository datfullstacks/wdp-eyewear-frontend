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
import { InventoryItem } from '@/types/inventory';

const PAGE_SIZE_OPTIONS = [20, 50, 100] as const;

const Inventory = () => {
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
        const result = await inventoryApi.getStockItems({ page: 1, limit: 100 });
        if (!isMounted) return;
        setItems(result);
      } catch (err) {
        if (!isMounted) return;
        const message =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (err as { message?: string })?.message ||
          'Khong the tai ton kho. Vui long thu lai.';
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
          throw new Error('Khong xac dinh duoc tai khoan dang nhap.');
        }

        const currentUser = await userApi.getById(currentUserId);
        const scope = currentUser.storeAccess;
        const scopeStores = Array.isArray(scope?.stores)
          ? scope.stores
              .map((store) => ({
                id: String(store?.id || '').trim(),
                name: String(store?.name || '').trim() || String(store?.id || '').trim(),
              }))
              .filter((store) => store.id)
          : [];

        const storesById = new Map(scopeStores.map((store) => [store.id, store]));
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
            'Tai khoan operation chua duoc gan cua hang de nhap kho.'
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
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
          (err as { message?: string })?.message ||
          'Khong tai duoc pham vi cua hang cua tai khoan operation.';
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
    const categories = new Set(items.map((item) => item.category).filter(Boolean));
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
        statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [items, searchTerm, statusFilter, categoryFilter]);

  const stats = useMemo(
    () => ({
      total: items.length,
      inStock: items.filter((item) => item.trackInventory !== false && item.status === 'in_stock')
        .length,
      lowStock: items.filter((item) => item.trackInventory !== false && item.status === 'low_stock')
        .length,
      outOfStock: items.filter(
        (item) => item.trackInventory !== false && item.status === 'out_of_stock'
      )
        .length,
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

  const paginatedInventory = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInventory.slice(start, start + pageSize);
  }, [currentPage, filteredInventory, pageSize]);

  const handleViewDetail = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
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
      throw new Error('San pham nay khong theo doi ton kho.');
    }

    if (!resolvedStoreId) {
      throw new Error(
        storeScopeError || 'Tai khoan operation chua duoc gan cua hang de nhap kho.'
      );
    }

    if (!item.productId || !item.variantId) {
      throw new Error('Khong tim thay bien the hop le de tao phieu nhap kho.');
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
        title="Ton kho va tinh trang hang"
        subtitle="Operation theo doi ton kho va tao phieu nhap kho cho tung bien the."
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
                ? `Phieu nhap kho se duoc tao cho ${resolvedStoreLabel}.`
                : 'Operation co the nhap kho truc tiep tu man nay.'}
            </p>
            <p className="mt-1">
              Hang nhap theo batch pre-order van co the xu ly tai{' '}
              <Link
                href="/operation/inventory/import"
                className="font-semibold underline underline-offset-4"
              >
                Nhap hang pre-order
              </Link>
              .
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 text-sm text-slate-600">
            Dang tai ton kho...
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
              placeholder="Tim theo ten, SKU, thuong hieu..."
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
                  availableStores.find((store) => store.id === value)?.name || ''
                );
              }}
              disabled={isResolvingStoreScope}
            >
              <SelectTrigger className="w-full sm:w-[260px]">
                <SelectValue placeholder="Chon cua hang" />
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
                  aria-label="Bo loc"
                  className="text-foreground/80 hover:text-foreground"
                >
                  <Filter />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Trang thai</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <DropdownMenuRadioItem value="all">
                    Tat ca trang thai
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="in_stock">
                    Con hang
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="low_stock">
                    Sap het
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="out_of_stock">
                    Het hang
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="overstock">
                    Ton nhieu
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="not_tracked">
                    Khong theo doi ton
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>

                <DropdownMenuSeparator />

                <DropdownMenuLabel>Danh muc</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <DropdownMenuRadioItem value="all">
                    Tat ca danh muc
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
              stockEditEnabled={Boolean(resolvedStoreId) && !isResolvingStoreScope}
              stockEditLabel="Nhap kho"
            />

            {filteredInventory.length > 0 && totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-sm text-slate-700">
                <p>
                  Trang <span className="font-semibold">{currentPage}</span>/{totalPages}{' '}
                  <span className="text-slate-500">
                    ({filteredInventory.length} dong ton kho)
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <Select
                    value={String(pageSize)}
                    onValueChange={(value) =>
                      setPageSize(Number(value) as (typeof PAGE_SIZE_OPTIONS)[number])
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
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage <= 1}
                  >
                    Trang truoc
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
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
          onOpenChange={setIsDetailOpen}
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
