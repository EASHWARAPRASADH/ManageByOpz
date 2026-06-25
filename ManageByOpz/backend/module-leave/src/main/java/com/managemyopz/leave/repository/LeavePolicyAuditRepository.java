package com.managemyopz.leave.repository;

import com.managemyopz.leave.entity.LeavePolicyAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeavePolicyAuditRepository extends JpaRepository<LeavePolicyAudit, UUID> {
    List<LeavePolicyAudit> findByPolicyIdAndDeletedFalseOrderByCreatedAtDesc(UUID policyId);
}
