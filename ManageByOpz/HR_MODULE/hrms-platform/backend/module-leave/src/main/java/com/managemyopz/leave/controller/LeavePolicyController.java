package com.managemyopz.leave.controller;

import com.managemyopz.leave.entity.*;
import com.managemyopz.leave.repository.LeavePolicyRepository;
import com.managemyopz.leave.repository.LeavePolicyRuleRepository;
import com.managemyopz.leave.service.LeavePolicyService;
import com.managemyopz.leave.service.LeavePolicyAssignmentService;
import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/v1/leave-policies")
@RequiredArgsConstructor
public class LeavePolicyController {

    private final LeavePolicyRepository leavePolicyRepository;
    private final LeavePolicyRuleRepository leavePolicyRuleRepository;
    private final LeavePolicyService leavePolicyService;
    private final LeavePolicyAssignmentService leavePolicyAssignmentService;

    @GetMapping
    @PreAuthorize("@rbac.hasPermission(authentication, 'LEAVE_POLICY_VIEW') or hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<LeavePolicy>>> getLeavePolicies() {
        String tenantId = TenantContext.getCurrentTenant();
        List<LeavePolicy> policies = leavePolicyRepository.findByTenantIdAndDeletedFalse(tenantId);
        return ResponseEntity.ok(ApiResponse.success(policies, "Leave policies retrieved successfully"));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<LeavePolicy>> createLeavePolicy(@RequestBody LeavePolicy policy) {
        LeavePolicy saved = leavePolicyService.createPolicy(policy);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(saved, "Leave policy created successfully"));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<LeavePolicy>> updateLeavePolicy(@PathVariable UUID id, @RequestBody LeavePolicy policyDetails) {
        LeavePolicy updated = leavePolicyService.updatePolicy(id, policyDetails);
        return ResponseEntity.ok(ApiResponse.success(updated, "Leave policy updated successfully"));
    }

    @PostMapping("/{id}/clone")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<LeavePolicy>> cloneLeavePolicy(
            @PathVariable UUID id,
            @RequestParam String newName,
            @RequestParam String newCode) {
        LeavePolicy cloned = leavePolicyService.clonePolicy(id, newName, newCode);
        return ResponseEntity.ok(ApiResponse.success(cloned, "Leave policy cloned successfully"));
    }

    @PostMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> archiveLeavePolicy(@PathVariable UUID id) {
        leavePolicyService.archivePolicy(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Leave policy archived successfully"));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> activateLeavePolicy(@PathVariable UUID id) {
        leavePolicyService.activatePolicy(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Leave policy activated successfully"));
    }

    @PostMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateLeavePolicy(@PathVariable UUID id) {
        leavePolicyService.deactivatePolicy(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Leave policy deactivated successfully"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteLeavePolicy(@PathVariable UUID id) {
        leavePolicyService.deletePolicy(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Leave policy soft-deleted successfully"));
    }

    @GetMapping("/{id}/rules")
    @PreAuthorize("@rbac.hasPermission(authentication, 'LEAVE_POLICY_VIEW') or hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<LeavePolicyRule>>> getPolicyRules(@PathVariable UUID id) {
        List<LeavePolicyRule> rules = leavePolicyRuleRepository.findByPolicyIdAndDeletedFalse(id);
        return ResponseEntity.ok(ApiResponse.success(rules, "Leave policy rules retrieved successfully"));
    }

    @PostMapping("/{id}/rules")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<LeavePolicyRule>> createPolicyRule(@PathVariable UUID id, @RequestBody LeavePolicyRule rule) {
        LeavePolicyRule saved = leavePolicyService.createRule(id, rule);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(saved, "Leave policy rule added successfully"));
    }

    @PutMapping("/rules/{ruleId}")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<LeavePolicyRule>> updatePolicyRule(@PathVariable UUID ruleId, @RequestBody LeavePolicyRule ruleDetails) {
        LeavePolicyRule updated = leavePolicyService.updateRule(ruleId, ruleDetails);
        return ResponseEntity.ok(ApiResponse.success(updated, "Leave policy rule updated successfully"));
    }

    @DeleteMapping("/rules/{ruleId}")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePolicyRule(@PathVariable UUID ruleId) {
        leavePolicyService.deleteRule(ruleId);
        return ResponseEntity.ok(ApiResponse.success(null, "Leave policy rule deleted successfully"));
    }

    @PostMapping("/assignments")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<LeavePolicyAssignment>> createAssignment(@RequestBody LeavePolicyAssignment assignment) {
        LeavePolicyAssignment saved = leavePolicyService.assignPolicy(assignment);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(saved, "Leave policy assignment created successfully"));
    }

    @DeleteMapping("/assignments/{assignmentId}")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAssignment(@PathVariable UUID assignmentId) {
        leavePolicyService.unassignPolicy(assignmentId);
        return ResponseEntity.ok(ApiResponse.success(null, "Leave policy assignment deleted successfully"));
    }

    @GetMapping("/{id}/assignments")
    @PreAuthorize("@rbac.hasPermission(authentication, 'LEAVE_POLICY_VIEW') or hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<LeavePolicyAssignment>>> getPolicyAssignments(@PathVariable UUID id) {
        List<LeavePolicyAssignment> assignments = leavePolicyService.getAssignmentsByPolicyId(id);
        return ResponseEntity.ok(ApiResponse.success(assignments, "Leave policy assignments retrieved successfully"));
    }

    @GetMapping("/{id}/versions")
    @PreAuthorize("@rbac.hasPermission(authentication, 'LEAVE_POLICY_VIEW') or hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<LeavePolicyVersion>>> getPolicyVersions(@PathVariable UUID id) {
        List<LeavePolicyVersion> versions = leavePolicyService.getVersions(id);
        return ResponseEntity.ok(ApiResponse.success(versions, "Leave policy versions retrieved successfully"));
    }

    @GetMapping("/{id}/audits")
    @PreAuthorize("@rbac.hasPermission(authentication, 'LEAVE_POLICY_VIEW') or hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<List<LeavePolicyAudit>>> getPolicyAudits(@PathVariable UUID id) {
        List<LeavePolicyAudit> audits = leavePolicyService.getAudits(id);
        return ResponseEntity.ok(ApiResponse.success(audits, "Leave policy audits retrieved successfully"));
    }

    @GetMapping("/{id}/impact")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPolicyImpact(
            @PathVariable UUID id,
            @RequestParam Double newAllocatedDays,
            @RequestParam UUID leaveTypeId) {
        Map<String, Object> impact = leavePolicyService.calculateImpact(id, newAllocatedDays, leaveTypeId);
        return ResponseEntity.ok(ApiResponse.success(impact, "Leave policy impact calculated successfully"));
    }

    @GetMapping("/resolved/{employeeId}")
    public ResponseEntity<ApiResponse<ResolvedPolicyDto>> getResolvedPolicy(@PathVariable UUID employeeId) {
        UUID policyId = leavePolicyAssignmentService.resolvePolicy(employeeId);
        if (policyId == null) {
            return ResponseEntity.ok(ApiResponse.success(null, "No policy resolved for employee"));
        }
        LeavePolicy policy = leavePolicyRepository.findById(policyId).orElse(null);
        List<LeavePolicyRule> rules = leavePolicyRuleRepository.findByPolicyIdAndDeletedFalse(policyId);
        ResolvedPolicyDto resolved = new ResolvedPolicyDto(policy, rules);
        return ResponseEntity.ok(ApiResponse.success(resolved, "Resolved policy retrieved successfully"));
    }

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class ResolvedPolicyDto {
        private LeavePolicy policy;
        private List<LeavePolicyRule> rules;
    }

    @PostMapping("/recalculate-balances")
    public ResponseEntity<ApiResponse<Void>> recalculateBalances(
            @RequestParam UUID employeeId,
            @RequestParam(required = false, defaultValue = "recalculate") String action) {
        
        if (action.equalsIgnoreCase("regenerate")) {
            leavePolicyAssignmentService.regenerateWallets(employeeId);
        } else {
            leavePolicyAssignmentService.recalculateBalances(employeeId);
        }
        
        return ResponseEntity.ok(ApiResponse.success(null, "Leave balances updated successfully via action: " + action));
    }
}
