package com.managemyopz.leave.repository;

import com.managemyopz.leave.entity.CompOffRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CompOffRequestRepository extends JpaRepository<CompOffRequest, UUID> {
    List<CompOffRequest> findByEmployeeIdAndDeletedFalse(UUID employeeId);
    List<CompOffRequest> findByTenantIdAndDeletedFalse(String tenantId);
}
