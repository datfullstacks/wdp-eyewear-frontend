import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Mail, MoreHorizontal, Phone } from 'lucide-react';

export type CustomerListItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
};

type CustomerListProps = {
  customers?: CustomerListItem[];
  onViewDetails?: (id: string) => void;
};

export const CustomerList = ({ customers = [], onViewDetails }: CustomerListProps) => {
  return (
    <div className="glass-card overflow-hidden rounded-xl">
      <Table className="text-sm font-normal">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Khách hàng</TableHead>
            <TableHead>Số điện thoại</TableHead>
            <TableHead className="text-center">Ngày tạo</TableHead>
            <TableHead className="text-center">Cập nhật</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-foreground/80 py-8 text-center">
                Không có khách hàng.
              </TableCell>
            </TableRow>
          ) : (
            customers.map((customer) => (
              <TableRow key={customer.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar
                      name={customer.name}
                      size="md"
                      className="bg-yellow-400 bg-none text-yellow-950 ring-yellow-500"
                    />
                    <div>
                      <p className="text-foreground font-normal">{customer.name}</p>
                      <div className="text-foreground/80 mt-1 flex items-center gap-3 text-sm">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-foreground/90 font-normal">
                  <span className="inline-flex items-center gap-2">
                    <Phone className="h-4 w-4 text-slate-500" />
                    {customer.phone}
                  </span>
                </TableCell>
                <TableCell className="text-foreground/90 text-center text-sm">
                  {customer.createdAt}
                </TableCell>
                <TableCell className="text-foreground/90 text-center text-sm">
                  {customer.updatedAt}
                </TableCell>
                <TableCell>
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
                      <DropdownMenuItem onSelect={() => onViewDetails?.(customer.id)}>
                        Xem chi tiết
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
