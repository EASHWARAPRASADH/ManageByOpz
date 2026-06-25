package com.managemyopz.security.controller;

import com.managemyopz.security.entity.*;
import com.managemyopz.security.dto.*;
import com.managemyopz.security.repository.*;
import com.managemyopz.security.service.JwtService;
import com.managemyopz.security.service.SecurityPlatformService;
import com.managemyopz.shared.dto.ApiResponse;
import com.managemyopz.shared.entity.TenantContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.*;

@Slf4j
@RestController
@RequestMapping("/v1/security")
@RequiredArgsConstructor
public class SecurityController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final SecurityModuleRepository moduleRepository;
    private final SecurityPageRepository pageRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserPermissionRepository userPermissionRepository;
    private final FieldPermissionRepository fieldPermissionRepository;
    private final SecurityAuditLogRepository auditLogRepository;
    private final SecurityPlatformService securityPlatformService;

    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ApplicationEventPublisher eventPublisher;
    private final com.managemyopz.security.service.UserProvisioningService userProvisioningService;
    private final HttpServletRequest servletRequest;

    private final com.managemyopz.security.service.RoleService roleService;
    private final com.managemyopz.security.service.DataScopeService dataScopeService;
    private final com.managemyopz.security.service.FieldSecurityService fieldSecurityService;

    @GetMapping("/my-navigation")
    public ApiResponse<Map<String, Object>> getMyNavigation(Principal principal) {
        if (principal == null) {
            return ApiResponse.error(401, "Not authenticated");
        }
        return ApiResponse.success(securityPlatformService.getNavigationForUser(principal.getName()));
    }

    @GetMapping("/modules")
    public ApiResponse<List<SecurityModule>> listModules() {
        return ApiResponse.success(moduleRepository.findAll());
    }

    @GetMapping("/pages")
    public ApiResponse<List<SecurityPage>> listPages() {
        return ApiResponse.success(pageRepository.findAll());
    }

    @GetMapping("/matrix")
    public ApiResponse<Map<String, Object>> getPermissionMatrix() {
        Map<String, Object> response = new HashMap<>();
        response.put("roles", roleRepository.findAll());
        response.put("users", userRepository.findAll());
        response.put("pages", pageRepository.findAll());
        response.put("permissions", permissionRepository.findAll());
        response.put("rolePermissions", rolePermissionRepository.findAll());
        response.put("userPermissions", userPermissionRepository.findAll());
        return ApiResponse.success(response);
    }

    @PostMapping("/matrix")
    public ApiResponse<Void> updateMatrix(@RequestBody MatrixUpdateRequest req, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String ip = getClientIp(servletRequest);
        securityPlatformService.updatePermissionMatrix(req, actor, ip);
        return ApiResponse.success(null, "Matrix updated successfully");
    }

    @GetMapping("/field-permissions")
    public ApiResponse<List<FieldPermission>> getFieldPermissions() {
        return ApiResponse.success(fieldSecurityService.getAllFieldPermissions());
    }

    @PostMapping("/field-permissions")
    public ApiResponse<FieldPermission> saveFieldPermission(@RequestBody FieldPermission req, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        FieldPermission saved = fieldSecurityService.saveFieldPermission(req, actor);
        return ApiResponse.success(saved, "Field permission saved successfully");
    }

    // Role CRUD endpoints
    @PostMapping("/roles")
    public ApiResponse<Role> createRole(@RequestBody CreateRoleRequest req, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String tenant = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "ACME";
        Role role = roleService.createCustomRole(req.getName(), req.getDescription(), req.getBaseRoleCode(), tenant, actor);
        return ApiResponse.success(role, "Role created successfully");
    }

    @PostMapping("/roles/{id}/clone")
    public ApiResponse<Role> cloneRole(@PathVariable UUID id, @RequestBody CloneRoleRequest req, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String tenant = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "ACME";
        Role role = roleService.cloneRole(id, req.getName(), req.getDescription(), tenant, actor);
        return ApiResponse.success(role, "Role cloned successfully");
    }

    @PutMapping("/roles/{id}/archive")
    public ApiResponse<Void> archiveRole(@PathVariable UUID id, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String tenant = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "ACME";
        roleService.archiveRole(id, tenant, actor);
        return ApiResponse.success(null, "Role archived successfully");
    }

    // Data Scope endpoints
    @GetMapping("/data-scopes")
    public ApiResponse<List<DataScopeRule>> listDataScopes() {
        return ApiResponse.success(dataScopeService.getAllDataScopeRules());
    }

    @PostMapping("/data-scopes")
    public ApiResponse<DataScopeRule> saveDataScope(@RequestBody DataScopeRule req, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        DataScopeRule saved = dataScopeService.saveDataScopeRule(req, actor);
        return ApiResponse.success(saved, "Data scope rule saved successfully");
    }

    @DeleteMapping("/data-scopes/{id}")
    public ApiResponse<Void> deleteDataScope(@PathVariable UUID id, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        dataScopeService.deleteDataScopeRule(id, actor);
        return ApiResponse.success(null, "Data scope rule deleted successfully");
    }

    @GetMapping("/audit")
    public ApiResponse<List<SecurityAuditLog>> getAuditLogs() {
        return ApiResponse.success(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    @PostMapping("/templates/apply")
    public ApiResponse<Void> applyTemplate(@RequestBody TemplateApplyRequest req, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String ip = getClientIp(servletRequest);
        securityPlatformService.applyPermissionTemplate(req, actor, ip);
        return ApiResponse.success(null, "Template applied successfully");
    }

    // Existing User Management & Provisioning Endpoints
    @GetMapping("/users")
    public ApiResponse<List<User>> listUsers() {
        return ApiResponse.success(userRepository.findAll());
    }

    @GetMapping("/users/{id}")
    public ApiResponse<User> getUserById(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ApiResponse.success(user);
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<User> createUser(@RequestBody UserCreationRequest req, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        String tenant = TenantContext.getCurrentTenant() != null ? TenantContext.getCurrentTenant() : "default";

        User user = new User();
        user.setTenantId(tenant);
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword() != null ? req.getPassword() : "Password123!"));
        user.setFirstName(req.getFirstName());
        user.setLastName(req.getLastName());
        user.setEmployeeId(req.getEmployeeId());
        user.setActive(true);

        if (req.getRoleCodes() != null) {
            Set<Role> roles = new HashSet<>();
            for (String roleCode : req.getRoleCodes()) {
                roleRepository.findByCode(roleCode).ifPresent(roles::add);
            }
            user.setRoles(roles);
        }

        User savedUser = userRepository.save(user);

        return ApiResponse.created(savedUser, "User created successfully");
    }

    @PostMapping("/users/{userId}/roles")
    public ApiResponse<User> assignRole(@PathVariable UUID userId, @RequestBody RoleAssignmentRequest req, Principal principal) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Role role = roleRepository.findByCode(req.getRoleCode())
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));

        user.getRoles().add(role);
        User savedUser = userRepository.save(user);

        return ApiResponse.success(savedUser, "Role assigned successfully");
    }

    @DeleteMapping("/users/{userId}/roles/{roleId}")
    public ApiResponse<User> revokeRole(@PathVariable UUID userId, @PathVariable UUID roleId, Principal principal) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));

        user.getRoles().remove(role);
        User savedUser = userRepository.save(user);

        return ApiResponse.success(savedUser, "Role revoked successfully");
    }

    @GetMapping("/roles")
    public ApiResponse<List<Role>> listRoles() {
        return ApiResponse.success(roleRepository.findAll());
    }

    @GetMapping("/permissions")
    public ApiResponse<List<Permission>> listPermissions() {
        return ApiResponse.success(permissionRepository.findAll());
    }

    @PostMapping("/auth/token")
    public ApiResponse<TokenResponse> generateToken(@RequestBody TokenRequest req) {
        String username = req.getUsername() != null ? req.getUsername() : "test-admin";
        String tenantId = req.getTenantId() != null ? req.getTenantId() : "default";
        String role = req.getRole() != null ? req.getRole() : "ROLE_ADMIN";
        String employeeId = req.getEmployeeId();

        String token = jwtService.generateToken(username, tenantId, role, employeeId);
        TokenResponse response = new TokenResponse();
        response.setToken(token);
        response.setUsername(username);
        response.setTenantId(tenantId);
        response.setRole(role);
        response.setEmployeeId(employeeId);

        return ApiResponse.success(response, "Token generated successfully");
    }

    @PutMapping("/users/{id}/lock")
    public ApiResponse<Void> lockUser(@PathVariable UUID id, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        userProvisioningService.lockAccount(id, actor);
        return ApiResponse.success(null, "User locked successfully");
    }

    @PutMapping("/users/{id}/unlock")
    public ApiResponse<Void> unlockUser(@PathVariable UUID id, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        userProvisioningService.unlockAccount(id, actor);
        return ApiResponse.success(null, "User unlocked successfully");
    }

    @PutMapping("/users/{id}/reset-password")
    public ApiResponse<Void> resetUserPassword(@PathVariable UUID id, @RequestBody AdminPasswordResetRequest req, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        userProvisioningService.forcePasswordReset(id, req.getPassword(), actor);
        return ApiResponse.success(null, "User password reset forced successfully");
    }

    @PostMapping("/users/{id}/resend-activation")
    public ApiResponse<Void> resendActivation(@PathVariable UUID id, Principal principal) {
        String actor = principal != null ? principal.getName() : "system";
        userProvisioningService.resendActivationEmail(id, actor);
        return ApiResponse.success(null, "Activation email resent successfully");
    }

    private String getClientIp(HttpServletRequest req) {
        String xfHeader = req.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return req.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    @Data
    public static class AdminPasswordResetRequest {
        private String password;
    }

    @Data
    public static class UserCreationRequest {
        private String username;
        private String email;
        private String password;
        private String firstName;
        private String lastName;
        private String employeeId;
        private List<String> roleCodes;
    }

    @Data
    public static class RoleAssignmentRequest {
        private String roleCode;
    }

    @Data
    public static class TokenRequest {
        private String username;
        private String tenantId;
        private String role;
        private String employeeId;
    }

    @Data
    public static class TokenResponse {
        private String token;
        private String username;
        private String tenantId;
        private String role;
        private String employeeId;
    }

    @Data
    public static class CreateRoleRequest {
        private String name;
        private String description;
        private String baseRoleCode;
    }

    @Data
    public static class CloneRoleRequest {
        private String name;
        private String description;
    }
}
