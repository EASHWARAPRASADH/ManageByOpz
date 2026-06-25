package com.managemyopz.security.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dashboard_widgets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DashboardWidget {
    @Id
    @Column(name = "id", nullable = false, length = 36)
    private String id;

    @Column(name = "widget_key", nullable = false, unique = true, length = 50)
    private String widgetKey;

    @Column(name = "default_title", nullable = false, length = 100)
    private String defaultTitle;

    @Column(name = "default_w", nullable = false)
    private int defaultW;

    @Column(name = "default_h", nullable = false)
    private int defaultH;

    @Column(name = "min_w")
    private int minW = 1;

    @Column(name = "min_h")
    private int minH = 1;

    @Column(name = "component_name", nullable = false, length = 100)
    private String componentName;

    @Column(name = "active", nullable = false)
    private boolean active = true;
}
