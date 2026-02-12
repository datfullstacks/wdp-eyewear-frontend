import { SupplementOrder } from '@/types/prescription';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  User,
  Clock,
  MoreHorizontal,
  Eye,
  Send,
  History,
  Upload,
  Image,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PrescriptionOrderTableProps {
  orders: SupplementOrder[];
  selectedOrders: string[];
  onSelectOrder: (orderId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onViewDetail: (order: SupplementOrder) => void;
  onContact: (order: SupplementOrder) => void;
  onViewHistory: (order: SupplementOrder) => void;
  onUploadImage: (order: SupplementOrder) => void;
}

const missingTypeTextClass: Record<SupplementOrder['missingType'], string> = {
  no_prescription: 'text-destructive',
  incomplete_data: 'text-warning',
  unclear_image: 'text-warning',
  need_verification: 'text-primary',
};

const missingTypeLabel: Record<SupplementOrder['missingType'], string> = {
  no_prescription: 'Chưa có Rx',
  incomplete_data: 'Thiếu dữ liệu',
  unclear_image: 'Ảnh không rõ',
  need_verification: 'Cần xác nhận',
};

export const PrescriptionOrderTable = ({
  orders,

  onViewDetail,
  onContact,
  onViewHistory,
  onUploadImage,
}: PrescriptionOrderTableProps) => {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Đơn hàng</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Thông tin thiếu</TableHead>
            <TableHead>Liên hệ</TableHead>
            <TableHead>Chờ</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="hover:bg-muted/30">
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{order.orderId}</span>
                </div>
                <p className="text-foreground/85 mt-1 text-xs">
                  Đặt: {order.orderDate}
                </p>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="text-foreground/80 h-4 w-4" />
                  <div>
                    <p className="text-foreground font-normal">
                      {order.customer}
                    </p>
                    <p className="text-foreground/85 text-sm">{order.phone}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      missingTypeTextClass[order.missingType]
                    )}
                  >
                    {missingTypeLabel[order.missingType]}
                  </span>
                  <p className="text-foreground/85 mt-1 text-xs">
                    {order.missingFields.length > 2
                      ? `${order.missingFields.length} thông số thiếu`
                      : order.missingFields.map((f) => f.label).join(', ')}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {order.contactAttempts === 0 ? (
                    <span className="text-foreground/80 text-sm">
                      Chưa liên hệ
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'text-sm font-medium',
                        order.contactAttempts >= 3
                          ? 'text-warning'
                          : 'text-foreground/80'
                      )}
                    >
                      {order.contactAttempts} lần
                    </span>
                  )}
                </div>
                {order.lastContactDate && (
                  <p className="text-foreground/85 mt-1 text-xs">
                    Lần cuối: {order.lastContactDate}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Clock
                    className={`h-4 w-4 ${order.daysPending >= 3 ? 'text-destructive' : 'text-foreground/80'}`}
                  />
                  <span
                    className={
                      order.daysPending >= 3
                        ? 'text-destructive font-medium'
                        : 'text-foreground'
                    }
                  >
                    {order.daysPending} ngày
                  </span>
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
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onContact(order)}>
                      <Send className="mr-2 h-4 w-4" />
                      Liên hệ khách
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewHistory(order)}>
                      <History className="mr-2 h-4 w-4" />
                      Lịch sử liên hệ
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onUploadImage(order)}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload ảnh Rx
                    </DropdownMenuItem>
                    {order.prescriptionImage && (
                      <DropdownMenuItem>
                        <Image className="mr-2 h-4 w-4" />
                        Xem ảnh Rx
                      </DropdownMenuItem>
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
                className="text-foreground/80 py-8 text-center"
              >
                Không có đơn hàng nào cần xử lý
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
