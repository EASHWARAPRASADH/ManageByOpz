package com.managemyopz.security.controller;

import com.managemyopz.security.entity.User;
import com.managemyopz.security.entity.Role;
import com.managemyopz.security.repository.RoleRepository;
import com.managemyopz.security.service.UserProvisioningService;
import com.managemyopz.audit.entity.AuditLog;
import com.managemyopz.audit.repository.AuditLogRepository;
import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.shared.exception.PlatformException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/v1/employees/{employeeId}/account")
@RequiredArgsConstructor
public class EmployeeAccountController {

    private final UserProvisioningService provisioningService;
    private final AuditLogRepository auditLogRepository;
    private final RoleRepository roleRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ULTRA_SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN', 'ROLE_MANAGER')")
    public ApiResponse<Map<String, Object>> getEmployeeAccount(@PathVariable UUID employeeId) {
        // Temporarily clear tenant context to perform a global/cross-tenant lookup if needed,
        // and restore afterwards.
        String originalTenant = TenantContext.getCurrentTenant();
        TenantContext.setCurrentTenant(null);
        try {
            User user = provisioningService.getAccountByEmployeeId(employeeId);
            
            // Query Audit logs for the security timeline/login history
            Pageable limit = PageRequest.of(0, 50);
            List<AuditLog> auditLogs = auditLogRepository
                    .findByTenantIdAndEntityTypeAndEntityIdOrderByPerformedAtDesc(
                            user.getTenantId(), "USER", user.getId().toString(), limit)
                    .getContent();

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("employeeId", user.getEmployeeId());
            response.put("tenantId", user.getTenantId());
            response.put("status", user.getStatus());
            response.put("active", user.isActive());
            response.put("locked", user.isLocked());
            response.put("accountLocked", user.isAccountLocked());
            response.put("accountLockedAt", user.getAccountLockedAt());
            response.put("failedLoginAttempts", user.getFailedLoginAttempts());
            response.put("passwordChangeRequired", user.isPasswordChangeRequired());
            response.put("activatedAt", user.getActivatedAt());
            response.put("activationSentAt", user.getActivationSentAt());
            response.put("activationToken", user.getActivationToken());
            response.put("activationTokenExpiry", user.getActivationTokenExpiry());
            response.put("lastLoginAt", user.getLastLoginAt());
            response.put("lastLoginIp", user.getLastLoginIp());
            response.put("lastPasswordChangeAt", user.getLastPasswordChangeAt());
            response.put("passwordExpiryAt", user.getPasswordExpiryAt());
            response.put("mfaEnabled", user.isMfaEnabled());
            response.put("roles", user.getRoles().stream().map(Role::getCode).collect(Collectors.toList()));
            response.put("auditLogs", auditLogs);

            return ApiResponse.success(response);
        } catch (PlatformException pe) {
            throw pe;
        } catch (Exception e) {
            throw new PlatformException("Failed to load user account: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR, "ERROR_LOAD_ACCOUNT");
        } finally {
            if (originalTenant != null) {
                TenantContext.setCurrentTenant(originalTenant);
            }
        }
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ROLE_ULTRA_SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    public ApiResponse<User> updateEmployeeAccount(
            @PathVariable UUID employeeId,
            @RequestBody Map<String, Object> payload,
            Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String originalTenant = TenantContext.getCurrentTenant();
        TenantContext.setCurrentTenant(null);
        try {
            User updateDetails = new User();
            if (payload.containsKey("username")) {
                updateDetails.setUsername((String) payload.get("username"));
            }
            if (payload.containsKey("email")) {
                updateDetails.setEmail((String) payload.get("email"));
            }
            if (payload.containsKey("roles")) {
                List<String> roleCodes = (List<String>) payload.get("roles");
                Set<Role> roles = new HashSet<>();
                for (String code : roleCodes) {
                    roleRepository.findByCode(code).ifPresent(roles::add);
                }
                updateDetails.setRoles(roles);
            }

            User updated = provisioningService.updateAccount(employeeId, updateDetails, actor);
            return ApiResponse.success(updated, "Account updated successfully");
        } finally {
            if (originalTenant != null) {
                TenantContext.setCurrentTenant(originalTenant);
            }
        }
    }

    @PostMapping("/resend-activation")
    @PreAuthorize("hasAnyRole('ROLE_ULTRA_SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    public ApiResponse<Void> resendActivation(@PathVariable UUID employeeId, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String originalTenant = TenantContext.getCurrentTenant();
        TenantContext.setCurrentTenant(null);
        try {
            User user = provisioningService.getAccountByEmployeeId(employeeId);
            provisioningService.resendActivationEmail(user.getId(), actor);
            return ApiResponse.success(null, "Activation email resent successfully");
        } finally {
            if (originalTenant != null) {
                TenantContext.setCurrentTenant(originalTenant);
            }
        }
    }

    @PostMapping("/reset-password")
    @PreAuthorize("hasAnyRole('ROLE_ULTRA_SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    public ApiResponse<Void> resetPassword(
            @PathVariable UUID employeeId,
            @RequestBody Map<String, String> payload,
            Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String newPassword = payload.get("password");
        if (newPassword == null || newPassword.isBlank()) {
            throw new PlatformException("Password is required", HttpStatus.BAD_REQUEST, "PASSWORD_REQUIRED");
        }
        String originalTenant = TenantContext.getCurrentTenant();
        TenantContext.setCurrentTenant(null);
        try {
            User user = provisioningService.getAccountByEmployeeId(employeeId);
            provisioningService.forcePasswordReset(user.getId(), newPassword, actor);
            return ApiResponse.success(null, "Password reset successfully");
        } finally {
            if (originalTenant != null) {
                TenantContext.setCurrentTenant(originalTenant);
            }
        }
    }

    @PostMapping("/unlock")
    @PreAuthorize("hasAnyRole('ROLE_ULTRA_SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    public ApiResponse<Void> unlockAccount(@PathVariable UUID employeeId, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String originalTenant = TenantContext.getCurrentTenant();
        TenantContext.setCurrentTenant(null);
        try {
            User user = provisioningService.getAccountByEmployeeId(employeeId);
            provisioningService.unlockAccount(user.getId(), actor);
            return ApiResponse.success(null, "Account unlocked successfully");
        } finally {
            if (originalTenant != null) {
                TenantContext.setCurrentTenant(originalTenant);
            }
        }
    }

    @PostMapping("/disable")
    @PreAuthorize("hasAnyRole('ROLE_ULTRA_SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    public ApiResponse<Void> disableAccount(@PathVariable UUID employeeId, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String originalTenant = TenantContext.getCurrentTenant();
        TenantContext.setCurrentTenant(null);
        try {
            User user = provisioningService.getAccountByEmployeeId(employeeId);
            provisioningService.disableAccount(user.getId(), actor);
            return ApiResponse.success(null, "Account disabled successfully");
        } finally {
            if (originalTenant != null) {
                TenantContext.setCurrentTenant(originalTenant);
            }
        }
    }

    @PostMapping("/enable")
    @PreAuthorize("hasAnyRole('ROLE_ULTRA_SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    public ApiResponse<Void> enableAccount(@PathVariable UUID employeeId, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String originalTenant = TenantContext.getCurrentTenant();
        TenantContext.setCurrentTenant(null);
        try {
            User user = provisioningService.getAccountByEmployeeId(employeeId);
            provisioningService.enableAccount(user.getId(), actor);
            return ApiResponse.success(null, "Account enabled successfully");
        } finally {
            if (originalTenant != null) {
                TenantContext.setCurrentTenant(originalTenant);
            }
        }
    }

    @PostMapping("/force-password-change")
    @PreAuthorize("hasAnyRole('ROLE_ULTRA_SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    public ApiResponse<Void> forcePasswordChange(@PathVariable UUID employeeId, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String originalTenant = TenantContext.getCurrentTenant();
        TenantContext.setCurrentTenant(null);
        try {
            User user = provisioningService.getAccountByEmployeeId(employeeId);
            provisioningService.forcePasswordChange(user.getId(), actor);
            return ApiResponse.success(null, "Password change forced successfully");
        } finally {
            if (originalTenant != null) {
                TenantContext.setCurrentTenant(originalTenant);
            }
        }
    }

    @PostMapping("/generate-temp-password")
    @PreAuthorize("hasAnyRole('ROLE_ULTRA_SUPER_ADMIN', 'ROLE_SUPER_ADMIN', 'ROLE_ADMIN')")
    public ApiResponse<Map<String, String>> generateTempPassword(@PathVariable UUID employeeId, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String originalTenant = TenantContext.getCurrentTenant();
        TenantContext.setCurrentTenant(null);
        try {
            User user = provisioningService.getAccountByEmployeeId(employeeId);
            String tempPassword = provisioningService.generateTemporaryPassword(user.getId(), actor);
            return ApiResponse.success(Map.of("tempPassword", tempPassword), "Temporary password generated successfully");
        } finally {
            if (originalTenant != null) {
                TenantContext.setCurrentTenant(originalTenant);
            }
        }
    }
}
