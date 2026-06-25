package com.managemyopz.twin.recruitment.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "requisition_approval_steps")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RequisitionApprovalStep extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requisition_id", nullable = false)
    @JsonIgnore
    private Requisition requisition;

    @Column(name = "step_name", nullable = false)
    private String stepName;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(name = "approver_role")
    private String approverRole;

    @Column(name = "approver_name")
    private String approverName;

    @Column(name = "status", nullable = false)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, ON_HOLD, DELEGATED, CHANGES_REQUESTED

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;
}
