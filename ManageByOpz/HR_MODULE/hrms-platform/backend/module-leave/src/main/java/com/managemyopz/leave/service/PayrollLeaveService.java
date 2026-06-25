package com.managemyopz.leave.service;

import com.managemyopz.leave.entity.PayrollLeaveTransaction;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface PayrollLeaveService {
    PayrollLeaveTransaction generateLopTransaction(UUID employeeId, double unpaidDays, String payrollMonth);
    PayrollLeaveTransaction generateEncashmentTransaction(UUID employeeId, double encashableDays, String payrollMonth);
    Map<String, Object> calculateFinalSettlement(UUID employeeId);
    List<PayrollLeaveTransaction> getMonthlyTransactions(String payrollMonth);
}
