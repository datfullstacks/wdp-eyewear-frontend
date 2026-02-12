'use client';
import { useState } from 'react';

import { Header } from '@/components/organisms/Header';
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
import { Filter, CheckCircle2, ClipboardList } from 'lucide-react';
import {
  ShipmentForHandover,
  HandoverBatch,
  HandoverCarrierType,
} from '@/types/handover';
import {
  mockHandoverShipments,
  mockHandoverBatches,
} from '@/data/handoverData';
import {
  HandoverStatsGrid,
  HandoverShipmentGroups,
  HandoverBatchHistory,
  CreateBatchModal,
  HandoverConfirmModal,
  HandoverDetailModal,
  HandoverPrintModal,
} from '@/components/organisms/handover';
import { Card, CardContent } from '@/components/atoms';

const ShippingHandover = () => {
  const [shipments] = useState<ShipmentForHandover[]>(mockHandoverShipments);
  const [batches] = useState<HandoverBatch[]>(mockHandoverBatches);
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCarrier, setFilterCarrier] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  // Modals
  const [createBatchModal, setCreateBatchModal] = useState(false);
  const [handoverModal, setHandoverModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [printManifestModal, setPrintManifestModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<HandoverBatch | null>(
    null
  );

  // Form states
  const [carrierStaffName, setCarrierStaffName] = useState('');
  const [handoverNotes, setHandoverNotes] = useState('');

  const readyShipments = shipments.filter((s) => s.status === 'ready');
  const pendingShipments = shipments.filter((s) => s.status === 'pending');

  const filteredShipments = readyShipments.filter((shipment) => {
    const matchesSearch =
      shipment.trackingNumber
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCarrier =
      filterCarrier === 'all' || shipment.carrier === filterCarrier;
    return matchesSearch && matchesCarrier;
  });

  const groupedByCarrier = filteredShipments.reduce(
    (acc, shipment) => {
      if (!acc[shipment.carrier]) {
        acc[shipment.carrier] = [];
      }
      acc[shipment.carrier].push(shipment);
      return acc;
    },
    {} as Record<string, ShipmentForHandover[]>
  );

  const toggleSelectShipment = (id: string) => {
    setSelectedShipments((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const selectAllByCarrier = (carrier: HandoverCarrierType) => {
    const carrierShipmentIds = (groupedByCarrier[carrier] || []).map(
      (s) => s.id
    );
    const allSelected = carrierShipmentIds.every((id) =>
      selectedShipments.includes(id)
    );

    if (allSelected) {
      setSelectedShipments((prev) =>
        prev.filter((id) => !carrierShipmentIds.includes(id))
      );
    } else {
      setSelectedShipments((prev) => [
        ...new Set([...prev, ...carrierShipmentIds]),
      ]);
    }
  };

  const selectedShipmentDetails = shipments.filter((s) =>
    selectedShipments.includes(s.id)
  );
  const selectedTotalWeight = selectedShipmentDetails.reduce(
    (sum, s) => sum + s.weight,
    0
  );
  const selectedTotalPackages = selectedShipmentDetails.reduce(
    (sum, s) => sum + s.packageCount,
    0
  );

  return (
    <>
      <Header
        title="Bàn giao vận chuyển"
        subtitle="Quản lý bàn giao kiện hàng cho nhà vận chuyển"
      />

      <div className="space-y-6 p-6">
        {/* Stats */}
        <HandoverStatsGrid
          pendingCount={pendingShipments.length}
          readyCount={readyShipments.length}
          confirmedCount={
            batches.filter((b) => b.status === 'confirmed').length
          }
          waitingConfirmCount={
            batches.filter((b) => b.status === 'ready').length
          }
        />

        {/* Tabs */}
        <div className="border-border flex gap-2 border-b">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'pending'
                ? 'text-primary border-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Chờ bàn giao ({readyShipments.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-primary border-primary border-b-2'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Lịch sử bàn giao
          </button>
        </div>

        {activeTab === 'pending' ? (
          <>
            {/* Search and Filter */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
              <div className="w-full sm:max-w-[240px]">
                <SearchBar
                  placeholder="Tìm theo mã vận đơn, đơn hàng, khách hàng..."
                  value={searchQuery}
                  onChange={setSearchQuery}
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
                    <DropdownMenuLabel>Nhà vận chuyển</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={filterCarrier}
                      onValueChange={setFilterCarrier}
                    >
                      <DropdownMenuRadioItem value="all">
                        Tất cả NVC
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="GHN">
                        GHN
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="GHTK">
                        GHTK
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="Viettel Post">
                        Viettel Post
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="J&T">
                        J&T Express
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="Ninja Van">
                        Ninja Van
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Trạng thái</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={activeTab}>
                      <DropdownMenuRadioItem value="pending">
                        Chờ bàn giao
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="history">
                        Lịch sử bàn giao
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Selected Summary */}
            {selectedShipments.length > 0 && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="text-primary h-5 w-5" />
                        <span className="font-medium">
                          Đã chọn {selectedShipments.length} vận đơn
                        </span>
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {selectedTotalPackages} kiện •{' '}
                        {selectedTotalWeight.toFixed(1)} kg
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedShipments([])}
                      >
                        Bỏ chọn tất cả
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setCreateBatchModal(true)}
                      >
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Tạo phiếu bàn giao
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Grouped Shipments */}
            <HandoverShipmentGroups
              groupedByCarrier={groupedByCarrier}
              selectedShipments={selectedShipments}
              onToggleShipment={toggleSelectShipment}
              onSelectAllByCarrier={selectAllByCarrier}
            />
          </>
        ) : (
          <HandoverBatchHistory
            batches={batches}
            onViewDetail={(batch) => {
              setSelectedBatch(batch);
              setDetailModal(true);
            }}
            onPrintManifest={(batch) => {
              setSelectedBatch(batch);
              setPrintManifestModal(true);
            }}
            onHandover={(batch) => {
              setSelectedBatch(batch);
              setCarrierStaffName('');
              setHandoverNotes('');
              setHandoverModal(true);
            }}
          />
        )}
      </div>

      {/* Modals */}
      <CreateBatchModal
        open={createBatchModal}
        onOpenChange={setCreateBatchModal}
        selectedShipments={selectedShipmentDetails}
        totalWeight={selectedTotalWeight}
        totalPackages={selectedTotalPackages}
        notes={handoverNotes}
        onNotesChange={setHandoverNotes}
        onSubmit={() => {
          setCreateBatchModal(false);
          setSelectedShipments([]);
        }}
      />

      <HandoverConfirmModal
        open={handoverModal}
        onOpenChange={setHandoverModal}
        batch={selectedBatch}
        carrierStaffName={carrierStaffName}
        onCarrierStaffNameChange={setCarrierStaffName}
        notes={handoverNotes}
        onNotesChange={setHandoverNotes}
        onSubmit={() => setHandoverModal(false)}
      />

      <HandoverDetailModal
        open={detailModal}
        onOpenChange={setDetailModal}
        batch={selectedBatch}
        onPrintManifest={() => {
          setDetailModal(false);
          if (selectedBatch) {
            setPrintManifestModal(true);
          }
        }}
      />

      <HandoverPrintModal
        open={printManifestModal}
        onOpenChange={setPrintManifestModal}
        batch={selectedBatch}
        onPrint={() => setPrintManifestModal(false)}
      />
    </>
  );
};

export default ShippingHandover;
