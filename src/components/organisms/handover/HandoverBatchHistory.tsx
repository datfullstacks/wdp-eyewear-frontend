import {
  HandoverBatch,
  HandoverStatus,
  handoverCarrierColors,
} from '@/types/handover';
import { StatusBadge } from '@/components/atoms/StatusBadge';

import { Button } from '@/components/ui/button';
import { Eye, Printer, PackageCheck } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface HandoverBatchHistoryProps {
  batches: HandoverBatch[];
  onViewDetail: (batch: HandoverBatch) => void;
  onPrintManifest: (batch: HandoverBatch) => void;
  onHandover: (batch: HandoverBatch) => void;
}

const getStatusBadge = (status: HandoverStatus) => {
  switch (status) {
    case 'pending':
      return <StatusBadge status="warning">Chờ bàn giao</StatusBadge>;
    case 'ready':
      return <StatusBadge status="info">Sẵn sàng</StatusBadge>;
    case 'handed_over':
      return <StatusBadge status="warning">Đã bàn giao</StatusBadge>;
    case 'confirmed':
      return <StatusBadge status="success">Đã xác nhận</StatusBadge>;
  }
};

export const HandoverBatchHistory = ({
  batches,
  onViewDetail,
  onPrintManifest,
  onHandover,
}: HandoverBatchHistoryProps) => {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <div className="border-border/60 flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-foreground font-medium">Lịch sử phiếu bàn giao</h3>
      </div>
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[120px]">Mã phiếu</TableHead>
            <TableHead>Nhà vận chuyển</TableHead>
            <TableHead>Số vận đơn</TableHead>
            <TableHead>Tổng kiện/KL</TableHead>
            <TableHead>Thời gian tạo</TableHead>
            <TableHead>Thời gian bàn giao</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[120px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.map((batch) => (
            <TableRow key={batch.id} className="hover:bg-muted/30">
              <TableCell className="font-mono font-medium">
                {batch.id}
              </TableCell>
              <TableCell>
                <span
                  className={`rounded border px-2 py-1 text-xs font-medium ${handoverCarrierColors[batch.carrier]}`}
                >
                  {batch.carrier}
                </span>
              </TableCell>
              <TableCell className="font-medium">
                {batch.shipmentCount}
              </TableCell>
              <TableCell className="text-sm">
                {batch.totalPackages} ki?n � {batch.totalWeight} kg
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {batch.createdAt}
              </TableCell>
              <TableCell className="text-sm">
                {batch.handoverTime || '-'}
              </TableCell>
              <TableCell>{getStatusBadge(batch.status)}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewDetail(batch)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPrintManifest(batch)}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  {batch.status === 'ready' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onHandover(batch)}
                    >
                      <PackageCheck className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
