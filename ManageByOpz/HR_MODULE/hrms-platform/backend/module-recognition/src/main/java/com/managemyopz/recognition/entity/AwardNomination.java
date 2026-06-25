package com.managemyopz.recognition.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "award_nominations")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AwardNomination extends BaseEntity {
    @Column(name = "program_id", nullable = false)
    private UUID programId;

    @Column(name = "nominee_employee_id", nullable = false)
    private UUID nomineeEmployeeId;

    @Column(name = "nominator_employee_id", nullable = false)
    private UUID nominatorEmployeeId;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private NominationStatus status = NominationStatus.PENDING;

    @Column(name = "evidence_url")
    private String evidenceUrl;

    @Column(name = "vote_count")
    @Builder.Default
    private int voteCount = 0;

    @Column(name = "score")
    @Builder.Default
    private double score = 0.0;

    public enum NominationStatus { PENDING, UNDER_REVIEW, APPROVED, REJECTED }
}
