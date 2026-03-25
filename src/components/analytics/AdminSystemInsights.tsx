'use client';

import type { UserStatsResponse } from '@/api/users';
import type { StoreRecord } from '@/api/stores';
import type { SystemConfig } from '@/api/systemConfig';
import { Card } from '@/components/ui/card';

import {
  DistributionBars,
  DonutBreakdown,
  type ChartDatum,
} from './ChartPrimitives';

const rolePalette: Record<string, string> = {
  admin: '#be123c',
  manager: '#d97706',
  sales: '#4f46e5',
  operations: '#0284c7',
  customer: '#16a34a',
};

function isGhnReady(store: StoreRecord) {
  return Boolean(
    store?.ghn?.shopId &&
      store?.ghn?.districtId &&
      store?.ghn?.wardCode &&
      store?.ghn?.address,
  );
}

function buildRoleData(userStats: UserStatsResponse | null): ChartDatum[] {
  const rows = Object.entries(userStats?.byRole || {})
    .map(([role, count]) => ({
      label:
        role === 'admin'
          ? 'System Admin'
          : role === 'manager'
            ? 'Manager'
            : role === 'sales'
              ? 'Sales'
              : role === 'operations'
                ? 'Operations'
                : role === 'customer'
                  ? 'Customer'
                  : role,
      value: Number(count || 0),
      color: rolePalette[role] || '#6b7280',
    }))
    .sort((left, right) => right.value - left.value);

  return rows;
}

function buildStoreCapabilityData(stores: StoreRecord[]): ChartDatum[] {
  const safeStores = Array.isArray(stores) ? stores : [];

  return [
    {
      label: 'Active stores',
      value: safeStores.filter((store) => store.status === 'active').length,
      color: '#16a34a',
      hint: `${safeStores.length} total stores`,
    },
    {
      label: 'GHN ready',
      value: safeStores.filter((store) => isGhnReady(store)).length,
      color: '#0284c7',
      hint: 'Shop ID + district + ward + address configured',
    },
    {
      label: 'Try-on enabled',
      value: safeStores.filter((store) => Boolean(store.supportsTryOn)).length,
      color: '#7c3aed',
      hint: 'Store network can support in-person try-on',
    },
    {
      label: 'Pickup enabled',
      value: safeStores.filter((store) => store.supportsPickup !== false).length,
      color: '#ea580c',
      hint: 'Customer pickup workflow available',
    },
  ];
}

function buildControlData(systemConfig: SystemConfig | null): ChartDatum[] {
  if (!systemConfig) {
    return [];
  }

  const controlRows = [
    {
      label: 'Split payment',
      value: systemConfig.featureFlags.splitPaymentEnabled ? 1 : 0,
      color: '#0f766e',
    },
    {
      label: 'COD',
      value: systemConfig.payments.codEnabled ? 1 : 0,
      color: '#2563eb',
    },
    {
      label: 'GHN routing',
      value: systemConfig.shipping.ghnEnabled ? 1 : 0,
      color: '#7c3aed',
    },
    {
      label: 'Estimated shipping fallback',
      value: systemConfig.shipping.allowEstimatedShippingFee ? 1 : 0,
      color: '#ea580c',
    },
    {
      label: 'Email notifications',
      value: systemConfig.notifications.emailEnabled ? 1 : 0,
      color: '#16a34a',
    },
    {
      label: 'Push notifications',
      value: systemConfig.notifications.pushEnabled ? 1 : 0,
      color: '#dc2626',
    },
    {
      label: 'SMS notifications',
      value: systemConfig.notifications.smsEnabled ? 1 : 0,
      color: '#0891b2',
    },
  ];

  const enabledCount = controlRows.filter((item) => item.value > 0).length;
  const disabledCount = controlRows.length - enabledCount;

  return [
    {
      label: 'Enabled controls',
      value: enabledCount,
      color: '#16a34a',
      hint: 'Controls currently active across checkout and messaging',
    },
    {
      label: 'Disabled controls',
      value: disabledCount,
      color: '#e5e7eb',
      hint: 'Features intentionally turned off or held back',
    },
  ];
}

export function AdminSystemInsights({
  userStats,
  stores,
  systemConfig,
}: {
  userStats: UserStatsResponse | null;
  stores: StoreRecord[];
  systemConfig: SystemConfig | null;
}) {
  const roleData = buildRoleData(userStats);
  const storeCapabilityData = buildStoreCapabilityData(stores);
  const controlData = buildControlData(systemConfig);

  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_1.1fr_1.4fr]">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">Role distribution</h3>
        <p className="mt-1 text-sm text-gray-600">
          Snapshot of who currently holds system, management, and frontline access.
        </p>
        <div className="mt-6">
          <DonutBreakdown
            data={roleData}
            centerLabel="User mix"
            emptyLabel="No governed user roles found."
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">Control posture</h3>
        <p className="mt-1 text-sm text-gray-600">
          High-level ratio between enabled and disabled runtime controls.
        </p>
        <div className="mt-6">
          <DonutBreakdown
            data={controlData}
            centerLabel="Controls"
            emptyLabel="System config is not available."
          />
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900">Store readiness</h3>
        <p className="mt-1 text-sm text-gray-600">
          Operational view of how much of the network is ready for carrier and try-on flows.
        </p>
        <div className="mt-6">
          <DistributionBars
            data={storeCapabilityData}
            emptyLabel="No store network data is available."
          />
        </div>
      </Card>
    </section>
  );
}
