package com.managemyopz.leave.repository;

import com.managemyopz.leave.entity.LeavePolicyVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface LeavePolicyVersionRepository extends JpaRepository<LeavePolicyVersion, UUID> {
    List<LeavePolicyVersion> findByPolicyIdAndDeletedFalseOrderByVersionNumberDesc(UUID policyId);
    List<LeavePolicyVersion> findByPolicyIdAndDeletedFalseOrderByVersionNumberAsc(UUID policyId);
}
