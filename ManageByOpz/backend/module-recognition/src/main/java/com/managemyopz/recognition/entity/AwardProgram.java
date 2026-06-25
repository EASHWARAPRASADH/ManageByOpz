package com.managemyopz.recognition.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "award_programs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AwardProgram extends BaseEntity {
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", nullable = false)
    @Enumerated(EnumType.STRING)
    private ProgramCategory category;

    @Column(name = "active")
    @Builder.Default
    private boolean active = true;

    @Column(name = "budget_limit")
    @Builder.Default
    private int budgetLimit = 0;

    public enum ProgramCategory { MONTHLY, QUARTERLY, YEARLY, SPECIAL }
}
