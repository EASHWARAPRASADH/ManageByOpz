package com.managemyopz.leave.exception;

import com.managemyopz.shared.exception.ResourceNotFoundException;
import java.util.UUID;

public class EmployeeNotFoundException extends ResourceNotFoundException {
    public EmployeeNotFoundException(UUID employeeId) {
        super("Employee not found with id: " + employeeId);
    }
}
