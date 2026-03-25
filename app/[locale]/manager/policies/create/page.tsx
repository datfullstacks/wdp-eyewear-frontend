'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Loader2, Shield } from 'lucide-react';

import { RuntimeFeatureBlockedPage } from '@/components/pages/RuntimeFeatureBlockedPage';
import { Header } from '@/components/organisms/Header';
import { PolicyForm, type PolicyFormData } from '@/components/organisms/manager';
import { useRuntimeSystemConfig } from '@/hooks/useRuntimeSystemConfig';
import policyApi from '@/api/policies';

const EMPTY_FORM: PolicyFormData = {
  title: '',
  category: 'warranty',
  summary: '',
  content: '',
  effectiveDate: '',
  expiryDate: '',
  status: 'draft',
  version: '1.0',
};

export default function CreatePolicyPage() {
  const router = useRouter();
  const {
    config: runtimeConfig,
    loading: loadingRuntimeConfig,
    error: runtimeConfigError,
  } = useRuntimeSystemConfig();
  const [formData, setFormData] = useState<PolicyFormData>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  if (loadingRuntimeConfig) {
    return (
      <>
        <Header title="Create Policy" subtitle="Loading runtime policy access..." />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  if (runtimeConfigError) {
    return (
      <RuntimeFeatureBlockedPage
        title="Create Policy"
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
        title="Create Policy"
        subtitle="System maintenance is active"
        heading="Policy creation is temporarily unavailable"
        message="Admin has enabled maintenance mode, so manager policy changes are paused until the system is reopened."
        primaryHref="/manager/policies"
        primaryLabel="Back to policies"
      />
    );
  }

  if (runtimeConfig?.featureFlags?.managerPolicyEditorEnabled === false) {
    return (
      <RuntimeFeatureBlockedPage
        title="Create Policy"
        subtitle="Manager policy editor is disabled"
        heading="Policy creation is currently locked"
        message="Admin has turned off manager access for policy governance. Ask an admin to publish or edit policies."
        primaryHref="/manager/policies"
        primaryLabel="Back to policies"
      />
    );
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.summary || !formData.content || !formData.effectiveDate) {
      setApiError('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      setApiError('');
      await policyApi.create(formData as unknown as Record<string, unknown>);
      router.push('/manager/policies');
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Failed to create policy.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header
        title="Create Policy"
        subtitle="Publish business rules for warranty, return, shipping, and platform terms"
      />

      <div className="space-y-6 p-6">
        <Link
          href="/manager/policies"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-amber-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to policies
        </Link>

        {apiError ? (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>{apiError}</span>
          </div>
        ) : null}

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-900">
            <Shield className="h-5 w-5" />
            Policy notes
          </h4>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>Write short summaries so staff can identify the right policy quickly.</li>
            <li>Keep version numbers explicit when policy changes affect operations.</li>
            <li>Use draft first for review, then publish active when approved.</li>
          </ul>
        </div>

        <PolicyForm
          formData={formData}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onCancel={() => router.push('/manager/policies')}
          isSubmitting={isSubmitting}
          submitLabel="Create policy"
        />
      </div>
    </>
  );
}
