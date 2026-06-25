import React from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Lightweight CSS-only tooltip using group/peer pattern.
 * For complex tooltips (with rich content), use a Radix popover instead.
 */
export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  return (
    <div className="relative inline-flex group">
      {children}
      <div
        role="tooltip"
        className={[
          'absolute z-50 pointer-events-none whitespace-nowrap',
          'bg-slate-900 dark:bg-slate-700 text-white text-[10px] font-semibold',
          'px-2.5 py-1 rounded-lg shadow-lg',
          'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
          side === 'top' && 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
          side === 'bottom' && 'top-full left-1/2 -translate-x-1/2 mt-1.5',
          side === 'left' && 'right-full top-1/2 -translate-y-1/2 mr-1.5',
          side === 'right' && 'left-full top-1/2 -translate-y-1/2 ml-1.5',
        ].filter(Boolean).join(' ')}
      >
        {content}
      </div>
    </div>
  );
}
