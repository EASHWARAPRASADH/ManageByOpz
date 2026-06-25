package com.managemyopz.orgdna.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "employment_types")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmploymentType extends BaseEntity {
    @Column(name = "name", nullable = false) private String name;
    @Column(name = "code", nullable = false) private String code;
    @Column(name = "description") private String description;
    @Column(name = "probation_days") private Integer probationDays;
    @Column(name = "notice_period_days") private Integer noticePeriodDays;
    @Column(name = "active", nullable = false) private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference("org-employment-types")
    private Organization organization;
}
