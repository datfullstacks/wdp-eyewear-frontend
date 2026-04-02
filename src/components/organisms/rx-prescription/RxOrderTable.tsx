import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { PrescriptionOrder } from '@/types/rxPrescription';
import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  Package,
  Phone,
  Truck,
} from 'lucide-react';

interface RxOrderTableProps {
  orders: PrescriptionOrder[];
  onViewDetail: (order: PrescriptionOrder) => void;
  onInputPrescription: (order: PrescriptionOrder) => void;
  onContact: (order: PrescriptionOrder) => void;
  onApprove: (order: PrescriptionOrder) => void;
  onAdvanceWorkflow: (order: PrescriptionOrder) => void;
  onCreateShipment: (order: PrescriptionOrder) => void;
  onManageShipment: (order: PrescriptionOrder) => void;
}

type StatusTone = 'success' | 'warning' | 'error' | 'info' | 'default';

type MainAction = {
  key: string;
  label: string;
  icon: LucideIcon;
  disabled: boolean;
  title: string;
  onClick?: () => void;
};

const workflowStageSequence: PrescriptionOrder['workflowStage'][] = [
  'waiting_review',
  'waiting_lab',
  'lens_processing',
  'lens_fitting',
  'qc_check',
  'ready_to_pack',
  'packing',
  'ready_to_ship',
  'shipment_created',
  'handover_to_carrier',
  'in_transit',
  'delivery_failed',
  'waiting_redelivery',
  'return_pending',
  'return_in_transit',
  'exception_hold',
  'delivered',
  'returned',
];

const statusTextClass: Record<StatusTone, string> = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
  info: 'text-primary',
  default: 'text-foreground/80',
};

const statusBadgeClass: Record<StatusTone, string> = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  info: 'border-sky-200 bg-sky-50 text-sky-700',
  default: 'border-slate-200 bg-slate-50 text-slate-600',
};

function statusBadgeTone(tone: StatusTone) {
  return `inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass[tone]}`;
}

function getWorkflowStageIndex(stage: PrescriptionOrder['workflowStage']) {
  return workflowStageSequence.indexOf(stage);
}

function getRxStatusLabel(order: PrescriptionOrder) {
  if (order.prescriptionStatus === 'missing') {
    return { label: 'Thiếu Rx', className: statusTextClass.error };
  }

  if (order.prescriptionStatus === 'incomplete') {
    return { label: 'Chưa đầy đủ', className: statusTextClass.warning };
  }

  if (order.prescriptionStatus === 'pending_review') {
    return { label: 'Chờ duyệt', className: statusTextClass.info };
  }

  return { label: 'Đã duyệt', className: statusTextClass.success };
}

function getWorkflowMeta(order: PrescriptionOrder): {
  label: string;
  tone: StatusTone;
} {
  switch (order.workflowStage) {
    case 'waiting_review':
      return { label: 'Chờ duyệt Rx', tone: 'warning' };
    case 'waiting_lab':
      return { label: 'Chờ vào gia công', tone: 'info' };
    case 'lens_processing':
      return { label: 'Đang cắt mài tròng', tone: 'warning' };
    case 'lens_fitting':
      return { label: 'Đang lắp tròng vào gọng', tone: 'warning' };
    case 'qc_check':
      return { label: 'Đang QC sau gia công', tone: 'info' };
    case 'ready_to_pack':
      return { label: 'Sẵn sàng đóng gói', tone: 'success' };
    case 'packing':
      return { label: 'Đang đóng gói', tone: 'warning' };
    case 'ready_to_ship':
      return { label: 'Chờ tạo vận đơn', tone: 'info' };
    case 'shipment_created':
      return { label: 'Đã tạo vận đơn GHN', tone: 'info' };
    case 'handover_to_carrier':
      return { label: 'Đã bàn giao vận chuyển', tone: 'info' };
    case 'in_transit':
      return { label: 'Đang vận chuyển', tone: 'info' };
    case 'delivery_failed':
      return { label: 'Giao thất bại', tone: 'error' };
    case 'waiting_redelivery':
      return { label: 'Chờ giao lại', tone: 'warning' };
    case 'return_pending':
      return { label: 'Chờ hoàn hàng', tone: 'warning' };
    case 'return_in_transit':
      return { label: 'Đang hoàn hàng', tone: 'warning' };
    case 'exception_hold':
      return { label: 'Đang hold ngoại lệ', tone: 'error' };
    case 'delivered':
      return { label: 'Đã giao', tone: 'success' };
    case 'returned':
      return { label: 'Đã hoàn hàng', tone: 'error' };
    default:
      return { label: '-', tone: 'default' };
  }
}

