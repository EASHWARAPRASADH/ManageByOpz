package com.managemyopz.leave.service;

import com.managemyopz.leave.entity.LeaveRequest;

public interface LeaveApprovalService {
    LeaveRequest submitForApproval(LeaveRequest request, boolean requiresApproval);
    LeaveRequest approve(LeaveRequest request, String approverId, String comment);
    LeaveRequest reject(LeaveRequest request, String approverId, String reason);
}
