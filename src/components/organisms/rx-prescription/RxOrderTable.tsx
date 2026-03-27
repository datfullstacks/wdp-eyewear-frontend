import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { PrescriptionOrder } from '@/types/rxPrescription';
import {
  CheckCircle2,
  Eye,
  MoreHorizontal,
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
  onSyncShipment: (order: PrescriptionOrder) => void;
}

const statusTextClass: Record<string, string> = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
  info: 'text-primary',
  default: 'text-foreground/80',
};

function getRxStatusLabel(order: PrescriptionOrder) {
  if (order.prescriptionStatus === 'missing') {
    return { label: 'Thieu Rx', className: statusTextClass.error };
  }
  if (order.prescriptionStatus === 'incomplete') {
    return { label: 'Chua day du', className: statusTextClass.warning };
  }
  if (order.prescriptionStatus === 'pending_review') {
    return { label: 'Cho duyet', className: statusTextClass.info };
  }
  return { label: 'Da duyet', className: statusTextClass.success };
}

function getWorkflowMeta(order: PrescriptionOrder) {
  switch (order.workflowStage) {
    case 'waiting_review':
      return { label: 'Cho review Rx', className: statusTextClass.warning };
    case 'waiting_lab':
      return { label: 'Cho vao gia cong', className: statusTextClass.info };
    case 'lens_processing':
      return { label: 'Dang cat mai trong', className: statusTextClass.warning };
    case 'lens_fitting':
      return { label: 'Dang lap trong vao gong', className: statusTextClass.warning };
    case 'qc_check':
      return { label: 'Dang QC sau gia cong', className: statusTextClass.info };
    case 'ready_to_pack':
      return { label: 'San sang dong goi', className: statusTextClass.success };
    case 'packing':
      return { label: 'Dang dong goi', className: statusTextClass.warning };
    case 'ready_to_ship':
      return { label: 'Cho tao van don', className: statusTextClass.info };
    case 'shipment_created':
      return { label: 'Da tao van don GHN', className: statusTextClass.info };
    case 'handover_to_carrier':
      return { label: 'Da ban giao van chuyen', className: statusTextClass.info };
    case 'in_transit':
      return { label: 'Dang van chuyen', className: statusTextClass.info };
    case 'delivery_failed':
      return { label: 'Giao that bai', className: statusTextClass.error };
    case 'waiting_redelivery':
      return { label: 'Cho giao lai', className: statusTextClass.warning };
    case 'return_pending':
      return { label: 'Cho hoan hang', className: statusTextClass.warning };
    case 'return_in_transit':
      return { label: 'Dang hoan hang', className: statusTextClass.warning };
    case 'exception_hold':
      return { label: 'Dang hold ngoai le', className: statusTextClass.error };
    case 'delivered':
      return { label: 'Da giao', className: statusTextClass.success };
    case 'returned':
      return { label: 'Da hoan hang', className: statusTextClass.error };
    default:
      return { label: '-', className: statusTextClass.default };
  }
}

function getAdvanceActionLabel(order: PrescriptionOrder): string | null {
  switch (order.workflowStage) {
    case 'waiting_lab':
      return 'Bat dau gia cong';
    case 'lens_processing':
      return 'Chuyen sang lap trong';
    case 'lens_fitting':
      return 'Chuyen sang QC';
    case 'qc_check':
      return 'Dat QC - san sang dong goi';
    case 'ready_to_pack':
      return 'Chuyen sang dong goi';
    case 'packing':
      return 'San sang tao van don';
    default:
      return null;
  }
}

function canCreateShipment(order: PrescriptionOrder) {
  return order.workflowStage === 'ready_to_ship';
}

function canSyncShipment(order: PrescriptionOrder) {
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

function getSourceLabel(source: PrescriptionOrder['source']) {
  if (source === 'customer_upload') return 'Khach upload toa';
  if (source === 'store_input') return 'Store nhap Rx';
  return 'Dang cho Rx';
}

export const RxOrderTable = ({
  orders,
  onViewDetail,
  onInputPrescription: _onInputPrescription,
  onContact,
  onApprove,
  onAdvanceWorkflow,
  onCreateShipment,
  onSyncShipment,
}: RxOrderTableProps) => {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Ma don</TableHead>
            <TableHead>Khach hang</TableHead>
            <TableHead>San pham</TableHead>
            <TableHead>Trang thai Rx</TableHead>
            <TableHead>Tien do xu ly</TableHead>
            <TableHead>GHN</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const rxStatus = getRxStatusLabel(order);
            const workflow = getWorkflowMeta(order);
            const advanceLabel = getAdvanceActionLabel(order);

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
                        <span className="text-foreground/70"> ({product.frame})</span>
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className={rxStatus.className}>{rxStatus.label}</span>
                    <span className="text-foreground/60 text-xs">
                      {getSourceLabel(order.source)}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className={workflow.className}>{workflow.label}</span>
                    {order.opsStage ? (
                      <span className="text-foreground/70 text-xs">{order.opsStage}</span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {order.shipmentStatus ? (
                      <span className="text-foreground/80 text-sm">
                        GHN: {order.shipmentStatus}
                      </span>
                    ) : (
                      <span className="text-foreground/60 text-xs">-</span>
                    )}
                    {order.trackingCode ? (
                      <span className="text-foreground/70 font-mono text-xs">
                        {order.trackingCode}
                      </span>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-foreground/80 hover:text-foreground h-8 w-8"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewDetail(order)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiet
                      </DropdownMenuItem>

                      {order.prescriptionStatus === 'pending_review' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onContact(order)}>
                            <Phone className="mr-2 h-4 w-4" />
                            Yeu cau xac nhan them
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onApprove(order)}>
                            <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                            Duyet va vao gia cong
                          </DropdownMenuItem>
                        </>
                      )}

                      {order.prescriptionStatus === 'approved' && advanceLabel && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onAdvanceWorkflow(order)}>
                            <Package className="mr-2 h-4 w-4" />
                            {advanceLabel}
                          </DropdownMenuItem>
                        </>
                      )}

                      {order.prescriptionStatus === 'approved' && canCreateShipment(order) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onCreateShipment(order)}>
                            <Truck className="mr-2 h-4 w-4" />
                            Tao van don GHN
                          </DropdownMenuItem>
                        </>
                      )}

                      {order.prescriptionStatus === 'approved' && canSyncShipment(order) && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onSyncShipment(order)}>
                            <Truck className="mr-2 h-4 w-4" />
                            Dong bo GHN
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}

          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-muted-foreground py-8 text-center">
                Khong co don hang nao
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
