'use client';
import { useState } from 'react';

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

const Returns = () => {
  const [requests] = useState<ReturnRequest[]>(mockReturnRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [detailModal, setDetailModal] = useState<ReturnRequest | null>(null);
  const [approveModal, setApproveModal] = useState<ReturnRequest | null>(null);
  const [rejectModal, setRejectModal] = useState<ReturnRequest | null>(null);
  const [processModal, setProcessModal] = useState<ReturnRequest | null>(null);
  const [contactModal, setContactModal] = useState<ReturnRequest | null>(null);

  const filteredRequests = requests.filter((request) => {
    const matchesSearch =
      request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.phone.includes(searchTerm);
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    const matchesStatus =
      statusFilter === 'all' || request.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleApprove = () => {
    console.log('Approving request:', approveModal?.id);
    setApproveModal(null);
  };

  const handleReject = (reason: string) => {
    console.log('Rejecting request:', rejectModal?.id, 'Reason:', reason);
    setRejectModal(null);
  };

  const handleProcess = (action: string, notes: string) => {
    console.log(
      'Processing request:',
      processModal?.id,
      'Action:',
      action,
      'Notes:',
      notes
    );
    setProcessModal(null);
  };

  return (
    <>
      <Header
        title="Yêu cầu Đổi/Trả/Bảo hành"
        subtitle="Quản lý và xử lý các yêu cầu đổi hàng, trả hàng và bảo hành từ khách hàng"
      />
      <div className="space-y-6 p-6">

        <ReturnsStatsGrid requests={requests} />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
          <div className="w-full sm:max-w-[240px]">
            <SearchBar
              placeholder="Tìm theo mã yêu cầu, mã đơn, tên hoặc SĐT..."
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
                <DropdownMenuLabel>Loại yêu cầu</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                >
                  <DropdownMenuRadioItem value="all">
                    Tất cả loại
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="exchange">
                    Đổi hàng
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="return">
                    Trả hàng
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="warranty">
                    Bảo hành
                  </DropdownMenuRadioItem>
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
                  <DropdownMenuRadioItem value="pending">
                    Chờ xử lý
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="reviewing">
                    Đang xem xét
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="approved">
                    Đã duyệt
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="processing">
                    Đang xử lý
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="completed">
                    Hoàn thành
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="rejected">
                    Từ chối
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <ReturnsTable
          requests={filteredRequests}
          onDetail={setDetailModal}
          onApprove={setApproveModal}
          onReject={setRejectModal}
          onProcess={setProcessModal}
          onContact={setContactModal}
        />
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
