'use client';

import { useParams } from 'next/navigation';
import { ManagerProductEditorPage } from '@/components/organisms/manager';

export default function EditProductPage() {
  const params = useParams();
  const productId = params.id as string;

  return <ManagerProductEditorPage productId={productId} />;
}
