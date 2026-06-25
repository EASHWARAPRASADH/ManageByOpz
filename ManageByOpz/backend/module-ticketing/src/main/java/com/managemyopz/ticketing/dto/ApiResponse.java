package com.managemyopz.ticketing.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.slf4j.MDC;

import java.time.Instant;
import java.util.Map;

/**
 * ApiResponse — Universal API response wrapper.
 *
 * Every REST endpoint in every module returns data wrapped in this envelope.
 * Provides consistent structure for:
 * - Success/failure indication
 * - HTTP status code
 * - Human-readable message
 * - Generic typed data payload
 * - Error details and field-level validation errors
 * - Pagination metadata
 * - Request timestamp
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private int status;
    private String errorCode;
    private String message;
    private T data;
    private Map<String, String> errors;
    private PageMeta pagination;
    private Instant timestamp;

    /**
     * Unique request ID for distributed tracing — sourced from MDC.
     * Correlates this response to the specific request in logs.
     */
    private String requestId;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PageMeta {
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }

    // ── Factory Methods ──────────────────────────────────────────

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .status(200)
                .message("Success")
                .data(data)
                .timestamp(Instant.now())
                .requestId(MDC.get("requestId"))
                .build();
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .status(200)
                .message(message)
                .data(data)
                .timestamp(Instant.now())
                .requestId(MDC.get("requestId"))
                .build();
    }

    public static <T> ApiResponse<T> created(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .status(201)
                .message(message)
                .data(data)
                .timestamp(Instant.now())
                .requestId(MDC.get("requestId"))
                .build();
    }

    /**
     * Returns a paginated success response wrapping a {@link PageResponse}.
     */
    public static <T> ApiResponse<PageResponse<T>> paged(
            org.springframework.data.domain.Page<T> page, String message) {
        return ApiResponse.<PageResponse<T>>builder()
                .success(true)
                .status(200)
                .message(message)
                .data(PageResponse.from(page))
                .timestamp(Instant.now())
                .requestId(MDC.get("requestId"))
                .build();
    }

    public static <T> ApiResponse<T> error(int status, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .status(status)
                .message(message)
                .timestamp(Instant.now())
                .requestId(MDC.get("requestId"))
                .build();
    }

    public static <T> ApiResponse<T> error(int status, String errorCode, String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .status(status)
                .errorCode(errorCode)
                .message(message)
                .timestamp(Instant.now())
                .requestId(MDC.get("requestId"))
                .build();
    }

    public static <T> ApiResponse<T> error(int status, String message, Map<String, String> errors) {
        return ApiResponse.<T>builder()
                .success(false)
                .status(status)
                .message(message)
                .errors(errors)
                .timestamp(Instant.now())
                .requestId(MDC.get("requestId"))
                .build();
    }

    public static <T> ApiResponse<T> paginated(T data, PageMeta pagination) {
        return ApiResponse.<T>builder()
                .success(true)
                .status(200)
                .message("Success")
                .data(data)
                .pagination(pagination)
                .timestamp(Instant.now())
                .requestId(MDC.get("requestId"))
                .build();
    }
}
