package com.managemyopz.workflow.entity;

import com.managemyopz.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

/**
 * WorkflowDefinition — Blueprint for a workflow process.
 *
 * Defines the approval chain, parallel approvals, delegation rules,
 * SLA configuration, and escalation paths.
 * Module-agnostic: used by Leave, Recognition, Assets, Recruitment, etc.
 */
@Entity @Table(name = "workflow_definitions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class WorkflowDefinition extends BaseEntity {

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code", nullable = false, unique = true)
    private String code;

    @Column(name = "module_code", nullable = false)
    private String moduleCode; // Which module uses this workflow

    @Column(name = "entity_type", nullable = false)
    private String entityType; // e.g., "LeaveRequest", "AssetRequest"

    @Column(name = "description")
    private String description;

    @Column(name = "version_number", nullable = false)
    private int versionNumber = 1;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "sla_hours")
    private Integer slaHours;

    @Column(name = "auto_approve_on_sla_breach")
    private boolean autoApproveOnSlaBreach = false;

    @Column(name = "allow_delegation")
    private boolean allowDelegation = true;

    @OneToMany(mappedBy = "workflowDefinition", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepOrder ASC")
    private List<WorkflowStep> steps = new ArrayList<>();
}
