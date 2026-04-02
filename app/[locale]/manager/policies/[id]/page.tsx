'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { AlertTriangle, ArrowLeft, Edit, Loader2, Trash2 } from 'lucide-react';

import { Button } from '@/components/atoms';
import { RuntimeFeatureBlockedPage } from '@/components/pages/RuntimeFeatureBlockedPage';
import { Header } from '@/components/organisms/Header';
import { Card } from '@/components/ui/card';
import { PolicyForm, type PolicyFormData } from '@/components/organisms/manager';
import { useRuntimeSystemConfig } from '@/hooks/useRuntimeSystemConfig';
import policyApi, { type PolicyRecord } from '@/api/policies';

function toFormData(policy: PolicyRecord): PolicyFormData {
  return {
    title: policy.title,
    category: policy.category,
    summary: policy.summary,
    content: policy.content,
    effectiveDate: policy.effectiveDate?.slice(0, 10) || '',
    expiryDate: policy.expiryDate?.slice(0, 10) || '',
    status: policy.status,
    version: policy.version,
  };
}

export default function PolicyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const policyId = params.id as string;
  const {
    config: runtimeConfig,
    loading: loadingRuntimeConfig,
    error: runtimeConfigError,
  } = useRuntimeSystemConfig();

  const tCommon = useTranslations('common');
  const [policy, setPolicy] = useState<PolicyRecord | null>(null);
  const [formData, setFormData] = useState<PolicyFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  const loadPolicy = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await policyApi.getById(policyId);
      setPolicy(data);
      setFormData(toFormData(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load policy.');
    } finally {
      setLoading(false);
    }
  }, [policyId]);

  useEffect(() => {
    if (loadingRuntimeConfig) {
      return;
    }
    if (
      runtimeConfigError ||
      runtimeConfig?.maintenanceMode ||
      runtimeConfig?.featureFlags?.managerPolicyEditorEnabled === false
    ) {
      setLoading(false);
      return;
    }
    void loadPolicy();
  }, [loadPolicy, loadingRuntimeConfig, runtimeConfig, runtimeConfigError]);

  if (loadingRuntimeConfig) {
    return (
      <>
        <Header title="Policy Detail" subtitle="Loading runtime policy access..." />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  if (runtimeConfigError) {
    return (
      <RuntimeFeatureBlockedPage
        title="Policy Detail"
        subtitle="Unable to load runtime system config"
        heading="Cannot verify policy editor availability"
        message={runtimeConfigError}
        primaryHref="/manager/policies"
        primaryLabel="Back to policies"
      />
    );
  }

  if (runtimeConfig?.maintenanceMode) {
    return (
      <RuntimeFeatureBlockedPage
        title="Policy Detail"
        subtitle="System maintenance is active"
        heading="Policy editing is temporarily unavailable"
        message="Admin has enabled maintenance mode, so manager policy actions are paused until the system is reopened."
        primaryHref="/manager/policies"
        primaryLabel="Back to policies"
      />
    );
  }

  if (runtimeConfig?.featureFlags?.managerPolicyEditorEnabled === false) {
    return (
      <RuntimeFeatureBlockedPage
        title="Policy Detail"
        subtitle="Manager policy editor is disabled"
        heading="Policy editing is currently locked"
        message="Admin has turned off manager access for policy governance. Ask an admin if this policy needs to change."
        primaryHref="/manager/policies"
        primaryLabel="Back to policies"
      />
    );
  }

  const handleSave = async () => {
    if (!formData) return;

    try {
      setSaving(true);
      setError('');
      const updated = await policyApi.update(
        policyId,
        formData as unknown as Record<string, unknown>,
      );
      setPolicy(updated);
      setFormData(toFormData(updated));
      setEditing(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save policy.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!policy || !window.confirm(`Delete policy "${policy.title}"?`)) return;

    try {
      setSaving(true);
      setError('');
      await policyApi.remove(policy.id);
      router.push('/manager/policies');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete policy.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Policy Detail" subtitle="Loading policy..." />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  if (!policy || !formData) {
    return (
      <>
        <Header title="Policy Detail" subtitle="Policy not found" />
        <div className="p-6">
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{error || 'Policy not found.'}</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title={editing ? 'Edit Policy' : 'Policy Detail'} subtitle={policy.title} />

      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Link
            href="/manager/policies"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to policies
          </Link>

          {!editing ? (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setEditing(true)} className="gap-2">
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={saving}
                className="gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : null}

        {editing ? (
          <PolicyForm
            formData={formData}
            onChange={setFormData}
            onSubmit={handleSave}
            onCancel={() => {
              setFormData(toFormData(policy));
              setEditing(false);
            }}
            isSubmitting={saving}
            submitLabel="Save policy"
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Policy summary</h3>
              <div className="mt-4 space-y-4 text-sm text-gray-700">
                <div>
                  <div className="text-gray-500">Category</div>
                  <div>{policy.category}</div>
                </div>
                <div>
                  <div className="text-gray-500">Status</div>
                  <div>{policy.status}</div>
                </div>
                <div>
                  <div className="text-gray-500">Version</div>
                  <div>{policy.version}</div>
                </div>
                <div>
                  <div className="text-gray-500">Effective date</div>
                  <div>{policy.effectiveDate?.slice(0, 10)}</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
              <p className="mt-4 text-sm leading-6 text-gray-700">{policy.summary}</p>
            </Card>

            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900">Content</h3>
              <pre className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">
                {policy.content}
              </pre>
            </Card>
          </div>
        )}
      </div>
    </>
  );
}
