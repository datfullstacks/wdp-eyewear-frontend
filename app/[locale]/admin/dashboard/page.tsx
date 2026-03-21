'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  KeyRound,
  Loader2,
  Package,
  Receipt,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  UserCog,
} from 'lucide-react';

import { Header } from '@/components/organisms/Header';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/molecules/StatCard';
import { userApi, type UserStatsResponse } from '@/api/users';
import productApi from '@/api/products';
import orderApi from '@/api/orders';
import systemConfigApi, { type SystemConfig } from '@/api/systemConfig';

export default function AdminDashboardPage() {
  const [userStats, setUserStats] = useState<UserStatsResponse | null>(null);
  const [productTotal, setProductTotal] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const [users, products, orders, config] = await Promise.all([
          userApi.getStats(),
          productApi.getAll({ page: 1, limit: 1 }),
          orderApi.getAll({ page: 1, limit: 1 }),
          systemConfigApi.get(),
        ]);

        if (!active) return;

        setUserStats(users);
        setProductTotal(products.total);
        setOrderTotal(orders.total);
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
        title: 'Managers + admins',
        value:
          Number(userStats?.byRole?.manager || 0) + Number(userStats?.byRole?.admin || 0),
        icon: KeyRound,
      },
      {
        title: 'Products',
        value: productTotal,
        icon: Package,
      },
      {
        title: 'Orders',
        value: orderTotal,
        icon: ShoppingCart,
      },
    ],
    [orderTotal, productTotal, userStats],
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
                    Refund workflow policy
                  </div>
                  <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                    <div>
                      Staff approval limit:{' '}
                      <span className="font-medium text-slate-900">
                        {new Intl.NumberFormat('vi-VN').format(
                          Number(systemConfig?.refunds?.staffApprovalLimit || 0)
                        )}{' '}
                        VND
                      </span>
                    </div>
                    <div>
                      Return-required:
                      <span className="ml-1 font-medium text-slate-900">
                        {systemConfig?.refunds?.requiresManagerForReturn
                          ? 'Manager approval'
                          : 'Staff can approve'}
                      </span>
                    </div>
                    <div>
                      Shipping refund:
                      <span className="ml-1 font-medium text-slate-900">
                        {systemConfig?.refunds?.requiresManagerForShippingRefund
                          ? 'Manager approval'
                          : 'Staff can approve'}
                      </span>
                    </div>
                    <div>
                      Payout proof:
                      <span className="ml-1 font-medium text-slate-900">
                        {systemConfig?.refunds?.requirePayoutProof
                          ? 'Required'
                          : 'Optional'}
                      </span>
                    </div>
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
                <Link
                  href="/admin/settings"
                  className="mt-4 inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  Open system settings
                </Link>
              </Card>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <Card className="p-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Refund monitoring</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Review stuck refund cases, owner queues, and payout backlog.
                </p>
                <Link
                  href="/admin/refunds"
                  className="mt-4 inline-flex items-center rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-600"
                >
                  Open monitoring
                </Link>
              </Card>

              <Card className="p-6">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <Receipt className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Reconciliation</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Verify invoice state, payout references, and refund mismatches.
                </p>
                <Link
                  href="/admin/reconciliation"
                  className="mt-4 inline-flex items-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-900"
                >
                  Open reconciliation
                </Link>
              </Card>
            </section>
          </>
        )}
      </div>
    </>
  );
}
