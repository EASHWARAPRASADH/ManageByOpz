import React from 'react';
import { cn } from '@managemyopz/platform-utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full rounded-lg border px-3 py-2.5 text-sm transition-all duration-150 bg-white dark:bg-slate-900/50 resize-y min-h-[80px]',
            'text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400',
            error
              ? 'border-rose-400 dark:border-rose-500'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
            'disabled:opacity-50 disabled:pointer-events-none',
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">{error}</p>}
        {helperText && !error && <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
