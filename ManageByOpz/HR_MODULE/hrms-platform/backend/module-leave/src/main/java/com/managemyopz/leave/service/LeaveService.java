package com.managemyopz.leave.service;

import com.managemyopz.leave.entity.LeaveBalance;
import com.managemyopz.leave.entity.LeaveRequest;
import com.managemyopz.leave.entity.LeaveType;
import java.util.List;
import java.util.UUID;

public interface LeaveService {
    LeaveType createLeaveType(LeaveType leaveType);
    LeaveType updateLeaveType(UUID id, LeaveType leaveType);
    List<LeaveType> getLeaveTypes();
    LeaveType getLeaveTypeById(UUID id);
    void deleteLeaveType(UUID id);

    LeaveRequest applyLeave(LeaveRequest request);
    LeaveRequest actionLeaveRequest(UUID id, LeaveRequest.LeaveStatus status, String comment, String approvedBy);
    List<LeaveRequest> getLeaveRequestsByEmployee(UUID employeeId);
    List<LeaveRequest> getAllLeaveRequests();

    List<LeaveBalance> getLeaveBalancesByEmployee(UUID employeeId, int year);
    LeaveBalance adjustBalance(UUID employeeId, UUID leaveTypeId, int year, double amount, String reason);
}
