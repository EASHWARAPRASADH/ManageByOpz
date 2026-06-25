package com.managemyopz.workflow.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * WorkflowStep — A single step in a workflow definition.
 * Supports sequential and parallel approval patterns.
 */
@Entity @Table(name = "workflow_steps")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class WorkflowStep extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "step_order", nullable = false)
    private int stepOrder;

    @Column(name = "step_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private StepType stepType;

    @Column(name = "approver_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ApproverType approverType;

    @Column(name = "approver_value")
    private String approverValue; // Role name, specific user ID, or "REPORTING_MANAGER"

    @Column(name = "sla_hours")
    private Integer slaHours;

    @Column(name = "escalation_to")
    private String escalationTo; // Who to escalate to on SLA breach

    @Column(name = "required_approvals")
    private int requiredApprovals = 1; // For parallel: how many must approve

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_definition_id", nullable = false)
    private WorkflowDefinition workflowDefinition;

    public enum StepType {
        SEQUENTIAL, PARALLEL, CONDITIONAL, NOTIFICATION_ONLY
    }

    public enum ApproverType {
        REPORTING_MANAGER, ROLE, SPECIFIC_USER, DEPARTMENT_HEAD, HR_BUSINESS_PARTNER, DYNAMIC
    }
}
