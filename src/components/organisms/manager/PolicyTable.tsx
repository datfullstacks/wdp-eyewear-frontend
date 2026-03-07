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
import { Eye, Trash2, FileText, Shield, Truck, ShoppingCart, Lock, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Policy } from '@/data/policiesData';

interface PolicyTableTranslations {
  title: string;
  category: string;
  lastUpdated: string;
  status: string;
  actions: string;
  noData: string;
  warranty: string;
  return: string;
  shipping: string;
  purchase: string;
  privacy: string;
  terms: string;
  active: string;
  inactive: string;
  draft: string;
  viewDetails: string;
  deletePolicy: string;
}

interface PolicyTableProps {
  policies: Policy[];
  onView?: (policy: Policy) => void;
  onDelete?: (policy: Policy) => void;
  translations?: PolicyTableTranslations;
}

const defaultTranslations: PolicyTableTranslations = {
  title: 'Tiêu đề',
  category: 'Danh mục',
  lastUpdated: 'Cập nhật',
  status: 'Trạng thái',
  actions: 'Hành động',
  noData: 'Không có dữ liệu',
  warranty: 'Bảo hành',
  return: 'Đổi trả',
  shipping: 'Vận chuyển',
  purchase: 'Mua hàng',
  privacy: 'Bảo mật',
  terms: 'Điều khoản',
  active: 'Đang hoạt động',
  inactive: 'Tạm dừng',
  draft: 'Bản nháp',
  viewDetails: 'Xem chi tiết',
  deletePolicy: 'Xóa chính sách',
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function getCategoryIcon(category: string) {
  const icons = {
    warranty: Shield,
    return: FileText,
    shipping: Truck,
    purchase: ShoppingCart,
    privacy: Lock,
    terms: ScrollText,
  };
  return icons[category as keyof typeof icons] || FileText;
}

function getCategoryColor(category: string) {
  const colors = {
    warranty: 'text-blue-600 bg-blue-50',
    return: 'text-green-600 bg-green-50',
    shipping: 'text-purple-600 bg-purple-50',
    purchase: 'text-amber-600 bg-amber-50',
    privacy: 'text-red-600 bg-red-50',
    terms: 'text-gray-600 bg-gray-50',
  };
  return colors[category as keyof typeof colors] || colors.terms;
}

function getCategoryLabel(category: string, t: PolicyTableTranslations) {
  const labels = {
    warranty: t.warranty,
    return: t.return,
    shipping: t.shipping,
    purchase: t.purchase,
    privacy: t.privacy,
    terms: t.terms,
  };
  return labels[category as keyof typeof labels] || category;
}

function getStatusColor(status: string) {
  const colors = {
    active: 'bg-green-100 text-green-700',
    inactive: 'bg-gray-100 text-gray-700',
    draft: 'bg-yellow-100 text-yellow-700',
  };
  return colors[status as keyof typeof colors] || colors.inactive;
}

function getStatusLabel(status: string, t: PolicyTableTranslations) {
  const labels = {
    active: t.active,
    inactive: t.inactive,
    draft: t.draft,
  };
  return labels[status as keyof typeof labels] || status;
}

export function PolicyTable({
  policies,
  onView,
  onDelete,
  translations: t = defaultTranslations,
}: PolicyTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.title}</TableHead>
          <TableHead>{t.category}</TableHead>
          <TableHead>{t.lastUpdated}</TableHead>
          <TableHead>{t.status}</TableHead>
          <TableHead className="text-center">{t.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {policies.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-gray-500">
              {t.noData}
            </TableCell>
          </TableRow>
        ) : (
          policies.map((policy) => {
            const CategoryIcon = getCategoryIcon(policy.category);
            return (
              <TableRow key={policy.id} className="hover:bg-gray-50">
                <TableCell>
                  <div className="font-medium text-gray-900">{policy.title}</div>
                  <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                    {policy.summary}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Version {policy.version}
                  </div>
                </TableCell>
                <TableCell>
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
                      getCategoryColor(policy.category)
                    )}
                  >
                    <CategoryIcon className="h-3.5 w-3.5" />
                    <span className="text-sm font-medium">
                      {getCategoryLabel(policy.category, t)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm text-gray-600">
                    {formatDate(policy.updatedAt)}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Hiệu lực: {formatDate(policy.effectiveDate)}
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-xs font-medium',
                      getStatusColor(policy.status)
                    )}
                  >
                    {getStatusLabel(policy.status, t)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    {onView && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onView(policy)}
                        title={t.viewDetails}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(policy)}
                        title={t.deletePolicy}
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
