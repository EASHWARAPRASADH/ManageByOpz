package com.managemyopz.security.service;

import com.managemyopz.security.entity.*;
import com.managemyopz.security.repository.*;
import com.managemyopz.shared.exception.PlatformException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final SecurityCacheService cacheService;

    @Override
    @Transactional(readOnly = true)
    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    @Override
    @Transactional
    public Role createCustomRole(String name, String description, String baseRoleCode, String tenantId, String actor) {
        String code = "ROLE_" + name.toUpperCase().replaceAll("\\s+", "_");
        Optional<Role> existing = roleRepository.findByCode(code);
        if (existing.isPresent()) {
            throw new PlatformException("Role with code " + code + " already exists", HttpStatus.BAD_REQUEST, "ROLE_EXISTS");
        }

        Role newRole = new Role();
        newRole.setName(name);
        newRole.setCode(code);
        newRole.setDescription(description);
        newRole.setSystemRole(false);
        newRole.setActive(true);
        newRole.setTenantId(tenantId);

        Role saved = roleRepository.save(newRole);

        // Copy permissions from base role if specified
        if (baseRoleCode != null && !baseRoleCode.isBlank()) {
            roleRepository.findByCode(baseRoleCode).ifPresent(baseRole -> {
                List<RolePermission> basePerms = rolePermissionRepository.findByRoleId(baseRole.getId());
                for (RolePermission bp : basePerms) {
                    RolePermission rp = new RolePermission(saved, bp.getPage(), bp.getPermission());
                    rolePermissionRepository.save(rp);
                }
            });
        }

        log.info("[RBAC] Custom role created: {} by {}", code, actor);
        return saved;
    }

    @Override
    @Transactional
    public Role cloneRole(UUID roleId, String newName, String description, String tenantId, String actor) {
        Role sourceRole = roleRepository.findById(roleId)
                .orElseThrow(() -> new PlatformException("Source role not found", HttpStatus.NOT_FOUND, "ROLE_NOT_FOUND"));

        String code = "ROLE_" + newName.toUpperCase().replaceAll("\\s+", "_");
        Optional<Role> existing = roleRepository.findByCode(code);
        if (existing.isPresent()) {
            throw new PlatformException("Role with code " + code + " already exists", HttpStatus.BAD_REQUEST, "ROLE_EXISTS");
        }

        Role newRole = new Role();
        newRole.setName(newName);
        newRole.setCode(code);
        newRole.setDescription(description);
        newRole.setSystemRole(false);
        newRole.setActive(true);
        newRole.setTenantId(tenantId);

        Role saved = roleRepository.save(newRole);

        List<RolePermission> basePerms = rolePermissionRepository.findByRoleId(sourceRole.getId());
        for (RolePermission bp : basePerms) {
            RolePermission rp = new RolePermission(saved, bp.getPage(), bp.getPermission());
            rolePermissionRepository.save(rp);
        }

        log.info("[RBAC] Role cloned: {} -> {} by {}", sourceRole.getCode(), code, actor);
        return saved;
    }

    @Override
    @Transactional
    public void archiveRole(UUID roleId, String tenantId, String actor) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new PlatformException("Role not found", HttpStatus.NOT_FOUND, "ROLE_NOT_FOUND"));

        if (role.isSystemRole()) {
            throw new PlatformException("Cannot archive system roles", HttpStatus.BAD_REQUEST, "SYSTEM_ROLE_CANNOT_BE_ARCHIVED");
        }

        role.setActive(false);
        roleRepository.save(role);

        log.info("[RBAC] Role archived: {} by {}", role.getCode(), actor);
    }
}
