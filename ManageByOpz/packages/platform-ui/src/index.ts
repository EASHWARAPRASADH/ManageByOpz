/**
 * @managemyopz/platform-ui
 *
 * Enterprise UI Component Library — the single source of truth for all
 * shared UI components across ManageByOpz applications.
 *
 * Import from this package in all apps:
 *   import { Button, Badge, Dialog, ... } from '@managemyopz/platform-ui';
 */

export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { Badge } from './components/Badge';
export type { BadgeProps } from './components/Badge';

export { Input } from './components/Input';
export type { InputProps } from './components/Input';

export { Textarea } from './components/Textarea';

export { Label } from './components/Label';

export { Select } from './components/Select';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/Card';

export { Spinner } from './components/Spinner';

export { Avatar } from './components/Avatar';
export type { AvatarProps } from './components/Avatar';

export { Tooltip } from './components/Tooltip';

export { EmptyState } from './components/EmptyState';

// Dialog exports
export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription
} from './components/Dialog';

// Table exports
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from './components/Table';
export type { TableProps, TableHeaderProps, TableBodyProps, TableRowProps, TableHeadProps, TableCellProps } from './components/Table';

// Pagination export
export { Pagination } from './components/Pagination';
export type { PaginationProps } from './components/Pagination';

// Re-export cn utility from platform-utils for convenience
export { cn } from '@managemyopz/platform-utils';
