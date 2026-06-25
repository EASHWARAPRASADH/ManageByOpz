package com.managemyopz.security.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity @Table(name = "role_permissions")
@IdClass(RolePermissionId.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RolePermission implements Serializable {

    @Id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    @JsonIgnore
    private Role role;

    @Id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "page_id", nullable = false)
    private SecurityPage page;

    @Id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "permission_id", nullable = false)
    private Permission permission;
}
