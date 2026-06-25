package com.managemyopz.leave.service;

import com.managemyopz.leave.entity.LeavePolicy;
import com.managemyopz.leave.entity.LeavePolicyRule;
import com.managemyopz.leave.entity.LeavePolicyAssignment;
import com.managemyopz.leave.entity.LeavePolicyVersion;
import com.managemyopz.leave.entity.LeavePolicyAudit;
import java.util.List;
import java.util.UUID;
import java.util.Map;

public interface LeavePolicyService {
    // Policy operations
    LeavePolicy createPolicy(LeavePolicy policy);
    LeavePolicy updatePolicy(UUID id, LeavePolicy policyDetails);
    LeavePolicy clonePolicy(UUID policyId, String newName, String newCode);
    void archivePolicy(UUID policyId);
    void activatePolicy(UUID policyId);
    void deactivatePolicy(UUID policyId);
    void deletePolicy(UUID policyId);

    // Rule operations
    LeavePolicyRule createRule(UUID policyId, LeavePolicyRule rule);
    LeavePolicyRule updateRule(UUID ruleId, LeavePolicyRule ruleDetails);
    void deleteRule(UUID ruleId);

    // Assignment operations
    LeavePolicyAssignment assignPolicy(LeavePolicyAssignment assignment);
    void unassignPolicy(UUID assignmentId);
    List<LeavePolicyAssignment> getAssignmentsByPolicyId(UUID policyId);

    // Versions & Audits
    List<LeavePolicyVersion> getVersions(UUID policyId);
    List<LeavePolicyAudit> getAudits(UUID policyId);

    // Impact Analysis
    Map<String, Object> calculateImpact(UUID policyId, Double newAllocatedDays, UUID leaveTypeId);
}
