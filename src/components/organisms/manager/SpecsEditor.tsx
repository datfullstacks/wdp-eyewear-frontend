import { Textarea } from '@/components/atoms';

interface SpecsEditorProps {
  value: string;
  error: string;
  onChange: (value: string) => void;
}

export function SpecsEditor({ value, error, onChange }: SpecsEditorProps) {
  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-gray-900">Specs (JSON)</h3>
      <Textarea
        rows={12}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder='{"common": {"shape": "round"}}'
      />
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
