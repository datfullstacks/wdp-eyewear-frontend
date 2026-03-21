'use client';

import { Header } from '@/components/organisms/Header';
import { StoreNetworkPage } from '@/components/pages/StoreNetwork';

export default function AdminStoresPage() {
  return (
    <>
      <Header
        title="Store Network"
        subtitle="System-level overview for the retail store network"
      />
      <div className="p-6">
        <StoreNetworkPage workspace="admin" />
      </div>
    </>
  );
}
