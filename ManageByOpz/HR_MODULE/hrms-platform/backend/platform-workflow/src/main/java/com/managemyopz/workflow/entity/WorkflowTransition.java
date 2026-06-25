package com.managemyopz.workflow.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

/**
 * WorkflowTransition — Records each action taken in a workflow instance.
 * Provides complete audit trail of who did what and when.
 */
@Entity @Table(name = "workflow_transitions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class WorkflowTransition extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_instance_id", nullable = false)
    private WorkflowInstance workflowInstance;

    @Column(name = "step_order")
    private int stepOrder;

    @Column(name = "action", nullable = false)
    @Enumerated(EnumType.STRING)
    private TransitionAction action;

    @Column(name = "acted_by", nullable = false)
    private String actedBy;

    @Column(name = "acted_at", nullable = false)
    private Instant actedAt;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Column(name = "delegated_to")
    private String delegatedTo;

    public enum TransitionAction {
        SUBMITTED, APPROVED, REJECTED, RETURNED, DELEGATED, ESCALATED, CANCELLED, AUTO_APPROVED
    }
}
