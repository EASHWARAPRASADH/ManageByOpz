import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={['flex flex-col items-center justify-center py-16 text-center', className].filter(Boolean).join(' ')}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">{title}</h3>
      {description && (
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
