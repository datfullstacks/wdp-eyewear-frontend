'use client';
import { useEffect, useMemo, useState } from 'react';
import { SearchBar } from '@/components/molecules/SearchBar';
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
import { Filter } from 'lucide-react';
import { InventoryItem } from '@/types/inventory';
import { mockHistoryEntries } from '@/data/inventoryData';
import inventoryApi from '@/api/inventory';
import {
  InventoryTable,
  InventoryDetailModal,
  InventoryEditModal,
  InventoryHistoryModal,
  InventoryStatsGrid,
} from '@/components/organisms/inventory';
import { Header } from '@/components/organisms/Header';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
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
        const result = await inventoryApi.getStockItems({ page: 1, limit: 100 });
        if (!isMounted) return;
        setItems(result);
      } catch (err) {
        if (!isMounted) return;
        const message =
          (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
            ?.message ||
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

  const inventoryCategories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const filteredInventory = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase());
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
      inStock: items.filter((i) => i.status === 'in_stock').length,
      lowStock: items.filter((i) => i.status === 'low_stock').length,
      outOfStock: items.filter((i) => i.status === 'out_of_stock').length,
    }),
    [items]
  );

  const handleViewDetail = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDetailOpen(true);
  };

  const handleEditStock = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsEditOpen(true);
  };

  const handleViewHistory = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsHistoryOpen(true);
  };

  const handleUpdateStock = async (item: InventoryItem, newStock: number, reason: string) => {
    await inventoryApi.updateVariantStock({
      rowId: item.id,
      sku: item.sku,
      stock: newStock,
      reason,
    });

    const result = await inventoryApi.getStockItems({ page: 1, limit: 100 });
    setItems(result);
  };

  return (
    <>
      <Header
        title="Tồn kho & Tình trạng hàng"
        subtitle="Quản lý và theo dõi tình trạng tồn kho sản phẩm"
      />
      <div className="space-y-6 p-6">
        {/* Stats */}
        <InventoryStatsGrid stats={stats} />

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 text-sm text-slate-600">
            Đang tải tồn kho...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
            {error}
          </div>
        ) : null}

        {/* Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
          <div className="w-full sm:max-w-[240px]">
            <SearchBar
              placeholder="Tìm theo tên, SKU, thương hiệu..."
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
                    Còn hàng
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="low_stock">
                    Sắp hết
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="out_of_stock">
                    Hết hàng
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="overstock">
                    Tồn nhiều
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
                  {inventoryCategories.map((cat) => (
                    <DropdownMenuRadioItem key={cat} value={cat}>
                      {cat}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Inventory Table */}
        {!isLoading && !error ? (
          <InventoryTable
            items={filteredInventory}
            onViewDetail={handleViewDetail}
            onEditStock={handleEditStock}
            onViewHistory={handleViewHistory}
          />
        ) : null}

        {/* Modals */}
        <InventoryDetailModal
          item={selectedItem}
          open={isDetailOpen}
          onOpenChange={setIsDetailOpen}
        />

        <InventoryEditModal
          item={selectedItem}
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          onUpdate={handleUpdateStock}
        />

        <InventoryHistoryModal
          item={selectedItem}
          entries={mockHistoryEntries}
          open={isHistoryOpen}
          onOpenChange={setIsHistoryOpen}
        />
      </div>
    </>
  );
};

export default Inventory;
