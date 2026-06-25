package com.managemyopz.ticketing.controller;

import com.managemyopz.ticketing.dto.ApiResponse;
import com.managemyopz.ticketing.entity.User;
import com.managemyopz.ticketing.service.UserService;
import com.managemyopz.ticketing.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/users")
    public ResponseEntity<?> list() {
        return ResponseEntity.ok(ApiResponse.success(userService.findAll().stream().map(this::serialize).toList()));
    }

    @GetMapping("/users/{uid}")
    public ResponseEntity<?> get(@PathVariable String uid) {
        return userService.findByUid(uid)
            .map(u -> ResponseEntity.ok((Object) ApiResponse.success(serialize(u))))
            .orElse(ResponseEntity.status(404).body(ApiResponse.error(404, "User not found")));
    }

    @PostMapping("/users")
    public ResponseEntity<?> create(@RequestBody Map<String,Object> body) {
        try {
            String restrictedModulesStr = "";
            if (body.get("restrictedModules") != null) {
                Object val = body.get("restrictedModules");
                if (val instanceof List) {
                    restrictedModulesStr = String.join(",", (List<String>) val);
                } else if (val instanceof String) {
                    restrictedModulesStr = (String) val;
                }
            } else if (body.get("restricted_modules") != null) {
                Object val = body.get("restricted_modules");
                if (val instanceof List) {
                    restrictedModulesStr = String.join(",", (List<String>) val);
                } else if (val instanceof String) {
                    restrictedModulesStr = (String) val;
                }
            }

            String tenantIdVal = (String) body.get("tenantId");
            if (tenantIdVal == null) tenantIdVal = (String) body.get("tenant_id");
            if (tenantIdVal == null) tenantIdVal = com.managemyopz.shared.entity.TenantContext.getCurrentTenant();

            User user = User.builder()
                .uid((String) body.get("uid"))
                .name((String) body.get("name"))
                .email(((String) body.get("email")).toLowerCase().trim())
                .role((String) body.getOrDefault("role","user"))
                .phone((String) body.get("phone"))
                .department((String) body.get("department"))
                .isActive(body.get("is_active") == null || Boolean.parseBoolean(body.get("is_active").toString()))
                .isDemo(Boolean.parseBoolean(body.getOrDefault("is_demo","false").toString()))
                .passwordHash(body.get("password_hash") != null
                    ? (String) body.get("password_hash")
                    : body.get("password") != null ? passwordEncoder.encode((String) body.get("password")) : null)
                .restrictedModules(restrictedModulesStr)
                .build();
            user.setTenantId(tenantIdVal);
            return ResponseEntity.status(201).body(ApiResponse.created(serialize(userService.create(user)), "User created successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(500, "Failed to create user: " + e.getMessage()));
        }
    }

    @PutMapping("/users/{uid}")
    public ResponseEntity<?> update(@PathVariable String uid, @RequestBody Map<String,Object> body) {
        try {
            User updates = new User();
            if (body.get("name")       != null) updates.setName((String) body.get("name"));
            if (body.get("email")      != null) updates.setEmail((String) body.get("email"));
            if (body.get("role")       != null) updates.setRole((String) body.get("role"));
            if (body.get("phone")      != null) updates.setPhone((String) body.get("phone"));
            if (body.get("department") != null) updates.setDepartment((String) body.get("department"));
            if (body.get("is_active")  != null) updates.setIsActive(Boolean.parseBoolean(body.get("is_active").toString()));
            if (body.get("password")   != null) updates.setPasswordHash(passwordEncoder.encode((String) body.get("password")));
            if (body.get("password_hash") != null) updates.setPasswordHash((String) body.get("password_hash"));
            if (body.get("restrictedModules") != null) {
                Object val = body.get("restrictedModules");
                if (val instanceof List) {
                    updates.setRestrictedModules(String.join(",", (List<String>) val));
                } else if (val instanceof String) {
                    updates.setRestrictedModules((String) val);
                }
            } else if (body.get("restricted_modules") != null) {
                Object val = body.get("restricted_modules");
                if (val instanceof List) {
                    updates.setRestrictedModules(String.join(",", (List<String>) val));
                } else if (val instanceof String) {
                    updates.setRestrictedModules((String) val);
                }
            }
            return ResponseEntity.ok(ApiResponse.success(serialize(userService.update(uid, updates)), "User updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(500, "Failed to update user: " + e.getMessage()));
        }
    }

    @DeleteMapping("/users/{uid}")
    public ResponseEntity<?> delete(@PathVariable String uid) {
        userService.softDelete(uid);
        return ResponseEntity.ok(ApiResponse.success(Map.of("success", true), "User deleted successfully"));
    }

    @PostMapping("/users/reset-password")
    public ResponseEntity<?> resetPassword(
            @RequestBody Map<String, String> body,
            @RequestHeader(value = "x-user-uid", required = false) String headerUid) {
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");
        String confirmNewPassword = body.get("confirmNewPassword");

        if (currentPassword == null || newPassword == null || confirmNewPassword == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "All fields are required."));
        }

        if (headerUid == null || headerUid.isBlank()) {
            return ResponseEntity.status(401).body(ApiResponse.error(401, "Unauthorized: User session not found."));
        }

        Optional<User> userOpt = userService.findByUid(headerUid);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(ApiResponse.error(404, "User not found."));
        }

        User user = userOpt.get();

        // 1. Verify current password
        Optional<User> authUserOpt = userService.authenticate(user.getEmail(), currentPassword);
        if (authUserOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "Incorrect current password."));
        }

        // 2. Ensure new password and confirm password match
        if (!newPassword.equals(confirmNewPassword)) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "New password and confirm password do not match."));
        }

        // 3. Prevent weak or invalid passwords based on existing password policies
        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(ApiResponse.error(400, "New password must be at least 6 characters."));
        }

        try {
            // 4. Encrypt/hash passwords using BCrypt
            String newHash = passwordEncoder.encode(newPassword);
            
            User updates = new User();
            updates.setPasswordHash(newHash);
            userService.update(user.getUid(), updates);

            // 5. (Audit logging skipped - password reset is a user self-service action)

            // 6. Send password change email notification
            String emailBody = emailService.buildTemplate(
                "Password Changed",
                null,
                "<p>Hello " + user.getName() + ",</p>" +
                "<p>The password for your Manage My Desk account has been successfully changed.</p>" +
                "<p>If you did not make this change, please contact your administrator immediately.</p>",
                null
            );
            emailService.sendAsync(user.getEmail(), "Manage My Desk - Password Reset Successful", emailBody);

            return ResponseEntity.ok(ApiResponse.success(Map.of("success", true), "Password reset successfully."));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(ApiResponse.error(500, "Failed to reset password: " + e.getMessage()));
        }
    }

    private Map<String,Object> serialize(User u) {
        Map<String,Object> m = new LinkedHashMap<>();
        m.put("id",          String.valueOf(u.getId()));
        m.put("uid",         u.getUid());
        m.put("name",        u.getName());
        m.put("email",       u.getEmail());
        m.put("role",        u.getRole());
        m.put("phone",       u.getPhone());
        m.put("department",  u.getDepartment());
        m.put("is_active",   u.getIsActive());
        m.put("is_demo",     u.getIsDemo());
        m.put("created_at",  u.getCreatedAt());
        m.put("last_login",  u.getLastLogin());
        m.put("tenantId",    u.getTenantId() != null ? u.getTenantId() : "default");

        List<String> modulesList = new ArrayList<>();
        if (u.getRestrictedModules() != null && !u.getRestrictedModules().isBlank()) {
            modulesList = Arrays.asList(u.getRestrictedModules().split(","));
        }
        m.put("restrictedModules", modulesList);
        m.put("restricted_modules", u.getRestrictedModules() != null ? u.getRestrictedModules() : "");
        return m;
    }
}
