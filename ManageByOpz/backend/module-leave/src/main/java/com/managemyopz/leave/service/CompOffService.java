package com.managemyopz.leave.service;

import com.managemyopz.leave.entity.CompOffRequest;
import com.managemyopz.leave.entity.CompOffWallet;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface CompOffService {
    CompOffRequest submitCompOffRequest(UUID employeeId, LocalDate workDate, double hoursWorked, String reason, String initiatorUsername);
    List<CompOffRequest> getEmployeeRequests(UUID employeeId);
    List<CompOffRequest> getAllRequests();
    CompOffWallet getEmployeeWallet(UUID employeeId);
    void approveCompOffRequest(UUID requestId, String approvedBy);
    void rejectCompOffRequest(UUID requestId, String rejectedBy);
    void expireCompOffBalances();
}
