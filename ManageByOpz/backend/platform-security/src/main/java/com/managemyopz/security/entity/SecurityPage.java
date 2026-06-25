package com.managemyopz.security.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "security_pages")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class SecurityPage extends BaseEntity {

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "module_id", nullable = false)
    private SecurityModule module;

    @Column(name = "page_code", nullable = false, unique = true)
    private String pageCode;

    @Column(name = "page_name", nullable = false)
    private String pageName;

    @Column(name = "route_path", nullable = false)
    private String routePath;

    @Column(name = "component_name")
    private String componentName;

    @Column(name = "menu_visible", nullable = false)
    private boolean menuVisible = true;

    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;

    @Column(name = "active", nullable = false)
    private boolean active = true;
}
