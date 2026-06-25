package com.managemyopz.orgdna.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "sub_departments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Team extends BaseEntity {
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "code", nullable = false)
    private String code;
    
    @Column(name = "description")
    private String description;
    
    @Column(name = "head_employee_id")
    private UUID headEmployeeId;
    
    @Column(name = "active", nullable = false)
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonBackReference("dept-teams")
    private Department department;
}
