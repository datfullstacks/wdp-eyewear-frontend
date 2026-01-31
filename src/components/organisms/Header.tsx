import { Bell, Plus } from 'lucide-react';
import { SearchBar } from '@/components/molecules/SearchBar';

import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/atoms';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  addButtonLabel?: string;
  onAdd?: () => void;
  titleClassName?: string;
  subtitleClassName?: string;
  addButtonClassName?: string;
  avatarClassName?: string;
}

export const Header = ({
  title,
  subtitle,
  showAddButton,
  addButtonLabel = 'Thêm mới',
  onAdd,
  titleClassName,
  subtitleClassName,
  addButtonClassName,
  avatarClassName,
}: HeaderProps) => {
  return (
    <header className="bg-card border-border flex h-16 items-center justify-between gap-4 border-b px-6">
      <div>
        <h1
          className={`font-display text-foreground text-xl font-semibold ${titleClassName ?? ''}`}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            className={`text-muted-foreground text-sm ${subtitleClassName ?? ''}`}
          >
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        <SearchBar className="hidden w-64 md:block" placeholder="Tìm kiếm..." />

        {showAddButton && (
          <Button
            onClick={onAdd}
            className={`gap-2 bg-amber-400 text-slate-900 hover:opacity-90 ${addButtonClassName ?? ''}`}
          >
            <Plus className="h-4 w-4" />
            {addButtonLabel}
          </Button>
        )}

        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          <span className="bg-destructive absolute top-1 right-1 h-2 w-2 rounded-full" />
        </Button>

        <Avatar
          name="Nhân viên"
          size="md"
          className={avatarClassName ?? 'bg-amber-400 text-slate-900'}
        />
      </div>
    </header>
  );
};
