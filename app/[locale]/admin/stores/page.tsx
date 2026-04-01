'use client';

import { Header } from '@/components/organisms/Header';
import { StoreNetworkPage } from '@/components/pages/StoreNetwork';

export default function AdminStoresPage() {
  return (
    <>
      <Header
        title="Flagship Store"
        subtitle="Single-store configuration for the active flagship"
      />
      <div className="p-6">
        <StoreNetworkPage workspace="admin" />
      </div>
    </>
  );
}
