package com.managemyopz.leave.repository;

import com.managemyopz.leave.entity.LeavePolicyRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LeavePolicyRuleRepository extends JpaRepository<LeavePolicyRule, UUID> {
    List<LeavePolicyRule> findByPolicyIdAndDeletedFalse(UUID policyId);
    Optional<LeavePolicyRule> findByIdAndDeletedFalse(UUID id);
    Optional<LeavePolicyRule> findByPolicyIdAndLeaveTypeIdAndDeletedFalse(UUID policyId, UUID leaveTypeId);
}
