import React from 'react';
import { cn } from '@managemyopz/platform-utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'md', border = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl bg-[var(--color-surface)]',
          border && 'border border-[var(--color-border)]',
          'shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none text-[var(--color-text)] flex flex-col gap-4 overflow-hidden',
          padding === 'sm' && 'p-4',
          padding === 'md' && 'p-6',
          padding === 'lg' && 'p-8',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col gap-1.5', className)}
      {...props}
    />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-base font-bold leading-none tracking-tight text-[var(--color-text)]', className)}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm text-[var(--color-text-secondary)]', className)}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('text-sm text-[var(--color-text)]', className)}
      {...props}
    />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex items-center pt-2', className)}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';
