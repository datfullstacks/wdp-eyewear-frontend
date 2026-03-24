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
import { useStatusRealtimeReload } from '@/hooks/useStatusRealtime';
import { toSupplementOrder } from '@/lib/orderAdapters';
import { canOperationHandlePrescription } from '@/lib/orderWorkflow';
import type {
  ContactHistory,
  ContactType,
  SupplementOrder,
} from '@/types/prescription';

const typeOptions = [
  { value: 'no_prescription', label: 'Chua co Rx' },
  { value: 'incomplete_data', label: 'Thieu du lieu' },
  { value: 'unclear_image', label: 'Anh khong ro' },
  { value: 'need_verification', label: 'Can xac nhan' },
];

const priorityOptions = [
  { value: 'urgent', label: 'Gap' },
  { value: 'high', label: 'Cao' },
  { value: 'normal', label: 'Binh thuong' },
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

function parseContactMessage(message: string): { type: ContactType; content: string } {
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
  templateId: string,
) {
  const template = (contactTemplates[contactType] || []).find(
    (entry) => entry.id === templateId,
  );
  if (!template) return '';

  let content = template.content
    .replace('{customer}', order.customer)
    .replace('{orderId}', order.orderId);

  if (content.includes('{missingFields}')) {
    const fields = order.missingFields.map((field) => `- ${field.label}`).join('\n');
    content = content.replace('{missingFields}', fields);
  }

  return content.trim();
}

function mapTicketToContactHistory(ticket?: SupportTicketRecord | null): ContactHistory[] {
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
      existing?.lastMessageAt || existing?.updatedAt || existing?.createdAt || 0,
    ).getTime();
    const nextTime = new Date(
      ticket.lastMessageAt || ticket.updatedAt || ticket.createdAt || 0,
    ).getTime();

    if (!existing || nextTime >= existingTime) {
      map.set(ticket.orderId, ticket);
    }
  }

  return map;
}

