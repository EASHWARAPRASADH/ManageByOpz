package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skill_master")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SkillMaster extends BaseEntity {

    @Column(name = "skill_name", nullable = false)
    private String skillName;

    @Column(name = "category")
    private String category;

    @Column(name = "active", nullable = false)
    private Boolean active = true;
}
