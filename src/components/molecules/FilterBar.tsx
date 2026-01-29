import React from 'react';
import { Select, Button } from '../atoms';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterBarProps {
  filters: Array<{
    name: string;
    label: string;
    options: FilterOption[];
  }>;
  onFilterChange?: (filters: Record<string, string>) => void;
  onReset?: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const [selectedFilters, setSelectedFilters] = React.useState<
    Record<string, string>
  >({});

  const handleFilterChange = (name: string, value: string) => {
    const newFilters = { ...selectedFilters, [name]: value };
    setSelectedFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleReset = () => {
    setSelectedFilters({});
    onReset?.();
  };

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border bg-gray-50 p-4">
      {filters.map((filter) => (
        <div key={filter.name} className="min-w-[200px]">
          <Select
            label={filter.label}
            options={filter.options}
            value={selectedFilters[filter.name] || ''}
            onChange={(e) => handleFilterChange(filter.name, e.target.value)}
          />
        </div>
      ))}
      <Button variant="outline" onClick={handleReset} className="mb-0">
        Reset
      </Button>
    </div>
  );
};
