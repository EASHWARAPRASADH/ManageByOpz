package com.managemyopz.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * PageResponse — Standard paginated data wrapper.
 *
 * Wraps Spring's Page<T> into a consistent, serializable structure
 * returned inside the ApiResponse envelope.
 *
 * Enterprise Standard §2.4 — All paginated endpoints MUST use this wrapper.
 * Never expose Page<T> directly from controllers.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {

    /** The page content — list of items for the current page. */
    private List<T> content;

    /** Zero-based page number. */
    private int page;

    /** Number of items per page. */
    private int size;

    /** Total number of elements across all pages. */
    private long totalElements;

    /** Total number of pages. */
    private int totalPages;

    /** Whether this is the last page. */
    private boolean last;

    /** Whether this is the first page. */
    private boolean first;

    /** Whether the page has any content. */
    private boolean hasContent;

    // ── Factory Methods ──────────────────────────────────────────

    /**
     * Converts a Spring {@link Page} to a {@link PageResponse}.
     * Use this in all service/controller methods returning paginated data.
     */
    public static <T> PageResponse<T> from(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .first(page.isFirst())
                .hasContent(page.hasContent())
                .build();
    }

    /**
     * Convenience: wraps a PageResponse inside a success ApiResponse.
     * Usage: return ResponseEntity.ok(PageResponse.asApiResponse(page, "Employees retrieved"));
     */
    public static <T> ApiResponse<PageResponse<T>> asApiResponse(Page<T> page, String message) {
        return ApiResponse.<PageResponse<T>>builder()
                .success(true)
                .status(200)
                .message(message)
                .data(PageResponse.from(page))
                .timestamp(java.time.Instant.now())
                .build();
    }
}
