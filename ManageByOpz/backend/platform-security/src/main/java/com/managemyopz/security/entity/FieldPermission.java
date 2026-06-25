package com.managemyopz.security.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "field_permissions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class FieldPermission extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role role;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "field_name", nullable = false)
    private String fieldName;

    @Column(name = "can_view", nullable = false)
    private boolean canView = false;

    @Column(name = "can_edit", nullable = false)
    private boolean canEdit = false;

    @Column(name = "access_level", nullable = false)
    private String accessLevel = "EDITABLE";
}
