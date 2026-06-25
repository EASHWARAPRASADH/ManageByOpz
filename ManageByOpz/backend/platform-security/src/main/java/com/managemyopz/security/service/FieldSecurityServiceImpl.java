package com.managemyopz.security.service;

import com.managemyopz.security.entity.FieldPermission;
import com.managemyopz.security.entity.Role;
import com.managemyopz.security.entity.User;
import com.managemyopz.security.repository.FieldPermissionRepository;
import com.managemyopz.security.repository.UserRepository;
import com.managemyopz.shared.exception.PlatformException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FieldSecurityServiceImpl implements FieldSecurityService {

    private final FieldPermissionRepository fieldPermissionRepository;
    private final UserRepository userRepository;

    private static final Map<String, Integer> ACCESS_LEVEL_PRIORITIES = Map.of(
            "EDITABLE", 4,
            "READ_ONLY", 3,
            "MASKED", 2,
            "HIDDEN", 1
    );

    @Override
    @Transactional(readOnly = true)
    public List<FieldPermission> getAllFieldPermissions() {
        return fieldPermissionRepository.findAll();
    }

    @Override
    @Transactional
    public FieldPermission saveFieldPermission(FieldPermission permission, String actor) {
        // Enforce can_view and can_edit boolean sync with access_level
        String level = permission.getAccessLevel() != null ? permission.getAccessLevel().toUpperCase() : "EDITABLE";
        permission.setAccessLevel(level);
        if ("EDITABLE".equals(level)) {
            permission.setCanView(true);
            permission.setCanEdit(true);
        } else if ("READ_ONLY".equals(level)) {
            permission.setCanView(true);
            permission.setCanEdit(false);
        } else {
            permission.setCanView(false);
            permission.setCanEdit(false);
        }
        return fieldPermissionRepository.save(permission);
    }

    @Override
    @Transactional(readOnly = true)
    public String getAccessLevel(String username, String fieldName) {
        log.info("getAccessLevel called for username: {}, fieldName: {}, tenantId: {}", username, fieldName, com.managemyopz.shared.entity.TenantContext.getCurrentTenant());
        if (username == null || username.isBlank() || "anonymousUser".equalsIgnoreCase(username)) {
            return "HIDDEN";
        }
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(username);
        }
        if (userOpt.isEmpty()) {
            log.warn("User {} not found in tenant {}. Defaulting access level to HIDDEN.", username, com.managemyopz.shared.entity.TenantContext.getCurrentTenant());
            return "HIDDEN";
        }
        User user = userOpt.get();

        // Ultra Super Admin gets full access
        if (user.getRoles().stream().anyMatch(r -> "ROLE_ULTRA_SUPER_ADMIN".equals(r.getCode()))) {
            return "EDITABLE";
        }

        // 1. Check User override
        List<FieldPermission> userPerms = fieldPermissionRepository.findByUserId(user.getId());
        Optional<FieldPermission> userOverride = userPerms.stream()
                .filter(fp -> fp.getFieldName().equalsIgnoreCase(fieldName))
                .findFirst();

        if (userOverride.isPresent()) {
            return userOverride.get().getAccessLevel();
        }

        // 2. Check Role-level permissions (take the highest/most permissive level)
        String highestLevel = "HIDDEN";
        int highestPriority = 0;

        for (Role role : user.getRoles()) {
            List<FieldPermission> rolePerms = fieldPermissionRepository.findByRoleId(role.getId());
            Optional<FieldPermission> rolePerm = rolePerms.stream()
                    .filter(fp -> fp.getFieldName().equalsIgnoreCase(fieldName))
                    .findFirst();

            if (rolePerm.isPresent()) {
                String level = rolePerm.get().getAccessLevel();
                int priority = ACCESS_LEVEL_PRIORITIES.getOrDefault(level, 0);
                if (priority > highestPriority) {
                    highestPriority = priority;
                    highestLevel = level;
                }
            }
        }

        // Default to EDITABLE if no rules are defined in the database
        return highestPriority > 0 ? highestLevel : "EDITABLE";
    }
}
