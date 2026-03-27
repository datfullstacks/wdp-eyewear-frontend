'use client';

import userApi, { User } from '@/api/users';
import { CustomerApiResponseModal } from '@/components/molecules/CustomerApiResponseModal';
import { SearchBar } from '@/components/molecules/SearchBar';
import { StatCard } from '@/components/molecules/StatCard';
import { Pagination } from '@/components/molecules/Pagination';
import { CustomerList } from '@/components/organisms/CustomerList';
import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Clock, Filter, Phone, UserPlus, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDetailRoute } from '@/hooks/useDetailRoute';

type SegmentFilter = 'all' | 'has_phone' | 'no_phone' | 'google' | 'credentials';

const ITEMS_PER_PAGE = 10;

function formatDate(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('vi-VN');
}

function isWithinDays(value?: string, days = 30) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const diffMs = Date.now() - date.getTime();
  return diffMs >= 0 && diffMs <= days * 24 * 60 * 60 * 1000;
}

const Customers = () => {
  const { detailId, openDetail, closeDetail } = useDetailRoute();
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<SegmentFilter>('all');
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const stats = useMemo(() => {
    const total = customers.length;
    const withPhone = customers.filter((c) => Boolean(c.phone)).length;
    const newIn30Days = customers.filter((c) => isWithinDays(c.createdAt, 30)).length;
    const updatedIn30Days = customers.filter((c) => isWithinDays(c.updatedAt, 30)).length;

    return {
      total,
      withPhone,
      newIn30Days,
      updatedIn30Days,
    };
  }, [customers]);

  useEffect(() => {
    let isMounted = true;

    const loadCustomers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await userApi.getAll({
          page: 1,
          limit: 100,
          role: 'customer',
        });

        const onlyCustomers = result.users.filter(
          (u) => String(u.role || '').toLowerCase() === 'customer'
        );

        if (isMounted) {
          setCustomers(onlyCustomers);
        }
      } catch (err) {
        if (!isMounted) return;
        const message =
          (
            err as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (err as { message?: string })?.message ||
          'Không thể tải khách hàng. Vui lòng thử lại.';
        setError(message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCustomers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let rows = customers;

    if (q) {
      rows = rows.filter((c) => {
        const name = c.name || '';
        const email = c.email || '';
        const phone = c.phone || '';
        const provider = c.provider || '';
        return (
          name.toLowerCase().includes(q) ||
          email.toLowerCase().includes(q) ||
          phone.toLowerCase().includes(q) ||
          provider.toLowerCase().includes(q)
        );
      });
    }

    switch (segmentFilter) {
      case 'has_phone':
        return rows.filter((c) => Boolean(c.phone));
      case 'no_phone':
        return rows.filter((c) => !c.phone);
      case 'google':
        return rows.filter((c) => (c.provider || '').toLowerCase().includes('google'));
      case 'credentials':
        return rows.filter((c) => {
          const provider = (c.provider || '').toLowerCase();
          return provider === '' || provider.includes('credentials') || provider.includes('local');
        });
      case 'all':
      default:
        return rows;
    }
  }, [customers, searchTerm, segmentFilter]);

  const customerListItems = useMemo(() => {
    return filteredCustomers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '-',
      createdAt: formatDate(user.createdAt),
      updatedAt: formatDate(user.updatedAt),
    }));
  }, [filteredCustomers]);

  // Pagination
  const totalPages = Math.ceil(customerListItems.length / ITEMS_PER_PAGE);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return customerListItems.slice(startIndex, endIndex);
  }, [customerListItems, currentPage]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, segmentFilter]);

  useEffect(() => {
    if (!detailId) {
      setDetailOpen(false);
      setDetailUserId(null);
      return;
    }

    setDetailUserId(detailId);
    setDetailOpen(true);
  }, [detailId]);

  return (
    <>
      <Header
        title="Khách hàng"
        subtitle="Quản lý thông tin khách hàng"
        showAddButton
        addButtonLabel="Thêm khách hàng"
      />

      <div className="space-y-6 p-6">
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
            title="Có SĐT"
            value={stats.withPhone.toString()}
            icon={Phone}
            className="p-3"
            titleClassName="text-foreground/90 text-sm"
            valueClassName="text-2xl"
            showIcon={false}
            inline
          />
          <StatCard
            title="Mới (30 ngày)"
            value={stats.newIn30Days.toString()}
            icon={UserPlus}
            className="p-3"
            titleClassName="text-foreground/90 text-sm"
            valueClassName="text-2xl"
            showIcon={false}
            inline
          />
          <StatCard
            title="Cập nhật (30 ngày)"
            value={stats.updatedIn30Days.toString()}
            icon={Clock}
            className="p-3"
            titleClassName="text-foreground/90 text-sm"
            valueClassName="text-2xl"
            showIcon={false}
            inline
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-[240px]">
            <SearchBar
              placeholder="Tìm theo tên, SĐT, email, provider..."
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
                <DropdownMenuLabel>Lọc nhanh</DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={segmentFilter}
                  onValueChange={(v) => setSegmentFilter(v as SegmentFilter)}
                >
                  <DropdownMenuRadioItem value="all">Tất cả</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="has_phone">Có SĐT</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="no_phone">Chưa có SĐT</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="google">Google</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="credentials">
                    Tài khoản nội bộ
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 text-sm text-slate-600">
            Đang tải khách hàng...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
            {error}
          </div>
        ) : (
          <>
            <CustomerList
              customers={paginatedCustomers}
              onViewDetails={openDetail}
            />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={customerListItems.length}
              className="mt-4"
            />
          </>
        )}
      </div>

      <CustomerApiResponseModal
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (open) return;
          if (detailId) {
            closeDetail();
            return;
          }
          setDetailUserId(null);
        }}
        userId={detailUserId}
      />
    </>
  );
};

export default Customers;
