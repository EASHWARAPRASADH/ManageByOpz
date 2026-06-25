package com.managemyopz.shared.exception;

import com.managemyopz.shared.dto.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * GlobalExceptionHandler — Single, consistent exception handling for all modules.
 *
 * Enterprise Standard §Phase 3 — No try-catch-return-string in any service or controller.
 * All exceptions flow here and are wrapped in ApiResponse.
 *
 * Covered cases:
 *  - @Valid / @Validated field-level validation errors
 *  - ConstraintViolationException (path/query param validation)
 *  - ResourceNotFoundException (404)
 *  - PlatformException (generic business error with HTTP status)
 *  - Spring Security AccessDeniedException (403)
 *  - All other exceptions (500 with stack trace in logs only)
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PlatformException.class)
    public ResponseEntity<ApiResponse<Void>> handlePlatformException(
            PlatformException ex, HttpServletRequest req) {
        log.error("Platform error: code={} message={} uri={} requestId={}",
                ex.getErrorCode(), ex.getMessage(), req.getRequestURI(), MDC.get("requestId"));
        java.util.Map<String, String> errorsMap = null;
        if (ex.getDetails() instanceof java.util.Map) {
            errorsMap = (java.util.Map<String, String>) ex.getDetails();
        }
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .status(ex.getHttpStatus().value())
                .errorCode(ex.getErrorCode())
                .message(ex.getMessage())
                .errors(errorsMap)
                .timestamp(java.time.Instant.now())
                .requestId(MDC.get("requestId"))
                .build();
        return ResponseEntity.status(ex.getHttpStatus()).body(response);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(
            ResourceNotFoundException ex, HttpServletRequest req) {
        log.warn("Resource not found: {} uri={}", ex.getMessage(), req.getRequestURI());
        ApiResponse<Void> response = ApiResponse.error(404, ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
    }

    /**
     * Handles ConstraintViolationException — thrown when @RequestParam / @PathVariable
     * or service-level @Validated constraints fail.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(
            ConstraintViolationException ex, HttpServletRequest req) {
        Map<String, String> errors = ex.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        v -> v.getPropertyPath().toString(),
                        ConstraintViolation::getMessage
                ));
        log.warn("Constraint violation at {}: {}", req.getRequestURI(), errors);
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(ApiResponse.error(422, "Validation failed", errors));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
            MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(),
                    error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value");
        }
        log.warn("Validation failed at {}: {}", req.getRequestURI(), errors);
        ApiResponse<Void> response = ApiResponse.error(422, "Validation failed", errors);
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(response);
    }

    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(org.springframework.security.access.AccessDeniedException ex) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null) ? auth.getName() : "anonymous";
        String authorities = (auth != null) ? auth.getAuthorities().toString() : "[]";
        
        String detailMessage = ex.getMessage();
        String displayMessage = detailMessage;
        
        if (detailMessage == null || "Access is denied".equalsIgnoreCase(detailMessage)) {
            displayMessage = "You do not have permission to perform this action.";
        }
        
        String auditMessage = String.format("Access denied for user '%s' with authorities %s. Request details: %s", username, authorities, detailMessage);
        log.warn("Access denied error: {}", auditMessage);
        
        Map<String, String> errorsMap = new HashMap<>();
        errorsMap.put("username", username);
        errorsMap.put("authorities", authorities);
        errorsMap.put("details", detailMessage != null ? detailMessage : "No details");
        if (detailMessage != null && detailMessage.contains("Missing permission: ")) {
            errorsMap.put("missingPermission", detailMessage.substring(detailMessage.indexOf("Missing permission: ") + 20));
        }
        
        ApiResponse<Void> response = ApiResponse.<Void>builder()
                .success(false)
                .status(HttpStatus.FORBIDDEN.value())
                .errorCode("ACCESS_DENIED")
                .message(displayMessage)
                .errors(errorsMap)
                .timestamp(java.time.Instant.now())
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGeneric(
            Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception at {} requestId={}",
                req.getRequestURI(), MDC.get("requestId"), ex);
        ApiResponse<Void> response = ApiResponse.error(500, "An unexpected error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
