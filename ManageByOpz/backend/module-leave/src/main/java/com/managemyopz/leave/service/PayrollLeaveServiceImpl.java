package com.managemyopz.leave.service;

import com.managemyopz.leave.entity.LeaveBalance;
import com.managemyopz.leave.entity.PayrollLeaveTransaction;
import com.managemyopz.leave.repository.LeaveBalanceRepository;
import com.managemyopz.leave.repository.PayrollLeaveTransactionRepository;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import com.managemyopz.orgdna.entity.Band;
import com.managemyopz.orgdna.repository.BandRepository;
import com.managemyopz.shared.entity.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PayrollLeaveServiceImpl implements PayrollLeaveService {

    private final PayrollLeaveTransactionRepository transactionRepository;
    private final EmployeeTwinRepository employeeTwinRepository;
    private final BandRepository bandRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;

    private double calculateDailySalary(UUID employeeId) {
        EmployeeTwin emp = employeeTwinRepository.findById(employeeId).orElse(null);
        if (emp == null) return 2000.0;

        if (emp.getBandId() != null) {
            Band band = bandRepository.findByIdAndDeletedFalse(emp.getBandId()).orElse(null);
            if (band != null && band.getMinSalary() != null && band.getMaxSalary() != null) {
                return ((band.getMinSalary() + band.getMaxSalary()) / 2.0) / 30.0;
            }
        }
        return 2000.0;
    }

    @Override
    public PayrollLeaveTransaction generateLopTransaction(UUID employeeId, double unpaidDays, String payrollMonth) {
        log.info("Generating LOP transaction for employee {}, days: {}", employeeId, unpaidDays);
        double dailySalary = calculateDailySalary(employeeId);
        double amount = dailySalary * unpaidDays;

        PayrollLeaveTransaction tx = PayrollLeaveTransaction.builder()
                .employeeId(employeeId)
                .leaveType("LOP")
                .days(unpaidDays)
                .amount(amount)
                .payrollMonth(payrollMonth)
                .build();
        tx.setTenantId(TenantContext.getCurrentTenant());
        return transactionRepository.save(tx);
    }

    @Override
    public PayrollLeaveTransaction generateEncashmentTransaction(UUID employeeId, double encashableDays, String payrollMonth) {
        log.info("Generating Encashment transaction for employee {}, days: {}", employeeId, encashableDays);
        double dailySalary = calculateDailySalary(employeeId);
        double amount = dailySalary * encashableDays;

        PayrollLeaveTransaction tx = PayrollLeaveTransaction.builder()
                .employeeId(employeeId)
                .leaveType("ENCASHMENT")
                .days(encashableDays)
                .amount(amount)
                .payrollMonth(payrollMonth)
                .build();
        tx.setTenantId(TenantContext.getCurrentTenant());
        return transactionRepository.save(tx);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> calculateFinalSettlement(UUID employeeId) {
        log.info("Calculating final leave settlement for employee {}", employeeId);
        double dailySalary = calculateDailySalary(employeeId);
        
        List<LeaveBalance> balances = leaveBalanceRepository.findByEmployeeIdAndDeletedFalse(employeeId);
        double totalRemainingBalance = balances.stream().mapToDouble(LeaveBalance::getBalance).sum();
        double encashmentAmount = totalRemainingBalance * dailySalary;

        Map<String, Object> settlement = new HashMap<>();
        settlement.put("employeeId", employeeId);
        settlement.put("remainingLeaveDays", totalRemainingBalance);
        settlement.put("dailySalaryRate", dailySalary);
        settlement.put("totalLeavePayout", encashmentAmount);

        return settlement;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PayrollLeaveTransaction> getMonthlyTransactions(String payrollMonth) {
        return transactionRepository.findByPayrollMonthAndDeletedFalse(payrollMonth);
    }
}
