'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Filter } from 'lucide-react';

import { SearchBar } from '@/components/molecules/SearchBar';
import { Header } from '@/components/organisms/Header';
import { RecentOrdersTable } from '@/components/organisms/RecentOrdersTable';
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
import { buildDetailPath } from '@/hooks/useDetailRoute';

const statusFilters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Cần xử lý' },
  { key: 'processing', label: 'Đã xử lý' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const Orders = () => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'processing' | 'completed' | 'cancelled'
  >('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <Header
        title="Đơn hàng"
        subtitle="Quản lý đơn hàng khách mua"
        showAddButton
        addButtonLabel="Tạo đơn mới"
      />

      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
          <div className="w-full sm:max-w-[240px]">
            <SearchBar
              placeholder="Tìm theo mã đơn, khách hàng..."
              value={searchTerm}
              accent="yellow"
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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Trạng thái</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={(value) =>
                    setStatusFilter(value as typeof statusFilter)
                  }
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

        <RecentOrdersTable
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          detailHref={(order) => buildDetailPath(pathname, order.id)}
        />
      </div>
    </>
  );
};

export default Orders;
