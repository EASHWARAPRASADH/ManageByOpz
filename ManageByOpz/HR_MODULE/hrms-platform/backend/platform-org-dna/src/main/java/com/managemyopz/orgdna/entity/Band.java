package com.managemyopz.orgdna.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "bands")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Band extends BaseEntity {
    @Column(name = "name", nullable = false) private String name;
    @Column(name = "code", nullable = false) private String code;
    @Column(name = "min_salary") private Double minSalary;
    @Column(name = "max_salary") private Double maxSalary;
    @Column(name = "currency") private String currency;
    @Column(name = "description") private String description;
    @Column(name = "active", nullable = false) private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference("org-bands")
    private Organization organization;
}
