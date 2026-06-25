package com.managemyopz.leave.repository;

import com.managemyopz.leave.entity.LeavePolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeavePolicyRepository extends JpaRepository<LeavePolicy, UUID> {
    List<LeavePolicy> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<LeavePolicy> findByIdAndDeletedFalse(UUID id);
    Optional<LeavePolicy> findByTenantIdAndPolicyCodeAndDeletedFalse(String tenantId, String policyCode);
    boolean existsByTenantIdAndPolicyCodeAndDeletedFalse(String tenantId, String policyCode);
}
