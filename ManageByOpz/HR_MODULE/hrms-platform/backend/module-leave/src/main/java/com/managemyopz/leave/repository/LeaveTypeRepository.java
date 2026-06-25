package com.managemyopz.leave.repository;

import com.managemyopz.leave.entity.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeaveTypeRepository extends JpaRepository<LeaveType, UUID> {
    List<LeaveType> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<LeaveType> findByIdAndDeletedFalse(UUID id);
    boolean existsByTenantIdAndCodeAndDeletedFalse(String tenantId, String code);
    boolean existsByTenantIdAndNameAndDeletedFalse(String tenantId, String name);
}
