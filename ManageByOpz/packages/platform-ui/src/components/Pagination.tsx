import React from 'react';
import { cn } from '@managemyopz/platform-utils';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from '@managemyopz/platform-icons';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
  showFirstLast?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
  showFirstLast = true,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const range = (start: number, end: number) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, idx) => idx + start);
  };

  const fetchPageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 5;
    const totalBlocks = totalNumbers + 2;

    if (totalPages > totalBlocks) {
      const startPage = Math.max(2, currentPage - siblingCount);
      const endPage = Math.min(totalPages - 1, currentPage + siblingCount);

      let pages: (number | string)[] = range(startPage, endPage);

      const hasLeftSpill = startPage > 2;
      const hasRightSpill = (totalPages - endPage) > 1;
      const spillOffset = totalNumbers - (pages.length + 1);

      switch (true) {
        case hasLeftSpill && !hasRightSpill: {
          const extraPages = range(startPage - spillOffset, startPage - 1);
          pages = ['...', ...extraPages, ...pages];
          break;
        }
        case !hasLeftSpill && hasRightSpill: {
          const extraPages = range(endPage + 1, endPage + spillOffset);
          pages = [...pages, ...extraPages, '...'];
          break;
        }
        case hasLeftSpill && hasRightSpill:
        default: {
          pages = ['...', ...pages, '...'];
          break;
        }
      }

      return [1, ...pages, totalPages];
    }

    return range(1, totalPages);
  };

  const pages = fetchPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('flex items-center justify-center gap-1.5', className)}
    >
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 p-0"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-xs text-[var(--color-text-muted)]"
            >
              &hellip;
            </span>
          );
        }

        const isCurrent = page === currentPage;

        return (
          <Button
            key={`page-${page}`}
            variant={isCurrent ? 'primary' : 'outline'}
            className={cn(
              'h-8 w-8 p-0 text-xs font-medium',
              !isCurrent && 'hover:bg-[var(--color-border-subtle)] text-[var(--color-text)]'
            )}
            onClick={() => onPageChange(Number(page))}
            aria-current={isCurrent ? 'page' : undefined}
            aria-label={`Page ${page}`}
          >
            {page}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 p-0"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8 p-0"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Go to last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      )}
    </nav>
  );
}
