'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Save } from 'lucide-react';

import { Header } from '@/components/organisms/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/atoms';
import systemConfigApi, { type SystemConfig } from '@/api/systemConfig';

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await systemConfigApi.get();
        if (active) {
          setConfig(data);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load system config.');
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

  const updateNested = <K extends keyof SystemConfig>(
    section: K,
    key: string,
    value: boolean | string | string[] | number,
  ) => {
    setConfig((current) => {
      if (!current) return current;
      return {
        ...current,
        [section]: {
          ...(current[section] as Record<string, unknown>),
          [key]: value,
        },
      };
    });
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      setError('');
      const updated = await systemConfigApi.update(config);
      setConfig(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save system config.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header
        title="System Configuration"
        subtitle="Manage feature flags, payment behavior, shipping integration, and notification channels"
      />

      <div className="space-y-6 p-6">
        {error ? (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : null}

        {loading || !config ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 xl:grid-cols-2">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">Feature flags</h3>
                <div className="mt-4 space-y-3 text-sm">
                  {[
                    ['preorderEnabled', 'Preorder enabled'],
                    ['splitPaymentEnabled', 'Split payment enabled'],
                    ['refundWorkflowEnabled', 'Refund workflow enabled'],
                    ['managerPolicyEditorEnabled', 'Manager policy editor enabled'],
                  ].map(([key, label]) => (
                    <label key={key} className="flex items-center justify-between gap-3">
                      <span>{label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(config.featureFlags[key as keyof typeof config.featureFlags])}
                        onChange={(event) =>
                          updateNested('featureFlags', key, event.target.checked)
                        }
                        className="h-4 w-4"
                      />
                    </label>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">Payments</h3>
                <div className="mt-4 space-y-4 text-sm">
                  <label className="flex items-center justify-between gap-3">
                    <span>COD enabled</span>
                    <input
                      type="checkbox"
                      checked={config.payments.codEnabled}
                      onChange={(event) =>
                        updateNested('payments', 'codEnabled', event.target.checked)
                      }
                      className="h-4 w-4"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-gray-700">Pay-now gateway</span>
                    <select
                      value={config.payments.payNowGateway}
                      disabled
                      className="flex h-10 w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600"
                    >
                      <option value="sepay">SePay</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-500">
                      Runtime hiện chỉ hỗ trợ một cổng pay-now là SePay.
                    </p>
                  </label>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">Shipping</h3>
                <div className="mt-4 space-y-4 text-sm">
                  <label className="block">
                    <span className="mb-2 block text-gray-700">Default carrier</span>
                    <select
                      value={config.shipping.defaultCarrier}
                      disabled
                      className="flex h-10 w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-600"
                    >
                      <option value="ghn">GHN</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-500">
                      Runtime hiện chỉ hỗ trợ một carrier là GHN.
                    </p>
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span>GHN enabled</span>
                    <input
                      type="checkbox"
                      checked={config.shipping.ghnEnabled}
                      onChange={(event) =>
                        updateNested('shipping', 'ghnEnabled', event.target.checked)
                      }
                      className="h-4 w-4"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span>Estimated shipping fee allowed</span>
                    <input
                      type="checkbox"
                      checked={config.shipping.allowEstimatedShippingFee}
                      onChange={(event) =>
                        updateNested(
                          'shipping',
                          'allowEstimatedShippingFee',
                          event.target.checked,
                        )
                      }
                      className="h-4 w-4"
                    />
                  </label>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900">Notifications & maintenance</h3>
                <div className="mt-4 space-y-4 text-sm">
                  <label className="flex items-center justify-between gap-3">
                    <span>Push notifications</span>
                    <input
                      type="checkbox"
                      checked={Boolean(config.notifications.pushEnabled)}
                      onChange={(event) =>
                        updateNested('notifications', 'pushEnabled', event.target.checked)
                      }
                      className="h-4 w-4"
                    />
                  </label>

                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-xs text-gray-600">
                    <div className="font-medium text-gray-800">
                      Email và SMS chưa được nối vào runtime trong đợt này.
                    </div>
                    <div className="mt-2 grid gap-2">
                      <label className="flex items-center justify-between gap-3">
                        <span>Email notifications</span>
                        <input
                          type="checkbox"
                          checked={Boolean(config.notifications.emailEnabled)}
                          disabled
                          className="h-4 w-4"
                        />
                      </label>
                      <label className="flex items-center justify-between gap-3">
                        <span>SMS notifications</span>
                        <input
                          type="checkbox"
                          checked={Boolean(config.notifications.smsEnabled)}
                          disabled
                          className="h-4 w-4"
                        />
                      </label>
                    </div>
                  </div>

                  <label className="flex items-center justify-between gap-3">
                    <span>Maintenance mode</span>
                    <input
                      type="checkbox"
                      checked={config.maintenanceMode}
                      onChange={(event) =>
                        setConfig((current) =>
                          current
                            ? { ...current, maintenanceMode: event.target.checked }
                            : current,
                        )
                      }
                      className="h-4 w-4"
                    />
                  </label>
                </div>
              </Card>

              <Card className="p-6 xl:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900">Refund workflow</h3>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-gray-700">
                      Staff approval limit (VND)
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={config.refunds.staffApprovalLimit}
                      onChange={(event) =>
                        updateNested(
                          'refunds',
                          'staffApprovalLimit',
                          Math.max(0, Number(event.target.value) || 0)
                        )
                      }
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2"
                    />
                  </label>

                  <div className="space-y-3 text-sm">
                    <label className="flex items-center justify-between gap-3">
                      <span>Manager approval required for return-required refunds</span>
                      <input
                        type="checkbox"
                        checked={config.refunds.requiresManagerForReturn}
                        onChange={(event) =>
                          updateNested(
                            'refunds',
                            'requiresManagerForReturn',
                            event.target.checked
                          )
                        }
                        className="h-4 w-4"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3">
                      <span>Manager approval required for shipping fee refunds</span>
                      <input
                        type="checkbox"
                        checked={config.refunds.requiresManagerForShippingRefund}
                        onChange={(event) =>
                          updateNested(
                            'refunds',
                            'requiresManagerForShippingRefund',
                            event.target.checked
                          )
                        }
                        className="h-4 w-4"
                      />
                    </label>
                    <label className="flex items-center justify-between gap-3">
                      <span>Require payout proof link on completion</span>
                      <input
                        type="checkbox"
                        checked={config.refunds.requirePayoutProof}
                        onChange={(event) =>
                          updateNested(
                            'refunds',
                            'requirePayoutProof',
                            event.target.checked
                          )
                        }
                        className="h-4 w-4"
                      />
                    </label>
                  </div>
                </div>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 bg-red-600 text-white hover:bg-red-700"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save system config'}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
