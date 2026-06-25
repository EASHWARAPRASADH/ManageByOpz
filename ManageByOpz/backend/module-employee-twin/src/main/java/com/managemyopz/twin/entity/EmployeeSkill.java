package com.managemyopz.twin.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "employee_skills")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmployeeSkill extends BaseEntity {
    @Column(name = "skill_name", nullable = false) private String skillName;
    @Column(name = "skill_category") private String skillCategory; // TECHNICAL, FUNCTIONAL, SOFT, LANGUAGE
    @Column(name = "proficiency_level") private String proficiencyLevel; // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
    @Column(name = "years_of_experience") private Double yearsOfExperience;
    @Column(name = "self_rating") private Integer selfRating; // 1-10
    @Column(name = "manager_rating") private Integer managerRating; // 1-10
    @Column(name = "verified") private boolean verified = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_twin_id", nullable = false)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private EmployeeTwin employeeTwin;
}
