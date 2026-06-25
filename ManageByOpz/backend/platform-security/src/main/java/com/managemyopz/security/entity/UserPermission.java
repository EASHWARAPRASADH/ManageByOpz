package com.managemyopz.security.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;

@Entity @Table(name = "user_permissions")
@IdClass(UserPermissionId.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class UserPermission implements Serializable {

    @Id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "page_id", nullable = false)
    private SecurityPage page;

    @Id
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "permission_id", nullable = false)
    private Permission permission;

    @Column(name = "allow", nullable = false)
    private boolean allow = true;
}
