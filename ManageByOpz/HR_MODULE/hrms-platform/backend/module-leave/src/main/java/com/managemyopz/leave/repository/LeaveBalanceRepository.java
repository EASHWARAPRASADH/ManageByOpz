package com.managemyopz.leave.repository;

import com.managemyopz.leave.entity.LeaveBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveBalanceRepository extends JpaRepository<LeaveBalance, UUID> {
    List<LeaveBalance> findByEmployeeIdAndYearAndDeletedFalse(UUID employeeId, int year);
    Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeIdAndYearAndDeletedFalse(UUID employeeId, UUID leaveTypeId, int year);
    List<LeaveBalance> findByTenantIdAndYearAndDeletedFalse(String tenantId, int year);
    List<LeaveBalance> findByEmployeeIdAndDeletedFalse(UUID employeeId);
    List<LeaveBalance> findByTenantIdAndDeletedFalse(String tenantId);
}
