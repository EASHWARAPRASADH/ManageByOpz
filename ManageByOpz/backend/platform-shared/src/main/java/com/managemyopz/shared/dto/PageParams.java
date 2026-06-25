package com.managemyopz.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * PageParams — Standard query parameters for all paginated list endpoints.
 *
 * Received from the frontend as query parameters:
 * GET /api/v1/hr/employees?page=0&size=20&search=John&sortBy=createdDate&sortDir=desc
 *
 * Enterprise Standard §2.3 — All list endpoints MUST accept these parameters.
 * Defaults: page=0, size=20, sortBy=createdDate, sortDir=desc.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageParams {

    /** Zero-based page index (default: 0). */
    @Builder.Default
    private int page = 0;

    /** Items per page — capped at 100 to prevent over-fetching (default: 20). */
    @Builder.Default
    private int size = 20;

    /** Optional search keyword — applied by the service layer. */
    private String search;

    /** Column name to sort by (default: createdDate). */
    @Builder.Default
    private String sortBy = "createdAt";

    /** Sort direction: asc | desc (default: desc). */
    @Builder.Default
    private String sortDir = "desc";

    // ── Utilities ─────────────────────────────────────────────────

    /**
     * Converts to a Spring {@link Pageable} for use in JPA repository calls.
     */
    public Pageable toPageable() {
        int cappedSize = Math.min(size, 100); // safety cap
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        return PageRequest.of(page, cappedSize, sort);
    }

    /**
     * Returns true if a non-blank search term was provided.
     */
    public boolean hasSearch() {
        return search != null && !search.isBlank();
    }
}
