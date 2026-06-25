package com.managemyopz.leave.repository;

import com.managemyopz.leave.entity.LeaveRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, UUID> {
    List<LeaveRequest> findByEmployeeIdAndDeletedFalse(UUID employeeId);
    List<LeaveRequest> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<LeaveRequest> findByIdAndDeletedFalse(UUID id);

    @Query("SELECT lr FROM LeaveRequest lr WHERE lr.employeeId = :employeeId AND lr.deleted = false AND lr.status IN (com.managemyopz.leave.entity.LeaveRequest.LeaveStatus.PENDING, com.managemyopz.leave.entity.LeaveRequest.LeaveStatus.APPROVED, com.managemyopz.leave.entity.LeaveRequest.LeaveStatus.AUTO_APPROVED) AND (:startDate <= lr.endDate AND :endDate >= lr.startDate)")
    List<LeaveRequest> findOverlappingRequests(UUID employeeId, LocalDate startDate, LocalDate endDate);
}
