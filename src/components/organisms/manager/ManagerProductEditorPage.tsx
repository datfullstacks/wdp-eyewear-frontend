'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Save } from 'lucide-react';
import { Button, Input, Select, Textarea } from '@/components/atoms';
import { getProductById, updateProduct } from '@/api/managerProducts';
import {
  hasTryOnComplexity,
  mapProductToUpdatePayload,
  normalizeVariant,
  tryParseSpecsJson,
} from '@/lib/managerProduct';
import type { Product, UpdateProductPayload } from '@/types/managerProduct';
import { VariantsEditor } from './VariantsEditor';
import { MediaAssetsEditor } from './MediaAssetsEditor';
import { SpecsEditor } from './SpecsEditor';

interface ManagerProductEditorPageProps {
  productId: string;
}

const statusOptions = [
  { value: 'draft', label: 'draft' },
  { value: 'active', label: 'active' },
  { value: 'inactive', label: 'inactive' },
  { value: 'out_of_stock', label: 'out_of_stock' },
];

const typeOptions = [
  'sunglasses',
  'frame',
  'lens',
  'contact_lens',
  'accessory',
  'service',
  'bundle',
  'gift_card',
  'other',
].map((value) => ({ value, label: value }));

function toJsonString(value: unknown): string {
  try {
    return JSON.stringify(value || {}, null, 2);
  } catch {
    return '{}';
  }
}

