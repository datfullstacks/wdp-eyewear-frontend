'use client';

import { useEffect, useMemo, useState } from 'react';

import { SearchBar } from '@/components/molecules/SearchBar';
import { Pagination } from '@/components/molecules/Pagination';
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
import { RefundRequest } from '@/types/refund';
import { getRefundStats, mockRefunds } from '@/data/refundData';
import {
  RefundApproveModal,
  RefundContactModal,
  RefundDetailModal,
  RefundProcessModal,
  RefundRejectModal,
  RefundStatsGrid,
  RefundTable,
} from '@/components/organisms/refund';
import { Header } from '@/components/organisms/Header';

const ITEMS_PER_PAGE = 10;

const Refunds = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const filteredRefunds = useMemo(
    () =>
      mockRefunds.filter((refund) => {
        const matchesSearch =
          refund.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          refund.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          refund.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          refund.customerPhone.includes(searchTerm);
        const matchesStatus =
          statusFilter === 'all' || refund.status === statusFilter;
        const matchesMethod =
          methodFilter === 'all' || refund.method === methodFilter;
        return matchesSearch && matchesStatus && matchesMethod;
      }),
    [searchTerm, statusFilter, methodFilter]
  );

  const stats = useMemo(() => getRefundStats(mockRefunds), []);
  const totalPages = Math.max(1, Math.ceil(filteredRefunds.length / ITEMS_PER_PAGE));
  const paginatedRefunds = useMemo(
    () =>
      filteredRefunds.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [filteredRefunds, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, methodFilter]);

  const openModal = (refund: RefundRequest, setter: (value: boolean) => void) => {
    setSelectedRefund(refund);
    setter(true);
  };

  return (
    <>
      <Header
        title="Quan ly Hoan tien"
        subtitle="Xu ly cac yeu cau hoan tien tu khach hang"
      />
      <div className="space-y-6 p-6">
        <RefundStatsGrid stats={stats} />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
          <div className="w-full sm:max-w-[240px]">
            <SearchBar
              placeholder="Tim theo ma hoan tien, ma don, ten KH, SDT..."
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
                  <DropdownMenuRadioItem value="all">Tat ca trang thai</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="pending">Dang xu ly</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="reviewing">Dang xem xet</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="approved">Da duyet</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="processing">Dang hoan tien</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="completed">Hoan thanh</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="rejected">Tu choi</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Phuong thuc</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={methodFilter}
                  onValueChange={setMethodFilter}
                >
                  <DropdownMenuRadioItem value="all">Tat ca PT</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="bank_transfer">Chuyen khoan</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="card">The tin dung</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="cash">Tien mat</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="wallet">Vi dien tu</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <RefundTable
          refunds={paginatedRefunds}
          onDetail={(refund) => openModal(refund, setIsDetailOpen)}
          onApprove={(refund) => openModal(refund, setIsApproveOpen)}
          onReject={(refund) => openModal(refund, setIsRejectOpen)}
          onProcess={(refund) => openModal(refund, setIsProcessOpen)}
          onContact={(refund) => openModal(refund, setIsContactOpen)}
        />

        {filteredRefunds.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredRefunds.length}
            />
          </div>
        )}
      </div>

      <RefundDetailModal
        refund={selectedRefund}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />
      <RefundApproveModal
        refund={selectedRefund}
        open={isApproveOpen}
        onOpenChange={setIsApproveOpen}
      />
      <RefundRejectModal
        refund={selectedRefund}
        open={isRejectOpen}
        onOpenChange={setIsRejectOpen}
      />
      <RefundProcessModal
        refund={selectedRefund}
        open={isProcessOpen}
        onOpenChange={setIsProcessOpen}
      />
      <RefundContactModal
        refund={selectedRefund}
        open={isContactOpen}
        onOpenChange={setIsContactOpen}
      />
    </>
  );
};

export default Refunds;
