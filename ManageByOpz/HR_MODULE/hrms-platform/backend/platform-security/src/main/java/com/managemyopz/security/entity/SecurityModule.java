package com.managemyopz.security.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "security_modules")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SecurityModule extends BaseEntity {

    @Column(name = "module_code", nullable = false, unique = true)
    private String moduleCode;

    @Column(name = "module_name", nullable = false)
    private String moduleName;

    @Column(name = "icon")
    private String icon;

    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;

    @Column(name = "active", nullable = false)
    private boolean active = true;
}
