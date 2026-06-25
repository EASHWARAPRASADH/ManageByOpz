package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity(name = "TwinWorkflowStep")
@Table(name = "workflow_step")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStep extends BaseEntity {

    @Column(name = "workflow_definition_id", nullable = false)
    private UUID workflowDefinitionId;

    @Column(name = "step_name", nullable = false)
    private String stepName;

    @Column(name = "step_order", nullable = false)
    private Integer stepOrder;

    @Column(name = "approver_role", nullable = false)
    private String approverRole;
}
