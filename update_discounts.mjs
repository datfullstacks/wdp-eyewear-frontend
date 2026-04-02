import fs from 'fs';

function updateCreatePage() {
    const file = 'app/[locale]/manager/discounts/create/page.tsx';
    let content = fs.readFileSync(file, 'utf-8');

    if (!content.includes("import { toast } from 'sonner';")) {
        content = content.replace(
            "import { useRouter } from 'next/navigation';",
            "import { useRouter } from 'next/navigation';\nimport { useTranslations } from 'next-intl';\nimport { toast } from 'sonner';"
        );
    }

    if (!content.includes("const tCommon = useTranslations('common');")) {
        content = content.replace(
            "const [formData, setFormData] = useState<DiscountFormData>(EMPTY_FORM);",
            "const tCommon = useTranslations('common');\n  const [formData, setFormData] = useState<DiscountFormData>(EMPTY_FORM);"
        );
    }

    content = content.replace(
        "await promotionApi.create(formData as unknown as Record<string, unknown>);\n      router.push('/manager/discounts');",
        "await promotionApi.create(formData as unknown as Record<string, unknown>);\n      toast.success(tCommon('createSuccess'));\n      router.push('/manager/discounts');"
    );

    content = content.replace(
        "setApiError(error instanceof Error ? error.message : 'Failed to create promotion.');",
        "const msg = error instanceof Error ? error.message : 'Failed to create promotion.';\n      setApiError(msg);\n      toast.error(msg);"
    );

    fs.writeFileSync(file, content, 'utf-8');
}

function updateDetailPage() {
    const file = 'app/[locale]/manager/discounts/[id]/page.tsx';
    let content = fs.readFileSync(file, 'utf-8');

    if (!content.includes("import { toast } from 'sonner';")) {
        content = content.replace(
            "import { useParams, useRouter } from 'next/navigation';",
            "import { useParams, useRouter } from 'next/navigation';\nimport { useTranslations } from 'next-intl';\nimport { toast } from 'sonner';"
        );
    }

    if (!content.includes("const tCommon = useTranslations('common');")) {
        content = content.replace(
            "const [discount, setDiscount] = useState<PromotionRecord | null>(null);",
            "const tCommon = useTranslations('common');\n  const [discount, setDiscount] = useState<PromotionRecord | null>(null);"
        );
    }

    content = content.replace(
        "const updated = await promotionApi.update(\n        discountId,\n        formData as unknown as Record<string, unknown>,\n      );\n      setDiscount(updated);",
        "const updated = await promotionApi.update(\n        discountId,\n        formData as unknown as Record<string, unknown>,\n      );\n      toast.success(tCommon('updateSuccess'));\n      setDiscount(updated);"
    );

    content = content.replace(
        /setError\(err instanceof Error \? err\.message : 'Failed to save promotion\.'\);/g,
        "const msg = err instanceof Error ? err.message : 'Failed to save promotion.';\n      setError(msg);\n      toast.error(msg);"
    );

    content = content.replace(
        "await promotionApi.remove(discount.id);\n      router.push('/manager/discounts');",
        "await promotionApi.remove(discount.id);\n      toast.success(tCommon('deleteSuccess'));\n      router.push('/manager/discounts');"
    );

    content = content.replace(
        /setError\(err instanceof Error \? err\.message : 'Failed to delete promotion\.'\);/g,
        "const msg = err instanceof Error ? err.message : 'Failed to delete promotion.';\n      setError(msg);\n      toast.error(msg);"
    );

    fs.writeFileSync(file, content, 'utf-8');
}

function updateListPage() {
    const file = 'app/[locale]/manager/discounts/page.tsx';
    let content = fs.readFileSync(file, 'utf-8');

    if (!content.includes("import { toast } from 'sonner';")) {
        content = content.replace(
            "import { useTranslations } from 'next-intl';",
            "import { useTranslations } from 'next-intl';\nimport { toast } from 'sonner';"
        );
    }

    if (!content.includes("const tCommon = useTranslations('common');")) {
        content = content.replace(
            "const t = useTranslations('manager.discounts');",
            "const t = useTranslations('manager.discounts');\n  const tCommon = useTranslations('common');"
        );
    }

    content = content.replace(
        "setDiscounts((current) => current.filter((item) => item.id !== discount.id));\n      setApiError('');",
        "setDiscounts((current) => current.filter((item) => item.id !== discount.id));\n      toast.success(tCommon('deleteSuccess'));\n      setApiError('');"
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
console.log('Update Discounts completed!');