function getPaymentMeta(order: PrescriptionOrder): {
  label: string;
  tone: StatusTone;
} {
  switch (order.paymentStatus) {
    case 'paid':
      return { label: 'Đã thanh toán', tone: 'success' };
    case 'partial':
      return { label: 'Thanh toán một phần', tone: 'info' };
    case 'cod':
      return { label: 'COD', tone: 'warning' };
    default:
      return { label: 'Chờ thanh toán', tone: 'default' };
  }
}

function canCreateShipment(order: PrescriptionOrder) {
  return order.workflowStage === 'ready_to_ship';
}

function canManageShipment(order: PrescriptionOrder) {
  if (String(order.trackingCode || '').trim()) {
    return true;
  }

  return [
    'shipment_created',
    'handover_to_carrier',
    'in_transit',
    'delivery_failed',
    'waiting_redelivery',
    'return_pending',
    'return_in_transit',
    'exception_hold',
  ].includes(order.workflowStage);
}

function getAdvanceStepHint(
  order: PrescriptionOrder,
  stage: PrescriptionOrder['workflowStage']
) {
  if (order.prescriptionStatus !== 'approved') {
    return stage === 'waiting_lab'
      ? 'Cần duyệt Rx trước khi bắt đầu gia công.'
      : 'Cần duyệt Rx và hoàn tất các bước trước đó.';
  }

  const currentIndex = getWorkflowStageIndex(order.workflowStage);
  const targetIndex = getWorkflowStageIndex(stage);

  if (currentIndex > targetIndex) {
    return 'Đơn đã qua bước này.';
  }

  if (currentIndex < targetIndex) {
    return 'Cần hoàn tất bước trước đó.';
  }

  return '';
}

function buildMainActions(
  order: PrescriptionOrder,
  handlers: Pick<
    RxOrderTableProps,
    | 'onInputPrescription'
    | 'onApprove'
    | 'onAdvanceWorkflow'
    | 'onCreateShipment'
    | 'onManageShipment'
  >
): MainAction[] {
  const canInputPrescription =
    order.prescriptionStatus === 'missing' ||
    order.prescriptionStatus === 'incomplete';
  const canApprovePrescription = order.prescriptionStatus === 'pending_review';
  const canCreatePrescriptionShipment =
    order.prescriptionStatus === 'approved' && canCreateShipment(order);
  const canOpenPrescriptionShipmentManager =
    order.prescriptionStatus === 'approved' && canManageShipment(order);
  const currentStageIndex = getWorkflowStageIndex(order.workflowStage);
  const shipmentCreatedIndex = getWorkflowStageIndex('shipment_created');

  const workflowActions: Array<{
    key: string;
    label: string;
    stage: PrescriptionOrder['workflowStage'];
  }> = [
    {
      key: 'start_lab',
      label: 'Bắt đầu gia công',
      stage: 'waiting_lab',
    },
    {
      key: 'to_lens_fitting',
      label: 'Chuyển sang lắp tròng',
      stage: 'lens_processing',
    },
    {
      key: 'to_qc',
      label: 'Chuyển sang QC',
      stage: 'lens_fitting',
    },
    {
      key: 'qc_passed',
      label: 'Đạt QC - sẵn sàng đóng gói',
      stage: 'qc_check',
    },
    {
      key: 'to_packing',
      label: 'Chuyển sang đóng gói',
      stage: 'ready_to_pack',
    },
    {
      key: 'ready_for_shipment',
      label: 'Sẵn sàng tạo vận đơn',
      stage: 'packing',
    },
  ];

  return [
    {
      key: 'input_rx',
      label: 'Nhập Rx',
      icon: FileText,
      disabled: !canInputPrescription,
      title: canInputPrescription
        ? ''
        : order.prescriptionStatus === 'pending_review'
          ? 'Rx đã đủ dữ liệu và đang chờ duyệt.'
          : 'Đơn đã có Rx và đã duyệt.',
      onClick: canInputPrescription
        ? () => handlers.onInputPrescription(order)
        : undefined,
    },
    {
      key: 'approve_rx',
      label: 'Duyệt và vào gia công',
      icon: CheckCircle2,
      disabled: !canApprovePrescription,
      title: canApprovePrescription
        ? ''
        : canInputPrescription
          ? 'Cần nhập đủ Rx trước khi duyệt.'
          : 'Đơn đã duyệt Rx.',
      onClick: canApprovePrescription ? () => handlers.onApprove(order) : undefined,
    },
    ...workflowActions.map((action) => ({
      key: action.key,
      label: action.label,
      icon: Package,
      disabled:
        !(
          order.prescriptionStatus === 'approved' &&
          order.workflowStage === action.stage
        ),
      title: getAdvanceStepHint(order, action.stage),
      onClick:
        order.prescriptionStatus === 'approved' &&
        order.workflowStage === action.stage
          ? () => handlers.onAdvanceWorkflow(order)
          : undefined,
    })),
    {
      key: 'create_shipment',
      label: 'Tạo vận đơn GHN',
      icon: Truck,
      disabled: !canCreatePrescriptionShipment,
      title: canCreatePrescriptionShipment
        ? ''
        : order.prescriptionStatus !== 'approved'
          ? 'Cần duyệt Rx và hoàn tất gia công trước.'
          : currentStageIndex > getWorkflowStageIndex('ready_to_ship')
            ? 'Đơn đã có vận đơn hoặc đã sang giao vận.'
            : 'Cần hoàn tất bước đóng gói trước.',
      onClick: canCreatePrescriptionShipment
        ? () => handlers.onCreateShipment(order)
        : undefined,
    },
    {
      key: 'manage_shipment',
      label: 'Quan ly luong GHN',
      icon: Truck,
      disabled: !canOpenPrescriptionShipmentManager,
      title: canOpenPrescriptionShipmentManager
        ? ''
        : order.prescriptionStatus !== 'approved'
          ? 'Can co van don GHN truoc khi quan ly shipment.'
          : currentStageIndex < shipmentCreatedIndex
            ? 'Can tao van don GHN truoc khi quan ly shipment.'
            : 'Don chua co van don GHN de thao tac.',
      onClick: canOpenPrescriptionShipmentManager
        ? () => handlers.onManageShipment(order)
        : undefined,
    },
  ];
}

