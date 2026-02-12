import { Badge } from '@/components/ui/badge';
import type { PreorderOrder, PreorderProduct } from '@/types/preorder';

interface OrderStatusBadgeProps {
  status: PreorderOrder['status'];
}

export const PreorderOrderStatusBadge = ({ status }: OrderStatusBadgeProps) => {
  switch (status) {
    case 'waiting_stock':
      return (
        <Badge
          variant="secondary"
          className="bg-warning/10 text-warning border-warning/20"
        >
          Chờ hàng
        </Badge>
      );
    case 'partial_stock':
      return (
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-primary/20"
        >
          Đủ một phần
        </Badge>
      );
    case 'ready':
      return (
        <Badge
          variant="secondary"
          className="bg-success/10 text-success border-success/20"
        >
          Sẵn sàng
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge
          variant="secondary"
          className="bg-destructive/10 text-destructive border-destructive/20"
        >
          Đã hủy
        </Badge>
      );
    default:
      return null;
  }
};

interface ProductStatusBadgeProps {
  status: PreorderProduct['status'];
}

export const PreorderProductStatusBadge = ({
  status,
}: ProductStatusBadgeProps) => {
  switch (status) {
    case 'waiting':
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Chờ hàng
        </Badge>
      );
    case 'in_transit':
      return (
        <Badge variant="outline" className="text-primary border-primary/30">
          Đang về
        </Badge>
      );
    case 'arrived':
      return (
        <Badge variant="outline" className="text-success border-success/30">
          Đã về
        </Badge>
      );
    case 'partial':
      return (
        <Badge variant="outline" className="text-warning border-warning/30">
          Một phần
        </Badge>
      );
    default:
      return null;
  }
};

interface PaymentStatusBadgeProps {
  status: PreorderOrder['paymentStatus'];
}

export const PreorderPaymentBadge = ({ status }: PaymentStatusBadgeProps) => {
  switch (status) {
    case 'paid':
      return (
        <Badge
          variant="secondary"
          className="bg-success/10 text-success border-success/20"
        >
          Đã TT
        </Badge>
      );
    case 'partial':
      return (
        <Badge
          variant="secondary"
          className="bg-primary/10 text-primary border-primary/20"
        >
          TT một phần
        </Badge>
      );
    case 'pending':
      return (
        <Badge
          variant="secondary"
          className="bg-warning/10 text-warning border-warning/20"
        >
          Chờ TT
        </Badge>
      );
    case 'cod':
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          COD
        </Badge>
      );
    default:
      return null;
  }
};
