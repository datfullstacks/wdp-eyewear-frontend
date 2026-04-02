const fs = require('fs');
function processFile(filepath) {
    let content = fs.readFileSync(filepath, 'utf-8');
    content = content.replace(
        /await productApi\.create\(payload\);\s+router\.push\('\/manager\/products'\);/,
        'await productApi.create(payload);\n      toast.success(tCommon(\\'createSuccess\\'));\n      router.push(\\'/manager/products\\');'
    );
    content = content.replace(
        /setApiError\(error instanceof Error \? error\.message : 'Create failed'\);/,
        'const msg = error instanceof Error ? error.message : \\'Create failed\\';\n      setApiError(msg);\n      toast.error(msg);'
    );
    content = content.replace(
        /await productApi\.update\(productId, payload\);\s+router\.push\('\/manager\/products'\);/,
        'await productApi.update(productId, payload);\n      toast.success(tCommon(\\'updateSuccess\\'));\n      router.push(\\'/manager/products\\');'
    );
    content = content.replace(
        /setApiError\(error instanceof Error \? error\.message : 'Update failed'\);/,
        'const msg = error instanceof Error ? error.message : \\'Update failed\\';\n      setApiError(msg);\n      toast.error(msg);'
    );
    fs.writeFileSync(filepath, content, 'utf-8');
}
processFile('app/[locale]/manager/products/create/page.tsx');
processFile('app/[locale]/manager/products/[id]/edit/page.tsx');
console.log('Done');
