package com.managemyopz.security.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.managemyopz.security.entity.*;
import com.managemyopz.security.repository.*;
import com.managemyopz.security.dto.*;
import com.managemyopz.shared.entity.TenantContext;
import com.managemyopz.shared.exception.PlatformException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SecurityPlatformService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final SecurityModuleRepository moduleRepository;
    private final SecurityPageRepository pageRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserPermissionRepository userPermissionRepository;
    private final FieldPermissionRepository fieldPermissionRepository;
    private final SecurityAuditLogRepository auditLogRepository;
    private final SecurityCacheService cacheService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Checks if a user has access to a specific page action permission.
     */
    @Transactional(readOnly = true)
    public boolean hasPermission(UUID userId, String pageCode, String permissionCode) {
        // Retrieve from cache if present
        String cacheKey = "perms:" + userId + ":" + pageCode + ":" + permissionCode;
        String cachedVal = cacheService.get(cacheKey);
        if (cachedVal != null) {
            return Boolean.parseBoolean(cachedVal);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new PlatformException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

        // Ultra Super Admin has global bypass
        if (user.getRoles().stream().anyMatch(r -> "ROLE_ULTRA_SUPER_ADMIN".equals(r.getCode()))) {
            cacheService.put(cacheKey, "true", Duration.ofMinutes(5));
            return true;
        }

        // 1. Check User-specific overrides
        List<UserPermission> userOverrides = userPermissionRepository.findByUserId(userId);
        Optional<UserPermission> overrideOpt = userOverrides.stream()
                .filter(up -> up.getPage().getPageCode().equalsIgnoreCase(pageCode) &&
                        up.getPermission().getName().equalsIgnoreCase(permissionCode))
                .findFirst();

        if (overrideOpt.isPresent()) {
            boolean allowed = overrideOpt.get().isAllow();
            cacheService.put(cacheKey, String.valueOf(allowed), Duration.ofMinutes(5));
            return allowed;
        }

        // 2. Check Role-level permissions
        boolean hasRolePermission = false;
        for (Role role : user.getRoles()) {
            List<RolePermission> rolePerms = rolePermissionRepository.findByRoleId(role.getId());
            boolean matches = rolePerms.stream()
                    .anyMatch(rp -> rp.getPage().getPageCode().equalsIgnoreCase(pageCode) &&
                            rp.getPermission().getName().equalsIgnoreCase(permissionCode));
            if (matches) {
                hasRolePermission = true;
                break;
            }
        }

        cacheService.put(cacheKey, String.valueOf(hasRolePermission), Duration.ofMinutes(5));
        return hasRolePermission;
    }

    /**
     * Returns dynamic navigation menu for current user.
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getNavigationForUser(String username) {
        // Clear tenant context temporarily if needed, but here we assume user is already authenticated
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.findByEmail(username)
                        .orElseThrow(() -> new PlatformException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND")));

        List<SecurityModule> allModules = moduleRepository.findAll().stream()
                .filter(SecurityModule::isActive)
                .sorted(Comparator.comparingInt(SecurityModule::getDisplayOrder))
                .toList();

        List<SecurityPage> allPages = pageRepository.findAll().stream()
                .filter(SecurityPage::isActive)
                .sorted(Comparator.comparingInt(SecurityPage::getDisplayOrder))
                .toList();

        List<Map<String, Object>> allowedModules = new ArrayList<>();

        for (SecurityModule module : allModules) {
            List<Map<String, Object>> allowedPages = new ArrayList<>();
            List<SecurityPage> modulePages = allPages.stream()
                    .filter(p -> p.getModule().getId().equals(module.getId()))
                    .toList();

            for (SecurityPage page : modulePages) {
                // If user is Ultra Super Admin, or has VIEW permission on this page, include it
                if (user.getRoles().stream().anyMatch(r -> "ROLE_ULTRA_SUPER_ADMIN".equals(r.getCode())) ||
                        hasPermission(user.getId(), page.getPageCode(), "VIEW")) {
                    
                    // Fetch list of action permissions user has on this page
                    List<String> pageActions = new ArrayList<>();
                    List<Permission> allActions = permissionRepository.findAll();
                    for (Permission perm : allActions) {
                        if (hasPermission(user.getId(), page.getPageCode(), perm.getName())) {
                            pageActions.add(perm.getName());
                        }
                    }

                    Map<String, Object> pageMap = new HashMap<>();
                    pageMap.put("id", page.getId().toString());
                    pageMap.put("pageCode", page.getPageCode());
                    pageMap.put("pageName", page.getPageName());
                    pageMap.put("routePath", page.getRoutePath());
                    pageMap.put("componentName", page.getComponentName());
                    pageMap.put("menuVisible", page.isMenuVisible());
                    pageMap.put("actions", pageActions);
                    allowedPages.add(pageMap);
                }
            }

            // Only add module if it contains allowed pages
            if (!allowedPages.isEmpty()) {
                Map<String, Object> moduleMap = new HashMap<>();
                moduleMap.put("id", module.getId().toString());
                moduleMap.put("moduleCode", module.getModuleCode());
                moduleMap.put("moduleName", module.getModuleName());
                moduleMap.put("icon", module.getIcon());
                moduleMap.put("pages", allowedPages);
                allowedModules.add(moduleMap);
            }
        }

        Map<String, Object> navData = new HashMap<>();
        navData.put("modules", allowedModules);
        return navData;
    }

    /**
     * Updates permission matrix. Supports Role-level assignments and User-specific overrides.
     */
    @Transactional
    public void updatePermissionMatrix(MatrixUpdateRequest req, String actorUsername, String ipAddress) {
        User actor = userRepository.findByUsername(actorUsername)
                .orElseGet(() -> userRepository.findByEmail(actorUsername)
                        .orElseThrow(() -> new PlatformException("Actor not found", HttpStatus.NOT_FOUND, "ACTOR_NOT_FOUND")));

        SecurityPage page = pageRepository.findById(req.getPageId())
                .orElseThrow(() -> new PlatformException("Page not found", HttpStatus.NOT_FOUND, "PAGE_NOT_FOUND"));

        Permission permission = permissionRepository.findById(req.getPermissionId())
                .orElseThrow(() -> new PlatformException("Permission not found", HttpStatus.NOT_FOUND, "PERMISSION_NOT_FOUND"));

        if (req.getTargetType().equalsIgnoreCase("ROLE")) {
            Role role = roleRepository.findById(req.getTargetId())
                    .orElseThrow(() -> new PlatformException("Role not found", HttpStatus.NOT_FOUND, "ROLE_NOT_FOUND"));

            RolePermissionId rpId = new RolePermissionId(role.getId(), page.getId(), permission.getId());
            Optional<RolePermission> existing = rolePermissionRepository.findById(rpId);

            if (req.isAllow()) {
                if (existing.isEmpty()) {
                    RolePermission rp = new RolePermission(role, page, permission);
                    rolePermissionRepository.save(rp);
                    logSecurityAudit(actor, "ROLE", role.getId(), "ADD", null, "Assigned permission " + permission.getName() + " on page " + page.getPageCode(), ipAddress);
                }
            } else {
                if (existing.isPresent()) {
                    rolePermissionRepository.delete(existing.get());
                    logSecurityAudit(actor, "ROLE", role.getId(), "REMOVE", "Assigned permission " + permission.getName() + " on page " + page.getPageCode(), null, ipAddress);
                }
            }
            // Evict role related cache entries
            evictCacheForRole(role.getId());

        } else if (req.getTargetType().equalsIgnoreCase("USER")) {
            User targetUser = userRepository.findById(req.getTargetId())
                    .orElseThrow(() -> new PlatformException("User not found", HttpStatus.NOT_FOUND, "USER_NOT_FOUND"));

            UserPermissionId upId = new UserPermissionId(targetUser.getId(), page.getId(), permission.getId());
            Optional<UserPermission> existing = userPermissionRepository.findById(upId);

            String oldVal = existing.map(up -> String.valueOf(up.isAllow())).orElse("NONE");
            String newVal = String.valueOf(req.isAllow());

            if (existing.isPresent()) {
                existing.get().setAllow(req.isAllow());
                userPermissionRepository.save(existing.get());
            } else {
                UserPermission up = new UserPermission(targetUser, page, permission, req.isAllow());
                userPermissionRepository.save(up);
            }

            logSecurityAudit(actor, "USER", targetUser.getId(), "UPDATE", oldVal, newVal, ipAddress);
            // Evict target user cache entries
            evictCacheForUser(targetUser.getId());
        }
    }

    /**
     * Applies permission templates (Phase 7).
     */
    @Transactional
    public void applyPermissionTemplate(TemplateApplyRequest req, String actorUsername, String ipAddress) {
        User actor = userRepository.findByUsername(actorUsername)
                .orElseGet(() -> userRepository.findByEmail(actorUsername)
                        .orElseThrow(() -> new PlatformException("Actor not found", HttpStatus.NOT_FOUND, "ACTOR_NOT_FOUND")));

        Role role = roleRepository.findById(req.getRoleId())
                .orElseThrow(() -> new PlatformException("Role not found", HttpStatus.NOT_FOUND, "ROLE_NOT_FOUND"));

        // Clear existing role permissions
        rolePermissionRepository.deleteByRoleId(role.getId());

        List<SecurityPage> pages = pageRepository.findAll();
        List<Permission> perms = permissionRepository.findAll();

        if (req.getTemplateCode().equalsIgnoreCase("STANDARD_EMPLOYEE")) {
            // Employee gets view permissions on Dashboard, directory, approvals, leave, recognition
            for (SecurityPage p : pages) {
                if (p.getPageCode().matches("DASHBOARD_PAGE|EMPLOYEE_DIRECTORY|MY_APPROVALS|LEAVE_MANAGEMENT|RECOGNITION_PAGE")) {
                    perms.stream().filter(pm -> pm.getName().equals("VIEW"))
                            .findFirst().ifPresent(pm -> rolePermissionRepository.save(new RolePermission(role, p, pm)));
                }
            }
        } else if (req.getTemplateCode().equalsIgnoreCase("MANAGER")) {
            // Manager gets VIEW on everything, plus APPROVE/REJECT on approvals/leave, and CREATE/EDIT on leave/recognition
            for (SecurityPage p : pages) {
                perms.stream().filter(pm -> pm.getName().equals("VIEW"))
                        .findFirst().ifPresent(pm -> rolePermissionRepository.save(new RolePermission(role, p, pm)));
                
                if (p.getPageCode().matches("MY_APPROVALS|LEAVE_MANAGEMENT")) {
                    perms.stream().filter(pm -> pm.getName().matches("APPROVE|REJECT|CREATE|EDIT"))
                            .forEach(pm -> rolePermissionRepository.save(new RolePermission(role, p, pm)));
                }
            }
        } else if (req.getTemplateCode().equalsIgnoreCase("HR_ADMIN")) {
            // HR Admin gets all permissions on Dashboard, employee, org dna, leave, approvals, recognition
            for (SecurityPage p : pages) {
                if (!p.getPageCode().equals("SYSTEM_CONFIG")) {
                    perms.forEach(pm -> rolePermissionRepository.save(new RolePermission(role, p, pm)));
                }
            }
        }

        logSecurityAudit(actor, "ROLE", role.getId(), "TEMPLATE_APPLIED", null, req.getTemplateCode(), ipAddress);
        evictCacheForRole(role.getId());
    }

    /**
     * Logs permission and access control security events.
     */
    private void logSecurityAudit(User actor, String targetType, UUID targetId, String actionType, String oldValue, String newValue, String ipAddress) {
        SecurityAuditLog logEntry = new SecurityAuditLog();
        logEntry.setChangedBy(actor);
        logEntry.setTargetType(targetType);
        logEntry.setTargetId(targetId);
        logEntry.setActionType(actionType);
        logEntry.setOldValue(oldValue);
        logEntry.setNewValue(newValue);
        logEntry.setIpAddress(ipAddress);
        logEntry.setTenantId(actor.getTenantId());
        auditLogRepository.save(logEntry);
    }

    private void evictCacheForUser(UUID userId) {
        List<SecurityPage> pages = pageRepository.findAll();
        List<Permission> perms = permissionRepository.findAll();
        for (SecurityPage p : pages) {
            for (Permission pm : perms) {
                cacheService.evict("perms:" + userId + ":" + p.getPageCode() + ":" + pm.getName());
            }
        }
    }

    private void evictCacheForRole(UUID roleId) {
        // Evict all permissions for all users having this role
        userRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getId().equals(roleId)))
                .forEach(u -> evictCacheForUser(u.getId()));
    }
}
