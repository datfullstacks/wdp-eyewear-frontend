import { Button } from '@/components/ui/button';
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
  CheckCircle,
  XCircle,
  CreditCard,
  Phone,
  MoreHorizontal,
} from 'lucide-react';
import {
  RefundRequest,
  statusConfig,
  methodConfig,
  formatCurrency,
} from '@/types/refund';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface RefundTableProps {
  refunds: RefundRequest[];
  onDetail: (refund: RefundRequest) => void;
  onApprove: (refund: RefundRequest) => void;
  onReject: (refund: RefundRequest) => void;
  onProcess: (refund: RefundRequest) => void;
  onContact: (refund: RefundRequest) => void;
}

export const RefundTable = ({
  refunds,
  onDetail,
  onApprove,
  onReject,
  onProcess,
  onContact,
}: RefundTableProps) => {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Mã hoàn tiền</TableHead>
            <TableHead>Mã đơn hàng</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Số tiền</TableHead>
            <TableHead>Phương thức</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {refunds.map((refund) => {
            const MethodIcon = methodConfig[refund.method].icon;
            return (
              <TableRow key={refund.id} className="hover:bg-muted/30">
                <TableCell className="text-foreground font-mono text-sm font-normal">
                  {refund.id}
                </TableCell>
                <TableCell>
                  <span className="text-foreground/80">{refund.orderId}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-foreground font-normal">
                      {refund.customerName}
                    </p>
                    <p className="text-foreground/80 text-sm">
                      {refund.customerPhone}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-destructive font-semibold">
                  {formatCurrency(refund.amount)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <MethodIcon className="text-foreground/70 h-4 w-4" />
                    <span className="text-foreground/90">
                      {methodConfig[refund.method].label}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={
                      statusConfig[refund.status].type === 'success'
                        ? 'text-success'
                        : statusConfig[refund.status].type === 'warning'
                          ? 'text-warning'
                          : statusConfig[refund.status].type === 'error'
                            ? 'text-destructive'
                            : 'text-primary'
                    }
                  >
                    {statusConfig[refund.status].label}
                  </span>
                </TableCell>
                <TableCell className="text-foreground/80 text-sm">
                  {refund.createdAt}
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
                      <DropdownMenuItem onClick={() => onDetail(refund)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </DropdownMenuItem>
                      {(refund.status === 'pending' ||
                        refund.status === 'reviewing') && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onApprove(refund)}>
                            <CheckCircle className="mr-2 h-4 w-4 text-success" />
                            Duyệt
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onReject(refund)}>
                            <XCircle className="mr-2 h-4 w-4 text-destructive" />
                            Từ chối
                          </DropdownMenuItem>
                        </>
                      )}
                      {refund.status === 'approved' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onProcess(refund)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Hoàn tiền
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onContact(refund)}>
                        <Phone className="mr-2 h-4 w-4" />
                        Liên hệ khách
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
