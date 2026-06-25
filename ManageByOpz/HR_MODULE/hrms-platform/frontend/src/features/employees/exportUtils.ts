/**
 * Employee Export Utilities — Reusable download and filename helpers.
 */

/**
 * Parses the filename from a Content-Disposition header value.
 * Handles both RFC 5987 (filename*=UTF-8'') and standard (filename="...") formats.
 */
export function parseContentDisposition(header: string | null, fallback: string): string {
  if (!header) return fallback;

  // 1. RFC 5987: filename*=UTF-8''employees_2026_06_25.csv
  const rfc5987 = header.match(/filename\*\s*=\s*utf-8''([^;\s]+)/i);
  if (rfc5987?.[1]) {
    try {
      return decodeURIComponent(rfc5987[1]);
    } catch {
      // fall through
    }
  }

  // 2. Standard: filename="employees_2026_06_25.csv" or filename=employees_2026_06_25.csv
  const standard = header.match(/filename\s*=\s*"?([^";\n]+)"?/i);
  if (standard?.[1]) {
    return standard[1].trim();
  }

  return fallback;
}

/**
 * Downloads a Blob as a file in the browser.
 * Creates a temporary anchor element, triggers the download, and cleans up.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();

  // Delay cleanup to 60 seconds to ensure the download starts and completes
  // even if the user takes time in a native 'Save As' browser dialog before saving.
  setTimeout(() => {
    URL.revokeObjectURL(url);
    anchor.remove();
  }, 60000);
}

export type ExportFormat = 'csv' | 'excel' | 'pdf';

const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  csv: 'csv',
  excel: 'xlsx',
  pdf: 'pdf',
};

const FORMAT_MIME_TYPES: Record<ExportFormat, string> = {
  csv: 'text/csv;charset=utf-8',
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
};

const FORMAT_LABELS: Record<ExportFormat, string> = {
  csv: 'CSV',
  excel: 'Excel',
  pdf: 'PDF',
};

export interface ExportParams {
  format: ExportFormat;
  scope: 'filtered' | 'selected' | 'all';
  selectedIds?: string[];
  searchTerm?: string;
  statusFilter?: string;
  locationFilter?: string;
  deptFilter?: string;
  typeFilter?: string;
  sortBy?: string;
  showArchived?: boolean;
  token: string;
  tenantId: string;
}

export interface ExportResult {
  success: boolean;
  filename?: string;
  error?: string;
}

/**
 * Triggers an employee export download.
 * Constructs query parameters from filters, calls the backend API,
 * reads the filename from the Content-Disposition header, and downloads.
 *
 * Uses XMLHttpRequest with responseType='arraybuffer' to guarantee
 * binary data integrity for XLSX/PDF formats.
 */
export async function downloadExport(params: ExportParams): Promise<ExportResult> {
  const {
    format, scope, selectedIds, searchTerm, statusFilter,
    locationFilter, deptFilter, typeFilter, sortBy, showArchived,
    token, tenantId,
  } = params;

  const query = new URLSearchParams();

  if (scope === 'selected' && selectedIds?.length) {
    selectedIds.forEach(id => query.append('ids', id));
  } else if (scope === 'filtered') {
    if (searchTerm) query.append('search', searchTerm);
    if (statusFilter) query.append('status', statusFilter);
    if (locationFilter) query.append('locationId', locationFilter);
    if (deptFilter) query.append('departmentId', deptFilter);
    if (typeFilter) query.append('employmentTypeId', typeFilter);
    if (sortBy) query.append('sortBy', sortBy);
    query.append('showArchived', String(showArchived ?? false));
  } else {
    // all
    query.append('showArchived', String(showArchived ?? false));
  }

  const url = `/api/v1/employees/export/${format}?${query.toString()}`;
  console.log(`[Export] Requesting: ${url}`);

  try {
    const headers: Record<string, string> = {
      'X-Tenant-ID': tenantId || 'default',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    console.log(`[Export] Response Status: ${response.status}`);

    if (response.status === 401 || response.status === 403) {
      return { success: false, error: 'Unauthorized — you do not have permission to export.' };
    }
    if (response.status === 404) {
      return { success: false, error: 'No data available for export.' };
    }
    if (!response.ok) {
      return { success: false, error: `Export failed (HTTP ${response.status}). Please try again.` };
    }

    const blob = await response.blob();
    console.log(`[Export] Blob size: ${blob.size} bytes, type: ${blob.type}`);

    if (!blob || blob.size === 0) {
      return { success: false, error: 'Export returned empty data. No records found.' };
    }

    // Set correct MIME type to override any proxy misconfigurations
    const mimeType = FORMAT_MIME_TYPES[format];
    const typedBlob = blob.type === mimeType ? blob : new Blob([blob], { type: mimeType });

    // Parse filename from Content-Disposition header
    const fallback = `employees_export.${FORMAT_EXTENSIONS[format]}`;
    const disposition = response.headers.get('content-disposition');
    const filename = parseContentDisposition(disposition, fallback);
    console.log(`[Export] Filename: ${filename}`);

    downloadBlob(typedBlob, filename);
    return { success: true, filename };
  } catch (err: any) {
    console.error('[Export] Error in downloadExport:', err);
    return { success: false, error: `Export failed: ${err.message || err}` };
  }
}
