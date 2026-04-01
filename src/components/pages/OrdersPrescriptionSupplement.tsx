'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Clock, Filter, RefreshCw, Send } from 'lucide-react';

import { orderApi, supportApi, type SupportTicketRecord } from '@/api';
import { SearchBar } from '@/components/molecules/SearchBar';
import { Header } from '@/components/organisms/Header';
import {
  BulkContactModal,
  ContactHistoryModal,
  ContactModal,
  OrderDetailModal,
  PrescriptionOrderTable,
  PrescriptionStatsGrid,
  UploadImageModal,
} from '@/components/organisms/prescription';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { contactTemplates } from '@/data/prescriptionData';
import { useDetailRoute } from '@/hooks/useDetailRoute';
import { useStatusRealtimeReload } from '@/hooks/useStatusRealtime';
import { toSupplementOrder } from '@/lib/orderAdapters';
import { getPrescriptionFollowUpLabel } from '@/lib/prescriptionFollowUp';
import { canOperationHandlePrescription } from '@/lib/orderWorkflow';
import type {
  ContactHistory,
  ContactType,
  PrescriptionFollowUpStatus,
  SupplementOrder,
} from '@/types/prescription';

const typeOptions = [
  { value: 'no_prescription', label: 'Chưa có Rx' },
  { value: 'incomplete_data', label: 'Thiếu dữ liệu' },
  { value: 'unclear_image', label: 'Ảnh không rõ' },
  { value: 'need_verification', label: 'Cần xác nhận' },
];

const priorityOptions = [
  { value: 'urgent', label: 'Gấp' },
  { value: 'high', label: 'Cao' },
  { value: 'normal', label: 'Bình thường' },
];

const followUpOptions: Array<{
  value: 'all' | PrescriptionFollowUpStatus;
  label: string;
}> = [
  { value: 'all', label: 'Tất cả tiến độ' },
  { value: 'needs_review', label: 'Cần kiểm tra' },
  { value: 'needs_customer_contact', label: 'Cần liên hệ khách' },
  { value: 'waiting_customer_response', label: 'Chờ khách phản hồi' },
  { value: 'customer_responded', label: 'Khách đã phản hồi' },
];

const CONTACT_PREFIX: Record<ContactType, string> = {
  sms: '[SMS]',
  email: '[EMAIL]',
  phone: '[PHONE]',
  zalo: '[ZALO]',
};

function formatShortDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleString('vi-VN');
}

function toSupportPriority(priority: SupplementOrder['priority']) {
  return priority === 'normal' ? 'normal' : 'high';
}

function decorateContactMessage(type: ContactType, content: string) {
  return `${CONTACT_PREFIX[type]} ${content.trim()}`;
}

function parseContactMessage(message: string): {
  type: ContactType;
  content: string;
} {
  const trimmed = String(message || '').trim();

  for (const [type, prefix] of Object.entries(CONTACT_PREFIX) as Array<
    [ContactType, string]
  >) {
    if (trimmed.startsWith(prefix)) {
      return {
        type,
        content: trimmed.slice(prefix.length).trim(),
      };
    }
  }

  return {
    type: 'sms',
    content: trimmed,
  };
}

function buildTemplateMessage(
  order: SupplementOrder,
  contactType: ContactType,
  templateId: string
) {
  const template = (contactTemplates[contactType] || []).find(
    (entry) => entry.id === templateId
  );
  if (!template) return '';

  let content = template.content
    .replace('{customer}', order.customer)
    .replace('{orderId}', order.orderId);

  if (content.includes('{missingFields}')) {
    const fields = order.missingFields
      .map((field) => `- ${field.label}`)
      .join('\n');
    content = content.replace('{missingFields}', fields);
  }

  return content.trim();
}

function mapTicketToContactHistory(
  ticket?: SupportTicketRecord | null
): ContactHistory[] {
  if (!ticket) return [];

  return ticket.messages
    .filter((message) => message.sender === 'staff')
    .sort((left, right) => {
      const leftTime = new Date(left.createdAt || 0).getTime();
      const rightTime = new Date(right.createdAt || 0).getTime();
      return leftTime - rightTime;
    })
    .map((message) => {
      const parsed = parseContactMessage(message.message);

      return {
        id: message.id,
        type: parsed.type,
        date: formatShortDate(message.createdAt) || '-',
        content: parsed.content,
        status: 'sent',
        staff: 'Staff',
      } satisfies ContactHistory;
    });
}