export default function OrdersPrescriptionSupplement() {
  const [orders, setOrders] = useState<SupplementOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState<SupplementOrder | null>(null);
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
          limit: 200,
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
          });

          return accumulator;
        }, []);

      setOrders(mapped);
      setSelectedOrders((previous) =>
        previous.filter((id) => mapped.some((order) => order.id === id)),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Khong tai duoc danh sach don can bo sung prescription.',
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

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const searchValue = searchTerm.trim().toLowerCase();
        const matchesSearch =
          !searchValue ||
          order.orderId.toLowerCase().includes(searchValue) ||
          order.customer.toLowerCase().includes(searchValue) ||
          order.phone.includes(searchValue);
        const matchesType = typeFilter === 'all' || order.missingType === typeFilter;
        const matchesPriority =
          priorityFilter === 'all' || order.priority === priorityFilter;

        return matchesSearch && matchesType && matchesPriority;
      }),
    [orders, priorityFilter, searchTerm, typeFilter],
  );

  const pendingOrders = filteredOrders.filter((order) => order.contactAttempts < 3);
  const escalatedOrders = filteredOrders.filter((order) => order.contactAttempts >= 3);

  const stats = {
    total: orders.length,
    noPrescription: orders.filter((order) => order.missingType === 'no_prescription').length,
    incomplete: orders.filter((order) => order.missingType === 'incomplete_data').length,
    unclear: orders.filter((order) => order.missingType === 'unclear_image').length,
    needVerify: orders.filter((order) => order.missingType === 'need_verification').length,
    urgent: orders.filter((order) => order.priority === 'urgent').length,
    escalated: orders.filter((order) => order.contactAttempts >= 3).length,
  };

  const currentTabOrders = activeTab === 'pending' ? pendingOrders : escalatedOrders;

  const handleSelectAll = (checked: boolean) => {
    if (!checked) {
      setSelectedOrders([]);
      return;
    }

    setSelectedOrders(currentTabOrders.map((order) => order.id));
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    setSelectedOrders((previous) =>
      checked ? Array.from(new Set([...previous, orderId])) : previous.filter((id) => id !== orderId),
    );
  };

  const handleOpenModal = (
    order: SupplementOrder,
    setter: (open: boolean) => void,
  ) => {
    setSelectedOrder(order);
    setSuccessMessage(null);
    setter(true);
  };

  const createOrReplyPrescriptionTicket = async (
    order: SupplementOrder,
    contactType: ContactType,
    content: string,
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

  const handleContactSend = async (contact: Omit<ContactHistory, 'id'>) => {
    if (!selectedOrder) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      await createOrReplyPrescriptionTicket(selectedOrder, contact.type, contact.content);
      setContactOpen(false);
      setSelectedOrders([]);
      setSuccessMessage('Prescription clarification message sent through live support ticket.');
      await loadOrders();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Khong gui duoc yeu cau clarification.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkContact = async (contactType: ContactType, templateId: string) => {
    const batch = orders.filter((order) => selectedOrders.includes(order.id));
    if (batch.length === 0) return;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      await Promise.all(
        batch.map((order) => {
          const content = buildTemplateMessage(order, contactType, templateId);
          return createOrReplyPrescriptionTicket(order, contactType, content);
        }),
      );

      setBulkContactOpen(false);
      setSelectedOrders([]);
      setSuccessMessage('Bulk prescription clarification was sent through live support tickets.');
      await loadOrders();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Khong gui duoc bulk clarification.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title="Don can bo sung prescription"
        subtitle="Sales/support queue for missing, incomplete, or unclear prescription data"
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
                placeholder="Tim theo ma don, ten khach, SDT..."
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
                    aria-label="Bo loc"
                    className="text-foreground/80 hover:text-foreground"
                  >
                    <Filter />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>Loai thieu</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={typeFilter} onValueChange={setTypeFilter}>
                    <DropdownMenuRadioItem value="all">Tat ca loai</DropdownMenuRadioItem>
                    {typeOptions.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value}>
                        {option.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Do uu tien</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={priorityFilter}
                    onValueChange={setPriorityFilter}
                  >
                    <DropdownMenuRadioItem value="all">Tat ca</DropdownMenuRadioItem>
                    {priorityOptions.map((option) => (
                      <DropdownMenuRadioItem key={option.value} value={option.value}>
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
              Bulk contact ({selectedOrders.length})
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => void loadOrders()}
              disabled={isLoading || isSubmitting}
            >
              <RefreshCw className="h-4 w-4" />
              Lam moi
            </Button>
          </div>
        </div>

        {isLoading ? (
          <p className="text-foreground/70 text-sm">Dang tai du lieu don can bo sung...</p>
        ) : null}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Dang cho ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="escalated" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Escalated ({escalatedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <PrescriptionOrderTable
              orders={pendingOrders}
              selectedOrders={selectedOrders.filter((id) =>
                pendingOrders.some((order) => order.id === id),
              )}
              onSelectOrder={handleSelectOrder}
              onSelectAll={handleSelectAll}
              onViewDetail={(order) => handleOpenModal(order, setDetailOpen)}
              onContact={(order) => handleOpenModal(order, setContactOpen)}
              onViewHistory={(order) => handleOpenModal(order, setHistoryOpen)}
              onUploadImage={(order) => handleOpenModal(order, setUploadImageOpen)}
            />
          </TabsContent>

          <TabsContent value="escalated" className="space-y-3">
            <div className="text-foreground/80 flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Don da lien he nhieu lan ({'>=3'}) can xu ly dac biet
            </div>
            <PrescriptionOrderTable
              orders={escalatedOrders}
              selectedOrders={selectedOrders.filter((id) =>
                escalatedOrders.some((order) => order.id === id),
              )}
              onSelectOrder={handleSelectOrder}
              onSelectAll={handleSelectAll}
              onViewDetail={(order) => handleOpenModal(order, setDetailOpen)}
              onContact={(order) => handleOpenModal(order, setContactOpen)}
              onViewHistory={(order) => handleOpenModal(order, setHistoryOpen)}
              onUploadImage={(order) => handleOpenModal(order, setUploadImageOpen)}
            />
          </TabsContent>
        </Tabs>

        <OrderDetailModal
          open={detailOpen}
          onOpenChange={setDetailOpen}
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
