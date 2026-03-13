import { redirect } from 'next/navigation';

export default function OperationPage() {
  redirect('/operation/orders/ready-stock');
}
