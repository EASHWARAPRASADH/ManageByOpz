package com.managemyopz.security.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * Permission — Master permission catalog action key (e.g. VIEW, CREATE, EDIT, etc.)
 * Maps to security_permissions table.
 */
@Entity @Table(name = "security_permissions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Permission extends BaseEntity {

    @Column(name = "permission_code", nullable = false, unique = true)
    private String name; // mapped as 'name' to keep compatibility with getName()

    @Column(name = "permission_name", nullable = false)
    private String displayName;

    @Column(name = "category", nullable = false)
    private String category;

    public String getPermissionKey() {
        return name;
    }
}
