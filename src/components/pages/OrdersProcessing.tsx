'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Filter } from 'lucide-react';

import { Header } from '@/components/organisms/Header';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RecentOrdersTable } from '@/components/organisms/RecentOrdersTable';
import { buildDetailPath } from '@/hooks/useDetailRoute';
import { isProcessingPrescriptionOrder } from '@/lib/orderWorkflow';

const statusFilters = [
  { key: 'all', label: 'Tat ca' },
  { key: 'pending', label: 'Can xu ly' },
  { key: 'processing', label: 'Da xu ly' },
  { key: 'completed', label: 'Hoan thanh' },
  { key: 'cancelled', label: 'Da huy' },
] as const;

export default function OrdersProcessing() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'processing' | 'completed' | 'cancelled'
  >('all');

  return (
    <>
      <Header
        title="Don dang gia cong"
        subtitle="Cac don prescription dang o cac stage waiting_lab, lens_processing, lens_fitting hoac qc_check"
      />

      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
          <div className="w-full sm:max-w-[240px]">
            <SearchBar
              placeholder="Tim theo ma don, khach hang..."
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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Trang thai</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
                >
                  {statusFilters.map((filter) => (
                    <DropdownMenuRadioItem key={filter.key} value={filter.key}>
                      {filter.label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <RecentOrdersTable
          limit={200}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          filter={isProcessingPrescriptionOrder}
          detailHref={(order) => buildDetailPath(pathname, order.id)}
          emptyMessage="Khong co don nao dang gia cong."
        />
      </div>
    </>
  );
}
