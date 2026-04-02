import fs from 'fs';

function updateCreatePage() {
    const file = 'app/[locale]/manager/policies/create/page.tsx';
    let content = fs.readFileSync(file, 'utf-8');

    if (!content.includes("import { toast } from 'sonner';")) {
        content = content.replace(
            "import { useRouter } from 'next/navigation';",
            "import { useRouter } from 'next/navigation';\nimport { useTranslations } from 'next-intl';\nimport { toast } from 'sonner';"
        );
    }

    if (!content.includes("const tCommon = useTranslations('common');")) {
        content = content.replace(
            "const [formData, setFormData] = useState<PolicyFormData>(EMPTY_FORM);",
            "const tCommon = useTranslations('common');\n  const [formData, setFormData] = useState<PolicyFormData>(EMPTY_FORM);"
        );
    }

    content = content.replace(
        "await policyApi.create(formData as unknown as Record<string, unknown>);\n      router.push('/manager/policies');",
        "await policyApi.create(formData as unknown as Record<string, unknown>);\n      toast.success(tCommon('createSuccess'));\n      router.push('/manager/policies');"
    );

    content = content.replace(
        "setApiError(error instanceof Error ? error.message : 'Failed to create policy.');",
        "const msg = error instanceof Error ? error.message : 'Failed to create policy.';\n      setApiError(msg);\n      toast.error(msg);"
    );

    fs.writeFileSync(file, content, 'utf-8');
}

function updateDetailPage() {
    const file = 'app/[locale]/manager/policies/[id]/page.tsx';
    let content = fs.readFileSync(file, 'utf-8');

    if (!content.includes("import { toast } from 'sonner';")) {
        content = content.replace(
            "import { useParams, useRouter } from 'next/navigation';",
            "import { useParams, useRouter } from 'next/navigation';\nimport { useTranslations } from 'next-intl';\nimport { toast } from 'sonner';"
        );
    }

    if (!content.includes("const tCommon = useTranslations('common');")) {
        content = content.replace(
            "const [policy, setPolicy] = useState<PolicyRecord | null>(null);",
            "const tCommon = useTranslations('common');\n  const [policy, setPolicy] = useState<PolicyRecord | null>(null);"
        );
    }

    content = content.replace(
        "const updated = await policyApi.update(\n        policyId,\n        formData as unknown as Record<string, unknown>,\n      );\n      setPolicy(updated);",
        "const updated = await policyApi.update(\n        policyId,\n        formData as unknown as Record<string, unknown>,\n      );\n      toast.success(tCommon('updateSuccess'));\n      setPolicy(updated);"
    );

    content = content.replace(
        /setError\(err instanceof Error \? err\.message : 'Failed to save policy\.'\);/g,
        "const msg = err instanceof Error ? err.message : 'Failed to save policy.';\n      setError(msg);\n      toast.error(msg);"
    );

    content = content.replace(
        "await policyApi.remove(policy.id);\n      router.push('/manager/policies');",
        "await policyApi.remove(policy.id);\n      toast.success(tCommon('deleteSuccess'));\n      router.push('/manager/policies');"
    );

    content = content.replace(
        /setError\(err instanceof Error \? err\.message : 'Failed to delete policy\.'\);/g,
        "const msg = err instanceof Error ? err.message : 'Failed to delete policy.';\n      setError(msg);\n      toast.error(msg);"
    );

    fs.writeFileSync(file, content, 'utf-8');
}

function updateListPage() {
    const file = 'app/[locale]/manager/policies/page.tsx';
    let content = fs.readFileSync(file, 'utf-8');

    if (!content.includes("import { toast } from 'sonner';")) {
        content = content.replace(
            "import { useTranslations } from 'next-intl';",
            "import { useTranslations } from 'next-intl';\nimport { toast } from 'sonner';"
        );
    }

    if (!content.includes("const tCommon = useTranslations('common');")) {
        content = content.replace(
            "const t = useTranslations('manager.policies');",
            "const t = useTranslations('manager.policies');\n  const tCommon = useTranslations('common');"
        );
    }

    content = content.replace(
        "setPolicies((current) => current.filter((item) => item.id !== policy.id));\n      setApiError('');",
        "setPolicies((current) => current.filter((item) => item.id !== policy.id));\n      toast.success(tCommon('deleteSuccess'));\n      setApiError('');"
    );

    content = content.replace(
        "setApiError(error instanceof Error ? error.message : t('deleteFailed'));",
        "const msg = error instanceof Error ? error.message : t('deleteFailed');\n      setApiError(msg);\n      toast.error(msg);"
    );

    fs.writeFileSync(file, content, 'utf-8');
}

updateCreatePage();
updateDetailPage();
updateListPage();
console.log('Update Policies completed!');
