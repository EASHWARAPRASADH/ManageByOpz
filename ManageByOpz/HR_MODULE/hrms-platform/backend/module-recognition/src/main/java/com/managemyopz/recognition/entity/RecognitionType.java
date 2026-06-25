package com.managemyopz.recognition.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recognition_types")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecognitionType extends BaseEntity {
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "default_points")
    @Builder.Default
    private int defaultPoints = 50;

    @Column(name = "visibility_rules")
    @Builder.Default
    private String visibilityRules = "PUBLIC";

    @Column(name = "approval_rules")
    @Builder.Default
    private String approvalRules = "NONE";

    @Column(name = "badge_mapping")
    private String badgeMapping;

    @Column(name = "status", nullable = false)
    @Builder.Default
    private String status = "ACTIVE";
}
