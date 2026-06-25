package com.managemyopz.leave.service;

import com.managemyopz.leave.entity.LeaveRequest;
import com.managemyopz.leave.entity.LeaveType;

public interface LeaveValidationService {
    void validateRequest(LeaveRequest request, LeaveType leaveType);
}
