package com.managemyopz.leave.repository;

import com.managemyopz.leave.entity.PayrollLeaveTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface PayrollLeaveTransactionRepository extends JpaRepository<PayrollLeaveTransaction, UUID> {
    List<PayrollLeaveTransaction> findByEmployeeIdAndDeletedFalse(UUID employeeId);
    List<PayrollLeaveTransaction> findByPayrollMonthAndDeletedFalse(String payrollMonth);
}
