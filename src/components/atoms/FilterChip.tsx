import { cn } from '@/lib/utils';

interface FilterChipProps {
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export const FilterChip = ({
  label,
  count,
  active = false,
  onClick,
  className,
}: FilterChipProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80',
        className
      )}
    >
      {label}
      {count !== undefined && (
        <span
          className={cn(
            'inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs font-bold',
            active
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-background text-foreground'
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
};
