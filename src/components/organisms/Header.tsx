'use client';

import { Bell, Plus, Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useLocaleSwitch } from '@/hooks/useLocaleSwitch';

import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/atoms';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onAddProduct?: () => void;
  onSearch?: (query: string) => void;
  // Backward compatibility
  showAddButton?: boolean;
  addButtonLabel?: string;
  onAdd?: () => void;
  addButtonClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  avatarClassName?: string;
}

export const Header = ({
  title,
  subtitle,
  onAddProduct,
  showAddButton,
  addButtonLabel = 'Thêm mới',
  onAdd,
  addButtonClassName,
  titleClassName,
  subtitleClassName,
  avatarClassName,
}: HeaderProps) => {
  // Handle both old and new props
  const handleAddClick = onAddProduct || onAdd;
  const shouldShowAddButton = onAddProduct || (showAddButton && onAdd);
  const finalButtonLabel = addButtonLabel;

  const locale = useLocale();
  const { switchLocale, isPending } = useLocaleSwitch();

  return (
    <header className="bg-card border-border flex h-16 items-center justify-between gap-4 border-b px-6">
      <div className="min-w-0 flex-1">
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

      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50 p-0.5">
          <button
            onClick={() => switchLocale('vi')}
            disabled={isPending}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
              locale === 'vi'
                ? 'bg-amber-400 text-slate-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            } ${isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            VI
          </button>
          <button
            onClick={() => switchLocale('en')}
            disabled={isPending}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all duration-200 ${
              locale === 'en'
                ? 'bg-amber-400 text-slate-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            } ${isPending ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            EN
          </button>
        </div>

        {shouldShowAddButton && (
          <Button
            onClick={handleAddClick}
            className={`inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md ${addButtonClassName ?? ''}`}
          >
            <Plus className="h-4 w-4" />
            <span>{finalButtonLabel}</span>
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="relative text-gray-700 hover:text-gray-900"
        >
          <Bell className="h-5 w-5 text-gray-700" />
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
