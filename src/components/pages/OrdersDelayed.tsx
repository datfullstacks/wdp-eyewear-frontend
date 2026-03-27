'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
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
import {
  DelayedStatsGrid,
  DelayedOrderTable,
  DelayedDetailModal,
  EscalateModal,
  ContactModal,
  ResolveModal,
} from '@/components/organisms/delayed';
import { delayTypeLabels } from '@/data/delayedData';
import { DelayedOrder, ContactMethod, ResolveAction } from '@/types/delayed';
import { Filter } from 'lucide-react';
import { Header } from '@/components/organisms/Header';
import { orderApi } from '@/api';
import { useDetailRoute } from '@/hooks/useDetailRoute';
import { useStatusRealtimeReload } from '@/hooks/useStatusRealtime';
import { toDelayedOrdersFromApi } from '@/lib/orderWorkflow';

const ITEMS_PER_PAGE = 10;

export default function OrdersDelayed() {
  const t = useTranslations('manager.delayed');
  const [orders, setOrders] = useState<DelayedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [readOnlyMessage, setReadOnlyMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [detailOrder, setDetailOrder] = useState<DelayedOrder | null>(null);
  const [escalateOrder, setEscalateOrder] = useState<DelayedOrder | null>(null);
  const [contactOrder, setContactOrder] = useState<DelayedOrder | null>(null);
  const [resolveOrder, setResolveOrder] = useState<DelayedOrder | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const result = await orderApi.getAll({ page: 1, limit: 200 });
      setOrders(toDelayedOrdersFromApi(result.orders));
    } catch {
      setErrorMessage(t('loadError'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useStatusRealtimeReload({
    domains: ['order'],
    reload: loadOrders,
  });

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.customerPhone.includes(query);
      const matchesSeverity =
        severityFilter === 'all' || order.severity === severityFilter;
      const matchesType = typeFilter === 'all' || order.delayType === typeFilter;
      return matchesSearch && matchesSeverity && matchesType;
    });
  }, [orders, searchTerm, severityFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, severityFilter, typeFilter]);

  useEffect(() => {
    setSelectedOrders((prev) =>
      prev.filter((id) => filteredOrders.some((order) => order.id === id))
    );
  }, [filteredOrders]);

  useEffect(() => {
    if (!detailId) {
      setDetailOrder(null);
      return;
    }

    const matchedOrder = orders.find((order) => order.id === detailId);
    if (matchedOrder) {
      setDetailOrder(matchedOrder);
      return;
    }

    if (!isLoading) {
      setDetailOrder(null);
    }
  }, [detailId, isLoading, orders]);

  const stats = useMemo(
    () => ({
      critical: orders.filter((order) => order.severity === 'critical').length,
      high: orders.filter((order) => order.severity === 'high').length,
      medium: orders.filter((order) => order.severity === 'medium').length,
      slaBreached: orders.filter((order) => order.delayType === 'sla_breach').length,
    }),
    [orders]
  );

  const toggleSelectOrder = (orderId: string) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    const currentPageIds = paginatedOrders.map((order) => order.id);
    const allSelected = currentPageIds.every((id) => selectedOrders.includes(id));

    setSelectedOrders((prev) => {
      if (allSelected) {
        return prev.filter((id) => !currentPageIds.includes(id));
      }
      return Array.from(new Set([...prev, ...currentPageIds]));
    });
  };

  const handleEscalate = (orderId: string, note: string) => {
    void orderId;
    void note;
    setReadOnlyMessage(
      'Order alert actions are read-only in the web dashboard until backend escalation APIs are exposed.'
    );
    setEscalateOrder(null);
  };

  const handleContact = (
    orderId: string,
    method: ContactMethod,
    note: string
  ) => {
    void orderId;
    void method;
    void note;
    setReadOnlyMessage(
      'Customer contact logging is not wired to a live backend endpoint in this dashboard yet.'
    );
    setContactOrder(null);
  };

  const handleResolve = (
    orderId: string,
    action: ResolveAction,
    note: string
  ) => {
    void orderId;
    void action;
    void note;
    setReadOnlyMessage(
      'Alert resolution stays read-only here until backend workflow actions are available.'
    );
    setResolveOrder(null);
  };

  return (
    <>
      <Header
        title={t('title')}
        subtitle={t('subtitle')}
      />
      <div className="space-y-6 p-6">
        <DelayedStatsGrid stats={stats} />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
          <div className="w-full sm:max-w-[240px]">
            <SearchBar
              placeholder={t('searchPlaceholder')}
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
                  aria-label={t('filterLabel')}
                  className="text-foreground/80 hover:text-foreground"
                >
                  <Filter />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>{t('severity')}</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={severityFilter}
                  onValueChange={setSeverityFilter}
                >
                  <DropdownMenuRadioItem value="all">{t('severityAll')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="critical">{t('severityCritical')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="high">{t('severityHigh')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="medium">{t('severityMedium')}</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="low">{t('severityLow')}</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>{t('alertType')}</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={typeFilter}
                  onValueChange={setTypeFilter}
                >
                  <DropdownMenuRadioItem value="all">{t('alertTypeAll')}</DropdownMenuRadioItem>
                  {Object.entries(delayTypeLabels).map(([value, label]) => (
                    <DropdownMenuRadioItem key={value} value={value}>
                      {label}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading && (
          <p className="text-foreground/70 text-sm">{t('loading')}</p>
        )}
        {!isLoading && errorMessage && (
          <p className="text-destructive text-sm">{errorMessage}</p>
        )}
        {readOnlyMessage && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {readOnlyMessage}
          </p>
        )}

        {!isLoading && !errorMessage && (
          <>
            <DelayedOrderTable
              orders={paginatedOrders}
              selectedOrders={selectedOrders}
              onSelectOrder={toggleSelectOrder}
              onSelectAll={toggleSelectAll}
              onViewDetail={(order) => openDetail(order.id)}
              onContact={setContactOrder}
              onEscalate={setEscalateOrder}
              onResolve={setResolveOrder}
            />

            {filteredOrders.length > 0 && (
              <div className="mt-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={ITEMS_PER_PAGE}
                  totalItems={filteredOrders.length}
                />
              </div>
            )}
          </>
        )}

        <DelayedDetailModal
          order={detailOrder}
          onClose={() => {
            if (detailId) {
              closeDetail();
              return;
            }
            setDetailOrder(null);
          }}
          onResolve={setResolveOrder}
        />

        <EscalateModal
          order={escalateOrder}
          onClose={() => setEscalateOrder(null)}
          onSubmit={handleEscalate}
        />

        <ContactModal
          order={contactOrder}
          onClose={() => setContactOrder(null)}
          onSubmit={handleContact}
        />

        <ResolveModal
          order={resolveOrder}
          onClose={() => setResolveOrder(null)}
          onSubmit={handleResolve}
        />
      </div>
    </>
  );
}
