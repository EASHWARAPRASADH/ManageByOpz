package com.managemyopz.recognition.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

/**
 * Recognition — Core entity for the Recognition Platform.
 * Supports peer, manager, and organizational recognition with points and badges.
 */
@Entity @Table(name = "recognitions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Recognition extends BaseEntity {
    @Column(name = "giver_employee_id", nullable = false) 
    private UUID giverEmployeeId;

    @Column(name = "receiver_employee_id", nullable = false) 
    private UUID receiverEmployeeId;

    @Column(name = "recognition_type", nullable = false) 
    @Enumerated(EnumType.STRING)
    private RecognitionType recognitionType;

    @Column(name = "title", nullable = false) 
    private String title;

    @Column(name = "message", columnDefinition = "TEXT") 
    private String message;

    @Column(name = "points") 
    private int points;

    @Column(name = "badge_id") 
    private UUID badgeId;

    @Column(name = "award_id") 
    private UUID awardId;

    @Column(name = "visibility") 
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Visibility visibility = Visibility.PUBLIC;

    @Column(name = "approved") 
    @Builder.Default
    private boolean approved = true;

    // Phase 5 additions
    @Column(name = "recognition_value_id") 
    private UUID recognitionValueId;

    @Column(name = "tags") 
    private String tags;

    @Column(name = "project_ref") 
    private String projectRef;

    @Column(name = "business_impact", columnDefinition = "TEXT") 
    private String businessImpact;

    public enum RecognitionType { PEER, MANAGER, ORGANIZATIONAL, MILESTONE, ANNIVERSARY, SPOT }
    public enum Visibility { PUBLIC, TEAM, PRIVATE }
}
