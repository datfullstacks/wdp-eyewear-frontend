'use client';
import { useState } from 'react';

import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/molecules/SearchBar';
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
  TrackingStatsGrid,
  ShipmentTable,
  ShipmentDetailModal,
  CODReconciliationTable,
  CODDetailModal,
  SyncModal,
} from '@/components/organisms/shipping';
import { Shipment, CODReconciliation } from '@/types/shipping';
import { mockShipments, mockCODReconciliations } from '@/data/shippingData';
import { Truck, CreditCard, Filter } from 'lucide-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const ShippingTracking = () => {
  const [activeTab, setActiveTab] = useState('tracking');
  const [searchQuery, setSearchQuery] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(
    null
  );
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [codDetailModalOpen, setCodDetailModalOpen] = useState(false);
  const [selectedCOD, setSelectedCOD] = useState<CODReconciliation | null>(
    null
  );
  const filteredShipments = mockShipments.filter((shipment) => {
    const matchesSearch =
      shipment.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customerPhone.includes(searchQuery);
    const matchesCarrier =
      carrierFilter === 'all' || shipment.carrier === carrierFilter;
    const matchesStatus =
      statusFilter === 'all' || shipment.status === statusFilter;
    return matchesSearch && matchesCarrier && matchesStatus;
  });

  const stats = {
    picking: mockShipments.filter((s) => s.status === 'picking').length,
    inTransit: mockShipments.filter(
      (s) => s.status === 'in_transit' || s.status === 'delivering'
    ).length,
    delivered: mockShipments.filter((s) => s.status === 'delivered').length,
    failed: mockShipments.filter(
      (s) => s.status === 'failed' || s.status === 'returned'
    ).length,
    pendingCOD: formatCurrency(
      mockCODReconciliations
        .filter((c) => c.status === 'pending' || c.status === 'confirmed')
        .reduce((sum, c) => sum + c.netAmount, 0)
    ),
  };

  const carrierOptions = [
    { value: 'GHN', label: 'GHN' },
    { value: 'GHTK', label: 'GHTK' },
    { value: 'Viettel Post', label: 'Viettel Post' },
  ];

  const statusOptions = [
    { value: 'picking', label: 'Chờ lấy' },
    { value: 'in_transit', label: 'Đang vận chuyển' },
    { value: 'delivering', label: 'Đang giao' },
    { value: 'delivered', label: 'Đã giao' },
    { value: 'failed', label: 'Giao thất bại' },
    { value: 'returned', label: 'Hoàn hàng' },
  ];

  return (
    <>
      <Header
        title="Tracking & Đối soát"
        subtitle="Theo dõi vận đơn và đối soát COD với hãng vận chuyển"
      />

      <div className="space-y-6 p-6">
        {/* Stats */}
        <TrackingStatsGrid stats={stats} />

        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeTab === 'tracking' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('tracking')}
            className={
              activeTab === 'tracking' ? 'gradient-gold text-primary' : ''
            }
          >
            <Truck className="mr-2 h-4 w-4" />
            Tracking vận đơn
          </Button>
          <Button
            variant={activeTab === 'reconciliation' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('reconciliation')}
            className={
              activeTab === 'reconciliation' ? 'gradient-gold text-primary' : ''
            }
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Đối soát COD
          </Button>
        </div>

        {activeTab === 'tracking' ? (
          <>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
              <div className="w-full sm:max-w-[240px]">
                <SearchBar
                  placeholder="Tìm mã vận đơn, đơn hàng, khách hàng..."
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
                    <DropdownMenuLabel>Hãng vận chuyển</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={carrierFilter}
                      onValueChange={setCarrierFilter}
                    >
                      <DropdownMenuRadioItem value="all">
                        Tất cả hãng
                      </DropdownMenuRadioItem>
                      {carrierOptions.map((carrier) => (
                        <DropdownMenuRadioItem
                          key={carrier.value}
                          value={carrier.value}
                        >
                          {carrier.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Trạng thái</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <DropdownMenuRadioItem value="all">
                        Tất cả trạng thái
                      </DropdownMenuRadioItem>
                      {statusOptions.map((status) => (
                        <DropdownMenuRadioItem
                          key={status.value}
                          value={status.value}
                        >
                          {status.label}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <ShipmentTable
              shipments={filteredShipments}
              onViewDetail={(shipment) => {
                setSelectedShipment(shipment);
                setDetailModalOpen(true);
              }}
            />
          </>
        ) : (
          <div className="glass-card overflow-hidden rounded-xl">
            <CODReconciliationTable
              reconciliations={mockCODReconciliations}
              onViewDetail={(cod) => {
                setSelectedCOD(cod);
                setCodDetailModalOpen(true);
              }}
            />
          </div>
        )}

        {/* Modals */}
        <ShipmentDetailModal
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          shipment={selectedShipment}
        />

        <SyncModal
          open={syncModalOpen}
          onOpenChange={setSyncModalOpen}
          onSync={() => setSyncModalOpen(false)}
        />

        <CODDetailModal
          open={codDetailModalOpen}
          onOpenChange={setCodDetailModalOpen}
          cod={selectedCOD}
        />
      </div>
    </>
  );
};

export default ShippingTracking;
