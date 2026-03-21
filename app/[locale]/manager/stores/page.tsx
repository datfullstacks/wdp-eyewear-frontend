'use client';

import { Header } from '@/components/organisms/Header';
import { StoreNetworkPage } from '@/components/pages/StoreNetwork';

export default function ManagerStoresPage() {
  return (
    <>
      <Header
        title="Mang luoi cua hang"
        subtitle="Quan ly chuoi cua hang, showroom va kho phuc vu san pham"
      />
      <div className="p-6">
        <StoreNetworkPage workspace="manager" />
      </div>
    </>
  );
}
