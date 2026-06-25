package com.managemyopz.orgdna.exception;

import com.managemyopz.shared.exception.PlatformException;
import org.springframework.http.HttpStatus;

public class OrgDnaException extends PlatformException {

    public OrgDnaException(String message, HttpStatus httpStatus, String errorCode) {
        super(message, httpStatus, errorCode);
    }

    public OrgDnaException(String message, HttpStatus httpStatus, String errorCode, Object details) {
        super(message, httpStatus, errorCode, details);
    }
}
