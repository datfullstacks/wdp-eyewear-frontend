'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, ArrowLeft, Save } from 'lucide-react';
import { Button, Input, Select, Textarea } from '@/components/atoms';
import { createProduct } from '@/api/managerProducts';
import { tryParseSpecsJson } from '@/lib/managerProduct';
import type { UpdateProductPayload } from '@/types/managerProduct';
import { VariantsEditor } from './VariantsEditor';
import { MediaAssetsEditor } from './MediaAssetsEditor';
import { SpecsEditor } from './SpecsEditor';

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

const initialPayload: UpdateProductPayload = {
  name: '',
  slug: '',
  brand: '',
  description: '',
  type: 'accessory',
  status: 'draft',
  pricing: {
    currency: 'VND',
    basePrice: 0,
    msrp: 0,
    salePrice: 0,
    discountPercent: 0,
    taxRate: 0,
  },
  inventory: {
    track: true,
    threshold: 0,
  },
  preOrder: {
    enabled: false,
    allowCod: true,
  },
  variants: [],
  media: {
    assets: [],
    tryOn: {
      enabled: false,
    },
  },
  specs: {},
  servicesIncluded: [],
  bundleIds: [],
};

export function ManagerProductCreatePage() {
  const router = useRouter();

  const [payload, setPayload] = useState<UpdateProductPayload>(initialPayload);
  const [specsText, setSpecsText] = useState('{}');
  const [specsError, setSpecsError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState('');

  const patchPayload = (patch: Partial<UpdateProductPayload>) => {
    setPayload((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = async () => {
    try {
      setSpecsError('');
      setPageError('');
      const parsedSpecs = tryParseSpecsJson(specsText);

      setIsSaving(true);
      const created = await createProduct({
        ...payload,
        specs: parsedSpecs,
      });

      router.push(`/manager/products/${created._id}`);
    } catch (error) {
      if (error instanceof SyntaxError) {
        setSpecsError('JSON specs không hợp lệ. Vui lòng kiểm tra lại.');
        return;
      }

      const message = error instanceof Error ? error.message : 'Tạo sản phẩm thất bại';
      setPageError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <Button type="button" variant="outline" onClick={() => router.push('/manager/products')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to list
        </Button>

        <Button type="button" onClick={handleSave} disabled={isSaving}>
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Creating...' : 'Create'}
        </Button>
      </div>

      {pageError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{pageError}</span>
          </div>
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
        productId="new"
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
