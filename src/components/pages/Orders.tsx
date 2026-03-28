'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Filter } from 'lucide-react';
import { useTranslations } from 'next-intl';

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

const Orders = () => {
  const pathname = usePathname();
  const t = useTranslations('manager.orders');
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'pending' | 'processing' | 'completed' | 'cancelled'
  >('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const statusFilters = [
    { key: 'all', label: t('all') },
    { key: 'pending', label: t('pending') },
    { key: 'processing', label: t('processing') },
    { key: 'completed', label: t('completed') },
    { key: 'cancelled', label: t('cancelled') },
  ];

  return (
    <>
      <Header
        title={t('title')}
        subtitle={t('subtitle')}
        showAddButton
        addButtonLabel={t('createNew')}
      />

      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
          <div className="w-full sm:max-w-[240px]">
            <SearchBar
              placeholder={t('searchPlaceholder')}
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
                  aria-label={t('filterLabel')}
                  className="text-foreground/80 hover:text-foreground"
                >
                  <Filter />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{t('statusLabel')}</DropdownMenuLabel>
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
                <DropdownMenuLabel>{t('timeLabel')}</DropdownMenuLabel>
                <DropdownMenuRadioGroup value="today">
                  <DropdownMenuRadioItem value="today">
                    {t('today')}
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
