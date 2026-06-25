import React from 'react';
import { cn } from '@managemyopz/platform-utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  variant?: 'default' | 'primary' | 'outline' | 'ghost' | 'link' | 'danger' | 'success';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = 'md', variant = 'default', loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150',
          'disabled:opacity-50 disabled:pointer-events-none active:scale-95 focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500',
          // Variants
          variant === 'default' && 'bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
          variant === 'primary' && 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/20',
          variant === 'outline' && 'border border-slate-200 dark:border-slate-700 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300',
          variant === 'ghost' && 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300',
          variant === 'link' && 'bg-transparent underline-offset-4 hover:underline text-indigo-600 dark:text-indigo-400',
          variant === 'danger' && 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-200 dark:shadow-rose-900/20',
          variant === 'success' && 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-200 dark:shadow-emerald-900/20',
          // Sizes
          size === 'xs' && 'h-7 rounded-md px-2.5 text-[10px]',
          size === 'sm' && 'h-8 rounded-lg px-3 text-xs',
          size === 'md' && 'h-9 px-4 text-sm',
          size === 'lg' && 'h-11 rounded-xl px-6 text-sm',
          size === 'icon' && 'h-9 w-9 shrink-0',
          className
        )}
        {...props}
      >
        {loading && (
          <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin shrink-0" />
        )}
        {!loading && leftIcon}
        {children}
        {rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';
