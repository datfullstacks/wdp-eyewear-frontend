'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ExternalLink, Loader2, MessageSquare, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';

import supportApi, {
  type SupportAttachmentRecord,
  type SupportMessageRecord,
  type SupportTicketCategory,
  type SupportTicketOwnerRole,
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

const TAB_CONFIG_KEYS: Record<AfterSalesScope, { value: ConsoleTab; labelKey: string; category: SupportTicketCategory }[]> = {
  sale: [
    { value: 'return', labelKey: 'tabs.return', category: 'return' },
    { value: 'warranty', labelKey: 'tabs.warranty', category: 'warranty' },
  ],
  operation: [{ value: 'warranty', labelKey: 'tabs.warrantyOps', category: 'warranty' }],
  manager: [
    { value: 'return', labelKey: 'tabs.return', category: 'return' },
    { value: 'warranty', labelKey: 'tabs.warranty', category: 'warranty' },
    { value: 'prescription', labelKey: 'tabs.prescription', category: 'prescription' },
  ],
};

const REFUND_HREF: Record<AfterSalesScope, string> = {
  sale: '/sale/cases/refunds',
  operation: '/operation/refunds',
  manager: '/manager/refunds/monitoring',
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

const WARRANTY_ORDER_STATUS_LABELS: Record<string, string> = {
  created: 'Đã tạo đơn bảo hành',
  in_service: 'Đang xử lý bảo hành',
  completed: 'Đã hoàn tất bảo hành',
  cancelled: 'Đã hủy đơn bảo hành',
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
const TICKET_OWNER_LABELS: Record<SupportTicketOwnerRole, string> = {
  none: 'Đã đóng',
  customer: 'Khách hàng',
  sales: 'Sale',
  operations: 'Operations',
  manager: 'Manager',
};
const NEXT_ACTION_LABELS: Record<string, string> = {
  review_ticket: 'Sale xem xét yêu cầu',
  follow_up_customer: 'Sale theo dõi và phản hồi khách',
  close_ticket: 'Sale đóng case',
  review_warranty: 'Sale kiểm tra điều kiện bảo hành',
  decide_warranty: 'Sale duyệt hoặc từ chối bảo hành',
  start_service: 'Operations tiếp nhận bảo hành',
  complete_service: 'Operations hoàn tất bảo hành',
  reply_customer: 'Phản hồi khách hàng',
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
    return ['under_review', 'rejected'] as SupportTicketStatus[];
  }
  if (scope === 'operation' && category === 'warranty') {
    return ['in_service', 'completed'] as SupportTicketStatus[];
  }
  return [] as SupportTicketStatus[];
}

function getWarrantyOrderTone(status?: string) {
  if (status === 'completed') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'cancelled') return 'bg-rose-50 text-rose-700 border-rose-200';
  if (status === 'in_service') return 'bg-sky-50 text-sky-700 border-sky-200';
  return 'bg-amber-50 text-amber-700 border-amber-200';
}

function canCreateWarrantyOrder(ticket: SupportTicketRecord | null, scope: AfterSalesScope) {
  if (!ticket || scope !== 'sale' || ticket.category !== 'warranty' || !ticket.warranty) {
    return false;
  }

  if (ticket.warranty.eligibility !== 'eligible') {
    return false;
  }

  if (ticket.warranty.serviceOrder?.code) {
    return false;
  }

  return !['rejected', 'completed'].includes(ticket.status);
}

function canCreateWarrantyRefund(ticket: SupportTicketRecord | null, scope: AfterSalesScope) {
  if (!ticket || scope !== 'sale' || ticket.category !== 'warranty' || !ticket.warranty) {
    return false;
  }

  if (ticket.warranty.eligibility !== 'eligible') {
    return false;
  }

  if (ticket.warranty.serviceOrder?.code) {
    return false;
  }

  return !['rejected', 'completed'].includes(ticket.status);
}

function SupportAttachmentGallery({ attachments }: { attachments: SupportAttachmentRecord[] }) {
  if (!attachments.length) return null;

  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-amber-300"
        >
          {attachment.type === 'video' ? (
            <video
              src={attachment.url}
              controls
              preload="metadata"
              className="h-40 w-full bg-slate-950 object-cover"
            />
          ) : (
            <img
              src={attachment.url}
              alt={attachment.name || 'Evidence attachment'}
              className="h-40 w-full object-cover"
            />
          )}
          <div className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
            <span className="truncate font-medium text-slate-700">
              {attachment.name ||
                (attachment.type === 'video' ? 'Video chứng minh' : 'Ảnh chứng minh')}
            </span>
            <a
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 font-medium text-amber-700 hover:text-amber-800"
            >
              {attachment.type === 'video' ? 'Mở video' : 'Mở ảnh'}
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

function getOwnerRoleFilter(
  scope: AfterSalesScope,
  category: SupportTicketCategory
): SupportTicketOwnerRole | undefined {
  if (scope === 'manager') return undefined;
  if (scope === 'sale' && ['return', 'warranty'].includes(category)) {
    return 'sales';
  }
  if (scope === 'operation' && category === 'warranty') {
    return 'operations';
  }
  return undefined;
}

function TicketDetailDialog({
  ticket,
  open,
  onOpenChange,
  scope,
  onReply,
  onUpdateStatus,
  onCreateWarrantyOrder,
  onCreateWarrantyRefund,
  isSubmitting,
}: {
  ticket: SupportTicketRecord | null;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  scope: AfterSalesScope;
  onReply: (message: string) => Promise<void>;
  onUpdateStatus: (status: SupportTicketStatus, note: string) => Promise<void>;
  onCreateWarrantyOrder: (note: string) => Promise<void>;
  onCreateWarrantyRefund: (note: string) => Promise<void>;
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
  const allowCreateWarrantyOrder = canCreateWarrantyOrder(ticket, scope);
  const allowCreateWarrantyRefund = canCreateWarrantyRefund(ticket, scope);

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
                  <dt>Đang xử lý</dt>
                  <dd className="text-right font-medium text-gray-900">
                    {TICKET_OWNER_LABELS[ticket.currentOwnerRole] || ticket.currentOwnerRole}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>Bước tiếp theo</dt>
                  <dd className="text-right font-medium text-gray-900">
                    {NEXT_ACTION_LABELS[ticket.nextActionCode] || ticket.nextActionCode || '-'}
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
                {ticket.warranty.serviceOrder ? (
                  <>
                    <div>
                      <dt>Đơn bảo hành</dt>
                      <dd className="font-medium text-gray-900">
                        {ticket.warranty.serviceOrder.code}
                      </dd>
                    </div>
                    <div>
                      <dt>Trạng thái đơn</dt>
                      <dd>
                        <span
                          className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getWarrantyOrderTone(ticket.warranty.serviceOrder.status)}`}
                        >
                          {WARRANTY_ORDER_STATUS_LABELS[ticket.warranty.serviceOrder.status] ||
                            ticket.warranty.serviceOrder.status}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt>Tạo lúc</dt>
                      <dd className="font-medium text-gray-900">
                        {formatDateTime(ticket.warranty.serviceOrder.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt>Cập nhật đơn</dt>
                      <dd className="font-medium text-gray-900">
                        {formatDateTime(ticket.warranty.serviceOrder.updatedAt)}
                      </dd>
                    </div>
                    {ticket.warranty.serviceOrder.note ? (
                      <div className="md:col-span-2">
                        <dt>Ghi chú đơn bảo hành</dt>
                        <dd className="font-medium text-gray-900">
                          {ticket.warranty.serviceOrder.note}
                        </dd>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="md:col-span-2 rounded-xl border border-dashed border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                    Sale phải xác nhận chứng cứ. Nếu còn hàng thay thế thì tạo đơn bảo hành để
                    chuyển cho operations; nếu hết hàng thì có thể tạo hoàn tiền cho đúng sản phẩm
                    đang bảo hành.
                  </div>
                )}
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
                    <SupportAttachmentGallery attachments={message.attachments} />
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
                {allowCreateWarrantyOrder || allowCreateWarrantyRefund ? (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                    Sau khi sale xác nhận ảnh hoặc video hiện trạng, tạo đơn bảo hành nếu còn hàng
                    thay thế. Nếu hết hàng, tạo hoàn tiền để chuyển case sang luồng refund.
                  </div>
                ) : null}
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
                <div className="mt-3 flex flex-wrap justify-end gap-3">
                  {allowCreateWarrantyOrder ? (
                    <Button
                      onClick={() => void onCreateWarrantyOrder(statusNote)}
                      disabled={isSubmitting}
                    >
                      Tạo đơn bảo hành
                    </Button>
                  ) : null}
                  {allowCreateWarrantyRefund ? (
                    <Button
                      variant="outline"
                      onClick={() => void onCreateWarrantyRefund(statusNote)}
                      disabled={isSubmitting}
                    >
                      Tạo hoàn tiền
                    </Button>
                  ) : null}
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
  const t = useTranslations('manager.afterSales');
  const { detailId, openDetail, closeDetail } = useDetailRoute();
  const tabs = TAB_CONFIG_KEYS[scope].map((cfg) => ({ ...cfg, label: t(cfg.labelKey as Parameters<typeof t>[0]) }));
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
      const ownerRole = getOwnerRoleFilter(scope, activeConfig.category);

      if (activeConfig.category === 'warranty') {
        const result = await supportApi.getWarrantyCases({
          page: 1,
          limit: 100,
          ownerRole,
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
          ownerRole,
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
  }, [activeConfig.category, eligibilityFilter, scope, searchQuery, statusFilter]);

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

  const handleCreateWarrantyOrder = async (note: string) => {
    if (!selectedTicket || !canCreateWarrantyOrder(selectedTicket, scope)) return;

    try {
      setSubmitting(true);
      await supportApi.createWarrantyOrder(selectedTicket.id, {
        note: note.trim() || undefined,
      });
      await Promise.all([refreshSelectedTicket(selectedTicket.id), loadTickets()]);
      setSuccessMessage('Đã tạo đơn bảo hành và chuyển phiếu sang operations.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Không thể tạo đơn bảo hành.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateWarrantyRefund = async (note: string) => {
    if (!selectedTicket || !canCreateWarrantyRefund(selectedTicket, scope)) return;

    try {
      setSubmitting(true);
      await supportApi.createWarrantyRefund(selectedTicket.id, {
        note: note.trim() || undefined,
      });
      await Promise.all([refreshSelectedTicket(selectedTicket.id), loadTickets()]);
      setSuccessMessage('Đã tạo yêu cầu hoàn tiền cho case bảo hành. Theo dõi tiếp ở màn hoàn tiền.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Không thể tạo yêu cầu hoàn tiền cho case bảo hành.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header title={t(`title_${scope}` as Parameters<typeof t>[0])} subtitle={t(`subtitle_${scope}` as Parameters<typeof t>[0])} />

      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={REFUND_HREF[scope]}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {t(`refundLabel_${scope}` as Parameters<typeof t>[0])}
              <ExternalLink className="h-4 w-4" />
            </Link>
            {scope === 'sale' ? (
              <Link
                href="/sale/orders/prescription-needed"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                {t('prescriptionLink')}
                <ExternalLink className="h-4 w-4" />
              </Link>
            ) : null}
          </div>

          <Button variant="outline" className="gap-2" onClick={() => void loadTickets()}>
            <RefreshCw className="h-4 w-4" />
            {t('reload')}
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
                    placeholder={t('searchPlaceholder')}
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
                    <option value="all">{t('allStatus')}</option>
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
                      <option value="all">{t('allConditions')}</option>
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
                          <th className="px-4 py-3">{t('table.ticket')}</th>
                          <th className="px-4 py-3">{t('table.customer')}</th>
                          <th className="px-4 py-3">{t('table.store')}</th>
                          <th className="px-4 py-3">{t('table.status')}</th>
                          <th className="px-4 py-3">{t('table.lastUpdate')}</th>
                          <th className="px-4 py-3 text-right">{t('table.actions')}</th>
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
                              <div className="mt-1 text-xs text-gray-500">
                                {TICKET_OWNER_LABELS[ticket.currentOwnerRole] ||
                                  ticket.currentOwnerRole}
                              </div>
                              {ticket.warranty ? (
                                <div className="mt-1 text-xs text-gray-500">
                                  {ELIGIBILITY_LABELS[ticket.warranty.eligibility]}
                                </div>
                              ) : null}
                            </td>
                            <td className="px-4 py-3">
                              <div>{formatDateTime(ticket.lastMessageAt || ticket.updatedAt)}</div>
                              <div className="mt-1 text-xs text-gray-500">
                                {NEXT_ACTION_LABELS[ticket.nextActionCode] ||
                                  ticket.nextActionCode ||
                                  '-'}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDetail(ticket.id)}
                              >
                                {t('open')}
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {tickets.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-500">
                              {t('noMatch')}
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
            {t('loadingDetail')}
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
        onCreateWarrantyOrder={handleCreateWarrantyOrder}
        onCreateWarrantyRefund={handleCreateWarrantyRefund}
        isSubmitting={submitting}
      />
    </>
  );
}
