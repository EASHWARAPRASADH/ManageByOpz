package com.managemyopz.workflow.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "approval_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ApprovalTask extends BaseEntity {

    @Column(name = "workflow_instance_id")
    private UUID workflowInstanceId;

    @Column(name = "module_type", nullable = false)
    private String moduleType; // LEAVE, COMP_OFF, TRANSFER, DONATION, etc.

    @Column(name = "request_id", nullable = false)
    private UUID requestId;

    @Column(name = "approver_employee_id", nullable = false)
    private UUID approverEmployeeId;

    @Column(name = "level_no", nullable = false)
    private int levelNo;

    @Column(name = "action_status", nullable = false)
    private String actionStatus; // PENDING, APPROVED, REJECTED, RETURNED, DELEGATED, ESCALATED

    @Column(name = "assigned_at")
    private Instant assignedAt;

    @Column(name = "due_at")
    private Instant dueAt;

    @Column(name = "delegated_to")
    private UUID delegatedTo;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;
}
