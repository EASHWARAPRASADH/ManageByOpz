package com.managemyopz.security.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class RolePermissionId implements Serializable {
    private UUID role;
    private UUID page;
    private UUID permission;

    public RolePermissionId() {}

    public RolePermissionId(UUID role, UUID page, UUID permission) {
        this.role = role;
        this.page = page;
        this.permission = permission;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RolePermissionId that = (RolePermissionId) o;
        return Objects.equals(role, that.role) &&
               Objects.equals(page, that.page) &&
               Objects.equals(permission, that.permission);
    }

    @Override
    public int hashCode() {
        return Objects.hash(role, page, permission);
    }
}
