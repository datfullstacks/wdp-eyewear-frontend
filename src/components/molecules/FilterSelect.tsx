import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  allLabel?: string;
  className?: string;
}

export const FilterSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  allLabel = 'Tất cả',
  className,
}: FilterSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={cn('w-full md:w-40', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{allLabel}</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
