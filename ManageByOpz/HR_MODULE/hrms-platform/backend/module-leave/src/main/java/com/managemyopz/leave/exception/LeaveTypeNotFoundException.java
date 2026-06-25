package com.managemyopz.leave.exception;

import com.managemyopz.shared.exception.ResourceNotFoundException;
import java.util.UUID;

public class LeaveTypeNotFoundException extends ResourceNotFoundException {
    public LeaveTypeNotFoundException(UUID id) {
        super("Leave Type not found with id: " + id);
    }
}
