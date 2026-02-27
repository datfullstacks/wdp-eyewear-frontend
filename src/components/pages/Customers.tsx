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
import { useEffect, useMemo, useState } from 'react';
import userApi, { User } from '@/api/users';

const Customers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [segmentFilter, setSegmentFilter] = useState('all');
  const [customers, setCustomers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = customers.length;
    const active = total;
    const inactive = 0;
    const totalSpent = 0;

    return {
      total,
      active,
      inactive,
      totalSpent,
    };
  }, [customers.length]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
    }).format(amount);
  };

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
        if (isMounted) {
          setCustomers(result.users);
        }
      } catch (err) {
        if (isMounted) {
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
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
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
        const phone = c.phone || '';
        return (
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          phone.toLowerCase().includes(q)
        );
      });
    }

    // Segment filter is UI-only for now; backend doesn't provide VIP/loyal tags.
    if (segmentFilter !== 'all') return rows;

    return rows;
  }, [customers, searchTerm, segmentFilter]);

  const customerListItems = useMemo(() => {
    const formatLastVisit = (value?: string) => {
      if (!value) return '-';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('vi-VN');
    };

    return filteredCustomers.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '-',
      totalOrders: 0,
      totalSpent: 0,
      lastVisit: formatLastVisit(user.updatedAt || user.createdAt),
      status: 'active' as const,
    }));
  }, [filteredCustomers]);

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
        {isLoading ? (
          <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 text-sm text-slate-600">
            Đang tải khách hàng...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-600">
            {error}
          </div>
        ) : (
          <CustomerList customers={customerListItems} />
        )}
      </div>
    </>
  );
};

export default Customers;
