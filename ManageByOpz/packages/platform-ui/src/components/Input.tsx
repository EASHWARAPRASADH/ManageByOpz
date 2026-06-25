import React from 'react';
import { cn } from '@managemyopz/platform-utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-9 rounded-lg border text-sm transition-all duration-150 bg-white dark:bg-slate-900/50',
              'text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 dark:focus:border-indigo-500',
              error
                ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
              leftIcon && 'pl-9',
              rightIcon && 'pr-9',
              !leftIcon && !rightIcon && 'px-3',
              'disabled:opacity-50 disabled:pointer-events-none',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
