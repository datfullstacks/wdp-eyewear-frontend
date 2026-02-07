import { Header } from '@/components/organisms/Header';
import { CustomerList } from '@/components/organisms/CustomerList';

import { Filter, Download } from 'lucide-react';
import { Button } from '@/components/atoms';

const Customers = () => {
  return (
    <>
      <Header
        title="Khách hàng"
        subtitle="Quản lý thông tin khách hàng"
        showAddButton
        addButtonLabel="Thêm khách hàng"
      />

      <div className="space-y-6 p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-muted-foreground text-sm">
            Hiển thị <span className="text-foreground font-medium">5</span>{' '}
            khách hàng
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 text-black">
              <Filter className="h-4 w-4" />
              Bộ lọc
            </Button>
            <Button variant="outline" size="sm" className="gap-2 text-black">
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

