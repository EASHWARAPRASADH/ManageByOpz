package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "workflow_assignment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowAssignment extends BaseEntity {

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "workflow_definition_id", nullable = false)
    private UUID workflowDefinitionId;

    @Column(name = "current_step_index")
    private Integer currentStepIndex = 0;

    @Column(name = "status")
    private String status = "PENDING";
}
