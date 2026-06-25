package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "requisition_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequisitionSkill extends BaseEntity {

    @Column(name = "requisition_id", nullable = false)
    private UUID requisitionId;

    @Column(name = "skill_id", nullable = false)
    private UUID skillId;

    @Column(name = "skill_name", nullable = false)
    private String skillName;

    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = true;
}
