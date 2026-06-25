package com.managemyopz.workflow.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "approval_transactions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApprovalTransaction extends BaseEntity {

    @Column(name = "matrix_id")
    private UUID matrixId;

    @Column(name = "workflow_instance_id")
    private UUID workflowInstanceId;

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "level_number")
    private Integer levelNumber;

    @Column(name = "acted_by", nullable = false)
    private String actedBy;

    @Column(name = "action", nullable = false)
    private String action; // SUBMITTED, APPROVED, REJECTED, DELEGATED, ESCALATED, CANCELLED

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "acted_at", nullable = false)
    private Instant actedAt;
}
