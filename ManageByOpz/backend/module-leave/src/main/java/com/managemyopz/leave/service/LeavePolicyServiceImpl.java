package com.managemyopz.leave.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.managemyopz.leave.entity.*;
import com.managemyopz.leave.repository.*;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import com.managemyopz.shared.entity.TenantContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeavePolicyServiceImpl implements LeavePolicyService {

    @Autowired
    private LeavePolicyRepository leavePolicyRepository;

    @Autowired
    private LeavePolicyRuleRepository leavePolicyRuleRepository;

    @Autowired
    private LeavePolicyAssignmentRepository leavePolicyAssignmentRepository;

    @Autowired
    private LeavePolicyVersionRepository leavePolicyVersionRepository;

    @Autowired
    private LeavePolicyAuditRepository leavePolicyAuditRepository;

    @Autowired
    private EmployeeTwinRepository employeeTwinRepository;

    @Autowired
    private LeavePolicyAssignmentService leavePolicyAssignmentService;

    @Autowired
    private LeaveTypeRepository leaveTypeRepository;

    private final ObjectMapper objectMapper;

    public LeavePolicyServiceImpl() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    private void writeAudit(UUID policyId, String action, String oldValue, String newValue) {
        LeavePolicyAudit audit = LeavePolicyAudit.builder()
                .policyId(policyId)
                .action(action)
                .oldValue(oldValue)
                .newValue(newValue)
                .build();
        audit.setTenantId(TenantContext.getCurrentTenant());
        leavePolicyAuditRepository.save(audit);
    }

    private void createNewVersionSnapshot(LeavePolicy policy, String changedFields) {
        List<LeavePolicyRule> rules = leavePolicyRuleRepository.findByPolicyIdAndDeletedFalse(policy.getId());
        String rulesJson = "[]";
        try {
            rulesJson = objectMapper.writeValueAsString(rules);
        } catch (Exception e) {
            // fallback
        }

        List<LeavePolicyVersion> versions = leavePolicyVersionRepository.findByPolicyIdAndDeletedFalseOrderByVersionNumberDesc(policy.getId());
        int nextVer = versions.isEmpty() ? 1 : versions.get(0).getVersionNumber() + 1;

        LeavePolicyVersion version = LeavePolicyVersion.builder()
                .policyId(policy.getId())
                .versionNumber(nextVer)
                .policyName(policy.getPolicyName())
                .policyCode(policy.getPolicyCode())
                .description(policy.getDescription())
                .effectiveFrom(policy.getEffectiveFrom())
                .effectiveTo(policy.getEffectiveTo())
                .status(policy.getStatus())
                .organizationScope(policy.getOrganizationScope())
                .changedFields(changedFields)
                .policyDataJson(rulesJson)
                .build();
        version.setTenantId(TenantContext.getCurrentTenant());
        leavePolicyVersionRepository.save(version);
    }

    private void autoRecalculateAffectedEmployees(UUID policyId) {
        try {
            String tenant = TenantContext.getCurrentTenant();
            List<EmployeeTwin> employees = employeeTwinRepository.findAllActiveByTenant(tenant);
            for (EmployeeTwin emp : employees) {
                UUID resolvedPolicyId = leavePolicyAssignmentService.resolvePolicy(emp.getId());
                if (resolvedPolicyId != null && resolvedPolicyId.equals(policyId)) {
                    leavePolicyAssignmentService.regenerateWallets(emp.getId());
                }
            }
        } catch (Exception e) {
            // Keep transaction safe from background recalculation issues
        }
    }


    @Override
    @Transactional
    public LeavePolicy createPolicy(LeavePolicy policy) {
        if (policy.getTenantId() == null) {
            policy.setTenantId(TenantContext.getCurrentTenant());
        }
        policy.setStatus("ACTIVE");
        policy.setActive(true);
        LeavePolicy saved = leavePolicyRepository.save(policy);

        writeAudit(saved.getId(), "CREATED", null, "Policy name: " + saved.getPolicyName() + ", Code: " + saved.getPolicyCode());
        createNewVersionSnapshot(saved, "Initial Policy Creation");

        return saved;
    }

    @Override
    @Transactional
    public LeavePolicy updatePolicy(UUID id, LeavePolicy policyDetails) {
        LeavePolicy policy = leavePolicyRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new IllegalArgumentException("Policy not found: " + id));

        StringBuilder changes = new StringBuilder();
        if (!Objects.equals(policy.getPolicyName(), policyDetails.getPolicyName())) {
            changes.append("Name: ").append(policy.getPolicyName()).append(" -> ").append(policyDetails.getPolicyName()).append("; ");
            policy.setPolicyName(policyDetails.getPolicyName());
        }
        if (!Objects.equals(policy.getPolicyCode(), policyDetails.getPolicyCode())) {
            changes.append("Code: ").append(policy.getPolicyCode()).append(" -> ").append(policyDetails.getPolicyCode()).append("; ");
            policy.setPolicyCode(policyDetails.getPolicyCode());
        }
        if (!Objects.equals(policy.getDescription(), policyDetails.getDescription())) {
            changes.append("Description changed; ");
            policy.setDescription(policyDetails.getDescription());
        }
        if (!Objects.equals(policy.getEffectiveFrom(), policyDetails.getEffectiveFrom())) {
            changes.append("Effective From: ").append(policy.getEffectiveFrom()).append(" -> ").append(policyDetails.getEffectiveFrom()).append("; ");
            policy.setEffectiveFrom(policyDetails.getEffectiveFrom());
        }
        if (!Objects.equals(policy.getEffectiveTo(), policyDetails.getEffectiveTo())) {
            changes.append("Effective To: ").append(policy.getEffectiveTo()).append(" -> ").append(policyDetails.getEffectiveTo()).append("; ");
            policy.setEffectiveTo(policyDetails.getEffectiveTo());
        }
        if (!Objects.equals(policy.getStatus(), policyDetails.getStatus())) {
            changes.append("Status: ").append(policy.getStatus()).append(" -> ").append(policyDetails.getStatus()).append("; ");
            policy.setStatus(policyDetails.getStatus());
        }
        if (!Objects.equals(policy.getOrganizationScope(), policyDetails.getOrganizationScope())) {
            changes.append("Scope: ").append(policy.getOrganizationScope()).append(" -> ").append(policyDetails.getOrganizationScope()).append("; ");
            policy.setOrganizationScope(policyDetails.getOrganizationScope());
        }

        String changesStr = changes.toString();
        if (changesStr.isEmpty()) {
            changesStr = "No metadata changes";
        }

        LeavePolicy saved = leavePolicyRepository.save(policy);
        writeAudit(saved.getId(), "MODIFIED", null, changesStr);
        createNewVersionSnapshot(saved, changesStr);
        autoRecalculateAffectedEmployees(saved.getId());

        return saved;
    }

    @Override
    @Transactional
    public LeavePolicy clonePolicy(UUID policyId, String newName, String newCode) {
        LeavePolicy source = leavePolicyRepository.findByIdAndDeletedFalse(policyId)
                .orElseThrow(() -> new IllegalArgumentException("Source policy not found: " + policyId));

        LeavePolicy clone = new LeavePolicy();
        clone.setPolicyName(newName);
        clone.setPolicyCode(newCode);
        clone.setDescription("Clone of " + source.getPolicyName() + ". " + (source.getDescription() != null ? source.getDescription() : ""));
        clone.setEffectiveFrom(source.getEffectiveFrom());
        clone.setEffectiveTo(source.getEffectiveTo());
        clone.setActive(source.isActive());
        clone.setStatus(source.getStatus());
        clone.setOrganizationScope(source.getOrganizationScope());
        clone.setTenantId(TenantContext.getCurrentTenant());

        LeavePolicy savedClone = leavePolicyRepository.save(clone);

        List<LeavePolicyRule> sourceRules = leavePolicyRuleRepository.findByPolicyIdAndDeletedFalse(policyId);
        for (LeavePolicyRule r : sourceRules) {
            LeavePolicyRule ruleClone = new LeavePolicyRule();
            ruleClone.setPolicyId(savedClone.getId());
            ruleClone.setLeaveTypeId(r.getLeaveTypeId());
            ruleClone.setAllocatedDays(r.getAllocatedDays());
            ruleClone.setAccrualMethod(r.getAccrualMethod());
            ruleClone.setCarryForwardLimit(r.getCarryForwardLimit());
            ruleClone.setEncashmentAllowed(r.isEncashmentAllowed());
            ruleClone.setNegativeBalanceAllowed(r.isNegativeBalanceAllowed());
            ruleClone.setSandwichEnabled(r.isSandwichEnabled());
            ruleClone.setPrefixEnabled(r.isPrefixEnabled());
            ruleClone.setSuffixEnabled(r.isSuffixEnabled());
            ruleClone.setProbationRestricted(r.isProbationRestricted());
            ruleClone.setNoticePeriodRestricted(r.isNoticePeriodRestricted());
            ruleClone.setMaxConsecutiveDays(r.getMaxConsecutiveDays());
            ruleClone.setMinDaysNotice(r.getMinDaysNotice());
            ruleClone.setNoticePeriod(r.getNoticePeriod());
            ruleClone.setMinServiceDays(r.getMinServiceDays());
            ruleClone.setAttachmentRequired(r.isAttachmentRequired());
            ruleClone.setHalfDayAllowed(r.isHalfDayAllowed());
            ruleClone.setGenderEligibility(r.getGenderEligibility());
            ruleClone.setEmploymentTypeEligibility(r.getEmploymentTypeEligibility());
            ruleClone.setTenantId(TenantContext.getCurrentTenant());

            leavePolicyRuleRepository.save(ruleClone);
        }

        writeAudit(savedClone.getId(), "CREATED", null, "Cloned from Policy ID: " + policyId);
        createNewVersionSnapshot(savedClone, "Initial Cloned Policy Creation");

        return savedClone;
    }

    @Override
    @Transactional
    public void archivePolicy(UUID policyId) {
        LeavePolicy policy = leavePolicyRepository.findByIdAndDeletedFalse(policyId)
                .orElseThrow(() -> new IllegalArgumentException("Policy not found"));
        String oldStatus = policy.getStatus();
        policy.setStatus("ARCHIVED");
        policy.setActive(false);
        leavePolicyRepository.save(policy);

        writeAudit(policyId, "ARCHIVED", oldStatus, "ARCHIVED");
        createNewVersionSnapshot(policy, "Policy Archived");
        autoRecalculateAffectedEmployees(policyId);
    }

    @Override
    @Transactional
    public void activatePolicy(UUID policyId) {
        LeavePolicy policy = leavePolicyRepository.findByIdAndDeletedFalse(policyId)
                .orElseThrow(() -> new IllegalArgumentException("Policy not found"));
        String oldStatus = policy.getStatus();
        policy.setStatus("ACTIVE");
        policy.setActive(true);
        leavePolicyRepository.save(policy);

        writeAudit(policyId, "ACTIVATED", oldStatus, "ACTIVE");
        createNewVersionSnapshot(policy, "Policy Activated");
        autoRecalculateAffectedEmployees(policyId);
    }

    @Override
    @Transactional
    public void deactivatePolicy(UUID policyId) {
        LeavePolicy policy = leavePolicyRepository.findByIdAndDeletedFalse(policyId)
                .orElseThrow(() -> new IllegalArgumentException("Policy not found"));
        String oldStatus = policy.getStatus();
        policy.setStatus("INACTIVE");
        policy.setActive(false);
        leavePolicyRepository.save(policy);

        writeAudit(policyId, "DEACTIVATED", oldStatus, "INACTIVE");
        createNewVersionSnapshot(policy, "Policy Deactivated");
        autoRecalculateAffectedEmployees(policyId);
    }

    @Override
    @Transactional
    public void deletePolicy(UUID policyId) {
        LeavePolicy policy = leavePolicyRepository.findByIdAndDeletedFalse(policyId)
                .orElseThrow(() -> new IllegalArgumentException("Policy not found"));
        policy.softDelete(TenantContext.getCurrentUser());
        leavePolicyRepository.save(policy);

        writeAudit(policyId, "DELETED", "ACTIVE", "DELETED");
    }

    @Override
    @Transactional
    public LeavePolicyRule createRule(UUID policyId, LeavePolicyRule rule) {
        LeavePolicy policy = leavePolicyRepository.findByIdAndDeletedFalse(policyId)
                .orElseThrow(() -> new IllegalArgumentException("Policy not found"));

        rule.setPolicyId(policyId);
        if (rule.getTenantId() == null) {
            rule.setTenantId(TenantContext.getCurrentTenant());
        }
        LeavePolicyRule saved = leavePolicyRuleRepository.save(rule);

        writeAudit(policyId, "MODIFIED", null, "Added leave rule for leave type ID: " + rule.getLeaveTypeId());
        createNewVersionSnapshot(policy, "Added leave rule for leave type ID: " + rule.getLeaveTypeId());
        autoRecalculateAffectedEmployees(policyId);

        return saved;
    }

    @Override
    @Transactional
    public LeavePolicyRule updateRule(UUID ruleId, LeavePolicyRule ruleDetails) {
        LeavePolicyRule rule = leavePolicyRuleRepository.findByIdAndDeletedFalse(ruleId)
                .orElseThrow(() -> new IllegalArgumentException("Rule not found"));

        LeavePolicy policy = leavePolicyRepository.findByIdAndDeletedFalse(rule.getPolicyId())
                .orElseThrow(() -> new IllegalArgumentException("Policy not found"));

        String oldValue = "Allocated Days: " + rule.getAllocatedDays();
        String newValue = "Allocated Days: " + ruleDetails.getAllocatedDays();

        rule.setLeaveTypeId(ruleDetails.getLeaveTypeId());
        rule.setAllocatedDays(ruleDetails.getAllocatedDays());
        rule.setAccrualMethod(ruleDetails.getAccrualMethod());
        rule.setCarryForwardLimit(ruleDetails.getCarryForwardLimit());
        rule.setEncashmentAllowed(ruleDetails.isEncashmentAllowed());
        rule.setNegativeBalanceAllowed(ruleDetails.isNegativeBalanceAllowed());
        rule.setSandwichEnabled(ruleDetails.isSandwichEnabled());
        rule.setPrefixEnabled(ruleDetails.isPrefixEnabled());
        rule.setSuffixEnabled(ruleDetails.isSuffixEnabled());
        rule.setProbationRestricted(ruleDetails.isProbationRestricted());
        rule.setNoticePeriodRestricted(ruleDetails.isNoticePeriodRestricted());
        rule.setMaxConsecutiveDays(ruleDetails.getMaxConsecutiveDays());
        rule.setMinDaysNotice(ruleDetails.getMinDaysNotice());
        rule.setNoticePeriod(ruleDetails.getNoticePeriod());
        rule.setMinServiceDays(ruleDetails.getMinServiceDays());
        rule.setAttachmentRequired(ruleDetails.isAttachmentRequired());
        rule.setHalfDayAllowed(ruleDetails.isHalfDayAllowed());
        rule.setGenderEligibility(ruleDetails.getGenderEligibility());
        rule.setEmploymentTypeEligibility(ruleDetails.getEmploymentTypeEligibility());

        LeavePolicyRule saved = leavePolicyRuleRepository.save(rule);

        writeAudit(policy.getId(), "MODIFIED", oldValue, "Updated rule: " + newValue);
        createNewVersionSnapshot(policy, "Updated leave rule for leave type ID: " + rule.getLeaveTypeId());
        autoRecalculateAffectedEmployees(policy.getId());

        return saved;
    }

    @Override
    @Transactional
    public void deleteRule(UUID ruleId) {
        LeavePolicyRule rule = leavePolicyRuleRepository.findByIdAndDeletedFalse(ruleId)
                .orElseThrow(() -> new IllegalArgumentException("Rule not found"));

        LeavePolicy policy = leavePolicyRepository.findByIdAndDeletedFalse(rule.getPolicyId())
                .orElseThrow(() -> new IllegalArgumentException("Policy not found"));

        rule.softDelete(TenantContext.getCurrentUser());
        leavePolicyRuleRepository.save(rule);

        writeAudit(policy.getId(), "MODIFIED", "Leave Type: " + rule.getLeaveTypeId(), "DELETED");
        createNewVersionSnapshot(policy, "Deleted leave rule for leave type ID: " + rule.getLeaveTypeId());
        autoRecalculateAffectedEmployees(policy.getId());
    }

    @Override
    @Transactional
    public LeavePolicyAssignment assignPolicy(LeavePolicyAssignment assignment) {
        if (assignment.getTenantId() == null) {
            assignment.setTenantId(TenantContext.getCurrentTenant());
        }
        LeavePolicyAssignment saved = leavePolicyAssignmentRepository.save(assignment);
        writeAudit(assignment.getPolicyId(), "ASSIGNED", null, "Assigned to scope (Org/Dept/Grade/BU/Band)");
        autoRecalculateAffectedEmployees(assignment.getPolicyId());

        return saved;
    }

    @Override
    @Transactional
    public void unassignPolicy(UUID assignmentId) {
        LeavePolicyAssignment assignment = leavePolicyAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found"));
        assignment.softDelete(TenantContext.getCurrentUser());
        leavePolicyAssignmentRepository.save(assignment);

        writeAudit(assignment.getPolicyId(), "UNASSIGNED", "Assigned", "UNASSIGNED");
        autoRecalculateAffectedEmployees(assignment.getPolicyId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeavePolicyAssignment> getAssignmentsByPolicyId(UUID policyId) {
        String tenant = TenantContext.getCurrentTenant();
        return leavePolicyAssignmentRepository.findByTenantIdAndDeletedFalse(tenant).stream()
                .filter(a -> a.getPolicyId().equals(policyId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeavePolicyVersion> getVersions(UUID policyId) {
        return leavePolicyVersionRepository.findByPolicyIdAndDeletedFalseOrderByVersionNumberDesc(policyId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeavePolicyAudit> getAudits(UUID policyId) {
        return leavePolicyAuditRepository.findByPolicyIdAndDeletedFalseOrderByCreatedAtDesc(policyId);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> calculateImpact(UUID policyId, Double newAllocatedDays, UUID leaveTypeId) {
        String tenant = TenantContext.getCurrentTenant();
        List<EmployeeTwin> employees = employeeTwinRepository.findAllActiveByTenant(tenant);

        int affectedEmployees = 0;
        Set<UUID> affectedDepartments = new HashSet<>();

        for (EmployeeTwin emp : employees) {
            UUID resolvedPolicyId = leavePolicyAssignmentService.resolvePolicy(emp.getId());
            if (resolvedPolicyId != null && resolvedPolicyId.equals(policyId)) {
                affectedEmployees++;
                if (emp.getDepartmentId() != null) {
                    affectedDepartments.add(emp.getDepartmentId());
                }
            }
        }

        // Find current allocation
        double currentAllocated = 0.0;
        Optional<LeavePolicyRule> existingRule = leavePolicyRuleRepository.findByPolicyIdAndLeaveTypeIdAndDeletedFalse(policyId, leaveTypeId);
        if (existingRule.isPresent()) {
            currentAllocated = existingRule.get().getAllocatedDays();
        }

        Map<String, Object> impact = new HashMap<>();
        impact.put("affectedEmployees", affectedEmployees);
        impact.put("affectedDepartments", affectedDepartments.size());
        impact.put("currentAllocation", currentAllocated);
        impact.put("newAllocation", newAllocatedDays != null ? newAllocatedDays : currentAllocated);

        return impact;
    }
}
