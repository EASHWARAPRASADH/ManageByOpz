package com.managemyopz.security.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Role — Represents a security role in the Enterprise Authorization Platform.
 * Maps to security_roles table.
 */
@Entity @Table(name = "security_roles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Role extends BaseEntity {

    @Column(name = "role_code", nullable = false, unique = true)
    private String code;

    @Column(name = "role_name", nullable = false)
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "is_system_role", nullable = false)
    private boolean systemRole = false;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @OneToMany(mappedBy = "role", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private java.util.Set<RolePermission> rolePermissions = new java.util.HashSet<>();

    public java.util.Set<Permission> getPermissions() {
        if (rolePermissions == null) {
            return java.util.Collections.emptySet();
        }
        return rolePermissions.stream()
                .map(RolePermission::getPermission)
                .collect(java.util.stream.Collectors.toSet());
    }
}
