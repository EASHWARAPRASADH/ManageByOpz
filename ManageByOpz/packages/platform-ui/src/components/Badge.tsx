import React from 'react';
import { cn } from '@managemyopz/platform-utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'sm', dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 rounded-full font-semibold whitespace-nowrap',
          // Variants
          variant === 'default' && 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
          variant === 'primary' && 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40',
          variant === 'success' && 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40',
          variant === 'warning' && 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40',
          variant === 'danger' && 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40',
          variant === 'info' && 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40',
          variant === 'outline' && 'bg-transparent border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400',
          // Sizes
          size === 'sm' && 'text-[10px] px-1.5 py-0.5',
          size === 'md' && 'text-xs px-2 py-0.5',
          className
        )}
        {...props}
      >
        {dot && (
          <span className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'danger' && 'bg-rose-500',
            variant === 'info' && 'bg-blue-500',
            variant === 'primary' && 'bg-indigo-500',
            (!variant || variant === 'default' || variant === 'outline') && 'bg-slate-400',
          )} />
        )}
        {children}
      </span>
    );
  }
);
Badge.displayName = 'Badge';