export const RxOrderTable = ({
  orders,
  onViewDetail,
  onInputPrescription,
  onContact,
  onApprove,
  onAdvanceWorkflow,
  onCreateShipment,
  onManageShipment,
}: RxOrderTableProps) => {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Mã đơn</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Sản phẩm</TableHead>
            <TableHead>Trạng thái Rx</TableHead>
            <TableHead>Tiến độ xử lý</TableHead>
            <TableHead>Thanh toán</TableHead>
            <TableHead className="w-[190px] text-right">
              Thao tác chính
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const rxStatus = getRxStatusLabel(order);
            const workflow = getWorkflowMeta(order);
            const payment = getPaymentMeta(order);
            const canContactCustomer =
              order.prescriptionStatus === 'missing' ||
              order.prescriptionStatus === 'incomplete';
            const mainActions = buildMainActions(order, {
              onInputPrescription,
              onApprove,
              onAdvanceWorkflow,
              onCreateShipment,
              onManageShipment,
            });

            return (
              <TableRow key={order.id} className="hover:bg-muted/30">
                <TableCell className="text-foreground font-mono text-sm font-normal">
                  <span>{order.orderId}</span>
                </TableCell>

                <TableCell>
                  <div>
                    <p className="text-foreground font-normal">{order.customer}</p>
                    <p className="text-foreground/80 text-sm">{order.phone}</p>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="space-y-1">
                    {order.products.map((product, index) => (
                      <div key={index} className="text-sm">
                        <span className="text-foreground">{product.name}</span>
                        <span className="text-foreground/70">
                          {' '}
                          ({product.frame})
                        </span>
                      </div>
                    ))}
                  </div>
                </TableCell>

                <TableCell>
                  <span className={rxStatus.className}>{rxStatus.label}</span>
                </TableCell>

                <TableCell>
                  <span className={statusBadgeTone(workflow.tone)}>
                    {workflow.label}
                  </span>
                </TableCell>

                <TableCell>
                  <span className={statusBadgeTone(payment.tone)}>
                    {payment.label}
                  </span>
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 border-slate-300 bg-white font-semibold text-slate-950 hover:bg-slate-100 hover:text-slate-950"
                        aria-label="Mở thao tác chính"
                      >
                        Thao tác
                        <ChevronDown className="h-4 w-4 opacity-70" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel>Hoạt động chính</DropdownMenuLabel>

                      {mainActions.map((action) => {
                        const Icon = action.icon;

                        return (
                          <DropdownMenuItem
                            key={action.key}
                            onClick={action.onClick}
                            className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                            disabled={action.disabled}
                            title={action.title}
                          >
                            <Icon className="h-4 w-4" />
                            {action.label}
                          </DropdownMenuItem>
                        );
                      })}

                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Tiện ích</DropdownMenuLabel>

                      <DropdownMenuItem
                        onClick={() => onViewDetail(order)}
                        className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                      >
                        <Eye className="h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>

                      {canContactCustomer && (
                        <DropdownMenuItem
                          onClick={() => onContact(order)}
                          className="gap-2 border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 hover:text-slate-950"
                        >
                          <Phone className="h-4 w-4" />
                          Liên hệ khách
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}

          {orders.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-muted-foreground py-8 text-center"
              >
                Không có đơn hàng nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
