'use client';

import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/atoms';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
}

export const SearchBar = ({
  placeholder = 'Tìm kiếm...',
  value,
  onChange,
  onSearch,
  className,
}: SearchBarProps) => {
  const handleChange = (val: string) => {
    onChange?.(val);
    onSearch?.(val);
  };

  return (
    <div className={cn('relative', className)}>
      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-card border-border focus:ring-accent/20 pl-10 focus:ring-2"
      />
    </div>
  );
};
