'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

import { SearchBar } from '@/components/molecules/SearchBar';
import { Header } from '@/components/organisms/Header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Filter } from 'lucide-react';

import {
  mockBatches,
  getSuppliers,
  calculateStats,
} from '@/data/preorderImportData';
import {
  ImportStatsGrid,
  ImportBatchTable,
  ImportDetailModal,
  ImportReceiveModal,
  ImportCreateModal,
} from '@/components/organisms/preorder-import';
import type { PreorderBatch } from '@/types/preorderImport';

const PreorderImport = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [supplierFilter, setSupplierFilter] = useState<string>('all');
  const [selectedBatch, setSelectedBatch] = useState<PreorderBatch | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [receiveQuantities, setReceiveQuantities] = useState<
    Record<string, number>
  >({});
  const [receiveNotes, setReceiveNotes] = useState('');

  const suppliers = getSuppliers();

  const filteredBatches = mockBatches.filter((batch) => {
    const matchesSearch =
      batch.batchCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || batch.status === statusFilter;
    const matchesSupplier =
      supplierFilter === 'all' || batch.supplier === supplierFilter;
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const stats = calculateStats(mockBatches);

  const handleOpenDetail = (batch: PreorderBatch) => {
    setSelectedBatch(batch);
    setIsDetailOpen(true);
  };

  const handleOpenReceive = (batch: PreorderBatch) => {
    setSelectedBatch(batch);
    const initialQuantities: Record<string, number> = {};
    batch.items.forEach((item) => {
      initialQuantities[item.id] = 0;
    });
    setReceiveQuantities(initialQuantities);
    setReceiveNotes('');
    setIsReceiveOpen(true);
  };

  const handleConfirmReceive = () => {
    const totalReceived = Object.values(receiveQuantities).reduce(
      (a, b) => a + b,
      0
    );
    if (totalReceived === 0) {
      return;
    }

    setIsReceiveOpen(false);
  };

  const handleCreateBatch = () => {
    setIsCreateOpen(false);
  };

  return (
    <>
      <Header
        title="Nhập hàng Pre-order"
        subtitle="Quản lý và cập nhật hàng Pre-order về kho"
      />
      <div className="space-y-6 p-6">
        <ImportStatsGrid stats={stats} />

        {/* Filters & Actions */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
            <div className="w-full sm:max-w-[240px]">
              <SearchBar
                placeholder="Tìm theo mã đợt, nhà cung cấp..."
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
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Trạng thái</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <DropdownMenuRadioItem value="all">
                      Tất cả trạng thái
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="pending">
                      Chờ xử lý
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="in_transit">
                      Đang vận chuyển
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="partial">
                      Nhận một phần
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="completed">
                      Hoàn thành
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="delayed">
                      Trễ hàng
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Nhà cung cấp</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={supplierFilter}
                    onValueChange={setSupplierFilter}
                  >
                    <DropdownMenuRadioItem value="all">
                      Tất cả NCC
                    </DropdownMenuRadioItem>
                    {suppliers.map((supplier) => (
                      <DropdownMenuRadioItem key={supplier} value={supplier}>
                        {supplier}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Tạo đợt hàng mới
            </Button>
          </div>
        </div>

        <ImportBatchTable
          batches={filteredBatches}
          onViewDetail={handleOpenDetail}
          onReceive={handleOpenReceive}
        />
      </div>

      <ImportDetailModal
        batch={selectedBatch}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onReceive={handleOpenReceive}
      />

      <ImportReceiveModal
        batch={selectedBatch}
        open={isReceiveOpen}
        onOpenChange={setIsReceiveOpen}
        receiveQuantities={receiveQuantities}
        onReceiveQuantitiesChange={setReceiveQuantities}
        receiveNotes={receiveNotes}
        onReceiveNotesChange={setReceiveNotes}
        onConfirm={handleConfirmReceive}
      />

      <ImportCreateModal
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        suppliers={suppliers}
        onConfirm={handleCreateBatch}
      />
    </>
  );
};

export default PreorderImport;
