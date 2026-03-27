'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ExternalLink, Loader2, MessageSquare, RefreshCw } from 'lucide-react';

import supportApi, {
  type SupportMessageRecord,
  type SupportTicketCategory,
  type SupportTicketRecord,
  type SupportTicketStatus,
  type WarrantyEligibility,
} from '@/api/support';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Header } from '@/components/organisms/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDetailRoute } from '@/hooks/useDetailRoute';
import { Textarea } from '@/components/ui/textarea';

type AfterSalesScope = 'sale' | 'operation' | 'manager';
type ConsoleTab = 'return' | 'warranty' | 'prescription';

type TabConfig = {
  value: ConsoleTab;
  label: string;
  category: SupportTicketCategory;
};

const TAB_CONFIG: Record<AfterSalesScope, TabConfig[]> = {
  sale: [
    { value: 'return', label: 'Đổi / trả', category: 'return' },
    { value: 'warranty', label: 'Bảo hành', category: 'warranty' },
  ],
  operation: [{ value: 'warranty', label: 'Xử lý bảo hành', category: 'warranty' }],
  manager: [
    { value: 'return', label: 'Đổi / trả', category: 'return' },
    { value: 'warranty', label: 'Bảo hành', category: 'warranty' },
    { value: 'prescription', label: 'Toa kính', category: 'prescription' },
  ],
};

const SCOPE_COPY: Record<
  AfterSalesScope,
  { title: string; subtitle: string; refundHref: string; refundLabel: string }
> = {
  sale: {
    title: 'Hỗ trợ hậu mãi',
    subtitle: 'Theo dõi và xử lý yêu cầu đổi trả, bảo hành cho nhân viên bán hàng',
    refundHref: '/sale/cases/refunds',
    refundLabel: 'Mở khu vực hoàn tiền',
  },
  operation: {
    title: 'Hàng chờ bảo hành',
    subtitle: 'Theo dõi và xử lý các yêu cầu bảo hành thuộc bộ phận vận hành',
    refundHref: '/operation/refunds',
    refundLabel: 'Mở hàng chờ chi tiền',
  },
  manager: {
    title: 'Tổng quan hỗ trợ kinh doanh',
    subtitle: 'Theo dõi liên cửa hàng cho yêu cầu đổi trả, bảo hành và toa kính',
    refundHref: '/manager/refunds/monitoring',
    refundLabel: 'Mở giám sát hoàn tiền',
  },
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Mới tạo',
  in_progress: 'Đang xử lý',
  resolved: 'Đã xử lý',
  closed: 'Đã đóng',
  requested: 'Đã gửi yêu cầu',
  under_review: 'Đang xem xét',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
  in_service: 'Đang bảo hành',
  completed: 'Hoàn tất',
};

const CATEGORY_LABELS: Record<SupportTicketCategory, string> = {
  general: 'Chung',
  order: 'Đơn hàng',
  prescription: 'Toa kính',
  shipping: 'Vận chuyển',
  refund: 'Hoàn tiền',
  return: 'Đổi / trả',
  warranty: 'Bảo hành',
};

const ELIGIBILITY_LABELS: Record<WarrantyEligibility, string> = {
  eligible: 'Đủ điều kiện',
  expired: 'Hết hạn',
  not_covered: 'Không thuộc phạm vi',
};

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Thấp',
  normal: 'Trung bình',
  high: 'Cao',
};

const ROLE_LABELS: Record<string, string> = {
  customer: 'Khách hàng',
  sales: 'Nhân viên sale',
  operations: 'Vận hành',
  manager: 'Quản lý',
  admin: 'Quản trị viên',
};

const ORDER_TYPE_LABELS: Record<string, string> = {
  ready_stock: 'Có sẵn',
  pre_order: 'Đặt trước',
  prescription: 'Toa kính',
};

function formatDateTime(value?: string) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('vi-VN');
}

