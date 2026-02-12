import { CODReconciliation, CODStatus } from '@/types/shipping';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye } from 'lucide-react';

interface CODReconciliationTableProps {
  reconciliations: CODReconciliation[];
  onViewDetail: (cod: CODReconciliation) => void;
}

const statusLabels: Record<
  CODStatus,
  {
    label: string;
    status: 'success' | 'warning' | 'error' | 'info' | 'default';
  }
> = {
  pending: { label: 'Chờ đối soát', status: 'warning' },
  confirmed: { label: 'Đã xác nhận', status: 'info' },
  paid: { label: 'Đã thanh toán', status: 'success' },
  disputed: { label: 'Có tranh chấp', status: 'error' },
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const CODReconciliationTable = ({
  reconciliations,
  onViewDetail,
}: CODReconciliationTableProps) => {
  return (
    <Table className="text-sm font-normal">
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>Kỳ đối soát</TableHead>
          <TableHead>Hãng VC</TableHead>
          <TableHead className="text-right">Số đơn</TableHead>
          <TableHead className="text-right">Tổng COD</TableHead>
          <TableHead className="text-right">Phí ship</TableHead>
          <TableHead className="text-right">Thực nhận</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reconciliations.map((cod) => {
          const statusConfig = statusLabels[cod.status];
          return (
            <TableRow key={cod.id} className="hover:bg-muted/30">
              <TableCell>
                <div>
                  <p className="font-medium">{cod.period}</p>
                  <p className="text-muted-foreground text-xs">
                    T?o: {cod.createdAt}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{cod.carrier}</Badge>
              </TableCell>
              <TableCell className="text-right">{cod.totalOrders}</TableCell>
              <TableCell className="text-primary text-right font-medium">
                {formatCurrency(cod.totalCOD)}
              </TableCell>
              <TableCell className="text-muted-foreground text-right">
                -{formatCurrency(cod.shippingFee)}
              </TableCell>
              <TableCell className="text-success text-right font-bold">
                {formatCurrency(cod.netAmount)}
              </TableCell>
              <TableCell>
                <StatusBadge status={statusConfig.status}>
                  {statusConfig.label}
                </StatusBadge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onViewDetail(cod)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
        {reconciliations.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={8}
              className="text-muted-foreground py-8 text-center"
            >
              Không có dữ liệu đối soát
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
