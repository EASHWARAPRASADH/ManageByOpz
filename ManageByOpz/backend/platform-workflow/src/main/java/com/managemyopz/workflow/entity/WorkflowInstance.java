package com.managemyopz.workflow.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * WorkflowInstance — A running instance of a workflow attached to a specific entity.
 * Tracks the current state and all transitions of an approval process.
 */
@Entity @Table(name = "workflow_instances")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class WorkflowInstance extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_definition_id")
    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private WorkflowDefinition workflowDefinition;

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "initiated_by", nullable = false)
    private String initiatedBy;

    @Column(name = "current_step_order")
    private int currentStepOrder = 1;

    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private WorkflowStatus status = WorkflowStatus.PENDING;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    @Column(name = "sla_deadline")
    private Instant slaDeadline;

    @OneToMany(mappedBy = "workflowInstance", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("actedAt ASC")
    private List<WorkflowTransition> transitions = new ArrayList<>();

    public enum WorkflowStatus {
        PENDING, IN_PROGRESS, APPROVED, REJECTED, CANCELLED, ESCALATED, DELEGATED
    }
}