function formatCurrency(value?: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getStatusTone(status: SupportTicketStatus) {
  if (['rejected', 'closed'].includes(status)) return 'bg-rose-50 text-rose-700 border-rose-200';
  if (['approved', 'resolved', 'completed'].includes(status)) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (['requested', 'under_review', 'in_progress', 'in_service'].includes(status)) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  return 'bg-slate-50 text-slate-700 border-slate-200';
}

function getStatusOptions(scope: AfterSalesScope, category: SupportTicketCategory) {
  if (scope === 'manager') return [] as SupportTicketStatus[];
  if (category === 'return') {
    return ['open', 'in_progress', 'resolved', 'closed'] as SupportTicketStatus[];
  }
  if (scope === 'sale' && category === 'warranty') {
    return ['under_review', 'approved', 'rejected'] as SupportTicketStatus[];
  }
  if (scope === 'operation' && category === 'warranty') {
    return ['in_service', 'completed'] as SupportTicketStatus[];
  }
  return [] as SupportTicketStatus[];
}

function TicketDetailDialog({
  ticket,
  open,
  onOpenChange,
  scope,
  onReply,
  onUpdateStatus,
  isSubmitting,
}: {
  ticket: SupportTicketRecord | null;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  scope: AfterSalesScope;
  onReply: (message: string) => Promise<void>;
  onUpdateStatus: (status: SupportTicketStatus, note: string) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [replyMessage, setReplyMessage] = useState('');
  const [nextStatus, setNextStatus] = useState<SupportTicketStatus | ''>('');
  const [statusNote, setStatusNote] = useState('');

  useEffect(() => {
    if (!open) return;
    setReplyMessage('');
    setStatusNote('');
    setNextStatus('');
  }, [open, ticket?.id]);

  if (!ticket) return null;

  const statusOptions = getStatusOptions(scope, ticket.category);
  const isReadOnly = scope === 'manager';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ticket.subject}</DialogTitle>
          <DialogDescription>
            Phiếu {CATEGORY_LABELS[ticket.category].toLowerCase()} {ticket.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-900">Thông tin phiếu</h3>
              <dl className="mt-3 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between gap-3">
                  <dt>Loại</dt>
                  <dd className="font-medium text-gray-900">{CATEGORY_LABELS[ticket.category]}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Trạng thái</dt>
                  <dd>
                    <span
                      className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getStatusTone(ticket.status)}`}
                    >
                      {STATUS_LABELS[ticket.status] || ticket.status}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Mức ưu tiên</dt>
                  <dd className="font-medium text-gray-900">
                    {PRIORITY_LABELS[ticket.priority] || ticket.priority}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Khách hàng</dt>
                  <dd className="text-right font-medium text-gray-900">
                    {ticket.user?.name || ticket.email || '-'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Cập nhật gần nhất</dt>
                  <dd className="text-right font-medium text-gray-900">
                    {formatDateTime(ticket.lastMessageAt || ticket.updatedAt)}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-900">Đơn hàng / cửa hàng liên quan</h3>
              <dl className="mt-3 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between gap-3">
                  <dt>Đơn hàng</dt>
                  <dd className="text-right font-medium text-gray-900">
                    {ticket.order?.paymentCode || ticket.orderId || '-'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Loại đơn</dt>
                  <dd className="text-right font-medium text-gray-900">
                    {ORDER_TYPE_LABELS[ticket.order?.orderType || ''] || ticket.order?.orderType || '-'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Tổng tiền</dt>
                  <dd className="text-right font-medium text-gray-900">
                    {ticket.order ? formatCurrency(ticket.order.total) : '-'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Cửa hàng</dt>
                  <dd className="text-right font-medium text-gray-900">
                    {ticket.store?.name || ticket.store?.code || '-'}
                  </dd>
                </div>
              </dl>
            </Card>
          </div>

          {ticket.warranty ? (
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-900">Thông tin bảo hành</h3>
              <dl className="mt-3 grid gap-3 text-sm text-gray-600 md:grid-cols-2">
                <div>
                  <dt>Sản phẩm</dt>
                  <dd className="font-medium text-gray-900">{ticket.warranty.itemName || '-'}</dd>
                </div>
                <div>
                  <dt>Điều kiện</dt>
                  <dd className="font-medium text-gray-900">
                    {ELIGIBILITY_LABELS[ticket.warranty.eligibility]}
                  </dd>
                </div>
                <div>
                  <dt>Số tháng bảo hành</dt>
                  <dd className="font-medium text-gray-900">{ticket.warranty.warrantyMonths}</dd>
                </div>
                <div>
                  <dt>Hết hạn lúc</dt>
                  <dd className="font-medium text-gray-900">
                    {formatDateTime(ticket.warranty.expiresAt)}
                  </dd>
                </div>
                {ticket.warranty.decisionNote ? (
                  <div className="md:col-span-2">
                    <dt>Ghi chú duyệt</dt>
                    <dd className="font-medium text-gray-900">{ticket.warranty.decisionNote}</dd>
                  </div>
                ) : null}
                {ticket.warranty.serviceNote ? (
                  <div className="md:col-span-2">
                    <dt>Ghi chú xử lý</dt>
                    <dd className="font-medium text-gray-900">{ticket.warranty.serviceNote}</dd>
                  </div>
                ) : null}
              </dl>
            </Card>
          ) : null}

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-900">Trao đổi</h3>
            <div className="mt-4 space-y-3">
              {ticket.messages.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có tin nhắn nào.</p>
              ) : (
                ticket.messages.map((message: SupportMessageRecord) => (
                  <div
                    key={message.id}
                    className={`rounded-lg border p-3 text-sm ${
                      message.sender === 'staff'
                        ? 'border-amber-200 bg-amber-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-gray-900">
                        {message.sender === 'staff' ? 'Nhân viên' : 'Khách hàng'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDateTime(message.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-gray-700">{message.message}</p>
                  </div>
                ))
              )}
            </div>
          </Card>

          {!isReadOnly ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="p-4">
                <Label className="text-sm font-semibold text-gray-900">Phản hồi</Label>
                <Textarea
                  className="mt-3"
                  placeholder="Nhập nội dung phản hồi cho khách hàng..."
                  value={replyMessage}
                  onChange={(event) => setReplyMessage(event.target.value)}
                  rows={5}
                />
                <div className="mt-3 flex justify-end">
                  <Button
                    onClick={() => void onReply(replyMessage)}
                    disabled={isSubmitting || !replyMessage.trim()}
                  >
                    Gửi phản hồi
                  </Button>
                </div>
              </Card>

              <Card className="p-4">
                <Label className="text-sm font-semibold text-gray-900">Cập nhật trạng thái</Label>
                <select
                  value={nextStatus}
                  onChange={(event) =>
                    setNextStatus(event.target.value as SupportTicketStatus | '')
                  }
                  className="mt-3 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                >
                  <option value="">Chọn trạng thái tiếp theo</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status] || status}
                    </option>
                  ))}
                </select>
                <Textarea
                  className="mt-3"
                  placeholder={
                    ticket.category === 'warranty'
                      ? 'Nhập ghi chú duyệt hoặc ghi chú xử lý...'
                      : 'Nhập ghi chú trạng thái nếu cần...'
                  }
                  value={statusNote}
                  onChange={(event) => setStatusNote(event.target.value)}
                  rows={4}
                />
                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!nextStatus) return;
                      void onUpdateStatus(nextStatus, statusNote);
                    }}
                    disabled={isSubmitting || !nextStatus}
                  >
                    Áp dụng trạng thái
                  </Button>
                </div>
              </Card>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AfterSalesConsole({ scope }: { scope: AfterSalesScope }) {
  const { detailId, openDetail, closeDetail } = useDetailRoute();
  const tabs = TAB_CONFIG[scope];
  const [activeTab, setActiveTab] = useState<ConsoleTab>(tabs[0].value);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [eligibilityFilter, setEligibilityFilter] = useState<string>('all');
  const [tickets, setTickets] = useState<SupportTicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const activeConfig = useMemo(
    () => tabs.find((tab) => tab.value === activeTab) || tabs[0],
    [activeTab, tabs],
  );

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      if (activeConfig.category === 'warranty') {
        const result = await supportApi.getWarrantyCases({
          page: 1,
          limit: 100,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          eligibility:
            eligibilityFilter !== 'all'
              ? (eligibilityFilter as WarrantyEligibility)
              : undefined,
          q: searchQuery || undefined,
        });
        setTickets(result.items);
      } else {
        const result = await supportApi.getTickets({
          page: 1,
          limit: 100,
          category: activeConfig.category,
          status: statusFilter !== 'all' ? statusFilter : undefined,
          q: searchQuery || undefined,
        });
        setTickets(result.items);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Không thể tải danh sách phiếu hỗ trợ.',
      );
    } finally {
      setLoading(false);
    }
  }, [activeConfig.category, eligibilityFilter, searchQuery, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTickets();
    }, 200);

    return () => window.clearTimeout(timer);
  }, [loadTickets]);

  useEffect(() => {
    setStatusFilter('all');
    setEligibilityFilter('all');
    setSuccessMessage('');
  }, [activeTab]);

  const openTicketDetail = useCallback(async (ticketId: string) => {
    try {
      setDetailLoading(true);
      setDetailOpen(true);
      const detail = await supportApi.getTicket(ticketId);
      const nextTab = tabs.find((tab) => tab.category === detail.category)?.value;
      if (nextTab) {
        setActiveTab(nextTab);
      }
      setSelectedTicket(detail);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Không thể tải chi tiết phiếu hỗ trợ.',
      );
    } finally {
      setDetailLoading(false);
    }
  }, [tabs]);

  useEffect(() => {
    if (!detailId) {
      setDetailOpen(false);
      setSelectedTicket(null);
      return;
    }

    const matchedTicket = tickets.find((ticket) => ticket.id === detailId);
    if (matchedTicket) {
      setSelectedTicket(matchedTicket);
      const nextTab = tabs.find((tab) => tab.category === matchedTicket.category)?.value;
      if (nextTab) {
        setActiveTab(nextTab);
      }
    }

    void openTicketDetail(detailId);
  }, [detailId, openTicketDetail, tabs, tickets]);

  const refreshSelectedTicket = async (ticketId: string) => {
    const detail = await supportApi.getTicket(ticketId);
    setSelectedTicket(detail);
  };

  const handleReply = async (message: string) => {
    if (!selectedTicket || !message.trim()) return;

    try {
      setSubmitting(true);
      await supportApi.replyTicket(selectedTicket.id, { message: message.trim() });
      await Promise.all([refreshSelectedTicket(selectedTicket.id), loadTickets()]);
      setSuccessMessage('Đã gửi phản hồi thành công.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Không thể gửi phản hồi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (status: SupportTicketStatus, note: string) => {
    if (!selectedTicket || !status) return;

    try {
      setSubmitting(true);
      const payload =
        selectedTicket.category === 'warranty'
          ? scope === 'operation'
            ? { status, serviceNote: note.trim() || undefined }
            : { status, decisionNote: note.trim() || undefined }
          : { status, note: note.trim() || undefined };

      await supportApi.updateTicketStatus(selectedTicket.id, payload);
      await Promise.all([refreshSelectedTicket(selectedTicket.id), loadTickets()]);
      setSuccessMessage('Đã cập nhật trạng thái thành công.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Không thể cập nhật trạng thái hỗ trợ.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header title={SCOPE_COPY[scope].title} subtitle={SCOPE_COPY[scope].subtitle} />

      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={SCOPE_COPY[scope].refundHref}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {SCOPE_COPY[scope].refundLabel}
              <ExternalLink className="h-4 w-4" />
            </Link>
            {scope === 'sale' ? (
              <Link
                href="/sale/orders/prescription-needed"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Bổ sung toa kính
                <ExternalLink className="h-4 w-4" />
              </Link>
            ) : null}
          </div>

          <Button variant="outline" className="gap-2" onClick={() => void loadTickets()}>
            <RefreshCw className="h-4 w-4" />
            Tải lại
          </Button>
        </div>

        {errorMessage ? (
          <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            <AlertTriangle className="h-4 w-4" />
            <span>{errorMessage}</span>
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ConsoleTab)}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row">
                <div className="flex-1">
                  <SearchBar
                    placeholder="Tìm theo đơn hàng, khách hàng, số điện thoại hoặc tiêu đề phiếu"
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>
                <div className="w-full lg:w-56">
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                {tab.value === 'warranty' ? (
                  <div className="w-full lg:w-56">
                    <select
                      value={eligibilityFilter}
                      onChange={(event) => setEligibilityFilter(event.target.value)}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                    >
                      <option value="all">Tất cả điều kiện</option>
                      {Object.entries(ELIGIBILITY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : (
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50 text-left text-gray-500">
                        <tr>
                          <th className="px-4 py-3">Phiếu</th>
                          <th className="px-4 py-3">Khách hàng</th>
                          <th className="px-4 py-3">Cửa hàng</th>
                          <th className="px-4 py-3">Trạng thái</th>
                          <th className="px-4 py-3">Cập nhật gần nhất</th>
                          <th className="px-4 py-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tickets.map((ticket) => (
                          <tr key={ticket.id} className="border-t border-gray-100 text-gray-700">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">{ticket.subject}</div>
                              <div className="text-xs text-gray-500">
                                {ticket.order?.paymentCode || ticket.orderId || ticket.id}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div>{ticket.user?.name || ticket.email || '-'}</div>
                              <div className="text-xs text-gray-500">
                                {ROLE_LABELS[ticket.user?.role || ''] || ticket.user?.role || '-'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {ticket.store?.name || ticket.store?.code || '-'}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getStatusTone(ticket.status)}`}
                              >
                                {STATUS_LABELS[ticket.status] || ticket.status}
                              </span>
                              {ticket.warranty ? (
                                <div className="mt-1 text-xs text-gray-500">
                                  {ELIGIBILITY_LABELS[ticket.warranty.eligibility]}
                                </div>
                              ) : null}
                            </td>
                            <td className="px-4 py-3">
                              {formatDateTime(ticket.lastMessageAt || ticket.updatedAt)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDetail(ticket.id)}
                              >
                                Mở
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {tickets.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                              Không có phiếu hỗ trợ nào khớp với bộ lọc hiện tại.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {detailLoading && detailOpen ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            Đang tải chi tiết phiếu...
          </div>
        ) : null}
      </div>

      <TicketDetailDialog
        ticket={selectedTicket}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open);
          if (open) return;
          if (detailId) {
            closeDetail();
            return;
          }
          setSelectedTicket(null);
        }}
        scope={scope}
        onReply={handleReply}
        onUpdateStatus={handleStatusUpdate}
        isSubmitting={submitting}
      />
    </>
  );
}
