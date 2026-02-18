'use client';

import { Header } from '@/components/organisms/Header';
import { RecentOrdersTable } from '@/components/organisms/RecentOrdersTable';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusFilters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <>
      <Header
        title="Đơn hàng"
        subtitle="Quản lý đơn hàng khách mua"
        showAddButton
        addButtonLabel="Tạo đơn mới"
      />

      <div className="space-y-6 p-6">
        {/* Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
          <div className="w-full sm:max-w-[240px]">
            <SearchBar
              placeholder="Tìm theo mã đơn, khách hàng..."
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
                  aria-label="B? l?c"
                  className="text-foreground/80 hover:text-foreground"
                >
                  <Filter />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Trạng thái</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  {statusFilters.map((filter) => (
                    <DropdownMenuRadioItem key={filter.key} value={filter.key}>
                      {filter.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Thời gian</DropdownMenuLabel>
                <DropdownMenuRadioGroup value="today">
                  <DropdownMenuRadioItem value="today">
                    Hôm nay
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Order List */}
        <RecentOrdersTable />
      </div>
    </>
  );
};

export default Orders;
