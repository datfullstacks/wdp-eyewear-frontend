'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  Building2,
  KeyRound,
  Loader2,
  Settings,
  ShieldCheck,
  UserCog,
} from 'lucide-react';

import { Header } from '@/components/organisms/Header';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/molecules/StatCard';
import { userApi, type UserStatsResponse } from '@/api/users';
import storeApi from '@/api/stores';
import systemConfigApi, { type SystemConfig } from '@/api/systemConfig';

export default function AdminDashboardPage() {
  const [userStats, setUserStats] = useState<UserStatsResponse | null>(null);
  const [storeTotal, setStoreTotal] = useState(0);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [users, stores, config] = await Promise.all([
          userApi.getStats(),
          storeApi.getAll({ page: 1, limit: 1, status: 'all' }),
          systemConfigApi.get(),
        ]);

        if (!active) return;

        setUserStats(users);
        setStoreTotal(stores.total);
        setSystemConfig(config);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load admin dashboard.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(
    () => [
      {
        title: 'Total users',
        value: userStats?.total || 0,
        icon: UserCog,
      },
      {
        title: 'Admin accounts',
        value: Number(userStats?.byRole?.admin || 0),
        icon: KeyRound,
      },
      {
        title: 'Manager accounts',
        value: Number(userStats?.byRole?.manager || 0),
        icon: UserCog,
      },
      {
        title: 'Stores',
        value: storeTotal,
        icon: Building2,
      },
    ],
    [storeTotal, userStats],
  );

  return (
    <>
      <Header
        title="System Admin"
        subtitle="System-only workspace for access control, platform flags, and integration governance"
      />

      <div className="space-y-6 p-6">
        {error ? (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.title} {...stat} />
              ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
              <Card className="border-red-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900">System posture</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <ShieldCheck className="h-4 w-4" />
                      Split payment
                    </div>
                    <div className="text-sm text-gray-600">
                      {systemConfig?.featureFlags.splitPaymentEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Activity className="h-4 w-4" />
                      GHN integration
                    </div>
                    <div className="text-sm text-gray-600">
                      {systemConfig?.shipping.ghnEnabled ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                      <Settings className="h-4 w-4" />
                      Maintenance mode
                    </div>
                    <div className="text-sm text-gray-600">
                      {systemConfig?.maintenanceMode ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-2 text-sm font-medium text-slate-800">
                    System ownership
                  </div>
                  <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <div>Auth, role matrix, and access governance</div>
                    <div>Store master data and carrier integration config</div>
                    <div>Feature flags and payment/platform controls</div>
                    <div>Maintenance mode and deployment-safe settings</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                  <Settings className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Quick action</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Review system flags, payment settings, and carrier integrations.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link
                    href="/admin/settings"
                    className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                  >
                    Open system settings
                  </Link>
                  <Link
                    href="/admin/stores"
                    className="inline-flex items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Open stores
                  </Link>
                </div>
              </Card>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <Card className="p-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <UserCog className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Access review</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Review admin and manager accounts without dropping into daily business queues.
                </p>
                <Link
                  href="/admin/users"
                  className="mt-4 inline-flex items-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-900"
                >
                  Open users
                </Link>
              </Card>

              <Card className="p-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Store master data</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Manage store metadata, pickup support, and integration readiness at system scope.
                </p>
                <Link
                  href="/admin/stores"
                  className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Open stores
                </Link>
              </Card>
            </section>
          </>
        )}
      </div>
    </>
  );
}
