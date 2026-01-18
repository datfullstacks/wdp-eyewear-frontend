'use client';

import { useTranslations } from 'next-intl';
import { CanAccess } from '@/components/atoms';

export default function DashboardHomePage() {
  const t = useTranslations('dashboard');
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
          {t('title')}
        </h1>
        <p className="text-slate-600">{t('welcome')}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Staff */}
        <CanAccess roles={['staff', 'manager', 'admin']}>
          <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-lg border border-blue-200 hover:shadow-xl transition">
            <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-2">
              {t('stats.ordersToProcess')}
            </h2>
            <p className="text-4xl font-bold text-blue-600">12</p>
          </div>
        </CanAccess>
        
        {/* Operations */}
        <CanAccess roles={['operations', 'manager', 'admin']}>
          <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-lg border border-green-200 hover:shadow-xl transition">
            <h2 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-2">
              {t('stats.pendingShipments')}
            </h2>
            <p className="text-4xl font-bold text-green-600">8</p>
          </div>
        </CanAccess>
        
        {/* Manager/Admin */}
        <CanAccess roles={['manager', 'admin']}>
          <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-lg border border-purple-200 hover:shadow-xl transition">
            <h2 className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-2">
              {t('stats.totalRevenue')}
            </h2>
            <p className="text-4xl font-bold text-purple-600">$2,450</p>
          </div>
        </CanAccess>
      </div>
    </div>
  );
}
