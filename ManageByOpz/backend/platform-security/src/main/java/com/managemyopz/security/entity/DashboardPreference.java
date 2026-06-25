package com.managemyopz.security.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dashboard_preferences")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DashboardPreference extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "layout_id", nullable = false)
    @JsonIgnore
    private DashboardLayout layout;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "widget_id", nullable = false)
    private DashboardWidget widget;

    @Column(name = "position_x", nullable = false)
    private int positionX;

    @Column(name = "position_y", nullable = false)
    private int positionY;

    @Column(name = "width", nullable = false)
    private int width;

    @Column(name = "height", nullable = false)
    private int height;

    @Column(name = "custom_title")
    private String customTitle;

    @Column(name = "is_visible")
    private boolean visible = true;
}
