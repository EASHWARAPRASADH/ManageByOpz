package com.managemyopz.twin.recruitment.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity(name = "TwinWorkflowDefinition")
@Table(name = "workflow_definition")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowDefinition extends BaseEntity {

    @Column(name = "workflow_name", nullable = false)
    private String workflowName;

    @Column(name = "workflow_type", nullable = false)
    private String workflowType;

    @Column(name = "active", nullable = false)
    private Boolean active = true;
}
