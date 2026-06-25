package com.managemyopz.security.controller;

import com.managemyopz.audit.entity.AuditLog;
import com.managemyopz.audit.service.AuditService;
import com.managemyopz.security.entity.Permission;
import com.managemyopz.security.entity.Role;
import com.managemyopz.security.entity.User;
import com.managemyopz.security.repository.UserRepository;
import com.managemyopz.security.service.JwtService;
import com.managemyopz.shared.entity.TenantContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditService auditService;
    private final HttpServletRequest request;
    private final com.managemyopz.security.service.UserProvisioningService userProvisioningService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        String email = req.getEmail();
        String password = req.getPassword();
        String ipAddress = getClientIp(request);

        log.debug("Login attempt for email: {} from IP: {}", email, ipAddress);

        // Temporarily clear tenant context to allow global user lookup during login
        String originalTenant = TenantContext.getCurrentTenant();
        TenantContext.setCurrentTenant(null);
        Optional<User> userOpt;
        try {
            userOpt = userRepository.findByEmail(email);
            if (userOpt.isEmpty()) {
                // Fallback to username check
                userOpt = userRepository.findByUsername(email);
            }
        } finally {
            if (originalTenant != null) {
                TenantContext.setCurrentTenant(originalTenant);
            }
        }

        if (userOpt.isEmpty()) {
            log.warn("Login failed: User not found for email: {}", email);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Invalid email or password"
            ));
        }

        User user = userOpt.get();

        // Check account lock/status
        if ("LOCKED".equals(user.getStatus()) || user.isLocked()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "User account is locked. Please contact HR."
            ));
        }

        if ("DISABLED".equals(user.getStatus()) || !user.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "User account is disabled."
            ));
        }

        if ("PENDING_ACTIVATION".equals(user.getStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                    "success", false,
                    "message", "User account is pending activation. Please activate your account first."
            ));
        }

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= 5) {
                user.setStatus("LOCKED");
                user.setLocked(true);
                userRepository.save(user);

                auditService.recordAudit(
                        user.getTenantId(),
                        "SECURITY",
                        "USER",
                        user.getId().toString(),
                        AuditLog.AuditAction.ACCOUNT_LOCKED,
                        null,
                        Map.of("email", user.getEmail(), "reason", "Max failed attempts"),
                        null,
                        "system",
                        "SYSTEM"
                );

                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "success", false,
                        "message", "Account locked due to 5 consecutive failed login attempts."
                ));
            }
            userRepository.save(user);

            log.warn("Failed login attempt for email: {}", email);
            auditService.recordAudit(
                    user.getTenantId(),
                    "SECURITY",
                    "USER",
                    user.getId().toString(),
                    AuditLog.AuditAction.LOGIN_FAILED,
                    null,
                    Map.of("email", email != null ? email : "", "ip", ipAddress, "reason", "Invalid credentials", "attempts", attempts),
                    null,
                    email != null ? email : "unknown",
                    "GUEST"
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Invalid email or password"
            ));
        }

        // Reset attempts
        user.setFailedLoginAttempts(0);
        userRepository.save(user);

        // Bind the current thread-local context to the logged-in user's tenant ID
        TenantContext.setCurrentTenant(user.getTenantId());

        // Extract Role Code and Permissions
        String roleCode = "ROLE_EMPLOYEE";
        List<String> permissions = new ArrayList<>();
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            // Find highest role or first role
            Role primaryRole = user.getRoles().iterator().next();
            roleCode = primaryRole.getCode();
            
            // Collect all permissions across roles
            for (Role role : user.getRoles()) {
                if (role.getPermissions() != null) {
                    permissions.addAll(role.getPermissions().stream()
                            .map(Permission::getName)
                            .toList());
                }
            }
        }

        // Generate Tokens
        String userIdStr = user.getId().toString();
        String tenantId = user.getTenantId();
        String accessToken = jwtService.generateToken(userIdStr, user.getEmail(), tenantId, roleCode, permissions);
        String refreshToken = jwtService.generateRefreshToken(user.getUsername(), tenantId);

        // Update last login
        user.setLastLoginAt(Instant.now());
        user.setLastLoginIp(ipAddress);
        userRepository.save(user);

        // Audit Logging
        auditService.recordAudit(
                tenantId,
                "SECURITY",
                "USER",
                userIdStr,
                AuditLog.AuditAction.LOGIN_SUCCESS,
                null,
                Map.of("email", user.getEmail(), "ip", ipAddress),
                null,
                user.getEmail(),
                roleCode
        );

        String fullName = (user.getFirstName() != null ? user.getFirstName() : "") + " " + 
                          (user.getLastName() != null ? user.getLastName() : "");
        fullName = fullName.trim();
        if (fullName.isEmpty()) {
            fullName = user.getUsername();
        }

        UserDto userDto = new UserDto();
        userDto.setId(userIdStr);
        userDto.setName(fullName);
        userDto.setEmail(user.getEmail());
        userDto.setRole(roleCode);
        userDto.setTenantId(tenantId);
        userDto.setPermissions(permissions);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "accessToken", accessToken,
                "refreshToken", refreshToken,
                "user", userDto
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody RefreshRequest req) {
        String refreshToken = req.getRefreshToken();
        if (refreshToken == null || !jwtService.isTokenValid(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Invalid refresh token"
            ));
        }

        String username = jwtService.extractUsername(refreshToken);
        String tenantId = jwtService.extractTenantId(refreshToken);

        // Scope the database query to the user's actual tenant from the token
        TenantContext.setCurrentTenant(tenantId);

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(username);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "User not found"
            ));
        }

        User user = userOpt.get();
        String roleCode = "ROLE_EMPLOYEE";
        List<String> permissions = new ArrayList<>();
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            Role primaryRole = user.getRoles().iterator().next();
            roleCode = primaryRole.getCode();
            for (Role role : user.getRoles()) {
                if (role.getPermissions() != null) {
                    permissions.addAll(role.getPermissions().stream()
                            .map(Permission::getName)
                            .toList());
                }
            }
        }

        // Token rotation: generate new access & refresh tokens
        String userIdStr = user.getId().toString();
        String newAccessToken = jwtService.generateToken(userIdStr, user.getEmail(), tenantId, roleCode, permissions);
        String newRefreshToken = jwtService.generateRefreshToken(user.getUsername(), tenantId);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "accessToken", newAccessToken,
                "refreshToken", newRefreshToken
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(Principal principal) {
        String ipAddress = getClientIp(request);
        String username = principal != null ? principal.getName() : "system";

        log.debug("Logout request for user: {} from IP: {}", username, ipAddress);

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(username);
        }

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String roleCode = "ROLE_EMPLOYEE";
            if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                roleCode = user.getRoles().iterator().next().getCode();
            }

            auditService.recordAudit(
                    user.getTenantId(),
                    "SECURITY",
                    "USER",
                    user.getId().toString(),
                    AuditLog.AuditAction.LOGOUT,
                    null,
                    Map.of("email", user.getEmail(), "ip", ipAddress),
                    null,
                    user.getEmail(),
                    roleCode
            );
        } else {
            auditService.recordAudit(
                    "SYSTEM",
                    "SECURITY",
                    "USER",
                    null,
                    AuditLog.AuditAction.LOGOUT,
                    null,
                    Map.of("username", username, "ip", ipAddress),
                    null,
                    username,
                    "UNKNOWN"
            );
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Logged out successfully"
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "success", false,
                    "message", "Not authenticated"
            ));
        }

        String username = principal.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(username);
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", "User not found"
            ));
        }

        User user = userOpt.get();
        String roleCode = "ROLE_EMPLOYEE";
        List<String> permissions = new ArrayList<>();
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            Role primaryRole = user.getRoles().iterator().next();
            roleCode = primaryRole.getCode();
            for (Role r : user.getRoles()) {
                if (r.getPermissions() != null) {
                    permissions.addAll(r.getPermissions().stream()
                            .map(Permission::getName)
                            .toList());
                }
            }
        }

        String fullName = (user.getFirstName() != null ? user.getFirstName() : "") + " " + 
                          (user.getLastName() != null ? user.getLastName() : "");
        fullName = fullName.trim();
        if (fullName.isEmpty()) {
            fullName = user.getUsername();
        }

        UserDto userDto = new UserDto();
        userDto.setId(user.getId().toString());
        userDto.setName(fullName);
        userDto.setEmail(user.getEmail());
        userDto.setRole(roleCode);
        userDto.setTenantId(user.getTenantId());
        userDto.setPermissions(permissions);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "user", userDto
        ));
    }

    @PostMapping("/activate")
    public ResponseEntity<?> activate(@RequestBody ActivateRequest req) {
        String originalTenant = TenantContext.getCurrentTenant();
        TenantContext.setCurrentTenant(null);
        try {
            userProvisioningService.activateAccount(req.getToken(), req.getPassword());
            return ResponseEntity.ok(Map.of("success", true, "message", "Account activated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } finally {
            if (originalTenant != null) {
                TenantContext.setCurrentTenant(originalTenant);
            }
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        String originalTenant = TenantContext.getCurrentTenant();
        TenantContext.setCurrentTenant(null);
        try {
            userProvisioningService.forgotPassword(req.getEmail());
            return ResponseEntity.ok(Map.of("success", true, "message", "Password reset email sent successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } finally {
            if (originalTenant != null) {
                TenantContext.setCurrentTenant(originalTenant);
            }
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        String originalTenant = TenantContext.getCurrentTenant();
        TenantContext.setCurrentTenant(null);
        try {
            userProvisioningService.resetPassword(req.getToken(), req.getPassword());
            return ResponseEntity.ok(Map.of("success", true, "message", "Password reset successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } finally {
            if (originalTenant != null) {
                TenantContext.setCurrentTenant(originalTenant);
            }
        }
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshRequest req) {
        return refresh(req);
    }

    private String getClientIp(HttpServletRequest req) {
        String xfHeader = req.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return req.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class RefreshRequest {
        private String refreshToken;
    }

    @Data
    public static class ActivateRequest {
        private String token;
        private String password;
    }

    @Data
    public static class ForgotPasswordRequest {
        private String email;
    }

    @Data
    public static class ResetPasswordRequest {
        private String token;
        private String password;
    }

    @Data
    public static class UserDto {
        private String id;
        private String name;
        private String email;
        private String role;
        private String tenantId;
        private List<String> permissions;
    }
}
