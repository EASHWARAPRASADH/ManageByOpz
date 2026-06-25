package com.managemyopz.orgdna.entity;

import java.util.UUID;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "cost_centers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CostCenter extends BaseEntity {
    @Column(name = "name", nullable = false) private String name;
    @Column(name = "code", nullable = false) private String code;
    @Column(name = "description") private String description;
    @Column(name = "budget") private Double budget;
    @Column(name = "currency") private String currency;
    @Column(name = "department_id") private UUID departmentId;
    @Column(name = "active", nullable = false) private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference("org-ccs")
    private Organization organization;
}
