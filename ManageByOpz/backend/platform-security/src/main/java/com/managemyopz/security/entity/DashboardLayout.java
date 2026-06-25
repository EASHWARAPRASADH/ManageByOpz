package com.managemyopz.security.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "dashboard_layouts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class DashboardLayout extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "layout_name")
    private String layoutName = "Default";

    @Column(name = "is_active")
    private boolean active = true;

    @OneToMany(mappedBy = "layout", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DashboardPreference> preferences = new ArrayList<>();
}
