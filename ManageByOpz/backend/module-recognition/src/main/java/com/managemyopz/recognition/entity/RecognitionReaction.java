package com.managemyopz.recognition.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "recognition_reactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class RecognitionReaction extends BaseEntity {
    @Column(name = "recognition_id", nullable = false)
    private UUID recognitionId;

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "reaction_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ReactionType reactionType;

    public enum ReactionType { LIKE, CELEBRATE, APPLAUD, INSPIRE }
}