function pickLatestTicketByOrder(tickets: SupportTicketRecord[]) {
  const map = new Map<string, SupportTicketRecord>();

  for (const ticket of tickets) {
    if (!ticket.orderId) continue;
    const existing = map.get(ticket.orderId);
    const existingTime = new Date(
      existing?.lastMessageAt || existing?.updatedAt || existing?.createdAt || 0
    ).getTime();
    const nextTime = new Date(
      ticket.lastMessageAt || ticket.updatedAt || ticket.createdAt || 0
    ).getTime();

    if (!existing || nextTime >= existingTime) {
      map.set(ticket.orderId, ticket);
    }
  }

  return map;
}

function hasExplicitFollowUpStatus(order: {
  opsExecution?: { prescriptionFollowUpStatus?: string | null } | null;
}) {
  const status = String(order.opsExecution?.prescriptionFollowUpStatus || '')
    .trim()
    .toLowerCase();
  return (
    status === 'needs_review' ||
    status === 'needs_customer_contact' ||
    status === 'waiting_customer_response' ||
    status === 'customer_responded'
  );
}

function resolveSupplementFollowUpStatus(
  order: {
    opsExecution?: { prescriptionFollowUpStatus?: string | null } | null;
  },
  base: SupplementOrder,
  contactHistory: ContactHistory[]
): PrescriptionFollowUpStatus {
  if (hasExplicitFollowUpStatus(order)) {
    return base.followUpStatus;
  }

  return contactHistory.length > 0
    ? 'waiting_customer_response'
    : 'needs_review';
}

