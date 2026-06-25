import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  id?: string;
  className?: string;
}

export function Select({ label, helperText, error, options, id, className, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={[
          'w-full h-9 rounded-lg border px-3 text-sm transition-all duration-150 bg-white dark:bg-slate-900/50',
          'text-slate-900 dark:text-slate-100',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400',
          error
            ? 'border-rose-400 dark:border-rose-500'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
          'disabled:opacity-50 disabled:pointer-events-none',
          className,
        ].filter(Boolean).join(' ')}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-slate-500 dark:text-slate-400">{helperText}</p>}
    </div>
  );
}
