package com.managemyopz.leave.exception;

import com.managemyopz.shared.exception.PlatformException;
import org.springframework.http.HttpStatus;

public class LeaveValidationException extends PlatformException {

    public LeaveValidationException(String errorCode, String message) {
        super(message, HttpStatus.CONFLICT, errorCode);
    }

    public LeaveValidationException(String errorCode, String message, Object details) {
        super(message, HttpStatus.CONFLICT, errorCode, details);
    }
}