export default function OrdersPrescriptionSupplement() {
  const { detailId, openDetail, closeDetail } = useDetailRoute();
  const [orders, setOrders] = useState<SupplementOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [followUpFilter, setFollowUpFilter] = useState<
    'all' | PrescriptionFollowUpStatus
  >('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState<SupplementOrder | null>(
    null
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [bulkContactOpen, setBulkContactOpen] = useState(false);
  const [uploadImageOpen, setUploadImageOpen] = useState(false);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [orderResult, ticketResult] = await Promise.all([
        orderApi.getAll({ page: 1, limit: 200 }),
        supportApi.getTickets({
          page: 1,
          limit: 100,
          category: 'prescription',
        }),
      ]);

      const ticketByOrderId = pickLatestTicketByOrder(ticketResult.items);
      const mapped = orderResult.orders
        .filter(canOperationHandlePrescription)
        .reduce<SupplementOrder[]>((accumulator, order) => {
          const base = toSupplementOrder(order);
          if (!base) {
            return accumulator;
          }

          const ticket = ticketByOrderId.get(order.id);
          const contactHistory = mapTicketToContactHistory(ticket);
          const followUpStatus = resolveSupplementFollowUpStatus(
            order,
            base,
            contactHistory
          );

          accumulator.push({
            ...base,
            supportTicketId: ticket?.id,
            supportStatus: ticket?.status,
            contactAttempts: contactHistory.length,
            lastContactDate:
              contactHistory.length > 0
                ? contactHistory[contactHistory.length - 1]?.date
                : undefined,
            contactHistory,
            followUpStatus,
          });

          return accumulator;
        }, []);

      setOrders(mapped);
      setSelectedOrders((previous) =>
        previous.filter((id) => mapped.some((order) => order.id === id))
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Không tải được danh sách đơn cần bổ sung thông số.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useStatusRealtimeReload({
    domains: ['order', 'support'],
    reload: loadOrders,
  });

  useEffect(() => {
    if (!detailId) {
      setDetailOpen(false);
      return;
    }

    const matchedOrder = orders.find((order) => order.id === detailId);
    if (matchedOrder) {
      setSelectedOrder(matchedOrder);
      setDetailOpen(true);
      return;
    }

    if (!isLoading) {
      setSelectedOrder(null);
      setDetailOpen(false);
    }
  }, [detailId, isLoading, orders]);

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const searchValue = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !searchValue ||
          order.orderId.toLowerCase().includes(searchValue) ||
          order.customer.toLowerCase().includes(searchValue) ||
          order.phone.includes(searchValue);
        const matchesType =
          typeFilter === 'all' || order.missingType === typeFilter;
        const matchesPriority =
          priorityFilter === 'all' || order.priority === priorityFilter;
        const matchesFollowUp =
          followUpFilter === 'all' || order.followUpStatus === followUpFilter;

        return (
          matchesSearch && matchesType && matchesPriority && matchesFollowUp
        );
      }),
    [followUpFilter, orders, priorityFilter, searchTerm, typeFilter]
  );

  const pendingOrders = filteredOrders.filter(
    (order) => order.contactAttempts < 3
  );
  const escalatedOrders = filteredOrders.filter(
    (order) => order.contactAttempts >= 3
  );

  const stats = {
    total: orders.length,
    needsReview: orders.filter(
      (order) => order.followUpStatus === 'needs_review'
    ).length,
    needsCustomerContact: orders.filter(
      (order) => order.followUpStatus === 'needs_customer_contact'
    ).length,
    waitingCustomerResponse: orders.filter(
      (order) => order.followUpStatus === 'waiting_customer_response'
    ).length,
    customerResponded: orders.filter(
      (order) => order.followUpStatus === 'customer_responded'
    ).length,
    escalated: orders.filter((order) => order.contactAttempts >= 3).length,
  };

  const currentTabOrders =
    activeTab === 'pending' ? pendingOrders : escalatedOrders;

  const handleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedOrders([]);
      return;
    }

    setSelectedOrders(currentTabOrders.map((order) => order.id));
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    setSelectedOrders((previous) =>
      checked
        ? Array.from(new Set([...previous, orderId]))
        : previous.filter((id) => id !== orderId)
    );
  };

  const handleOpenModal = (
    order: SupplementOrder,
    setter: (open: boolean) => void
  ) => {
    setSelectedOrder(order);
    setSuccessMessage(null);
    setter(true);
  };

  const createOrReplyPrescriptionTicket = async (
    order: SupplementOrder,
    contactType: ContactType,
    content: string
  ) => {
    const message = decorateContactMessage(contactType, content);

    if (order.supportTicketId) {
      await supportApi.replyTicket(order.supportTicketId, { message });
      return;
    }

    await supportApi.createTicket({
      subject: `Prescription clarification for ${order.orderId}`,
      message,
      category: 'prescription',
      priority: toSupportPriority(order.priority),
      orderId: order.id,
    });
  };

  const handleUpdateFollowUpStatus = async (
    order: SupplementOrder,
    nextStatus: PrescriptionFollowUpStatus
  ) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await orderApi.updateOpsExecution(order.id, {
        prescriptionFollowUpStatus: nextStatus,
      });
      setSuccessMessage(
        `Đã chuyển ${order.orderId} sang "${getPrescriptionFollowUpLabel(
          nextStatus
        )}".`
      );
      await loadOrders();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Không cập nhật được trạng thái bổ sung thông số.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSend = async (contact: Omit<ContactHistory, 'id'>) => {
    if (!selectedOrder) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await createOrReplyPrescriptionTicket(
        selectedOrder,
        contact.type,
        contact.content
      );
      await orderApi.updateOpsExecution(selectedOrder.id, {
        prescriptionFollowUpStatus: 'waiting_customer_response',
      });
      setContactOpen(false);
      setSelectedOrders([]);
      setSuccessMessage(
        'Đã gửi yêu cầu bổ sung thông số và chuyển sang trạng thái chờ khách phản hồi.'
      );
      await loadOrders();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Không gửi được yêu cầu bổ sung thông số.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkContact = async (
    contactType: ContactType,
    templateId: string
  ) => {
    const batch = orders.filter((order) => selectedOrders.includes(order.id));
    if (batch.length === 0) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await Promise.all(
        batch.map(async (order) => {
          const content = buildTemplateMessage(order, contactType, templateId);
          await createOrReplyPrescriptionTicket(order, contactType, content);
          await orderApi.updateOpsExecution(order.id, {
            prescriptionFollowUpStatus: 'waiting_customer_response',
          });
        })
      );

      setBulkContactOpen(false);
      setSelectedOrders([]);
      setSuccessMessage(
        'Đã gửi liên hệ hàng loạt và cập nhật các đơn sang trạng thái chờ khách phản hồi.'
      );
      await loadOrders();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Không gửi được liên hệ hàng loạt.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title="Đơn cần bổ sung thông số"
        subtitle="Sale kiểm tra đơn kính thiếu thông số, đổi trạng thái follow-up và liên hệ khách hàng để hoàn tất dữ liệu."
      />

      <div className="space-y-6 p-6">
        <PrescriptionStatsGrid stats={stats} />

        {successMessage ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {errorMessage}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-start">
            <div className="w-full sm:max-w-[240px]">
              <SearchBar
                placeholder="Tìm theo mã đơn, tên khách, SĐT..."
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
                    aria-label="Bộ lọc"
                    className="text-foreground/80 hover:text-foreground"
                  >
                    <Filter />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Loại thiếu</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                  >
                    <DropdownMenuRadioItem value="all">
                      Tất cả loại
                    </DropdownMenuRadioItem>
                    {typeOptions.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Độ ưu tiên</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={priorityFilter}
                    onValueChange={setPriorityFilter}
                  >
                    <DropdownMenuRadioItem value="all">
                      Tất cả
                    </DropdownMenuRadioItem>
                    {priorityOptions.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Theo dõi sale</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={followUpFilter}
                    onValueChange={(value) =>
                      setFollowUpFilter(
                        value as 'all' | PrescriptionFollowUpStatus
                      )
                    }
                  >
                    {followUpOptions.map((option) => (
                      <DropdownMenuRadioItem
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setBulkContactOpen(true)}
              disabled={selectedOrders.length === 0 || isSubmitting}
            >
              <Send className="mr-2 h-4 w-4" />
              Liên hệ hàng loạt ({selectedOrders.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => void loadOrders()}
              disabled={isLoading || isSubmitting}
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-foreground/70 text-sm">
            Đang tải dữ liệu đơn cần bổ sung...
          </p>
        ) : null}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Đang chờ ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="escalated" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Xử lý đặc biệt ({escalatedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <PrescriptionOrderTable
              orders={pendingOrders}
              selectedOrders={selectedOrders.filter((id) =>
                pendingOrders.some((order) => order.id === id)
              )}
              onSelectOrder={handleSelectOrder}
              onSelectAll={handleSelectAll}
              onViewDetail={(order) => openDetail(order.id)}
              onContact={(order) => handleOpenModal(order, setContactOpen)}
              onViewHistory={(order) => handleOpenModal(order, setHistoryOpen)}
              onUploadImage={(order) =>
                handleOpenModal(order, setUploadImageOpen)
              }
              onUpdateFollowUpStatus={handleUpdateFollowUpStatus}
              isUpdatingStatus={isSubmitting}
            />
          </TabsContent>

          <TabsContent value="escalated" className="space-y-3">
            <div className="text-foreground/80 flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Đơn đã liên hệ nhiều lần ({'>=3'}) cần xử lý đặc biệt
            </div>
            <PrescriptionOrderTable
              orders={escalatedOrders}
              selectedOrders={selectedOrders.filter((id) =>
                escalatedOrders.some((order) => order.id === id)
              )}
              onSelectOrder={handleSelectOrder}
              onSelectAll={handleSelectAll}
              onViewDetail={(order) => openDetail(order.id)}
              onContact={(order) => handleOpenModal(order, setContactOpen)}
              onViewHistory={(order) => handleOpenModal(order, setHistoryOpen)}
              onUploadImage={(order) =>
                handleOpenModal(order, setUploadImageOpen)
              }
              onUpdateFollowUpStatus={handleUpdateFollowUpStatus}
              isUpdatingStatus={isSubmitting}
            />
          </TabsContent>
        </Tabs>

        <OrderDetailModal
          open={detailOpen}
          onOpenChange={(open) => {
            setDetailOpen(open);
            if (open) return;
            if (detailId) {
              closeDetail();
              return;
            }
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onContact={() => {
            if (!selectedOrder) return;
            setDetailOpen(false);
            setContactOpen(true);
          }}
        />
        <ContactModal
          open={contactOpen}
          onOpenChange={setContactOpen}
          order={selectedOrder}
          onSend={handleContactSend}
          isSubmitting={isSubmitting}
        />
        <ContactHistoryModal
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          order={selectedOrder}
          onContact={() => {
            if (!selectedOrder) return;
            setHistoryOpen(false);
            setContactOpen(true);
          }}
        />
        <BulkContactModal
          open={bulkContactOpen}
          onOpenChange={setBulkContactOpen}
          selectedCount={selectedOrders.length}
          onSend={handleBulkContact}
          isSubmitting={isSubmitting}
        />
        <UploadImageModal
          open={uploadImageOpen}
          onOpenChange={setUploadImageOpen}
          order={selectedOrder}
        />
      </div>
    </>
  );
}
