package com.managemyopz.ticketing.exception;

import com.managemyopz.ticketing.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
public class TicketingGlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<?> handleResourceNotFound(ResourceNotFoundException e) {
        log.error("[API Resource Not Found] {}", e.getMessage());
        return ResponseEntity.status(404).body(ApiResponse.error(404, e.getMessage()));
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<?> handleUnauthorized(UnauthorizedException e) {
        log.error("[API Unauthorized] {}", e.getMessage());
        return ResponseEntity.status(419).body(ApiResponse.error(419, e.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException e) {
        log.error("[API Error] {}", e.getMessage());
        if (e.getMessage() != null && e.getMessage().contains("not found")) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, e.getMessage()));
        }
        if (e.getMessage() != null && e.getMessage().contains("RCA")) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, e.getMessage()));
        }
        return ResponseEntity.status(500).body(ApiResponse.error(500, e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException e) {
        String errors = e.getBindingResult().getFieldErrors().stream()
            .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(ApiResponse.error(400, "Validation failed: " + errors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGeneric(Exception e) {
        log.error("[API Unexpected Error]", e);
        return ResponseEntity.status(500).body(ApiResponse.error(500, "Internal server error"));
    }
}
