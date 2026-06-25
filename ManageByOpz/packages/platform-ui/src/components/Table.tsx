import React from 'react';
import { cn } from '@managemyopz/platform-utils';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={cn("w-full caption-bottom text-sm border-collapse text-[var(--color-text)]", className)}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

export interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableHeaderProps>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("bg-[var(--color-border-subtle)] border-b border-[var(--color-border)]", className)} {...props} />
  )
);
TableHeader.displayName = 'TableHeader';

export interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableBodyProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={cn("divide-y divide-[var(--color-border)]/60 bg-[var(--color-surface)]", className)}
      {...props}
    />
  )
);
TableBody.displayName = 'TableBody';

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        "border-b border-[var(--color-border)] transition-colors hover:bg-slate-500/5 data-[state=selected]:bg-[var(--color-border-subtle)]",
        className
      )}
      {...props}
    />
  )
);
TableRow.displayName = 'TableRow';

export interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        "h-10 px-4 text-left align-middle font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider text-[11px] [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
);
TableHead.displayName = 'TableHead';

export interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0 text-xs font-normal text-[var(--color-text)]",
        className
      )}
      {...props}
    />
  )
);
TableCell.displayName = 'TableCell';
