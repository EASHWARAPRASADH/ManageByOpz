/**
 * src/lib/types/api.ts
 *
 * Shared API response TypeScript contracts matching the backend envelopes.
 */

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  pagination?: PageMeta;
  timestamp: string;
  requestId?: string;
}

export interface PageMeta {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
