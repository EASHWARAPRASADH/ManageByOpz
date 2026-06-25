package com.managemyopz.leave.service;

import java.util.UUID;

public interface LeavePolicyAssignmentService {
    UUID resolvePolicy(UUID employeeId);
    void generateWallets(UUID employeeId);
    void regenerateWallets(UUID employeeId);
    void recalculateBalances(UUID employeeId);
}
