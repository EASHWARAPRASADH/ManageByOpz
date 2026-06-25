package com.managemyopz.shared.exception;

/**
 * ResourceNotFoundException — Thrown when a requested entity does not exist.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceType, Object id) {
        super(resourceType + " not found with id: " + id);
    }

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
