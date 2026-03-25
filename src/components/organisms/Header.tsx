'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { Bell, LogOut, Plus } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useLocaleSwitch } from '@/hooks/useLocaleSwitch';

import { Avatar } from '@/components/atoms/Avatar';
import { Button } from '@/components/atoms';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button as UiButton } from '@/components/ui/button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onAddProduct?: () => void;
  onSearch?: (query: string) => void;
  showAddButton?: boolean;
  addButtonLabel?: string;
  onAdd?: () => void;
  addButtonClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  avatarClassName?: string;
}

type HeaderCopy = {
  notifications: string;
  account: string;
  accountStatus: string;
  logout: string;
  loggingOut: string;
  staffName: string;
  notificationItems: Array<{
    title: string;
    time: string;
  }>;
};

function getHeaderCopy(locale: string): HeaderCopy {
  if (locale === 'vi') {
    return {
      notifications: 'Thông báo',
      account: 'Tài khoản hệ thống',
      accountStatus: 'Đang đăng nhập',
      logout: 'Đăng xuất',
      loggingOut: 'Đang đăng xuất...',
      staffName: 'Nhân viên',
      notificationItems: [
        {
          title: 'Đơn hàng mới vừa được tạo',
          time: '2 phút trước',
        },
        {
          title: 'Tồn kho một số sản phẩm đang thấp',
          time: '1 giờ trước',
        },
        {
          title: 'Có yêu cầu hỗ trợ mới cần xử lý',
          time: '3 giờ trước',
        },
      ],
    };
  }

  return {
    notifications: 'Notifications',
    account: 'System account',
    accountStatus: 'Signed in',
    logout: 'Logout',
    loggingOut: 'Signing out...',
    staffName: 'Staff member',
    notificationItems: [
      {
        title: 'A new order has been created',
        time: '2 minutes ago',
      },
      {
        title: 'Several products are running low on stock',
        time: '1 hour ago',
      },
      {
        title: 'A new support request needs attention',
        time: '3 hours ago',
      },
    ],
  };
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
  const handleAddClick = onAddProduct || onAdd;
  const shouldShowAddButton = onAddProduct || (showAddButton && onAdd);
  const finalButtonLabel = addButtonLabel;

  const locale = useLocale();
  const { switchLocale, isPending } = useLocaleSwitch();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const copy = getHeaderCopy(locale);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await signOut({ callbackUrl: `/${locale}/login` });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-card border-border flex h-16 items-center justify-between gap-4 border-b px-6">
      <div className="min-w-0 flex-1">
        <h1
          className={`font-display text-foreground text-xl font-semibold ${titleClassName ?? ''}`}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={`text-muted-foreground text-sm ${subtitleClassName ?? ''}`}
          >
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-3">
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

        {shouldShowAddButton ? (
          <Button
            onClick={handleAddClick}
            className={`inline-flex items-center gap-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition-all hover:bg-amber-500 hover:shadow-md ${addButtonClassName ?? ''}`}
          >
            <Plus className="h-4 w-4" />
            <span>{finalButtonLabel}</span>
          </Button>
        ) : null}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <UiButton
              variant="ghost"
              size="icon"
              className="relative text-gray-700 hover:text-gray-900"
              aria-label={copy.notifications}
            >
              <Bell className="h-5 w-5 text-gray-700" />
              <span className="bg-destructive absolute top-1 right-1 h-2 w-2 rounded-full" />
            </UiButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>{copy.notifications}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {copy.notificationItems.map((item) => (
              <DropdownMenuItem
                key={`${item.title}-${item.time}`}
                className="flex flex-col items-start gap-1"
              >
                <span className="font-medium text-gray-900">{item.title}</span>
                <span className="text-xs text-gray-500">{item.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <UiButton
              variant="ghost"
              className="h-auto rounded-full p-0 hover:bg-transparent"
              aria-label={copy.account}
            >
              <Avatar
                name={copy.staffName}
                size="md"
                className={avatarClassName ?? 'bg-amber-400 text-slate-900'}
              />
            </UiButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="space-y-1">
              <div className="text-sm font-semibold text-gray-900">
                {copy.account}
              </div>
              <div className="text-xs font-normal text-gray-500">
                {copy.accountStatus}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void handleLogout()}
              disabled={isLoggingOut}
              className="text-red-600 focus:text-red-700"
            >
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? copy.loggingOut : copy.logout}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
