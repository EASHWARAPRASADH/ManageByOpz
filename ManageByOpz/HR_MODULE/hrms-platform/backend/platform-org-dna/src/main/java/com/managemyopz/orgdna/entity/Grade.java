package com.managemyopz.orgdna.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "grades")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Grade extends BaseEntity {
    @Column(name = "name", nullable = false) private String name;
    @Column(name = "code", nullable = false) private String code;
    @Column(name = "level") private Integer level;
    @Column(name = "description") private String description;
    @Column(name = "active", nullable = false) private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference("org-grades")
    private Organization organization;
}
