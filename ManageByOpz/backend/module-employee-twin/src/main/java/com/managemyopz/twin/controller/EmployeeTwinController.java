package com.managemyopz.twin.controller;

import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.twin.dto.BulkReassignManagerRequest;
import com.managemyopz.twin.dto.BulkTerminateRequest;
import com.managemyopz.twin.entity.EmployeeTwin;
import com.managemyopz.twin.service.EmployeeTwinService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1/employees")
@RequiredArgsConstructor
public class EmployeeTwinController {

    private final EmployeeTwinService service;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ApiResponse<EmployeeTwin> createEmployee(@RequestBody EmployeeTwin employee, Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        EmployeeTwin created = service.createEmployee(employee, user);
        return ApiResponse.created(created, "Employee Twin created successfully");
    }

    @PutMapping("/{id}")
    @PreAuthorize("@rbac.hasMinimumRole(authentication,'ROLE_ADMIN') and @rbac.hasPermission(authentication,'employee:update')")
    public ApiResponse<EmployeeTwin> updateEmployee(@PathVariable UUID id, @RequestBody EmployeeTwin employeeDetails, Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        EmployeeTwin updated = service.updateEmployee(id, employeeDetails, user);
        return ApiResponse.success(updated, "Employee Twin updated successfully");
    }

    @GetMapping("/{id}")
    public ApiResponse<EmployeeTwin> getEmployeeById(@PathVariable UUID id) {
        EmployeeTwin twin = service.getById(id);
        return ApiResponse.success(twin);
    }

    @GetMapping
    public ApiResponse<List<EmployeeTwin>> listEmployees(@RequestParam(required = false, defaultValue = "false") boolean showArchived) {
        List<EmployeeTwin> twins = service.getAll(showArchived);
        return ApiResponse.success(twins);
    }

    @PostMapping("/{id}/transfer")
    @PreAuthorize("@rbac.hasMinimumRole(authentication,'ROLE_ADMIN') and @rbac.hasPermission(authentication,'employee:transfer')")
    public ApiResponse<EmployeeTwin> transferEmployee(
            @PathVariable UUID id,
            @RequestParam UUID newDepartmentId,
            @RequestParam UUID newLocationId,
            Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        EmployeeTwin updated = service.transferEmployee(id, newDepartmentId, newLocationId, user);
        return ApiResponse.success(updated, "Employee transferred successfully");
    }

    @PostMapping("/{id}/promote")
    @PreAuthorize("@rbac.hasMinimumRole(authentication,'ROLE_ADMIN') and @rbac.hasPermission(authentication,'employee:promote')")
    public ApiResponse<EmployeeTwin> promoteEmployee(
            @PathVariable UUID id,
            @RequestParam UUID newDesignationId,
            @RequestParam UUID newGradeId,
            Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        EmployeeTwin updated = service.promoteEmployee(id, newDesignationId, newGradeId, user);
        return ApiResponse.success(updated, "Employee promoted successfully");
    }

    @PostMapping("/{id}/change-manager")
    public ApiResponse<EmployeeTwin> changeManager(
            @PathVariable UUID id,
            @RequestParam UUID newManagerId,
            Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        EmployeeTwin updated = service.changeManager(id, newManagerId, user);
        return ApiResponse.success(updated, "Manager changed successfully");
    }

    @PostMapping("/{id}/terminate")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN') or @rbac.hasPermission(authentication,'EMPLOYEE_TERMINATE')")
    public ApiResponse<EmployeeTwin> terminateEmployee(
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate exitDate,
            @RequestParam String reason,
            Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        EmployeeTwin updated = service.terminateEmployee(id, exitDate, reason, user);
        return ApiResponse.success(updated, "Employee terminated successfully");
    }

    @PostMapping("/{id}/archive")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN') or @rbac.hasPermission(authentication,'EMPLOYEE_ARCHIVE')")
    public ApiResponse<EmployeeTwin> archiveEmployee(
            @PathVariable UUID id,
            @RequestParam String reason,
            Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        EmployeeTwin archived = service.archiveEmployee(id, reason, user);
        return ApiResponse.success(archived, "Employee archived successfully");
    }

    @PostMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN') or @rbac.hasPermission(authentication,'EMPLOYEE_RESTORE')")
    public ApiResponse<EmployeeTwin> restoreEmployee(
            @PathVariable UUID id,
            Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        EmployeeTwin restored = service.restoreEmployee(id, user);
        return ApiResponse.success(restored, "Employee restored successfully");
    }

    @PostMapping("/bulk-archive")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN') or @rbac.hasPermission(authentication,'EMPLOYEE_ARCHIVE')")
    public ApiResponse<Void> bulkArchiveEmployees(
            @RequestParam List<UUID> ids,
            @RequestParam String reason,
            Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        service.bulkArchive(ids, reason, user);
        return ApiResponse.success(null, "Employees archived successfully");
    }

    @PostMapping("/bulk-reassign-manager")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ApiResponse<Void> bulkReassignManager(
            @RequestBody BulkReassignManagerRequest request,
            Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        service.bulkReassignManager(
                request.getEmployeeIds(),
                request.getManagerId(),
                request.getEffectiveDate(),
                request.getReason(),
                user
        );
        return ApiResponse.success(null, "Manager reassigned successfully for selected employees");
    }

    @PostMapping("/bulk-terminate")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ApiResponse<Void> bulkTerminate(
            @RequestBody BulkTerminateRequest request,
            Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        service.bulkTerminate(
                request.getEmployeeIds(),
                request.getTerminationDate(),
                request.getFinalWorkingDay(),
                request.getReason(),
                user
        );
        return ApiResponse.success(null, "Selected employees terminated successfully");
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_SUPER_ADMIN', 'ROLE_ULTRA_SUPER_ADMIN')")
    public ApiResponse<Void> deleteEmployee(@PathVariable UUID id, Principal principal) {
        String user = principal != null ? principal.getName() : "system";
        service.deleteEmployee(id, user);
        return ApiResponse.success(null, "Employee Twin deleted successfully");
    }

    @GetMapping("/{id}/completion")
    public ApiResponse<Integer> getCompletionScore(@PathVariable UUID id) {
        int score = service.calculateProfileCompletion(id);
        return ApiResponse.success(score);
    }

    @GetMapping("/preview/next-code")
    public ApiResponse<String> getNextEmployeeCode(
            @RequestParam(required = false) UUID organizationId,
            @RequestParam(required = false) UUID businessUnitId) {
        String code = service.previewNextEmployeeCode(organizationId, businessUnitId);
        return ApiResponse.success(code);
    }

    @GetMapping("/validate-code")
    public ApiResponse<Boolean> validateCode(@RequestParam String code) {
        boolean valid = service.validateCodeUniqueness(code);
        return ApiResponse.success(valid);
    }

    @PostMapping("/reserve-code")
    public ApiResponse<Void> reserveCode(
            @RequestParam UUID organizationId,
            @RequestParam String code) {
        service.reserveCode(organizationId, code);
        return ApiResponse.success(null, "Code reserved successfully");
    }
}
