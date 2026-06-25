package com.managemyopz.shared.exception;

/**
 * AccessDeniedException — Platform-level access denial (distinct from Spring Security's).
 */
public class AccessDeniedException extends RuntimeException {

    public AccessDeniedException(String message) {
        super(message);
    }
}
