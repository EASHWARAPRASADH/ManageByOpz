package com.managemyopz.security.service;

import com.managemyopz.security.entity.Role;
import java.util.List;
import java.util.UUID;

public interface RoleService {
    List<Role> getAllRoles();
    Role createCustomRole(String name, String description, String baseRoleCode, String tenantId, String actor);
    Role cloneRole(UUID roleId, String newName, String description, String tenantId, String actor);
    void archiveRole(UUID roleId, String tenantId, String actor);
}
