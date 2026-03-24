import {
  Clock,
  Eye,
  History,
  Image,
  MoreHorizontal,
  Send,
  Upload,
  User,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { cn } from '@/lib/utils';
import type { SupplementOrder } from '@/types/prescription';

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
  incomplete_data: 'text-amber-600',
  unclear_image: 'text-amber-600',
  need_verification: 'text-blue-600',
};

const missingTypeLabel: Record<SupplementOrder['missingType'], string> = {
  no_prescription: 'Chua co Rx',
  incomplete_data: 'Thieu du lieu',
  unclear_image: 'Anh khong ro',
  need_verification: 'Can xac nhan',
};

export const PrescriptionOrderTable = ({
  orders,
  selectedOrders,
  onSelectOrder,
  onSelectAll,
  onViewDetail,
  onContact,
  onViewHistory,
  onUploadImage,
}: PrescriptionOrderTableProps) => {
  const allSelected = orders.length > 0 && selectedOrders.length === orders.length;

  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(Boolean(checked))}
                aria-label="Select all orders"
              />
            </TableHead>
            <TableHead>Don hang</TableHead>
            <TableHead>Khach hang</TableHead>
            <TableHead>Thong tin thieu</TableHead>
            <TableHead>Lien he</TableHead>
            <TableHead>Cho</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const checked = selectedOrders.includes(order.id);

            return (
              <TableRow key={order.id} className="hover:bg-muted/30">
                <TableCell>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) => onSelectOrder(order.id, Boolean(value))}
                    aria-label={`Select ${order.orderId}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{order.orderId}</div>
                  <p className="text-foreground/85 mt-1 text-xs">Dat: {order.orderDate}</p>
                  {order.supportStatus ? (
                    <p className="text-foreground/70 mt-1 text-xs">
                      Support status: {order.supportStatus}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="text-foreground/80 h-4 w-4" />
                    <div>
                      <p className="text-foreground font-normal">{order.customer}</p>
                      <p className="text-foreground/85 text-sm">{order.phone}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        missingTypeTextClass[order.missingType],
                      )}
                    >
                      {missingTypeLabel[order.missingType]}
                    </span>
                    <p className="text-foreground/85 mt-1 text-xs">
                      {order.missingFields.length > 2
                        ? `${order.missingFields.length} thong so thieu`
                        : order.missingFields.map((field) => field.label).join(', ')}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {order.contactAttempts === 0 ? (
                      <span className="text-foreground/80 text-sm">Chua lien he</span>
                    ) : (
                      <span
                        className={cn(
                          'text-sm font-medium',
                          order.contactAttempts >= 3
                            ? 'text-amber-600'
                            : 'text-foreground/80',
                        )}
                      >
                        {order.contactAttempts} lan
                      </span>
                    )}
                  </div>
                  {order.lastContactDate ? (
                    <p className="text-foreground/85 mt-1 text-xs">
                      Lan cuoi: {order.lastContactDate}
                    </p>
                  ) : null}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock
                      className={`h-4 w-4 ${
                        order.daysPending >= 3 ? 'text-destructive' : 'text-foreground/80'
                      }`}
                    />
                    <span
                      className={
                        order.daysPending >= 3
                          ? 'text-destructive font-medium'
                          : 'text-foreground'
                      }
                    >
                      {order.daysPending} ngay
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
                        Xem chi tiet
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onContact(order)}>
                        <Send className="mr-2 h-4 w-4" />
                        Lien he khach
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewHistory(order)}>
                        <History className="mr-2 h-4 w-4" />
                        Lich su lien he
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onUploadImage(order)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Prescription attachment
                      </DropdownMenuItem>
                      {order.prescriptionImage ? (
                        <DropdownMenuItem>
                          <Image className="mr-2 h-4 w-4" />
                          Xem anh Rx
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}

          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-foreground/80 py-8 text-center">
                Khong co don hang nao can xu ly
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
};
