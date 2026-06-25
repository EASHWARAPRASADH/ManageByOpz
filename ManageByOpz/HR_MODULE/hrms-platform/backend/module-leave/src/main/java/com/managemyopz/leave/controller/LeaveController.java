package com.managemyopz.leave.controller;

import com.managemyopz.leave.entity.LeaveBalance;
import com.managemyopz.leave.entity.LeaveRequest;
import com.managemyopz.leave.entity.LeaveType;
import com.managemyopz.leave.service.LeaveService;
import com.managemyopz.leave.service.LeavePolicyAssignmentService;
import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.twin.repository.EmployeeTwinRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/v1/leave")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;
    private final LeavePolicyAssignmentService leavePolicyAssignmentService;
    private final EmployeeTwinRepository employeeTwinRepository;

    // ── Leave Types ──────────────────────────────────────────
    @PostMapping("/types")
    @PreAuthorize("@rbac.hasMinimumRole(authentication,'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<LeaveType>> createLeaveType(@RequestBody LeaveType leaveType) {
        LeaveType created = leaveService.createLeaveType(leaveType);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(created, "Leave Type created successfully"));
    }

    @PutMapping("/types/{id}")
    @PreAuthorize("@rbac.hasMinimumRole(authentication,'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<LeaveType>> updateLeaveType(@PathVariable UUID id, @RequestBody LeaveType leaveType) {
        LeaveType updated = leaveService.updateLeaveType(id, leaveType);
        return ResponseEntity.ok(ApiResponse.success(updated, "Leave Type updated successfully"));
    }

    @DeleteMapping("/types/{id}")
    @PreAuthorize("@rbac.hasMinimumRole(authentication,'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteLeaveType(@PathVariable UUID id) {
        leaveService.deleteLeaveType(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Leave Type deleted successfully"));
    }

    @GetMapping("/types")
    @PreAuthorize("@rbac.hasPermission(authentication,'LEAVE_VIEW') or @rbac.hasMinimumRole(authentication,'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<LeaveType>>> getLeaveTypes() {
        log.info("[LEAVE] getLeaveTypes called by user={}, role={}", TenantContext.getCurrentUser(), TenantContext.getCurrentRole());
        List<LeaveType> types = leaveService.getLeaveTypes();
        return ResponseEntity.ok(ApiResponse.success(types, "Leave Types retrieved successfully"));
    }

    @GetMapping("/types/{id}")
    @PreAuthorize("@rbac.hasPermission(authentication,'LEAVE_VIEW') or @rbac.hasMinimumRole(authentication,'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<LeaveType>> getLeaveTypeById(@PathVariable UUID id) {
        LeaveType type = leaveService.getLeaveTypeById(id);
        return ResponseEntity.ok(ApiResponse.success(type, "Leave Type retrieved successfully"));
    }

    // ── Leave Requests ──────────────────────────────────────────
    @PostMapping("/requests")
    @PreAuthorize("(@rbac.isSelf(authentication,#request.employeeId.toString()) and @rbac.hasPermission(authentication,'LEAVE_APPLY')) or @rbac.hasMinimumRole(authentication,'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<LeaveRequest>> applyLeave(@RequestBody LeaveRequest request) {
        log.info("[LEAVE] applyLeave called by user={}, role={}, employeeId={}", 
                TenantContext.getCurrentUser(), TenantContext.getCurrentRole(), request.getEmployeeId());
        LeaveRequest applied = leaveService.applyLeave(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(applied, "Leave request submitted successfully"));
    }

    @PostMapping("/requests/{id}/action")
    @PreAuthorize("@rbac.hasMinimumRole(authentication,'ROLE_MANAGER') or @rbac.hasPermission(authentication,'workflow:approve')")
    public ResponseEntity<ApiResponse<LeaveRequest>> actionLeaveRequest(
            @PathVariable UUID id,
            @RequestParam LeaveRequest.LeaveStatus status,
            @RequestParam(required = false, defaultValue = "") String comment) {
        String approvedBy = TenantContext.getCurrentUser();
        log.info("[LEAVE] actionLeaveRequest called by user={}, role={}, requestId={}, newStatus={}",
                approvedBy, TenantContext.getCurrentRole(), id, status);
        LeaveRequest actioned = leaveService.actionLeaveRequest(id, status, comment, approvedBy);
        return ResponseEntity.ok(ApiResponse.success(actioned, "Leave request status updated to " + status));
    }

    @GetMapping("/requests/employee/{employeeId}")
    @PreAuthorize("(@rbac.isSelf(authentication,#employeeId.toString()) and @rbac.hasPermission(authentication,'LEAVE_HISTORY_VIEW')) or @rbac.hasMinimumRole(authentication,'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> getLeaveRequestsByEmployee(@PathVariable UUID employeeId) {
        log.info("[LEAVE] getLeaveRequestsByEmployee called by user={}, employeeId={}", TenantContext.getCurrentUser(), employeeId);
        List<LeaveRequest> requests = leaveService.getLeaveRequestsByEmployee(employeeId);
        return ResponseEntity.ok(ApiResponse.success(requests, "Employee leave requests retrieved successfully"));
    }

    @GetMapping("/requests")
    @PreAuthorize("@rbac.hasMinimumRole(authentication,'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<LeaveRequest>>> getAllLeaveRequests() {
        List<LeaveRequest> requests = leaveService.getAllLeaveRequests();
        return ResponseEntity.ok(ApiResponse.success(requests, "All leave requests retrieved successfully"));
    }

    // ── Leave Balances ──────────────────────────────────────────
    @GetMapping("/balances/employee/{employeeId}")
    @PreAuthorize("(@rbac.isSelf(authentication,#employeeId.toString()) and @rbac.hasPermission(authentication,'LEAVE_BALANCE_VIEW')) or @rbac.hasMinimumRole(authentication,'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<List<LeaveBalance>>> getLeaveBalancesByEmployee(
            @PathVariable UUID employeeId,
            @RequestParam int year) {
        log.info("[LEAVE] getLeaveBalancesByEmployee called by user={}, employeeId={}, year={}", 
                TenantContext.getCurrentUser(), employeeId, year);
        List<LeaveBalance> balances = leaveService.getLeaveBalancesByEmployee(employeeId, year);
        return ResponseEntity.ok(ApiResponse.success(balances, "Employee leave balances retrieved successfully"));
    }

    @PostMapping("/balances/adjust")
    @PreAuthorize("@rbac.hasMinimumRole(authentication,'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<LeaveBalance>> adjustBalance(
            @RequestParam UUID employeeId,
            @RequestParam UUID leaveTypeId,
            @RequestParam int year,
            @RequestParam double amount,
            @RequestParam String reason) {
        LeaveBalance balance = leaveService.adjustBalance(employeeId, leaveTypeId, year, amount, reason);
        return ResponseEntity.ok(ApiResponse.success(balance, "Employee leave balance adjusted successfully"));
    }

    @GetMapping("/team-availability")
    @PreAuthorize("hasAuthority('LEAVE_VIEW') or @rbac.hasPermission(authentication,'LEAVE_VIEW') or @rbac.hasMinimumRole(authentication,'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTeamAvailability(
            @RequestParam UUID employeeId,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        
        java.time.LocalDate start = java.time.LocalDate.parse(startDate);
        java.time.LocalDate end = java.time.LocalDate.parse(endDate);
        
        var empOpt = employeeTwinRepository.findById(employeeId);
        if (empOpt.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(Map.of(
                    "todayOnLeave", 0,
                    "overlapCount", 0,
                    "capacityImpact", "Low"
            ), "Employee not found"));
        }
        var currentEmp = empOpt.get();
        UUID deptId = currentEmp.getDepartmentId();
        
        String tenant = TenantContext.getCurrentTenant();
        List<com.managemyopz.twin.entity.EmployeeTwin> deptEmps = employeeTwinRepository.findAllActiveByTenant(tenant);
        if (deptId != null) {
            deptEmps = deptEmps.stream()
                    .filter(e -> deptId.equals(e.getDepartmentId()))
                    .collect(java.util.stream.Collectors.toList());
        }
        
        List<UUID> deptEmpIds = deptEmps.stream().map(com.managemyopz.twin.entity.EmployeeTwin::getId).collect(java.util.stream.Collectors.toList());
        
        java.time.LocalDate today = java.time.LocalDate.now();
        long todayOnLeave = 0;
        long overlapCount = 0;
        
        if (!deptEmpIds.isEmpty()) {
            List<LeaveRequest> allRequests = leaveService.getAllLeaveRequests().stream()
                    .filter(r -> deptEmpIds.contains(r.getEmployeeId()))
                    .filter(r -> r.getStatus() == LeaveRequest.LeaveStatus.APPROVED || 
                                r.getStatus() == LeaveRequest.LeaveStatus.PENDING ||
                                r.getStatus() == LeaveRequest.LeaveStatus.PENDING_L1 ||
                                r.getStatus() == LeaveRequest.LeaveStatus.PENDING_L2 ||
                                r.getStatus() == LeaveRequest.LeaveStatus.PENDING_L3)
                    .collect(java.util.stream.Collectors.toList());
            
            todayOnLeave = allRequests.stream()
                    .filter(r -> !today.isBefore(r.getStartDate()) && !today.isAfter(r.getEndDate()))
                    .map(LeaveRequest::getEmployeeId)
                    .distinct()
                    .count();
            
            overlapCount = allRequests.stream()
                    .filter(r -> !r.getEmployeeId().equals(employeeId))
                    .filter(r -> !start.isAfter(r.getEndDate()) && !end.isBefore(r.getStartDate()))
                    .map(LeaveRequest::getEmployeeId)
                    .distinct()
                    .count();
        }
        
        double totalDeptSize = deptEmps.size();
        String capacityImpact = "Low";
        if (totalDeptSize > 0) {
            double ratio = (double) overlapCount / totalDeptSize;
            if (ratio > 0.3) {
                capacityImpact = "High";
            } else if (ratio > 0.1) {
                capacityImpact = "Medium";
            }
        }
        
        return ResponseEntity.ok(ApiResponse.success(Map.of(
                "todayOnLeave", todayOnLeave,
                "overlapCount", overlapCount,
                "capacityImpact", capacityImpact
        ), "Team availability calculated"));
    }

    // ── Admin: Recalculate Wallets ──────────────────────────────
    @PostMapping("/admin/recalculate-wallets")
    @PreAuthorize("@rbac.hasMinimumRole(authentication,'ROLE_ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> recalculateWallets(
            @RequestParam(required = false) String employeeId) {
        log.info("[LEAVE-ADMIN] recalculate-wallets triggered by user={}, targetEmployeeId={}", 
                TenantContext.getCurrentUser(), employeeId);
        
        int processed = 0;
        if (employeeId != null && !employeeId.isBlank()) {
            // Single employee
            UUID empId = UUID.fromString(employeeId);
            leavePolicyAssignmentService.regenerateWallets(empId);
            processed = 1;
        } else {
            String tenant = TenantContext.getCurrentTenant();
            var allEmployees = employeeTwinRepository.findAllActiveByTenant(tenant);
            for (var emp : allEmployees) {
                try {
                    leavePolicyAssignmentService.regenerateWallets(emp.getId());
                    processed++;
                } catch (Exception e) {
                    log.error("[LEAVE-ADMIN] Failed to regenerate wallets for employee={}: {}", emp.getId(), e.getMessage());
                }
            }
        }
        
        log.info("[LEAVE-ADMIN] recalculate-wallets completed. processed={} employees", processed);
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("processedCount", processed, "status", "COMPLETED"),
                "Leave wallets regenerated for " + processed + " employees"
        ));
    }
}
