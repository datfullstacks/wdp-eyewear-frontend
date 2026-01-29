import React from 'react';
import { ManagerSidebar } from '@/components/organisms/ManagerSidebar';
import { ManagerHeader } from '@/components/organisms/ManagerHeader';

interface ManagerLayoutProps {
  children: React.ReactNode;
}

export const ManagerLayout: React.FC<ManagerLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ManagerSidebar />
      <div className="flex flex-1 flex-col">
        <ManagerHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};
