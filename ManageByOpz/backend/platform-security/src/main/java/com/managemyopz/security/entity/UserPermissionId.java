package com.managemyopz.security.entity;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class UserPermissionId implements Serializable {
    private UUID user;
    private UUID page;
    private UUID permission;

    public UserPermissionId() {}

    public UserPermissionId(UUID user, UUID page, UUID permission) {
        this.user = user;
        this.page = page;
        this.permission = permission;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserPermissionId that = (UserPermissionId) o;
        return Objects.equals(user, that.user) &&
               Objects.equals(page, that.page) &&
               Objects.equals(permission, that.permission);
    }

    @Override
    public int hashCode() {
        return Objects.hash(user, page, permission);
    }
}
