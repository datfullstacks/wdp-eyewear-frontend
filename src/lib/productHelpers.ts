import type { ProductMediaAsset, ProductUpsertInput } from '@/api';
import type { ProductFormState } from '@/components/organisms/manager';

export function buildMediaAssets(form: ProductFormState): ProductMediaAsset[] {
  const assets: ProductMediaAsset[] = [];
  
  if (form.heroImageUrl) {
    assets.push({ url: form.heroImageUrl, role: 'hero', assetType: '2d' });
  }
  if (form.thumbnailUrl) {
    assets.push({ url: form.thumbnailUrl, role: 'thumbnail', assetType: '2d' });
  }
  form.galleryUrls.forEach((url) => {
    assets.push({ url, role: 'gallery', assetType: '2d' });
  });
  
  return assets;
}

export function buildUpsertPayload(form: ProductFormState): ProductUpsertInput {
  return {
    name: form.name.trim(),
    brand: form.brand.trim(),
    price: Number(form.price),
    stock: Number(form.stock),
    category: form.category,
    description: form.description.trim() || undefined,
    imageUrl: form.heroImageUrl || undefined,
    mediaAssets: buildMediaAssets(form),
  };
}

export function getRoleUrl(product: { mediaAssets?: ProductMediaAsset[] }, role: ProductMediaAsset['role']) {
  return product.mediaAssets?.find((asset) => asset.role === role)?.url || '';
}

export function getGalleryUrls(product: { mediaAssets?: ProductMediaAsset[] }) {
  return (
    product.mediaAssets
      ?.filter((asset) => asset.role === 'gallery')
      .map((asset) => asset.url) || []
  );
}

export function normalizeCategoryValue(category: string) {
  const lower = category.toLowerCase();
  if (lower.includes('sun')) return 'sunglasses';
  if (lower.includes('frame') || lower.includes('gong')) return 'frame';
  if (lower.includes('lens') || lower.includes('trong')) return 'lens';
  if (lower.includes('access') || lower.includes('phu')) return 'accessory';
  return 'other';
}
