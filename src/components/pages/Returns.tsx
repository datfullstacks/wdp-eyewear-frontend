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
import { ReturnRequest } from '@/types/returns';
import { mockReturnRequests } from '@/data/returnsData';
import {
  ReturnsStatsGrid,
  ReturnsTable,
  ReturnDetailModal,
  ReturnApproveModal,
  ReturnRejectModal,
  ReturnProcessModal,
  ReturnContactModal,
} from '@/components/organisms/returns';
import { Header } from '@/components/organisms/Header';

const ITEMS_PER_PAGE = 10;

const Returns = () => {
  const [requests] = useState<ReturnRequest[]>(mockReturnRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [detailModal, setDetailModal] = useState<ReturnRequest | null>(null);
  const [approveModal, setApproveModal] = useState<ReturnRequest | null>(null);
  const [rejectModal, setRejectModal] = useState<ReturnRequest | null>(null);
  const [processModal, setProcessModal] = useState<ReturnRequest | null>(null);
  const [contactModal, setContactModal] = useState<ReturnRequest | null>(null);

  const filteredRequests = useMemo(
    () =>
      requests.filter((request) => {
        const matchesSearch =
          request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.phone.includes(searchTerm);
        const matchesType = typeFilter === 'all' || request.type === typeFilter;
        const matchesStatus =
          statusFilter === 'all' || request.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
      }),
    [requests, searchTerm, typeFilter, statusFilter]
  );

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
  const paginatedRequests = useMemo(
    () =>
      filteredRequests.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      ),
    [filteredRequests, currentPage]
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, statusFilter]);

  const handleApprove = () => {
    console.log('Approving request:', approveModal?.id);
    setApproveModal(null);
  };

  const handleReject = (reason: string) => {
    console.log('Rejecting request:', rejectModal?.id, reason);
    setRejectModal(null);
  };

  const handleProcess = (action: string, notes: string) => {
    console.log('Processing request:', processModal?.id, action, notes);
    setProcessModal(null);
  };

  return (
    <>
      <Header
        title="Yeu cau Doi/Tra/Bao hanh"
        subtitle="Quan ly va xu ly cac yeu cau doi hang, tra hang va bao hanh"
      />
      <div className="space-y-6 p-6">
        <ReturnsStatsGrid requests={requests} />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
          <div className="w-full sm:max-w-[240px]">
            <SearchBar
              placeholder="Tim theo ma yeu cau, ma don, ten hoac SDT..."
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
                <DropdownMenuLabel>Loai yeu cau</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                >
                  <DropdownMenuRadioItem value="all">Tat ca loai</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="exchange">Doi hang</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="return">Tra hang</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="warranty">Bao hanh</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Trang thai</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <DropdownMenuRadioItem value="all">Tat ca trang thai</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="pending">Dang xu ly</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="reviewing">Dang xem xet</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="approved">Da duyet</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="processing">Dang thuc hien</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="completed">Hoan thanh</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="rejected">Tu choi</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <ReturnsTable
          requests={paginatedRequests}
          onDetail={setDetailModal}
          onApprove={setApproveModal}
          onReject={setRejectModal}
          onProcess={setProcessModal}
          onContact={setContactModal}
        />

        {filteredRequests.length > 0 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={filteredRequests.length}
            />
          </div>
        )}
      </div>

      <ReturnDetailModal
        request={detailModal}
        onClose={() => setDetailModal(null)}
      />
      <ReturnApproveModal
        request={approveModal}
        onClose={() => setApproveModal(null)}
        onApprove={handleApprove}
      />
      <ReturnRejectModal
        request={rejectModal}
        onClose={() => setRejectModal(null)}
        onReject={handleReject}
      />
      <ReturnProcessModal
        request={processModal}
        onClose={() => setProcessModal(null)}
        onProcess={handleProcess}
      />
      <ReturnContactModal
        request={contactModal}
        onClose={() => setContactModal(null)}
      />
    </>
  );
};

export default Returns;
