package com.managemyopz.orgdna.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity @Table(name = "divisions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Division extends BaseEntity {
    @Column(name = "name", nullable = false) private String name;
    @Column(name = "code", nullable = false) private String code;
    @Column(name = "description") private String description;
    @Column(name = "head_employee_id") private UUID headEmployeeId;
    @Column(name = "active", nullable = false) private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_unit_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference("bu-divs")
    private BusinessUnit businessUnit;

    @OneToMany(mappedBy = "division", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonManagedReference("div-depts")
    private List<Department> departments = new ArrayList<>();
}
