package com.managemyopz.shared.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * PlatformException — Base exception for all platform-level errors.
 * Carries HTTP status and a machine-readable error code for frontend handling.
 */
@Getter
public class PlatformException extends RuntimeException {

    private final HttpStatus httpStatus;
    private final String errorCode;
    private final Object details;

    public PlatformException(String message, HttpStatus httpStatus, String errorCode) {
        super(message);
        this.httpStatus = httpStatus;
        this.errorCode = errorCode;
        this.details = null;
    }

    public PlatformException(String message, HttpStatus httpStatus, String errorCode, Object details) {
        super(message);
        this.httpStatus = httpStatus;
        this.errorCode = errorCode;
        this.details = details;
    }

    public PlatformException(String message, HttpStatus httpStatus, String errorCode, Throwable cause) {
        super(message, cause);
        this.httpStatus = httpStatus;
        this.errorCode = errorCode;
        this.details = null;
    }
}
