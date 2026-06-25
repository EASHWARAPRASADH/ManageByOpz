import React from 'react';
import { cn } from '@managemyopz/platform-utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function Spinner({ size = 'md', className, label = 'Loading...' }: SpinnerProps) {
  return (
    <div role="status" aria-label={label} className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'rounded-full border-2 border-current/20 border-t-current animate-spin text-indigo-600 dark:text-indigo-400',
          size === 'xs' && 'w-3 h-3',
          size === 'sm' && 'w-4 h-4',
          size === 'md' && 'w-6 h-6',
          size === 'lg' && 'w-10 h-10',
        )}
      />
    </div>
  );
}
