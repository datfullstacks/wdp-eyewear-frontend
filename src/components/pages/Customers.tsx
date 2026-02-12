'use client';
import { Header } from '@/components/organisms/Header';
import { CustomerList } from '@/components/organisms/CustomerList';
import { SearchBar } from '@/components/molecules/SearchBar';
import { StatCard } from '@/components/molecules/StatCard';
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
import {
  Filter,
  Download,
  Users,
  UserCheck,
  UserX,
  Banknote,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { mockCustomers } from '@/data/customerData';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');

  const stats = useMemo(() => {
    const total = mockCustomers.length;
    const active = mockCustomers.filter((c) => c.status === 'active').length;
    const inactive = mockCustomers.filter(
      (c) => c.status === 'inactive'
    ).length;
    const totalSpent = mockCustomers.reduce((sum, c) => sum + c.totalSpent, 0);

    return {
      total,
      active,
      inactive,
      totalSpent,
    };
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
    }).format(amount);
  };

  return (
    <>
      <Header
        title="Khách hàng"
        subtitle="Quản lý thông tin khách hàng"
        showAddButton
        addButtonLabel="Thêm khách hàng"
      />

      <div className="space-y-6 p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tổng khách hàng"
            value={stats.total.toString()}
            icon={Users}
            className="p-3"
            titleClassName="text-foreground/90 text-sm"
            valueClassName="text-2xl"
            showIcon={false}
            inline
          />
          <StatCard
            title="Đang hoạt động"
            value={stats.active.toString()}
            icon={UserCheck}
            className="p-3"
            titleClassName="text-foreground/90 text-sm"
            valueClassName="text-2xl"
            showIcon={false}
            inline
          />
          <StatCard
            title="Không hoạt động"
            value={stats.inactive.toString()}
            icon={UserX}
            className="p-3"
            titleClassName="text-foreground/90 text-sm"
            valueClassName="text-2xl"
            showIcon={false}
            inline
          />
          <StatCard
            title="Tổng chi tiêu"
            value={formatCurrency(stats.totalSpent)}
            icon={Banknote}
            className="p-3"
            titleClassName="text-foreground/90 text-sm"
            valueClassName="text-2xl"
            showIcon={false}
            inline
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-[240px]">
            <SearchBar
              placeholder="T�m theo t�n, S�T, email..."
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>
          <div className="flex items-center gap-2">
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
                <DropdownMenuLabel>Phân khúc</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={segmentFilter}
                  onValueChange={setSegmentFilter}
                >
                  <DropdownMenuRadioItem value="all">
                    Tất cả
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="vip">VIP</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="loyal">
                    Thân thiết
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="new">
                    Khách mới
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Xuất dữ liệu</DropdownMenuLabel>
                <DropdownMenuRadioGroup value="excel">
                  <DropdownMenuRadioItem value="excel">
                    Xuất Excel
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Xuất Excel
            </Button>
          </div>
        </div>

        {/* Customer List */}
        <CustomerList />
      </div>
    </>
  );
};

export default Customers;