export function ManagerProductEditorPage({ productId }: ManagerProductEditorPageProps) {
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [payload, setPayload] = useState<UpdateProductPayload | null>(null);
  const [specsText, setSpecsText] = useState('{}');
  const [specsError, setSpecsError] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadDetail = async () => {
      try {
        setIsLoading(true);
        setPageError('');
        const detail = await getProductById(productId);
        if (!mounted) return;

        setProduct(detail);
        const nextPayload = mapProductToUpdatePayload(detail);
        nextPayload.variants = (nextPayload.variants || []).map((variant) =>
          normalizeVariant(variant)
        );

        setPayload(nextPayload);
        setSpecsText(toJsonString(nextPayload.specs || {}));
      } catch (error) {
        if (!mounted) return;
        const message =
          error instanceof Error ? error.message : 'Không thể tải chi tiết sản phẩm';
        setPageError(message);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadDetail();

    return () => {
      mounted = false;
    };
  }, [productId]);

  const tryOnWarning = useMemo(() => {
    if (!product) return '';
    if (!hasTryOnComplexity(product)) return '';
    return 'Sản phẩm có try-on/3D. Bản editor hiện tại ưu tiên CRUD product thường, nên hạn chế thay đổi sâu publish try-on.';
  }, [product]);

  const patchPayload = (patch: Partial<UpdateProductPayload>) => {
    setPayload((prev) => ({ ...(prev || {}), ...patch }));
    setSaveSuccess('');
  };

  const handleSave = async () => {
    if (!payload) return;

    try {
      setSpecsError('');
      const parsedSpecs = tryParseSpecsJson(specsText);

      setIsSaving(true);
      setPageError('');
      const nextPayload: UpdateProductPayload = {
        ...payload,
        specs: parsedSpecs,
      };

      const updated = await updateProduct(productId, nextPayload);
      setProduct(updated);
      setPayload(mapProductToUpdatePayload(updated));
      setSaveSuccess('Lưu sản phẩm thành công.');
    } catch (error) {
      if (error instanceof SyntaxError) {
        setSpecsError('JSON specs không hợp lệ. Vui lòng kiểm tra lại.');
        return;
      }

      const message = error instanceof Error ? error.message : 'Cập nhật sản phẩm thất bại';
      setPageError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-600">Đang tải chi tiết sản phẩm...</div>;
  }

  if (!payload || !product) {
    return (
      <div className="p-6 text-sm text-red-700">
        {pageError || 'Không tìm thấy dữ liệu sản phẩm để chỉnh sửa.'}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={() => router.push('/manager/products')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to list
        </Button>

        <Button type="button" onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>

      {tryOnWarning && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {tryOnWarning}
        </div>
      )}

      {pageError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{pageError}</span>
          </div>
        </div>
      )}

      {saveSuccess && (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {saveSuccess}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900">Basic Info</h2>

          <Input
            label="name"
            value={payload.name || ''}
            onChange={(event) => patchPayload({ name: event.target.value })}
          />
          <Input
            label="slug"
            value={payload.slug || ''}
            onChange={(event) => patchPayload({ slug: event.target.value })}
          />
          <Input
            label="brand"
            value={payload.brand || ''}
            onChange={(event) => patchPayload({ brand: event.target.value })}
          />

          <Select
            label="type"
            options={typeOptions}
            value={payload.type || 'other'}
            onChange={(event) => patchPayload({ type: event.target.value })}
          />

          <Select
            label="status"
            options={statusOptions}
            value={payload.status || 'draft'}
            onChange={(event) =>
              patchPayload({ status: event.target.value as UpdateProductPayload['status'] })
            }
          />

          <Textarea
            label="description"
            rows={4}
            value={payload.description || ''}
            onChange={(event) => patchPayload({ description: event.target.value })}
          />
        </div>

        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900">Pricing / Inventory / PreOrder</h2>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <Input
              label="pricing.currency"
              value={payload.pricing?.currency || 'VND'}
              onChange={(event) =>
                patchPayload({
                  pricing: { ...(payload.pricing || {}), currency: event.target.value },
                })
              }
            />
            <Input
              type="number"
              label="pricing.basePrice"
              value={Number(payload.pricing?.basePrice || 0)}
              onChange={(event) =>
                patchPayload({
                  pricing: {
                    ...(payload.pricing || {}),
                    basePrice: Number(event.target.value || 0),
                  },
                })
              }
            />
            <Input
              type="number"
              label="pricing.msrp"
              value={Number(payload.pricing?.msrp || 0)}
              onChange={(event) =>
                patchPayload({
                  pricing: { ...(payload.pricing || {}), msrp: Number(event.target.value || 0) },
                })
              }
            />
            <Input
              type="number"
              label="pricing.salePrice"
              value={Number(payload.pricing?.salePrice || 0)}
              onChange={(event) =>
                patchPayload({
                  pricing: {
                    ...(payload.pricing || {}),
                    salePrice: Number(event.target.value || 0),
                  },
                })
              }
            />
            <Input
              type="number"
              label="pricing.discountPercent"
              value={Number(payload.pricing?.discountPercent || 0)}
              onChange={(event) =>
                patchPayload({
                  pricing: {
                    ...(payload.pricing || {}),
                    discountPercent: Number(event.target.value || 0),
                  },
                })
              }
            />
            <Input
              type="number"
              label="pricing.taxRate"
              value={Number(payload.pricing?.taxRate || 0)}
              onChange={(event) =>
                patchPayload({
                  pricing: {
                    ...(payload.pricing || {}),
                    taxRate: Number(event.target.value || 0),
                  },
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(payload.inventory?.track)}
                onChange={(event) =>
                  patchPayload({
                    inventory: {
                      ...(payload.inventory || {}),
                      track: event.target.checked,
                    },
                  })
                }
              />
              inventory.track
            </label>

            <Input
              type="number"
              label="inventory.threshold"
              value={Number(payload.inventory?.threshold || 0)}
              onChange={(event) =>
                patchPayload({
                  inventory: {
                    ...(payload.inventory || {}),
                    threshold: Number(event.target.value || 0),
                  },
                })
              }
            />
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(payload.preOrder?.enabled)}
                onChange={(event) =>
                  patchPayload({
                    preOrder: {
                      ...(payload.preOrder || {}),
                      enabled: event.target.checked,
                    },
                  })
                }
              />
              preOrder.enabled
            </label>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(payload.preOrder?.allowCod)}
                onChange={(event) =>
                  patchPayload({
                    preOrder: {
                      ...(payload.preOrder || {}),
                      allowCod: event.target.checked,
                    },
                  })
                }
              />
              preOrder.allowCod
            </label>

            <Input
              type="datetime-local"
              label="preOrder.startAt"
              value={payload.preOrder?.startAt || ''}
              onChange={(event) =>
                patchPayload({
                  preOrder: {
                    ...(payload.preOrder || {}),
                    startAt: event.target.value,
                  },
                })
              }
            />
            <Input
              type="datetime-local"
              label="preOrder.endAt"
              value={payload.preOrder?.endAt || ''}
              onChange={(event) =>
                patchPayload({
                  preOrder: {
                    ...(payload.preOrder || {}),
                    endAt: event.target.value,
                  },
                })
              }
            />

            <Input
              type="datetime-local"
              label="preOrder.shipFrom"
              value={payload.preOrder?.shipFrom || ''}
              onChange={(event) =>
                patchPayload({
                  preOrder: {
                    ...(payload.preOrder || {}),
                    shipFrom: event.target.value,
                  },
                })
              }
            />
            <Input
              type="datetime-local"
              label="preOrder.shipTo"
              value={payload.preOrder?.shipTo || ''}
              onChange={(event) =>
                patchPayload({
                  preOrder: {
                    ...(payload.preOrder || {}),
                    shipTo: event.target.value,
                  },
                })
              }
            />

            <Input
              type="number"
              label="preOrder.depositPercent"
              value={Number(payload.preOrder?.depositPercent || 0)}
              onChange={(event) =>
                patchPayload({
                  preOrder: {
                    ...(payload.preOrder || {}),
                    depositPercent: Number(event.target.value || 0),
                  },
                })
              }
            />
            <Input
              type="number"
              label="preOrder.maxQuantityPerOrder"
              value={Number(payload.preOrder?.maxQuantityPerOrder || 0)}
              onChange={(event) =>
                patchPayload({
                  preOrder: {
                    ...(payload.preOrder || {}),
                    maxQuantityPerOrder: Number(event.target.value || 0),
                  },
                })
              }
            />
          </div>

          <Textarea
            label="preOrder.note"
            rows={2}
            value={payload.preOrder?.note || ''}
            onChange={(event) =>
              patchPayload({
                preOrder: {
                  ...(payload.preOrder || {}),
                  note: event.target.value,
                },
              })
            }
          />
        </div>
      </div>

      <VariantsEditor
        productId={product._id}
        variants={payload.variants || []}
        onChange={(variants) => patchPayload({ variants })}
      />

      <MediaAssetsEditor
        media={payload.media || { assets: [], tryOn: { enabled: false } }}
        onChange={(media) => patchPayload({ media })}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <SpecsEditor value={specsText} error={specsError} onChange={setSpecsText} />

        <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="text-sm font-semibold text-gray-900">servicesIncluded / bundleIds</h3>
          <Input
            label="servicesIncluded (comma separated)"
            value={(payload.servicesIncluded || []).join(', ')}
            onChange={(event) =>
              patchPayload({
                servicesIncluded: event.target.value
                  .split(',')
                  .map((value) => value.trim())
                  .filter(Boolean),
              })
            }
          />
          <Input
            label="bundleIds (comma separated)"
            value={(payload.bundleIds || []).join(', ')}
            onChange={(event) =>
              patchPayload({
                bundleIds: event.target.value
                  .split(',')
                  .map((value) => value.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
      </div>
    </div>
  );
}
