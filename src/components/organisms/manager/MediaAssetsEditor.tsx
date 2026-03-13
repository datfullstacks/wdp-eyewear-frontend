import { useMemo, useState } from 'react';
import { Button, Input } from '@/components/atoms';
import { uploadFile } from '@/api/managerProducts';
import type { Asset, Media } from '@/types/managerProduct';

interface MediaAssetsEditorProps {
  media: Media;
  onChange: (next: Media) => void;
}

const emptyAsset: Asset = {
  assetType: '2d',
  role: 'gallery',
  url: '',
  format: 'jpg',
  posterUrl: '',
  order: 0,
};

export function MediaAssetsEditor({ media, onChange }: MediaAssetsEditorProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState('');

  const assets = useMemo(() => media.assets || [], [media.assets]);

  const updateAssetAt = (index: number, patch: Partial<Asset>) => {
    const nextAssets = assets.map((asset, currentIndex) =>
      currentIndex === index ? { ...asset, ...patch } : asset
    );
    onChange({ ...media, assets: nextAssets });
  };

  const addAsset = () => {
    onChange({
      ...media,
      assets: [...assets, { ...emptyAsset, order: assets.length }],
    });
  };

  const removeAsset = (index: number) => {
    const nextAssets = assets.filter((_, currentIndex) => currentIndex !== index);
    onChange({ ...media, assets: nextAssets });
  };

  const handleUpload = async (index: number, file: File | null) => {
    if (!file) return;
    setUploadingIndex(index);
    setUploadError('');

    try {
      const uploaded = await uploadFile(file, 'wdp-products');
      updateAssetAt(index, { url: uploaded.url });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload thất bại';
      setUploadError(message);
    } finally {
      setUploadingIndex(null);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Media Assets</h3>
        <Button type="button" variant="outline" onClick={addAsset}>
          + Add asset
        </Button>
      </div>

      {uploadError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {uploadError}
        </div>
      )}

      {assets.map((asset, index) => (
        <div key={`${asset._id || 'asset'}-${index}`} className="space-y-2 rounded-md border border-gray-200 p-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <Input
              label="assetType"
              value={asset.assetType || '2d'}
              onChange={(event) =>
                updateAssetAt(index, {
                  assetType: (event.target.value as '2d' | '3d') || '2d',
                })
              }
            />
            <Input
              label="role"
              value={asset.role || 'gallery'}
              onChange={(event) => updateAssetAt(index, { role: event.target.value as Asset['role'] })}
            />
            <Input
              label="url"
              value={asset.url || ''}
              onChange={(event) => updateAssetAt(index, { url: event.target.value })}
            />
            <Input
              label="format"
              value={asset.format || ''}
              onChange={(event) => updateAssetAt(index, { format: event.target.value })}
            />
            <Input
              label="posterUrl"
              value={asset.posterUrl || ''}
              onChange={(event) => updateAssetAt(index, { posterUrl: event.target.value })}
            />
            <Input
              type="number"
              label="order"
              value={Number(asset.order || 0)}
              onChange={(event) => updateAssetAt(index, { order: Number(event.target.value || 0) })}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                handleUpload(index, event.target.files?.[0] || null)
              }
              className="text-sm"
            />
            {uploadingIndex === index && <span className="text-sm text-blue-700">Uploading...</span>}
            <Button type="button" variant="destructive" onClick={() => removeAsset(index)}>
              Remove
            </Button>
          </div>

          {asset.url && (
            <img
              src={asset.url}
              alt={`asset-${index}`}
              className="h-24 w-24 rounded border border-gray-200 object-cover"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          )}
        </div>
      ))}

      {assets.length === 0 && <p className="text-sm text-gray-500">Chưa có media asset.</p>}

      <div className="space-y-2 border-t border-gray-200 pt-3">
        <h4 className="text-sm font-semibold text-gray-900">TryOn (basic)</h4>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={Boolean(media.tryOn?.enabled)}
            onChange={(event) =>
              onChange({
                ...media,
                tryOn: {
                  ...(media.tryOn || {}),
                  enabled: event.target.checked,
                },
              })
            }
          />
          enabled
        </label>
        <Input
          label="tryOn.arUrl"
          value={media.tryOn?.arUrl || ''}
          onChange={(event) =>
            onChange({
              ...media,
              tryOn: {
                ...(media.tryOn || {}),
                arUrl: event.target.value,
              },
            })
          }
        />
      </div>
    </div>
  );
}
