import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const variants = {
      default:
        'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300 shadow-sm',
      success:
        'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-300 shadow-sm shadow-green-200/50',
      warning:
        'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-300 shadow-sm shadow-amber-200/50',
      danger:
        'bg-gradient-to-r from-rose-100 to-red-100 text-rose-800 border-rose-300 shadow-sm shadow-rose-200/50',
      info: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300 shadow-sm shadow-blue-200/50',
      secondary:
        'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border-purple-300 shadow-sm shadow-purple-200/50',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1',
      md: 'text-sm px-3 py-1.5',
      lg: 'text-base px-4 py-2',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border font-bold transition-all duration-300 hover:scale-105 hover:shadow-md',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
