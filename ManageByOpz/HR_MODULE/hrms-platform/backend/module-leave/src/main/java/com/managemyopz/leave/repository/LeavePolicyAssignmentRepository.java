package com.managemyopz.leave.repository;

import com.managemyopz.leave.entity.LeavePolicyAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeavePolicyAssignmentRepository extends JpaRepository<LeavePolicyAssignment, UUID> {
    List<LeavePolicyAssignment> findByTenantIdAndDeletedFalse(String tenantId);
    Optional<LeavePolicyAssignment> findByIdAndDeletedFalse(UUID id);
    
    // We can also query all assignments to do policy resolution
    List<LeavePolicyAssignment> findByPolicyIdAndDeletedFalse(UUID policyId);
}
