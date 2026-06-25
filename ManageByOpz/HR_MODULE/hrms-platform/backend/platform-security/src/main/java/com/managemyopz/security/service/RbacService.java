package com.managemyopz.security.service;

import com.managemyopz.security.entity.Permission;
import com.managemyopz.security.entity.Role;
import com.managemyopz.security.entity.User;
import com.managemyopz.security.repository.UserRepository;
import com.managemyopz.shared.entity.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Component("rbac")
@RequiredArgsConstructor
public class RbacService {

    private final UserRepository userRepository;
    private final SecurityPlatformService securityPlatformService;

    private static final Map<String, Integer> ROLE_PRIORITIES = Map.of(
            "ROLE_ULTRA_SUPER_ADMIN", 100,
            "ROLE_SUPER_ADMIN", 80,
            "ROLE_ADMIN", 60,
            "ROLE_MANAGER", 40,
            "ROLE_EMPLOYEE", 20
    );

    public boolean hasRole(Authentication auth, String roleCode) {
        if (auth == null || !auth.isAuthenticated()) {
            log.warn("[RBAC] hasRole denied: authentication is null or not authenticated");
            return false;
        }
        boolean result = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(roleCode));
        if (!result) {
            log.debug("[RBAC] hasRole denied: user={} does not have role={}, authorities={}",
                    auth.getName(), roleCode,
                    auth.getAuthorities().stream().map(a -> a.getAuthority()).collect(Collectors.joining(",")));
        }
        return result;
    }

    public boolean hasAnyRole(Authentication auth, String... roleCodes) {
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }
        for (String roleCode : roleCodes) {
            if (hasRole(auth, roleCode)) {
                return true;
            }
        }
        return false;
    }

    @Transactional(readOnly = true)
    public boolean hasPermission(Authentication auth, String permissionKey) {
        if (auth == null || !auth.isAuthenticated()) {
            log.warn("[RBAC] hasPermission denied: authentication is null or not authenticated for permission={}", permissionKey);
            return false;
        }

        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            // Fallback: try finding by email (username may be email)
            userOpt = userRepository.findByEmail(username);
        }
        if (userOpt.isEmpty()) {
            log.warn("[RBAC] hasPermission denied: user not found in DB, username={}, permission={}", username, permissionKey);
            return false;
        }

        User user = userOpt.get();
        // Ultra Super Admin has all permissions
        if (user.getRoles().stream().anyMatch(r -> "ROLE_ULTRA_SUPER_ADMIN".equals(r.getCode()))) {
            log.debug("[RBAC] hasPermission granted: user={} is ULTRA_SUPER_ADMIN (bypass), permission={}", username, permissionKey);
            return true;
        }

        String resolvedKey = permissionKey;
        if ("EMPLOYEE_VIEW".equals(permissionKey)) resolvedKey = "employee:view";
        else if ("EMPLOYEE_EDIT".equals(permissionKey)) resolvedKey = "employee:update";
        else if ("EMPLOYEE_TERMINATE".equals(permissionKey)) resolvedKey = "employee:terminate";
        else if ("EMPLOYEE_ARCHIVE".equals(permissionKey)) resolvedKey = "employee:archive";
        else if ("EMPLOYEE_RESTORE".equals(permissionKey)) resolvedKey = "employee:restore";
        else if ("LEAVE_POLICY_VIEW".equals(permissionKey)) resolvedKey = "leave:view";
        else if ("LEAVE_POLICY_CREATE".equals(permissionKey)) resolvedKey = "leave:edit";
        else if ("LEAVE_POLICY_EDIT".equals(permissionKey)) resolvedKey = "leave:edit";
        else if ("LEAVE_POLICY_DELETE".equals(permissionKey)) resolvedKey = "leave:delete";
        else if ("LEAVE_POLICY_ASSIGN".equals(permissionKey)) resolvedKey = "leave:edit";
        else if ("LEAVE_POLICY_APPROVE".equals(permissionKey)) resolvedKey = "leave:edit";
        else if ("REQUISITION_CREATE".equals(permissionKey)) resolvedKey = "recruitment:create";
        else if ("REQUISITION_VIEW".equals(permissionKey)) resolvedKey = "recruitment:view";
        else if ("REQUISITION_EDIT".equals(permissionKey)) resolvedKey = "recruitment:edit";
        else if ("REQUISITION_DELETE".equals(permissionKey)) resolvedKey = "recruitment:delete";
        else if ("REQUISITION_APPROVE".equals(permissionKey)) resolvedKey = "recruitment:approve";

        final String finalKey = resolvedKey;
        String pageCode = "EMPLOYEE_DIRECTORY";
        String actionCode = "VIEW";

        if (finalKey.contains(":")) {
            String[] parts = finalKey.split(":");
            String part1 = parts[0].toUpperCase();
            String part2 = parts[1].toUpperCase();

            switch (part1) {
                case "EMPLOYEE":
                case "EMPLOYEE_DIRECTORY":
                    pageCode = "EMPLOYEE_DIRECTORY";
                    break;
                case "LEAVE":
                case "LEAVE_MANAGEMENT":
                    pageCode = "LEAVE_MANAGEMENT";
                    break;
                case "APPROVAL":
                case "APPROVALS":
                case "MY_APPROVALS":
                    pageCode = "MY_APPROVALS";
                    break;
                case "RECOGNITION":
                case "RECOGNITION_PAGE":
                    pageCode = "RECOGNITION_PAGE";
                    break;
                case "ORG":
                case "ORG-DNA":
                case "ORG_DNA":
                case "ORG_DNA_PAGE":
                    pageCode = "ORG_DNA_PAGE";
                    break;
                case "ONBOARDING":
                case "ONBOARDING_PAGE":
                    pageCode = "ONBOARDING_PAGE";
                    break;
                case "ANALYTICS":
                case "ANALYTICS_PAGE":
                    pageCode = "ANALYTICS_PAGE";
                    break;
                case "RECRUITMENT":
                case "REQUISITION":
                    pageCode = "RECRUITMENT";
                    break;
                default:
                    pageCode = part1;
                    break;
            }

            if ("UPDATE".equals(part2) || "EDIT".equals(part2) || "TRANSFER".equals(part2) || "PROMOTE".equals(part2)) {
                actionCode = "EDIT";
            } else if ("TERMINATE".equals(part2) || "DELETE".equals(part2)) {
                actionCode = "DELETE";
            } else {
                actionCode = part2;
            }
        }

        boolean hasIt = securityPlatformService.hasPermission(user.getId(), pageCode, actionCode);
        if (!hasIt) {
            log.warn("[RBAC] hasPermission denied: user={}, role={}, requiredPermission={}:{}({})",
                    username, user.getRoles().stream().map(Role::getCode).collect(Collectors.joining(",")),
                    pageCode, actionCode, permissionKey);
            throw new org.springframework.security.access.AccessDeniedException("Missing permission: " + permissionKey);
        } else {
            log.debug("[RBAC] hasPermission granted: user={}, pageCode={}, actionCode={}", username, pageCode, actionCode);
        }
        return hasIt;
    }

    public boolean hasMinimumRole(Authentication auth, String minimumRoleCode) {
        if (auth == null || !auth.isAuthenticated()) {
            log.warn("[RBAC] hasMinimumRole denied: authentication is null or not authenticated for minimumRole={}", minimumRoleCode);
            return false;
        }

        // Get highest priority of user's roles
        int userPriority = auth.getAuthorities().stream()
                .map(a -> ROLE_PRIORITIES.getOrDefault(a.getAuthority(), 0))
                .max(Integer::compareTo)
                .orElse(0);

        int minPriority = ROLE_PRIORITIES.getOrDefault(minimumRoleCode, 0);
        boolean result = userPriority >= minPriority;
        if (!result) {
            log.warn("[RBAC] hasMinimumRole denied: user={}, authorities={}, userPriority={}, requiredMinimum={} (priority={})",
                    auth.getName(),
                    auth.getAuthorities().stream().map(a -> a.getAuthority()).collect(Collectors.joining(",")),
                    userPriority, minimumRoleCode, minPriority);
            throw new org.springframework.security.access.AccessDeniedException("Requires minimum role: " + minimumRoleCode);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public boolean isSelf(Authentication auth, String employeeId) {
        if (auth == null || !auth.isAuthenticated() || employeeId == null) {
            log.warn("[RBAC] isSelf denied: auth={}, employeeId={}", auth != null ? auth.getName() : "null", employeeId);
            return false;
        }
        String username = auth.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            // Fallback: try finding by email
            userOpt = userRepository.findByEmail(username);
        }
        if (userOpt.isEmpty()) {
            log.warn("[RBAC] isSelf denied: user not found in DB, username={}, employeeId={}", username, employeeId);
            return false;
        }
        User user = userOpt.get();
        boolean result = employeeId.equalsIgnoreCase(user.getEmployeeId());
        if (!result) {
            log.warn("[RBAC] isSelf denied: user={}, user.employeeId={}, requestedEmployeeId={} (mismatch)",
                    username, user.getEmployeeId(), employeeId);
        } else {
            log.debug("[RBAC] isSelf granted: user={}, employeeId={}", username, employeeId);
        }
        return result;
    }

    /**
     * Checks if tenant isolation is violated.
     * Ultra Super Admin can access all tenants.
     * Super Admin and Admin can only access their own tenant.
     * Employee can only access their own record.
     */
    public boolean validateTenantAccess(Authentication auth, String requestTenantId) {
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        // Ultra Super Admin is bypass tenant isolation
        if (hasRole(auth, "ROLE_ULTRA_SUPER_ADMIN")) {
            return true;
        }

        // Check if tenant match
        String currentTenant = TenantContext.getCurrentTenant();
        return currentTenant != null && currentTenant.equals(requestTenantId);
    }
}
