'use client';
import { useState, useMemo } from 'react';
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
import {
  mockInventory,
  mockHistoryEntries,
  inventoryCategories,
} from '@/data/inventoryData';
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
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const filteredInventory = useMemo(() => {
    return mockInventory.filter((item) => {
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
  }, [searchTerm, statusFilter, categoryFilter]);

  const stats = useMemo(
    () => ({
      total: mockInventory.length,
      inStock: mockInventory.filter((i) => i.status === 'in_stock').length,
      lowStock: mockInventory.filter((i) => i.status === 'low_stock').length,
      outOfStock: mockInventory.filter((i) => i.status === 'out_of_stock')
        .length,
    }),
    []
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

  const handleUpdateStock = () =>
    // item: InventoryItem,
    // newStock: number,
    // reason: string
    {
      setIsEditOpen(false);
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
        <InventoryTable
          items={filteredInventory}
          onViewDetail={handleViewDetail}
          onEditStock={handleEditStock}
          onViewHistory={handleViewHistory}
        />

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
