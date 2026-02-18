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

const Refunds = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isProcessOpen, setIsProcessOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const filteredRefunds = mockRefunds.filter((refund) => {
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
  });

  const stats = getRefundStats(mockRefunds);

  const openModal = (refund: RefundRequest, setter: (v: boolean) => void) => {
    setSelectedRefund(refund);
    setter(true);
  };

  return (
    <>
      <Header
        title="Quản lý Hoàn tiền"
        subtitle="Xử lý các yêu cầu hoàn tiền từ khách hàng"
      />
      <div className="space-y-6 p-6">
        <RefundStatsGrid stats={stats} />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
          <div className="w-full sm:max-w-[240px]">
            <SearchBar
              placeholder="Tìm theo mã hoàn tiền, mã đơn, tên KH, SĐT..."
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
                    Đang hoàn tiền
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="completed">
                    Hoàn thành
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="rejected">
                    Từ chối
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Phương thức</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={methodFilter}
                  onValueChange={setMethodFilter}
                >
                  <DropdownMenuRadioItem value="all">
                    Tất cả PT
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="bank_transfer">
                    Chuyển khoản
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="card">
                    Thẻ tín dụng
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="cash">
                    Tiền mặt
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="wallet">
                    Ví điện tử
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <RefundTable
          refunds={filteredRefunds}
          onDetail={(r) => openModal(r, setIsDetailOpen)}
          onApprove={(r) => openModal(r, setIsApproveOpen)}
          onReject={(r) => openModal(r, setIsRejectOpen)}
          onProcess={(r) => openModal(r, setIsProcessOpen)}
          onContact={(r) => openModal(r, setIsContactOpen)}
        />
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
