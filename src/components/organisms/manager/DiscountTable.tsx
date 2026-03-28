'use client';

import { Button } from '@/components/atoms';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, Trash2, Percent, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Discount } from '@/data/discountsData';

type DiscountWithUsage = Discount & {
  usedCount?: number;
  reservedCount?: number;
  activeCount?: number;
  remainingCount?: number | null;
};

interface DiscountTableTranslations {
  code: string;
  name: string;
  type: string;
  value: string;
  period: string;
  usage: string;
  status: string;
  actions: string;
  noData: string;
  percentage: string;
  fixed: string;
  active: string;
  inactive: string;
  expired: string;
  scheduled: string;
  unlimited: string;
  viewDetails: string;
  deleteDiscount: string;
}

interface DiscountTableProps {
  discounts: DiscountWithUsage[];
  onView?: (discount: DiscountWithUsage) => void;
  onDelete?: (discount: DiscountWithUsage) => void;
  translations?: DiscountTableTranslations;
}

const defaultTranslations: DiscountTableTranslations = {
  code: 'Mã',
  name: 'Tên khuyến mãi',
  type: 'Loại',
  value: 'Giá trị',
  period: 'Thời gian',
  usage: 'Sử dụng',
  status: 'Trạng thái',
  actions: 'Hành động',
  noData: 'Không có dữ liệu',
  percentage: 'Phần trăm',
  fixed: 'Cố định',
  active: 'Đang hoạt động',
  inactive: 'Tạm dừng',
  expired: 'Đã hết hạn',
  scheduled: 'Đã lên lịch',
  unlimited: 'Không giới hạn',
  viewDetails: 'Xem chi tiết',
  deleteDiscount: 'Xóa khuyến mãi',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function getStatusColor(status: string) {
  const colors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    expired: 'bg-red-100 text-red-700',
    scheduled: 'bg-blue-100 text-blue-700',
  };
  return colors[status as keyof typeof colors] || colors.inactive;
}

function getStatusLabel(status: string, t: DiscountTableTranslations) {
  const labels = {
    active: t.active,
    inactive: t.inactive,
    expired: t.expired,
    scheduled: t.scheduled,
  };
  return labels[status as keyof typeof labels] || status;
}

function getActiveUsageCount(discount: DiscountWithUsage) {
  return Number(discount.activeCount ?? discount.usageCount ?? 0);
}

function getUsedCount(discount: DiscountWithUsage) {
  return Number(discount.usedCount ?? discount.usageCount ?? 0);
}

function getReservedCount(discount: DiscountWithUsage) {
  return Number(discount.reservedCount ?? 0);
}

export function DiscountTable({
  discounts,
  onView,
  onDelete,
  translations: t = defaultTranslations,
}: DiscountTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.code}</TableHead>
          <TableHead>{t.name}</TableHead>
          <TableHead>{t.type}</TableHead>
          <TableHead>{t.value}</TableHead>
          <TableHead>{t.period}</TableHead>
          <TableHead>{t.usage}</TableHead>
          <TableHead>{t.status}</TableHead>
          <TableHead className="text-center">{t.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {discounts.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-gray-500">
              {t.noData}
            </TableCell>
          </TableRow>
        ) : (
          discounts.map((discount) => {
            const activeUsageCount = getActiveUsageCount(discount);
            const usedCount = getUsedCount(discount);
            const reservedCount = getReservedCount(discount);

            return (
              <TableRow key={discount.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="font-mono font-semibold text-amber-600">
                    {discount.code}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium text-gray-900">{discount.name}</div>
                  <div className="text-xs text-gray-500 line-clamp-1">
                    {discount.description}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {discount.type === 'percentage' ? (
                      <Percent className="h-3 w-3 text-blue-600" />
                    ) : (
                      <DollarSign className="h-3 w-3 text-green-600" />
                    )}
                    <span className="text-sm text-gray-600">
                      {discount.type === 'percentage' ? t.percentage : t.fixed}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {discount.type === 'percentage'
                    ? `${discount.value}%`
                    : `${discount.value.toLocaleString()}đ`}
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    <div>{formatDate(discount.startDate)}</div>
                    <div className="text-xs text-gray-400">
                      đến {formatDate(discount.endDate)}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {activeUsageCount} /{' '}
                    {discount.usageLimit === 0
                      ? t.unlimited
                      : discount.usageLimit.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">
                    Used {usedCount} • Reserved {reservedCount}
                  </div>
                  {discount.usageLimit > 0 && (
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={cn(
                          'h-full rounded-full',
                          activeUsageCount >= discount.usageLimit
                            ? 'bg-red-500'
                            : 'bg-amber-500'
                        )}
                        style={{
                          width: `${Math.min(
                            (activeUsageCount / discount.usageLimit) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-medium',
                      getStatusColor(discount.status)
                    )}
                  >
                    {getStatusLabel(discount.status, t)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {onView && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onView(discount)}
                        title={t.viewDetails}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(discount)}
                        title={t.deleteDiscount}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
