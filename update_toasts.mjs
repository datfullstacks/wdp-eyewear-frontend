import fs from 'fs';

function configurePage1() {
    let filepath = "app/[locale]/manager/products/[id]/page.tsx";
    let content = fs.readFileSync(filepath, 'utf-8');
    
    // Add imports
    if (!content.includes("import { toast } from 'sonner';")) {
        content = content.replace(
            "import { useTranslations } from 'next-intl';",
            "import { useTranslations } from 'next-intl';\nimport { toast } from 'sonner';"
        );
    }

    // Add tCommon
    if (!content.includes("const tCommon = useTranslations('common');")) {
        content = content.replace(
            "const tDetail = useTranslations('manager.products.detail');",
            "const tDetail = useTranslations('manager.products.detail');\n  const tCommon = useTranslations('common');"
        );
    }
    
    // handleToggleStatus
    content = content.replace(
        "await productApi.updateStatus(productId, newStatus);\n      await loadProduct();",
        "await productApi.updateStatus(productId, newStatus);\n      toast.success(tCommon('updateSuccess'));\n      await loadProduct();"
    );
    content = content.replace(
        "setApiError(error instanceof Error ? error.message : 'Update failed');",
        "const msg = error instanceof Error ? error.message : 'Update failed';\n      setApiError(msg);\n      toast.error(msg);"
    );
    
    // handleDelete
    content = content.replace(
        "await productApi.remove(productId);\n      router.push('/manager/products');",
        "await productApi.remove(productId);\n      toast.success(tCommon('deleteSuccess'));\n      router.push('/manager/products');"
    );
    content = content.replace(
        "setApiError(error instanceof Error ? error.message : 'Delete failed');",
        "const msg = error instanceof Error ? error.message : 'Delete failed';\n      setApiError(msg);\n      toast.error(msg);"
    );
    
    fs.writeFileSync(filepath, content, 'utf-8');
}

function configurePage2() {
    let filepath = "app/[locale]/manager/products/page.tsx";
    let content = fs.readFileSync(filepath, 'utf-8');
    
    // Add imports
    if (!content.includes("import { toast } from 'sonner';")) {
        content = content.replace(
            "import { useTranslations } from 'next-intl';",
            "import { useTranslations } from 'next-intl';\nimport { toast } from 'sonner';"
        );
    }

    // Add tCommon
    if (!content.includes("const tCommon = useTranslations('common');")) {
        content = content.replace(
            "const t = useTranslations('manager.products');",
            "const t = useTranslations('manager.products');\n  const tCommon = useTranslations('common');"
        );
    }
    
    // handleToggleStatus
    content = content.replace(
        "await productApi.updateStatus(product.id, newStatus);\n      await loadProducts();",
        "await productApi.updateStatus(product.id, newStatus);\n      toast.success(tCommon('updateSuccess'));\n      await loadProducts();"
    );
    content = content.replace(
        "setApiError(error instanceof Error ? error.message : 'Failed to update status');",
        "const msg = error instanceof Error ? error.message : 'Failed to update status';\n      setApiError(msg);\n      toast.error(msg);"
    );
    
    // handleDelete
    content = content.replace(
        "await productApi.remove(product.id);\n      await loadProducts();",
        "await productApi.remove(product.id);\n      toast.success(tCommon('deleteSuccess'));\n      await loadProducts();"
    );
    content = content.replace(
        "setApiError(error instanceof Error ? error.message : 'Failed to delete product');",
        "const msg = error instanceof Error ? error.message : 'Failed to delete product';\n      setApiError(msg);\n      toast.error(msg);"
    );
    
    fs.writeFileSync(filepath, content, 'utf-8');
}

configurePage1();
configurePage2();
console.log('Update Products script finished!');
