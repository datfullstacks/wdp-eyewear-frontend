import Link from 'next/link';
import {
  Activity,
  KeyRound,
  ShieldCheck,
  UserCog,
} from 'lucide-react';

import { Header } from '@/components/organisms/Header';
import { Card } from '@/components/ui/card';

const capabilityCards = [
  {
    title: 'Identity and Access',
    description:
      'Review privileged accounts, lock risky access, and maintain role boundaries.',
    icon: KeyRound,
  },
  {
    title: 'Security Controls',
    description:
      'Monitor hardening gaps, investigate incidents, and keep auditability intact.',
    icon: ShieldCheck,
  },
  {
    title: 'Platform Reliability',
    description:
      'Own environment configuration, integration health, and recovery readiness.',
    icon: Activity,
  },
];

export default function AdminDashboardPage() {
  return (
    <>
      <Header
        title="System Admin"
        subtitle="System-only workspace for access control, security, and platform reliability"
      />

      <div className="space-y-6 p-6">
        <section className="grid gap-4 md:grid-cols-3">
          {capabilityCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.title} className="border-red-100 p-6">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-red-700">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{card.description}</p>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900">Admin boundary</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
              This area is intentionally separated from staff, operation, and manager
              workflows. Use it for system-scoped control only, not daily business
              execution.
            </p>
          </Card>

          <Card className="p-6">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-900 text-white">
              <UserCog className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Quick action</h3>
            <p className="mt-2 text-sm text-gray-600">
              Review privileged accounts and business-role allocations.
            </p>
            <Link
              href="/admin/users"
              className="mt-4 inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Open Access Review
            </Link>
          </Card>
        </section>
      </div>
    </>
  );
}
