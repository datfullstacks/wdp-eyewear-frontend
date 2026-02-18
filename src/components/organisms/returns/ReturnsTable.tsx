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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  Eye,
  CheckCircle,
  XCircle,
  Phone,
  RefreshCw,
  MoreHorizontal,
} from 'lucide-react';
import {
  ReturnRequest,
  typeLabels,
  statusLabels,
  statusTypes,
  formatCurrency,
} from '@/types/returns';

interface ReturnsTableProps {
  requests: ReturnRequest[];
  onDetail: (request: ReturnRequest) => void;
  onApprove: (request: ReturnRequest) => void;
  onReject: (request: ReturnRequest) => void;
  onProcess: (request: ReturnRequest) => void;
  onContact: (request: ReturnRequest) => void;
}

export const ReturnsTable = ({
  requests,
  onDetail,
  onApprove,
  onReject,
  onProcess,
  onContact,
}: ReturnsTableProps) => {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Mã yêu cầu</TableHead>
            <TableHead>Mã đơn hàng</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Loại</TableHead>
            <TableHead>Lý do</TableHead>
            <TableHead>Giá trị</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} className="hover:bg-muted/30">
              <TableCell className="text-foreground font-mono text-sm font-normal">
                {request.id}
              </TableCell>
              <TableCell className="text-foreground/80">
                {request.orderId}
              </TableCell>
              <TableCell>
                <div>
                  <div className="text-foreground font-normal">
                    {request.customer}
                  </div>
                  <div className="text-foreground/80 text-sm">
                    {request.phone}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-foreground/80">
                  {typeLabels[request.type]}
                </span>
              </TableCell>
              <TableCell>
                <div
                  className="text-foreground/80 max-w-[200px] truncate"
                  title={request.reason}
                >
                  {request.reason}
                </div>
              </TableCell>
              <TableCell className="text-foreground text-base font-semibold">
                {formatCurrency(request.totalValue)}
              </TableCell>
              <TableCell>
                <span
                  className={
                    statusTypes[request.status] === 'success'
                      ? 'text-success'
                      : statusTypes[request.status] === 'warning'
                        ? 'text-warning'
                        : statusTypes[request.status] === 'error'
                          ? 'text-destructive'
                          : 'text-primary'
                  }
                >
                  {statusLabels[request.status]}
                </span>
              </TableCell>
              <TableCell className="text-foreground/80">
                {request.createdAt}
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
                    <DropdownMenuItem onClick={() => onDetail(request)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    {(request.status === 'pending' ||
                      request.status === 'reviewing') && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onApprove(request)}>
                          <CheckCircle className="text-success mr-2 h-4 w-4" />
                          Duyệt yêu cầu
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onReject(request)}>
                          <XCircle className="text-destructive mr-2 h-4 w-4" />
                          Từ chối
                        </DropdownMenuItem>
                      </>
                    )}
                    {request.status === 'approved' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onProcess(request)}>
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Xử lý yêu cầu
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onContact(request)}>
                      <Phone className="mr-2 h-4 w-4" />
                      Liên hệ khách
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {requests.length === 0 && (
        <div className="text-foreground/80 py-10 text-center">
          Không tìm thấy yêu cầu nào phù hợp
        </div>
      )}
    </div>
  );
};
