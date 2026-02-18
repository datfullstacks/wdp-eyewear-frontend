import { PrescriptionOrder } from '@/types/rxPrescription';
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
import {
  Eye,
  FileText,
  Phone,
  CheckCircle2,
  MoreHorizontal,
} from 'lucide-react';

interface RxOrderTableProps {
  orders: PrescriptionOrder[];
  onViewDetail: (order: PrescriptionOrder) => void;
  onInputPrescription: (order: PrescriptionOrder) => void;
  onContact: (order: PrescriptionOrder) => void;
  onApprove: (order: PrescriptionOrder) => void;
}

const statusTextClass: Record<string, string> = {
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-destructive',
  info: 'text-primary',
  default: 'text-foreground/80',
};

export const RxOrderTable = ({
  orders,
  onViewDetail,
  onInputPrescription,
  onContact,
  onApprove,
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
            <TableHead>Nguồn</TableHead>
            <TableHead>Hạn xử lý</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-muted/30">
              <TableCell className="text-foreground font-mono text-sm font-normal">
                <span>{order.orderId}</span>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-foreground font-normal">
                    {order.customer}
                  </p>
                  <p className="text-foreground/80 text-sm">{order.phone}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {order.products.map((p, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="text-foreground">{p.name}</span>
                      <span className="text-foreground/70">
                        {' '}
                        ({p.frame})
                      </span>
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <span
                  className={
                    order.prescriptionStatus === 'missing'
                      ? statusTextClass.error
                      : order.prescriptionStatus === 'incomplete'
                        ? statusTextClass.warning
                        : order.prescriptionStatus === 'pending_review'
                          ? statusTextClass.info
                          : statusTextClass.success
                  }
                >
                  {order.prescriptionStatus === 'missing'
                    ? 'Thiếu Rx'
                    : order.prescriptionStatus === 'incomplete'
                      ? 'Chưa đầy đủ'
                      : order.prescriptionStatus === 'pending_review'
                        ? 'Chờ duyệt'
                        : 'Đã duyệt'}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-foreground/80">
                  {order.source === 'customer_upload'
                    ? 'Khách gửi'
                    : order.source === 'store_input'
                      ? 'Nhập tại cửa hàng'
                      : 'Chờ nhập'}
                </span>
              </TableCell>
              <TableCell className="text-foreground/90 text-sm">
                {order.dueDate}
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
                      Xem chi tiết
                    </DropdownMenuItem>
                    {(order.prescriptionStatus === 'missing' ||
                      order.prescriptionStatus === 'incomplete') && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onInputPrescription(order)}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Nhập Rx
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onContact(order)}>
                          <Phone className="mr-2 h-4 w-4" />
                          Liên hệ khách
                        </DropdownMenuItem>
                      </>
                    )}
                    {order.prescriptionStatus === 'pending_review' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onApprove(order)}>
                          <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                          Duyệt
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
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
