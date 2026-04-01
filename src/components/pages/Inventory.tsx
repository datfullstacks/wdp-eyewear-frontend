'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import inventoryApi from '@/api/inventory';
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

    if (!item.productId || !item.variantId) {
      throw new Error('Khong tim thay bien the hop le de tao phieu nhap kho.');
    }

    await inventoryApi.createReceipt({
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
        title="Quan ly kho"
        subtitle="Operation theo doi ton hien tai, vi tri kho va chi ghi nhan nhap kho thu cong cho cac truong hop dieu chinh."
      />

      <div className="space-y-6 p-6">
        <InventoryStatsGrid stats={stats} />

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-medium">
            Man nay dung de quan ly ton hien tai, xem vi tri kho va ghi nhan
            nhap kho thu cong khi can dieu chinh.
          </p>
          <p className="mt-1">
            Luong nhap hang pre-order duoc xu ly rieng tai{' '}
            <Link
              href="/operation/inventory/import"
              className="font-semibold underline underline-offset-4"
            >
              Nhap hang pre-order
            </Link>
            .
          </p>
        </div>

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
                    {INVENTORY_STATUS_LABELS.in_stock}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="out_of_stock">
                    {INVENTORY_STATUS_LABELS.out_of_stock}
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
              stockEditEnabled
              stockEditLabel="Nhap kho thu cong"
            />

            {filteredInventory.length > 0 && totalPages > 1 ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-sm text-slate-700">
                <p>
                  Trang <span className="font-semibold">{currentPage}</span>/
                  {totalPages}{' '}
                  <span className="text-slate-500">
                    ({filteredInventory.length} dong ton kho)
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <select
                    className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    value={String(pageSize)}
                    onChange={(event) =>
                      setPageSize(
                        Number(event.target.value) as (typeof PAGE_SIZE_OPTIONS)[number]
                      )
                    }
                  >
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option} / trang
                      </option>
                    ))}
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage <= 1}
                  >
                    Trang truoc
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
