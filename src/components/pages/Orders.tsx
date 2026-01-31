'use client';

import { Header } from '@/components/organisms/Header';
import { OrderList } from '@/components/organisms/OrderList';

import { Calendar, Filter } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/atoms';

const statusFilters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ xử lý' },
  { key: 'processing', label: 'Đang xử lý' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
];

const Orders = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <>
      <Header
        title="Đơn hàng"
        subtitle="Quản lý đơn hàng khách mua"
        showAddButton
        addButtonLabel="Tạo đơn mới"
        titleClassName="text-black"
        subtitleClassName="text-black"
        addButtonClassName="text-black"
        avatarClassName="bg-amber-400 text-slate-900"
      />

      <div className="space-y-6 p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <Button
                key={filter.key}
                variant={activeFilter === filter.key ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter(filter.key)}
                className={cn('text-black', activeFilter === filter.key && 'gradient-gold text-black')}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-black">
              <Calendar className="h-4 w-4" />
              Hôm nay
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-black">
              <Filter className="h-4 w-4" />
              Bộ lọc
            </Button>
          </div>
        </div>

        {/* Order List */}
        <OrderList />
      </div>
    </>
  );
};

export default Orders;







