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
import { RefreshCw, Printer, Plus, Filter } from 'lucide-react';
import { carriers, FulfillmentShipment } from '@/types/fulfillment';
import {
  calculateFulfillmentStats,
  mockFulfillmentShipments,
  mockOrdersToShip,
} from '@/data/fulfillmentData';
import { FulfillmentDetailModal } from '@/components/organisms/fulfillment/FulfillmentDetailModal';
import { CreateShipmentModal } from '@/components/organisms/fulfillment/CreateShipmentModal';
import { PrintLabelsModal } from '@/components/organisms/fulfillment/PrintLabelsModal';
import { FulfillmentStatsGrid } from '@/components/organisms/fulfillment/FulfillmentStatsGrid';
import { OrdersToShipTable } from '@/components/organisms/fulfillment/OrdersToShipTable';
import { FulfillmentShipmentTable } from '@/components/organisms/fulfillment/FulfillmentShipmentTable';

const Shipping = () => {
  const [shipments, setShipments] = useState<FulfillmentShipment[]>(
    mockFulfillmentShipments
  );
  const [ordersToShip] = useState(mockOrdersToShip);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [carrierFilter, setCarrierFilter] = useState('all');
  const [selectedShipment, setSelectedShipment] =
    useState<FulfillmentShipment | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    carrier: '',
    weight: '0.5',
    notes: '',
  });

  const stats = calculateFulfillmentStats(shipments, ordersToShip);

  const filteredShipments = shipments.filter((shipment) => {
    const matchesSearch =
      shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.trackingNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      shipment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.customerPhone.includes(searchTerm);
    const matchesStatus =
      statusFilter === 'all' || shipment.status === statusFilter;
    const matchesCarrier =
      carrierFilter === 'all' ||
      shipment.carrier.toLowerCase().includes(carrierFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesCarrier;
  });

  const handleViewDetail = (shipment: FulfillmentShipment) => {
    setSelectedShipment(shipment);
    setDetailModalOpen(true);
  };

  const handleCopyTracking = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
  };

  const handleCreateShipment = () => {
    if (selectedOrders.length === 0) {
      return;
    }
    if (!createForm.carrier) {
      return;
    }

    const newShipments: FulfillmentShipment[] = selectedOrders.map(
      (orderId, index) => {
        const order = ordersToShip.find((o) => o.id === orderId)!;
        const carrierPrefix =
          createForm.carrier === 'ghn'
            ? 'GHN'
            : createForm.carrier === 'ghtk'
              ? 'GHTK'
              : createForm.carrier === 'viettelpost'
                ? 'VTP'
                : 'JT';
        return {
          id: `SHP-${String(shipments.length + index + 1).padStart(3, '0')}`,
          orderId: order.orderId,
          trackingNumber: `${carrierPrefix}${Date.now()}${index}VN`,
          carrier:
            carriers
              .find((c) => c.id === createForm.carrier)
              ?.name.split(' - ')[0] || createForm.carrier,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          address: order.address,
          district: order.district,
          city: order.city,
          products: order.products,
          weight: parseFloat(createForm.weight),
          codAmount: order.paymentMethod === 'cod' ? order.total : 0,
          shippingFee: 25000,
          status: 'pending',
          createdAt: new Date().toLocaleString('vi-VN'),
          estimatedDelivery: new Date(
            Date.now() + 2 * 24 * 60 * 60 * 1000
          ).toLocaleDateString('vi-VN'),
          notes: order.notes || createForm.notes,
        };
      }
    );

    setShipments([...newShipments, ...shipments]);
    setSelectedOrders([]);
    setCreateForm({ carrier: '', weight: '0.5', notes: '' });
    setCreateModalOpen(false);
  };

  const handlePrintLabels = () => {
    setPrintModalOpen(false);
  };

  const handleRefreshStatus = () => {};

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleAllOrders = () => {
    if (selectedOrders.length === ordersToShip.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(ordersToShip.map((o) => o.id));
    }
  };

  return (
    <>
      <Header
        title="Quản lý Vận đơn"
        subtitle="Tạo vận đơn, in nhãn và theo dõi giao hàng"
      />
      <div className="space-y-6 p-6">
        {/* Stats */}
        <FulfillmentStatsGrid stats={stats} />

        {/* Filters & Actions */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
            <div className="w-full sm:max-w-[240px]">
              <SearchBar
                placeholder="Tìm mã đơn, tracking, khách hàng..."
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
                      Tất cả
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="pending">
                      Chờ lấy hàng
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="picked_up">
                      Đã lấy hàng
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="in_transit">
                      Đang vận chuyển
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="delivered">
                      Đã giao
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="failed">
                      Giao thất bại
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="returned">
                      Hoàn hàng
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Đơn vị VC</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={carrierFilter}
                    onValueChange={setCarrierFilter}
                  >
                    <DropdownMenuRadioItem value="all">
                      Tất cả
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="ghn">
                      GHN
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="ghtk">
                      GHTK
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="viettel">
                      Viettel Post
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="jt">
                      J&T Express
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={handleRefreshStatus}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Đồng bộ
            </Button>
            <Button variant="outline" onClick={() => setPrintModalOpen(true)}>
              <Printer className="mr-2 h-4 w-4" />
              In nhãn
            </Button>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo vận đơn
            </Button>
          </div>
        </div>

        {/* Orders waiting to ship */}
        <OrdersToShipTable
          orders={ordersToShip}
          selectedOrders={selectedOrders}
          onToggleOrder={toggleOrderSelection}
          onToggleAll={toggleAllOrders}
          onCreateShipment={() => setCreateModalOpen(true)}
        />

        {/* Shipments list */}
        <FulfillmentShipmentTable
          shipments={filteredShipments}
          onViewDetail={handleViewDetail}
          onCopyTracking={handleCopyTracking}
        />
      </div>

      {/* Modals */}
      <FulfillmentDetailModal
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        shipment={selectedShipment}
      />

      <CreateShipmentModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        selectedCount={selectedOrders.length}
        form={createForm}
        onFormChange={setCreateForm}
        onSubmit={handleCreateShipment}
      />

      <PrintLabelsModal
        open={printModalOpen}
        onOpenChange={setPrintModalOpen}
        pendingCount={stats.pending}
        totalCount={shipments.length}
        onPrint={handlePrintLabels}
      />
    </>
  );
};

export default Shipping;
