package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recruitment_stage")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RecruitmentStage extends BaseEntity {

    @Column(name = "stage_code", nullable = false)
    private String stageCode;

    @Column(name = "stage_name", nullable = false)
    private String stageName;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder;

    @Column(name = "stage_color")
    private String stageColor;

    @Column(name = "active", nullable = false)
    private Boolean active = true;
}
