import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
import { Eye, PackageCheck, FileText, MoreHorizontal } from 'lucide-react';
import { getStatusConfig } from '@/data/preorderImportData';
import type { PreorderBatch } from '@/types/preorderImport';

interface ImportBatchTableProps {
  batches: PreorderBatch[];
  onViewDetail: (batch: PreorderBatch) => void;
  onReceive: (batch: PreorderBatch) => void;
}

export const ImportBatchTable = ({
  batches,
  onViewDetail,
  onReceive,
}: ImportBatchTableProps) => (
  <div className="glass-card overflow-hidden rounded-xl">
    <Table className="text-sm font-normal">
      <TableHeader>
        <TableRow className="bg-muted/50">
          <TableHead>Mã đợt</TableHead>
          <TableHead>Nhà cung cấp</TableHead>
          <TableHead>Ngày đặt</TableHead>
          <TableHead>Ngày dự kiến</TableHead>
          <TableHead>Tiến độ</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead className="w-[60px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {batches.map((batch) => {
          const statusConfig = getStatusConfig(batch.status);
          const StatusIcon = statusConfig.icon;
          const progress = Math.round(
            (batch.receivedItems / batch.totalItems) * 100
          );

          return (
            <TableRow key={batch.id} className="hover:bg-muted/30">
              <TableCell className="text-foreground font-mono text-sm font-normal">
                {batch.batchCode}
              </TableCell>
              <TableCell className="text-foreground/90">
                {batch.supplier}
              </TableCell>
              <TableCell className="text-foreground/90 text-sm">
                {new Date(batch.orderDate).toLocaleDateString('vi-VN')}
              </TableCell>
              <TableCell className="text-foreground/90 text-sm">
                {new Date(batch.expectedDate).toLocaleDateString('vi-VN')}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="bg-secondary h-2 w-24 rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-foreground/80 text-sm">
                    {batch.receivedItems}/{batch.totalItems}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={statusConfig.variant} className="gap-1">
                  <StatusIcon className="h-3 w-3" />
                  {statusConfig.label}
                </Badge>
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
                    <DropdownMenuItem onClick={() => onViewDetail(batch)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Xem chi tiết
                    </DropdownMenuItem>
                    {batch.status !== 'completed' && (
                      <DropdownMenuItem onClick={() => onReceive(batch)}>
                        <PackageCheck className="mr-2 h-4 w-4" />
                        Xác nhận nhập kho
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      Xem chứng từ
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
